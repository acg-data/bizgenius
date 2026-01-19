export type BusinessMode = 'idea' | 'existing';

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  question: string;
  why_important: string;
  category: string;
  mece_dimension?: string;
  options?: QuestionOption[];
  allow_custom_input?: boolean;
  example_answer?: string;
  isCompanyName?: boolean;
}

// 5 essential questions - focused on what the AI actually needs
export const CANNED_QUESTIONS: Question[] = [
  {
    id: 'target_market',
    question: 'Who will pay for this?',
    why_important: 'Shapes market research, personas, and go-to-market strategy.',
    category: 'target_customer',
    options: [
      { value: 'b2c', label: 'Individual consumers (B2C)' },
      { value: 'b2b_smb', label: 'Small/medium businesses' },
      { value: 'b2b_enterprise', label: 'Large enterprises' },
      { value: 'both', label: 'Both consumers and businesses' }
    ]
  },
  {
    id: 'problem',
    question: "What's the #1 pain point you solve?",
    why_important: 'Your problem statement drives the entire value proposition and pitch.',
    category: 'differentiation',
    allow_custom_input: true,
    example_answer: 'e.g., "Small restaurants lose 30% of revenue to delivery app fees"'
  },
  {
    id: 'geography',
    question: 'Where will you operate first?',
    why_important: 'Geography determines market size calculations and regulatory considerations.',
    category: 'location',
    options: [
      { value: 'local', label: 'Single city or region' },
      { value: 'national', label: 'One country (national)' },
      { value: 'global', label: 'Online / Global' }
    ]
  },
  {
    id: 'revenue_model',
    question: 'How will customers pay you?',
    why_important: 'Revenue model shapes your financial projections and business strategy.',
    category: 'business_model',
    options: [
      { value: 'subscription', label: 'Subscription (recurring)' },
      { value: 'transaction', label: 'Per-transaction or one-time' },
      { value: 'marketplace', label: 'Marketplace fees' },
      { value: 'services', label: 'Services / consulting' },
      { value: 'freemium', label: 'Free + premium / ads' }
    ]
  },
  {
    id: 'stage',
    question: 'Where are you at today?',
    why_important: "We'll tailor projections and recommendations to your current reality.",
    category: 'timeline',
    options: [
      { value: 'idea', label: 'Just an idea' },
      { value: 'building', label: 'Building product/MVP' },
      { value: 'launched', label: 'Launched with customers' },
      { value: 'growing', label: 'Growing with revenue' }
    ]
  }
];
