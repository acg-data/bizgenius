import { Link } from 'react-router-dom';
import { Button, Input, Card, CardBody, CardHeader } from '@heroui/react';
import { SparklesIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function ForgotPassword() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password reset
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center pb-2 pt-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mb-4">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-500 mt-2 text-center">
            No worries, we'll send you reset instructions
          </p>
        </CardHeader>
        
        <CardBody className="pb-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              startContent={<EnvelopeIcon className="w-4 h-4 text-gray-400" />}
              isRequired
              size="lg"
            />
            
            <Button type="submit" color="primary" size="lg" className="w-full font-semibold">
              Send Reset Link
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
              ← Back to Sign In
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
