import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Input, Card, CardBody, CardHeader, Divider } from '@heroui/react';
import { SparklesIcon, EnvelopeIcon, LockClosedIcon, UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuthActions } from "@convex-dev/auth/react";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuthActions();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      await signIn("google");
      const redirect = searchParams.get('redirect') || '/ideas';
      const idea = searchParams.get('idea');
      const mode = searchParams.get('mode');
      const websiteUrl = searchParams.get('websiteUrl');

      const redirectParams = new URLSearchParams();
      if (idea) redirectParams.set('idea', idea);
      if (mode) redirectParams.set('mode', mode);
      if (websiteUrl) redirectParams.set('websiteUrl', websiteUrl);

      const target = redirectParams.toString()
        ? `${redirect}?${redirectParams.toString()}`
        : redirect;

      navigate(target);
    } catch (err: any) {
      setError(err.message || 'Google sign-up failed');
      setIsGoogleLoading(false);
    }
  };

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
      await signIn("password", {
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
        flow: "signUp"
      });

      const redirect = searchParams.get('redirect') || '/ideas';
      const idea = searchParams.get('idea');
      const mode = searchParams.get('mode');
      const websiteUrl = searchParams.get('websiteUrl');

      const redirectParams = new URLSearchParams();
      if (idea) redirectParams.set('idea', idea);
      if (mode) redirectParams.set('mode', mode);
      if (websiteUrl) redirectParams.set('websiteUrl', websiteUrl);

      const target = redirectParams.toString()
        ? `${redirect}?${redirectParams.toString()}`
        : redirect;

      navigate(target);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
            
            <div className="relative my-6">
              <Divider />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm text-gray-500">
                or
              </span>
            </div>

            <Button
              variant="bordered"
              size="lg"
              className="w-full font-medium"
              isLoading={isGoogleLoading}
              onPress={handleGoogleSignIn}
              startContent={
                !isGoogleLoading && (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )
              }
            >
              Continue with Google
            </Button>

            <Divider className="my-6" />

            <div className="text-center">
              <p className="text-gray-500">
                Already have an account?{' '}
                <Link to={`/login?${searchParams.toString()}`} className="text-primary-600 font-semibold hover:text-primary-700">
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
