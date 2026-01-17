import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Input, Card, CardBody, CardHeader, Divider, Checkbox } from '@heroui/react';
import { SparklesIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuthActions } from "@convex-dev/auth/react";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signIn("password", { email, password, flow: "signIn" });
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
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

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
      setError(err.message || 'Google sign-in failed');
      setIsGoogleLoading(false);
    }
  };

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
            Welcome Back to BizGenius
          </h1>
          <p className="text-lg text-white/80 mb-8">
            Continue building your business ideas with AI-powered planning tools.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold text-white">10K+</p>
              <p className="text-sm text-white/70">Business Plans Created</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold text-white">5K+</p>
              <p className="text-sm text-white/70">Active Users</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold text-white">$500M+</p>
              <p className="text-sm text-white/70">Funding Raised</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold text-white">98%</p>
              <p className="text-sm text-white/70">Satisfaction Rate</p>
            </div>
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
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-2">Sign in to your account to continue</p>
          </CardHeader>
          
          <CardBody className="pb-8 pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-danger-50 text-danger-600 text-sm">
                  {error}
                </div>
              )}
              
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onValueChange={setEmail}
                startContent={<EnvelopeIcon className="w-4 h-4 text-gray-400" />}
                isRequired
                size="lg"
              />
              
              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onValueChange={setPassword}
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
              
              <div className="flex items-center justify-between">
                <Checkbox size="sm">Remember me</Checkbox>
                <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                  Forgot password?
                </Link>
              </div>
              
              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full font-semibold"
                isLoading={isLoading}
              >
                Sign In
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
                Don't have an account?{' '}
                <Link to={`/register?${searchParams.toString()}`} className="text-primary-600 font-semibold hover:text-primary-700">
                  Sign up free
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
