import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// Stripe signature verification using Web Crypto API
async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<{ valid: boolean; timestamp?: number }> {
  try {
    // Parse the signature header
    const parts = signature.split(",").reduce((acc, part) => {
      const [key, value] = part.split("=");
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const timestamp = parseInt(parts.t, 10);
    const expectedSig = parts.v1;

    if (!timestamp || !expectedSig) {
      return { valid: false };
    }

    // Check timestamp is within tolerance (5 minutes)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 300) {
      console.error("Stripe webhook timestamp too old");
      return { valid: false };
    }

    // Create signed payload
    const signedPayload = `${timestamp}.${payload}`;

    // Compute HMAC
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBytes = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signedPayload)
    );

    // Convert to hex
    const computedSig = Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Constant-time comparison
    if (computedSig.length !== expectedSig.length) {
      return { valid: false };
    }

    let mismatch = 0;
    for (let i = 0; i < computedSig.length; i++) {
      mismatch |= computedSig.charCodeAt(i) ^ expectedSig.charCodeAt(i);
    }

    return { valid: mismatch === 0, timestamp };
  } catch (error) {
    console.error("Signature verification error:", error);
    return { valid: false };
  }
}

// Stripe Webhook Handler
http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripeSignature = request.headers.get("stripe-signature");

    // Get raw body for signature verification
    const body = await request.text();

    // Verify webhook signature in production
    if (stripeWebhookSecret && stripeSignature) {
      const { valid } = await verifyStripeSignature(
        body,
        stripeSignature,
        stripeWebhookSecret
      );

      if (!valid) {
        console.error("Invalid Stripe webhook signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else if (process.env.NODE_ENV === "production") {
      // In production, require signature verification
      console.error("Missing Stripe webhook secret or signature");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const event = JSON.parse(body);

      console.log("Stripe webhook received:", event.type);

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          await handleCheckoutComplete(ctx, session);
          break;
        }

        case "customer.subscription.created":
        case "customer.subscription.updated": {
          const subscription = event.data.object;
          await handleSubscriptionUpdate(ctx, subscription);
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          await handleSubscriptionDeleted(ctx, subscription);
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object;
          await handlePaymentFailed(ctx, invoice);
          break;
        }

        case "invoice.payment_succeeded": {
          const invoice = event.data.object;
          await handlePaymentSucceeded(ctx, invoice);
          break;
        }

        default:
          console.log("Unhandled webhook event:", event.type);
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// Handle successful checkout
async function handleCheckoutComplete(ctx: any, session: any) {
  const customerId = session.customer;
  const subscriptionId = session.subscription;
  const tier = session.metadata?.tier || "premium";

  if (!customerId) {
    console.error("No customer ID in checkout session");
    return;
  }

  await ctx.runMutation(internal.stripe.updateSubscription, {
    stripeCustomerId: customerId,
    tier: tier as "premium" | "expert",
    status: "active",
    stripeSubscriptionId: subscriptionId,
  });

  console.log(`Checkout completed: Customer ${customerId} subscribed to ${tier}`);
}

// Handle subscription updates
async function handleSubscriptionUpdate(ctx: any, subscription: any) {
  const customerId = subscription.customer;
  const subscriptionId = subscription.id;
  const status = subscription.status;
  const priceId = subscription.items?.data?.[0]?.price?.id;
  const currentPeriodEnd = subscription.current_period_end;

  // Map Stripe status to our status
  let mappedStatus: "active" | "inactive" | "canceled" | "past_due" = "inactive";
  if (status === "active" || status === "trialing") {
    mappedStatus = "active";
  } else if (status === "past_due") {
    mappedStatus = "past_due";
  } else if (status === "canceled" || status === "unpaid") {
    mappedStatus = "canceled";
  }

  // Determine tier from metadata or price ID
  const tier = subscription.metadata?.tier || mapPriceToTier(priceId);

  await ctx.runMutation(internal.stripe.updateSubscription, {
    stripeCustomerId: customerId,
    tier: mappedStatus === "canceled" ? "free" : tier,
    status: mappedStatus,
    stripeSubscriptionId: subscriptionId,
    stripePriceId: priceId,
    expiresAt: currentPeriodEnd ? currentPeriodEnd * 1000 : undefined,
  });

  console.log(`Subscription updated: ${customerId} -> ${tier} (${mappedStatus})`);
}

// Handle subscription cancellation
async function handleSubscriptionDeleted(ctx: any, subscription: any) {
  const customerId = subscription.customer;

  await ctx.runMutation(internal.stripe.updateSubscription, {
    stripeCustomerId: customerId,
    tier: "free",
    status: "canceled",
  });

  console.log(`Subscription canceled: ${customerId}`);
}

// Handle failed payment
async function handlePaymentFailed(ctx: any, invoice: any) {
  const customerId = invoice.customer;

  // Get user and update status to past_due
  const user = await ctx.runQuery(internal.stripe.getUserByStripeCustomer, {
    stripeCustomerId: customerId,
  });

  if (user) {
    await ctx.runMutation(internal.stripe.updateSubscription, {
      stripeCustomerId: customerId,
      tier: user.subscriptionTier || "free",
      status: "past_due",
    });
  }

  console.log(`Payment failed for customer: ${customerId}`);
}

// Handle successful payment (for logging/analytics)
async function handlePaymentSucceeded(ctx: any, invoice: any) {
  console.log(`Payment succeeded for invoice: ${invoice.id}`);
  // Could store payment record here if needed
}

// Helper to map price ID to tier
function mapPriceToTier(priceId: string | undefined): "premium" | "expert" {
  if (!priceId) return "premium";

  const expertMonthly = process.env.STRIPE_EXPERT_MONTHLY_PRICE_ID;
  const expertYearly = process.env.STRIPE_EXPERT_YEARLY_PRICE_ID;

  if (priceId === expertMonthly || priceId === expertYearly) {
    return "expert";
  }

  return "premium";
}

export default http;
