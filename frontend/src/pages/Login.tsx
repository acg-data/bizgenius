import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Card, CardBody, CardHeader, Divider, Checkbox } from '@heroui/react';
import { SparklesIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { authService } from '../services/api';
import { useAuthStore } from '../store';

export default function Login() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await authService.login(email, password);
      setToken(data.access_token);
      setUser(data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setIsLoading(false);
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
            
            <Divider className="my-6" />
            
            <div className="text-center">
              <p className="text-gray-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">
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
