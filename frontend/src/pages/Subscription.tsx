import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardBody, Button, Switch, Chip } from '@heroui/react';
import { CheckIcon, SparklesIcon, FireIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useAction } from '../lib/convex';
import { api } from '../convex/_generated/api';
import { subscriptionPlans } from '../store';

export default function Subscription() {
  const navigate = useNavigate();
  const { user, subscription_tier } = useAuth();
  const usage = useQuery(api.users.checkUsageLimits, {});
  const createCheckoutSession = useAction(api.stripe.createCheckoutSession);
  
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [processingPlanId, setProcessingPlanId] = useState<number | null>(null);

  const currentTier = subscription_tier || "free";

  const handleSubscribe = async (tier: "premium" | "expert") => {
    // Map tier name to ID for loading state
    const planId = tier === 'premium' ? 2 : 3;
    setProcessingPlanId(planId);
    
    try {
      const result = await createCheckoutSession({
        tier,
        billing: billingInterval,
        successUrl: `${window.location.origin}/dashboard?checkout=success`,
        cancelUrl: `${window.location.origin}/subscription?checkout=canceled`,
      });

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Failed to start checkout. Please try again.");
      setProcessingPlanId(null);
    }
  };

  const handleManageSubscription = () => {
    navigate('/billing');
  };
  
  if (!user) {
    return (
      <div className="bg-apple-bg min-h-screen font-sans antialiased flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <SparklesIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to Upgrade</h1>
          <p className="text-gray-500 mb-8">Please log in to view and manage your subscription plan.</p>
          <Link 
            to="/login?redirect=subscription"
            className="block w-full bg-blue-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans antialiased pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Upgrade your Plan</h1>
          <p className="text-xl text-gray-500 mb-8">Unlock unlimited analysis, export capabilities, and expert tools.</p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-100 p-1 rounded-full border border-gray-200">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billingInterval === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Yearly <span className="text-xs text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded-full">-20%</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8">
        {/* Usage Stats (Mini Dashboard) */}
        {usage && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto transform -translate-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <FireIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Current Usage</p>
                <p className="text-gray-900 font-medium">
                  <span className="font-bold">{usage.analyses_used || 0}</span> / {usage.analyses_limit === -1 ? '∞' : usage.analyses_limit} Analyses
                </p>
              </div>
            </div>
            
            <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Current Plan: <span className="font-bold capitalize text-gray-900">{currentTier}</span></span>
              {currentTier !== 'free' && (
                <Button 
                  size="sm" 
                  variant="bordered" 
                  onClick={handleManageSubscription}
                  className="border-gray-200"
                >
                  Manage Billing
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-12">
          {subscriptionPlans.map((plan) => {
            const isCurrent = plan.name.toLowerCase() === currentTier;
            const isPopular = plan.is_popular;
            
            // Calculate price based on interval
            const price = billingInterval === 'monthly' ? plan.price_monthly : Math.round(plan.price_yearly / 12);
            
            return (
              <div 
                key={plan.id} 
                className={`relative flex flex-col bg-white rounded-2xl transition-all duration-300 ${
                  isPopular 
                    ? 'border-2 border-blue-600 shadow-xl scale-105 z-10' 
                    : 'border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    MOST POPULAR
                  </div>
                )}

                <div className="p-8 flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-500 text-sm mb-6">{plan.description}</p>
                  
                  <div className="flex items-baseline mb-8">
                    <span className="text-4xl font-bold text-gray-900">${price}</span>
                    <span className="text-gray-500 ml-2">/mo</span>
                    {billingInterval === 'yearly' && plan.price_monthly > 0 && (
                      <span className="ml-auto text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        Billed ${plan.price_yearly}/yr
                      </span>
                    )}
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckIcon className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-600 leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 pt-0 mt-auto">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-xl border border-green-200 bg-green-50 text-green-700 font-semibold flex items-center justify-center gap-2 cursor-default"
                    >
                      <CheckIcon className="w-5 h-5" />
                      Current Plan
                    </button>
                  ) : plan.price_monthly === 0 ? (
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 font-semibold cursor-not-allowed"
                    >
                      Basic Access
                    </button>
                  ) : (
                    <Button
                      className={`w-full py-6 font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98] ${
                        isPopular 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-200' 
                          : 'bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50'
                      }`}
                      isLoading={processingPlanId === plan.id}
                      onClick={() => handleSubscribe(plan.name.toLowerCase() as "premium" | "expert")}
                    >
                      {processingPlanId === plan.id ? 'Processing...' : `Upgrade to ${plan.name}`}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-gray-400 text-sm mt-12">
          Secure payment via Stripe. Cancel anytime from your billing settings.
        </p>
      </div>
    </div>
  );
}
