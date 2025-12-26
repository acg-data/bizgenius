import { Link } from 'react-router-dom';
import { Button, Card, CardBody } from '@heroui/react';
import { LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <Card className="bg-white shadow-lg">
          <CardBody className="p-8">
            <div className="w-20 h-20 rounded-full bg-danger-100 flex items-center justify-center mx-auto mb-6">
              <LockClosedIcon className="w-10 h-10 text-danger-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-8">
              You don't have permission to access this page. Please sign in or contact support if you believe this is an error.
            </p>
            <div className="space-y-4">
              <Link to="/login">
                <Button color="primary" size="lg" className="w-full" endContent={<ArrowRightIcon className="w-5 h-5" />}>
                  Sign In
                </Button>
              </Link>
              <Link to="/">
                <Button variant="light" size="lg" className="w-full">
                  Go to Homepage
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
