import { Link } from 'react-router-dom';
import { Card, CardBody, Button, Chip } from '@heroui/react';
import { CheckIcon, SparklesIcon, FireIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { subscriptionPlans } from '../store';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Chip color="primary" variant="flat" className="mb-4">Pricing</Chip>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that's right for you. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {subscriptionPlans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.is_popular ? 'ring-2 ring-primary-500' : ''}`}>
              {plan.is_popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Chip color="primary" size="sm">Most Popular</Chip>
                </div>
              )}
              
              <CardBody className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-500 mt-2">{plan.description}</p>
                </div>
                
                <div className="text-center mb-6">
                  {plan.price_monthly === 0 ? (
                    <div className="text-4xl font-bold text-gray-900">Free</div>
                  ) : (
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-gray-900">${plan.price_monthly}</span>
                      <span className="text-gray-500 ml-2">/month</span>
                    </div>
                  )}
                  {plan.price_yearly > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      ${Math.round(plan.price_yearly / 12)}/month billed yearly
                    </p>
                  )}
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to={plan.price_monthly === 0 ? '/register' : '/subscription'}>
                  <Button
                    color={plan.is_popular ? 'primary' : 'default'}
                    size="lg"
                    className="w-full font-semibold"
                  >
                    {plan.price_monthly === 0 ? 'Get Started Free' : 'Start Free Trial'}
                  </Button>
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Trusted by entrepreneurs worldwide
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white">
              <CardBody className="p-6 text-center">
                <ShieldCheckIcon className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Secure Payments</h3>
                <p className="text-sm text-gray-500">
                  All payments are processed securely through Stripe
                </p>
              </CardBody>
            </Card>
            
            <Card className="bg-white">
              <CardBody className="p-6 text-center">
                <FireIcon className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Cancel Anytime</h3>
                <p className="text-sm text-gray-500">
                  No long-term contracts. Cancel anytime with one click
                </p>
              </CardBody>
            </Card>
            
            <Card className="bg-white">
              <CardBody className="p-6 text-center">
                <SparklesIcon className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Money Back Guarantee</h3>
                <p className="text-sm text-gray-500">
                  Not satisfied? Get a full refund within 30 days
                </p>
              </CardBody>
            </Card>
          </div>
        </div>

        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {[
              {
                q: 'Can I change plans later?',
                a: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards (Visa, MasterCard, American Express) through our secure payment partner, Stripe.'
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes! All paid plans come with a 14-day free trial. No credit card required to start.'
              },
              {
                q: 'Can I cancel my subscription?',
                a: 'Absolutely. You can cancel anytime from your account settings. You\'ll continue to have access until the end of your billing period.'
              },
            ].map((faq, index) => (
              <Card key={index} className="bg-white">
                <CardBody className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
