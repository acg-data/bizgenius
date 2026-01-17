import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardBody, Button } from '@heroui/react';
import { CheckIcon, SparklesIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useAction } from '../lib/convex';
import { api } from '../convex/_generated/api';

import { subscriptionPlans } from '../store';

export default function Subscription() {
  const navigate = useNavigate();
  const { user, subscription_tier } = useAuth();
  // Convex useQuery returns data directly
  const usage = useQuery(api.users.checkUsageLimits, {});
  const createCheckoutSession = useAction(api.stripe.createCheckoutSession);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentTier = subscription_tier || "free";

  const handleSubscribe = async (tier: "premium" | "expert", billing: "monthly" | "yearly") => {
    setIsProcessing(true);
    try {
      const result = await createCheckoutSession({
        tier,
        billing,
        successUrl: `${window.location.origin}/dashboard?checkout=success`,
        cancelUrl: `${window.location.origin}/pricing?checkout=canceled`,
      });

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Failed to start checkout. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleSubscribePremiumMonthly = () => handleSubscribe("premium", "monthly");
  const handleSubscribePremiumYearly = () => handleSubscribe("premium", "yearly");
  const handleSubscribeExpertMonthly = () => handleSubscribe("expert", "monthly");
  const handleSubscribeExpertYearly = () => handleSubscribe("expert", "yearly");
  
  const handleManageSubscription = () => {
    navigate('/billing');
  };
  
  if (!user) {
    return (
      <div className="bg-apple-bg min-h-screen font-sans antialiased">
        <nav className="fixed top-0 w-full z-50 glass-panel">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <SparklesIcon className="w-5 h-5 text-apple-text" />
              <span className="text-lg tracking-tight">myCEO</span>
            </Link>
          </div>
        </nav>
        
        <div className="max-w-2xl mx-auto px-6 pt-32 pb-16">
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-12 text-center">
            <h1 className="text-2xl font-semibold text-apple-text mb-4">Sign in to Upgrade</h1>
            <p className="text-apple-gray mb-8">Please log in to view and manage your subscription</p>
            <Link 
              to="/login"
              className="inline-flex items-center gap-2 bg-apple-text text-white font-medium px-6 py-3 rounded-full hover:bg-gray-800 transition-all"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const PlanCard = ({ plan, isCurrent, onSelect }) => {
    return (
      <Card className={`${
        isCurrent 
          ? 'border-4xl border-primary-500 bg-primary-50' 
          : 'border border-gray-200 hover:border-primary-300'
      } transition-all`}>
        <CardBody className="p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-apple-text">{plan.name}</h3>
              <p className="text-sm text-apple-gray mt-1">{plan.description}</p>
            </div>
            {isCurrent && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                Current
              </span>
            )}
          </div>
          
          <div className="mb-6">
            <div className="text-4xl font-bold text-apple-text mb-2">
              {plan.price_monthly === 0 ? 'Free' : `$${plan.price_monthly}`}
              {plan.price_monthly > 0 && '/month'}
            </div>
            {plan.price_yearly > 0 && (
              <div className="text-sm text-apple-gray">
                <span className="line-through">${plan.price_yearly}</span>
                <span className="ml-2">${plan.price_yearly * 0.8}</span>/year
              </div>
            )}
          </div>
          
          <ul className="space-y-3 mb-8">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-apple-gray">
                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          {!isCurrent && (
            <Button
              color="primary"
              size="lg"
              className="w-full font-semibold"
              onClick={onSelect}
              disabled={isProcessing}
            >
              {isProcessing && plan.id === 1 ? 'Processing...' : 'Upgrade to Premium'}
            </Button>
          )}
        </CardBody>
      </Card>
    );
  };
  
  return (
    <div className="bg-apple-bg min-h-screen font-sans antialiased">
      <nav className="fixed top-0 w-full z-50 glass-panel">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <SparklesIcon className="w-5 h-5 text-apple-text" />
            <span className="text-lg tracking-tight">myCEO</span>
          </Link>
          <span className="text-sm font-medium text-apple-gray">
            Subscription Plans
          </span>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-apple-text mb-4">Choose Your Plan</h1>
          <p className="text-xl text-apple-gray">Unlock powerful business intelligence features</p>
        </div>
        
        {usage && (
          <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200 mb-12">
            <CardBody className="p-6">
              <h3 className="text-xl font-semibold text-apple-text mb-4">Your Current Usage</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-apple-gray mb-2">This Month</p>
                  <p className="text-3xl font-bold text-apple-text">
                    {usage.analyses_used || 0}
                    <span className="text-lg font-normal text-apple-gray">
                      /{usage.analyses_limit === -1 ? '∞' : usage.analyses_limit}
                    </span>
                  </p>
                  <p className="text-sm text-apple-gray">Analyses</p>
                </div>
                <div>
                  <p className="text-sm text-apple-gray mb-2">Saved Ideas</p>
                  <p className="text-3xl font-bold text-apple-text">
                    {usage.ideas_used || 0}
                    <span className="text-lg font-normal text-apple-gray">
                      /{usage.ideas_limit === -1 ? '∞' : usage.ideas_limit}
                    </span>
                  </p>
                  <p className="text-sm text-apple-gray">Ideas</p>
                </div>
                <div>
                  <p className="text-sm text-apple-gray mb-2">Current Plan</p>
                  <p className="text-3xl font-bold text-apple-text capitalize">{currentTier}</p>
                  <Button
                    color="default"
                    variant="bordered"
                    size="sm"
                    onClick={handleManageSubscription}
                    className="mt-2"
                  >
                    Manage
                  </Button>
                </div>
              </div>
              
              {currentTier === 'free' && (usage.analyses_used || 0) >= (usage.analyses_limit || 1) && (
                <div className="mt-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <p className="text-sm font-medium text-orange-700 mb-2">
                      You've reached your monthly limit
                    </p>
                    <p className="text-xs text-orange-600">
                      Upgrade to Premium or Expert to continue generating analyses
                    </p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {subscriptionPlans.map((plan) => {
            const isCurrent = plan.name.toLowerCase() === currentTier;
            
            if (plan.name === 'Premium') {
              return (
                <div key={plan.id} className="md:col-span-1">
                  <PlanCard
                    plan={plan}
                    isCurrent={isCurrent}
                    onSelect={handleSubscribePremiumMonthly}
                  />
                  <PlanCard
                    plan={plan}
                    isCurrent={isCurrent}
                    onSelect={handleSubscribePremiumYearly}
                  />
                </div>
              );
            }
            
            if (plan.name === 'Expert') {
              return (
                <div key={plan.id} className="md:col-span-2">
                  <PlanCard
                    plan={plan}
                    isCurrent={isCurrent}
                    onSelect={handleSubscribeExpertMonthly}
                  />
                  <PlanCard
                    plan={plan}
                    isCurrent={isCurrent}
                    onSelect={handleSubscribeExpertYearly}
                  />
                </div>
              );
            }
            
            return null;
          })}
        </div>
        
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 mb-8">
          <h3 className="text-xl font-semibold text-apple-text mb-4">Payment Methods</h3>
          <p className="text-sm text-apple-gray mb-6">We accept multiple payment options</p>
          
          <div className="grid grid-cols-2 gap-6 items-center">
            <div className="text-center">
              <div className="bg-gray-100 rounded-xl p-6 mb-3">
                <CreditCardIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-700 mb-2">Credit Card</h4>
                <p className="text-sm text-gray-600">
                  Visa, Mastercard, Amex
                  <br />
                  Secure processing
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 rounded-xl p-6 mb-3">
                <CreditCardIcon className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-700 mb-2">Crypto</h4>
                <p className="text-sm text-gray-600">
                  USDC, USDT, ETH
                  <br />
                  Pay with crypto, save on fees
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-8 mb-8">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-apple-text mb-4">Questions?</h3>
            <p className="text-apple-gray mb-6">Compare features and find the right plan for your business needs</p>
            <Link 
              to="/help"
              className="inline-flex items-center gap-2 bg-white text-primary-600 font-medium px-8 py-4 rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
            >
              Get Help Choosing
            </Link>
          </div>
        </div>
        
        <div className="text-center">
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-2 text-apple-gray hover:text-apple-text transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
