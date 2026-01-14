import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader, Button, Chip, Divider } from '@heroui/react';
import { CreditCardIcon, DocumentTextIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useAction } from '../lib/convex';
import { api } from '../convex/_generated/api';

export default function Billing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createPortalSession = useAction(api.stripe.createPortalSession);
  const [isLoading, setIsLoading] = useState(false);

  const invoices = [
    { id: 'INV-001', date: 'Dec 1, 2024', amount: '$80.00', status: 'paid' },
    { id: 'INV-002', date: 'Nov 1, 2024', amount: '$80.00', status: 'paid' },
    { id: 'INV-003', date: 'Oct 1, 2024', amount: '$80.00', status: 'paid' },
  ];

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const result = await createPortalSession({
        returnUrl: window.location.href,
      });
      if (result.portalUrl) {
        window.location.href = result.portalUrl;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Unable to open billing portal. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 font-sans antialiased">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-500 mt-1">Manage your subscription and view invoices</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CreditCardIcon className="w-6 h-6 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">VISA</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                    <p className="text-sm text-gray-500">Expires 12/26</p>
                  </div>
                </div>
                <Button variant="bordered" size="sm" isLoading={isLoading} onClick={handleManageSubscription}>
                  Update
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <DocumentTextIcon className="w-6 h-6 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900">Billing History</h2>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-gray-100">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium text-gray-900">{invoice.id}</p>
                        <p className="text-sm text-gray-500">{invoice.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Chip size="sm" color="success" variant="flat">{invoice.status}</Chip>
                      <p className="font-medium text-gray-900">{invoice.amount}</p>
                      <Button variant="light" size="sm">Download</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary-50 border border-primary-100">
            <CardBody className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <CalendarIcon className="w-6 h-6 text-primary-600" />
                <h3 className="font-semibold text-gray-900">Current Plan</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2 capitalize">{user?.subscription_tier || 'Free'}</p>
              <p className="text-sm text-gray-600 mb-4">
                {user?.subscription_status === 'active' ? 'Active' : 'Not subscribed'}
              </p>
              <Button color="primary" className="w-full" onClick={() => navigate('/subscription')}>
                Manage Subscription
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Billing Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Next billing date</span>
                  <span className="font-medium text-gray-900">Jan 1, 2025</span>
                </div>
                <Divider />
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount due</span>
                  <span className="font-medium text-gray-900">$80.00</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
