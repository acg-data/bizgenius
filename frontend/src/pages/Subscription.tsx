import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader, Button, Chip } from '@heroui/react';
import { CheckIcon, SparklesIcon, CreditCardIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAuthStore, subscriptionPlans } from '../store';
import { subscriptionService } from '../services/api';

export default function Subscription() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (planType: 'pro' | 'coach') => {
    setIsLoading(planType);
    try {
      const { checkout_url } = await subscriptionService.createCheckout(planType);
      window.location.href = checkout_url;
    } catch (error) {
      console.error('Error creating checkout:', error);
      setIsLoading(null);
    }
  };

  const currentPlan = user?.subscription_tier || 'free';

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
        <p className="text-gray-500 mt-1">Manage your subscription and billing</p>
      </div>

      {currentPlan !== 'free' && (
        <Card className="mb-8 bg-success-50 border border-success-200">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-success-100 flex items-center justify-center">
                  <CheckIcon className="w-6 h-6 text-success-600" />
                </div>
                <div>
                  <p className="font-semibold text-success-800">
                    You're on the {user?.subscription_tier === 'pro' ? 'Pro' : 'Daily Coach'} plan
                  </p>
                  <p className="text-sm text-success-600">
                    Your subscription is active and renews on {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button variant="bordered" color="success" onClick={() => navigate('/billing')}>
                Manage Billing
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {subscriptionPlans.slice(1).map((plan) => (
          <Card key={plan.id} className={`relative ${plan.is_popular ? 'ring-2 ring-primary-500' : ''}`}>
            {plan.is_popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Chip color="primary" size="sm">Most Popular</Chip>
              </div>
            )}
            
            <CardHeader className="pb-0">
              <div className="w-full text-center pt-6">
                <SparklesIcon className="w-10 h-10 text-primary-500 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
              </div>
            </CardHeader>
            
            <CardBody className="space-y-6">
              <div className="text-center">
                <span className="text-4xl font-bold text-gray-900">${plan.price_monthly}</span>
                <span className="text-gray-500">/month</span>
              </div>
              
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm">
                    <CheckIcon className="w-5 h-5 text-success-500 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                color={plan.is_popular ? 'primary' : 'default'}
                size="lg"
                className="w-full font-semibold"
                isLoading={isLoading === (plan.price_monthly === 80 ? 'pro' : 'coach')}
                onClick={() => handleSubscribe(plan.price_monthly === 80 ? 'pro' : 'coach')}
                startContent={currentPlan === (plan.price_monthly === 80 ? 'pro' : 'coach') ? undefined : <ArrowRightIcon className="w-4 h-4" />}
              >
                {currentPlan === (plan.price_monthly === 80 ? 'pro' : 'coach')
                  ? 'Current Plan'
                  : plan.price_monthly === 80
                  ? 'Upgrade to Pro'
                  : 'Add Daily Coach'}
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardBody className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CreditCardIcon className="w-10 h-10 text-gray-400" />
              <div>
                <h3 className="font-semibold text-gray-900">Payment Method</h3>
                <p className="text-sm text-gray-500">
                  {currentPlan === 'free' ? 'No payment method on file' : '•••• 4242'}
                </p>
              </div>
            </div>
            <Button variant="bordered" onClick={() => navigate('/billing')}>
              Update
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
