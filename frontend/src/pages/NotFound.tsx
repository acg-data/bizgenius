import { Link } from 'react-router-dom';
import { Button } from '@heroui/react';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-9xl font-bold text-primary-500/20 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button color="primary" size="lg" startContent={<HomeIcon className="w-5 h-5" />}>
              Go Home
            </Button>
          </Link>
          <Button variant="bordered" size="lg" startContent={<ArrowLeftIcon className="w-5 h-5" />} onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
