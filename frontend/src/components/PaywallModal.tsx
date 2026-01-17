import { useState } from 'react';
import {
  LockClosedIcon,
  CheckIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useAction } from '../lib/convex';
import { api } from '../convex/_generated/api';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
}

const features = [
  'Complete Financial Model with 5-year projections',
  'Break-even analysis & funding strategy',
  'Investor-ready Pitch Deck (10-12 slides)',
  'Speaker notes & investor FAQs',
  'CSV & Google Sheets export',
  'Unlimited generations'
];

export default function PaywallModal({ isOpen, onClose, sessionId }: PaywallModalProps) {
  const { isAuthenticated } = useAuth();
  const createCheckoutSession = useAction(api.stripe.createCheckoutSession);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      localStorage.setItem('myceo_pending_upgrade', JSON.stringify({ sessionId, plan: selectedPlan }));
      window.location.href = '/login?redirect=results&upgrade=true';
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createCheckoutSession({
        tier: 'premium',
        billing: selectedPlan,
        successUrl: `${window.location.origin}/dashboard?checkout=success`,
        cancelUrl: `${window.location.origin}/pricing?checkout=canceled`,
      });

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="absolute top-4 right-4">
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 px-8 py-10 text-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4">
            <LockClosedIcon className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Unlock Pro Features</h2>
          <p className="text-white/80">Get the complete business analysis toolkit</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedPlan === 'monthly'
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl font-bold text-gray-900">$29</div>
              <div className="text-sm text-gray-500">/month</div>
            </button>
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`p-4 rounded-xl border-2 transition-all relative ${
                selectedPlan === 'yearly'
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                SAVE 17%
              </div>
              <div className="text-2xl font-bold text-gray-900">$290</div>
              <div className="text-sm text-gray-500">/year</div>
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckIcon className="w-3 h-3 text-emerald-600" />
                </div>
                <span className="text-gray-700 text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : isAuthenticated ? 'Upgrade Now' : 'Sign Up & Upgrade'}
          </button>

          <p className="text-center text-xs text-gray-500 mt-4">
            Cancel anytime. Secure payment via Stripe.
          </p>
        </div>
      </div>
    </div>
  );
}

interface LockedSectionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  preview?: {
    available_years?: number;
    has_break_even?: boolean;
    has_funding_strategy?: boolean;
    total_slides?: number;
    slide_titles?: string[];
  };
  onUnlock: () => void;
}

export function LockedSectionCard({ title, description, icon: Icon, preview, onUnlock }: LockedSectionCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5" />
      
      <div className="relative p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-violet-600" />
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-2">
          <LockClosedIcon className="w-4 h-4 text-violet-600" />
          <span className="text-xs font-semibold text-violet-600 uppercase tracking-wider">Pro Feature</span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>

        {preview && (
          <div className="bg-white/80 rounded-xl p-4 mb-6 text-left max-w-xs mx-auto">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Preview</div>
            {preview.available_years && (
              <div className="text-sm text-gray-600">
                <CheckIcon className="w-4 h-4 inline text-emerald-500 mr-1" />
                {preview.available_years}-year financial projections ready
              </div>
            )}
            {preview.has_break_even && (
              <div className="text-sm text-gray-600">
                <CheckIcon className="w-4 h-4 inline text-emerald-500 mr-1" />
                Break-even analysis included
              </div>
            )}
            {preview.has_funding_strategy && (
              <div className="text-sm text-gray-600">
                <CheckIcon className="w-4 h-4 inline text-emerald-500 mr-1" />
                Funding strategy ready
              </div>
            )}
            {preview.total_slides && (
              <div className="text-sm text-gray-600">
                <CheckIcon className="w-4 h-4 inline text-emerald-500 mr-1" />
                {preview.total_slides} investor slides ready
              </div>
            )}
            {preview.slide_titles && preview.slide_titles.length > 0 && (
              <div className="text-xs text-gray-400 mt-2">
                Includes: {preview.slide_titles.slice(0, 3).join(', ')}...
              </div>
            )}
          </div>
        )}

        <button
          onClick={onUnlock}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all"
        >
          <SparklesIcon className="w-5 h-5" />
          Unlock with Pro
        </button>
      </div>
    </div>
  );
}
