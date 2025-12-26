import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Card, CardBody, CardHeader, Divider } from '@heroui/react';
import { SparklesIcon, EnvelopeIcon, LockClosedIcon, UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { authService } from '../services/api';
import { useAuthStore } from '../store';

export default function Register() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const data = await authService.register(
        formData.email,
        formData.password,
        formData.fullName
      );
      setToken(data.access_token);
      setUser(data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    'Unlimited business ideas',
    'Full financial models & projections',
    'Market research & competitor analysis',
    'Professional pitch decks',
    'Export to PDF, PPTX, Excel',
    'Priority support',
  ];

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-secondary-600 p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl text-white">BizGenius</span>
        </Link>
        
        <div>
          <h1 className="text-4xl font-bold text-white mb-6">
            Start Building Today
          </h1>
          <p className="text-lg text-white/80 mb-8">
            Join thousands of entrepreneurs who are building better businesses with AI.
          </p>
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 text-white">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                {benefit}
              </div>
            ))}
          </div>
        </div>
        
        <p className="text-sm text-white/60">
          © 2024 BizGenius. All rights reserved.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-col items-center pb-2 pt-8">
            <Link to="/" className="flex items-center gap-2 mb-4 lg:hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">BizGenius</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 mt-2">Start your 14-day free trial</p>
          </CardHeader>
          
          <CardBody className="pb-8 pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-danger-50 text-danger-600 text-sm">
                  {error}
                </div>
              )}
              
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={formData.fullName}
                onValueChange={(value) => setFormData({ ...formData, fullName: value })}
                startContent={<UserIcon className="w-4 h-4 text-gray-400" />}
                size="lg"
              />
              
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onValueChange={(value) => setFormData({ ...formData, email: value })}
                startContent={<EnvelopeIcon className="w-4 h-4 text-gray-400" />}
                isRequired
                size="lg"
              />
              
              <Input
                label="Password"
                placeholder="At least 8 characters"
                value={formData.password}
                onValueChange={(value) => setFormData({ ...formData, password: value })}
                startContent={<LockClosedIcon className="w-4 h-4 text-gray-400" />}
                endContent={
                  <button
                    type="button"
                    onClick={() => setIsVisible(!isVisible)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {isVisible ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                }
                isRequired
                size="lg"
                type={isVisible ? 'text' : 'password'}
              />
              
              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onValueChange={(value) => setFormData({ ...formData, confirmPassword: value })}
                startContent={<LockClosedIcon className="w-4 h-4 text-gray-400" />}
                isRequired
                size="lg"
                type={isVisible ? 'text' : 'password'}
              />
              
              <div className="text-xs text-gray-500">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-primary-600 hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.
              </div>
              
              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full font-semibold"
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </form>
            
            <Divider className="my-6" />
            
            <div className="text-center">
              <p className="text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
                  Sign in
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
