import { ConvexHttpClient } from "convex/browser";
import { api } from "./src/convex/_generated/api.js";

async function testAuthenticationHypothesis() {
  console.log("🔐 Testing Authentication Hypothesis\n");

  const client = new ConvexHttpClient("https://acrobatic-monitor-529.convex.cloud");

  try {
    // Test 1: Create a simple session
    console.log("📝 Test 1: Creating simple session...");
    const simpleResult = await client.mutation(api.sessions.createSession, {
      idea: "Test idea for auth check",
      answers: {},
      branding: { name: "Test", colors: ["#FF0000"], tagline: "Test" }
    });
    console.log("✅ Simple session created:", simpleResult.sessionId);

    // Test 2: Try to run generation on this session
    console.log("\n🤖 Test 2: Running generation on simple session...");
    const genResult = await client.action(api.ai.runGenerationPublic, {
      sessionId: simpleResult.sessionId
    });
    console.log("✅ Generation action result:", genResult);

    // Wait a moment for generation to complete
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Test 3: Check session status
    console.log("\n📊 Test 3: Checking session status...");
    const session = await client.query(api.sessions.getSessionStatus, {
      sessionId: simpleResult.sessionId
    });

    console.log("Session status:", session.status);
    console.log("Progress:", session.progress);
    console.log("Current step:", session.currentStep);

    if (session.status === "failed") {
      console.log("\n❌ AUTH HYPOTHESIS CONFIRMED!");
      console.log("Issue: Internal action requires authentication");
      console.log("Solution: Need authenticated user or public action");
    } else if (session.status === "completed") {
      console.log("\n✅ AUTH NOT THE ISSUE!");
      console.log("Session completed successfully");
    } else {
      console.log("\n🤔 Session status:", session.status);
      console.log("Generation still in progress or pending");
    }

    console.log("\n" + "=".repeat(80));
    console.log("🎯 DIAGNOSIS COMPLETE");
    console.log("=".repeat(80));

  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error("Full error:", error);
  }
}

testAuthenticationHypothesis();