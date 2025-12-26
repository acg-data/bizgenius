import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Input, Textarea, Select, SelectItem, Progress } from '@heroui/react';
import { SparklesIcon, ArrowRightIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { ideaService } from '../services/api';
import { useAuthStore } from '../store';

const industries = [
  { value: 'technology', label: 'Technology & Software', emoji: '💻' },
  { value: 'healthcare', label: 'Healthcare & Medical', emoji: '🏥' },
  { value: 'finance', label: 'Finance & Fintech', emoji: '💰' },
  { value: 'education', label: 'Education & EdTech', emoji: '📚' },
  { value: 'e-commerce', label: 'E-commerce & Retail', emoji: '🛒' },
  { value: 'sustainability', label: 'Sustainability & CleanTech', emoji: '🌱' },
  { value: 'food', label: 'Food & Beverage', emoji: '🍕' },
  { value: 'fitness', label: 'Health & Fitness', emoji: '💪' },
  { value: 'real-estate', label: 'Real Estate & PropTech', emoji: '🏠' },
  { value: 'entertainment', label: 'Entertainment & Media', emoji: '🎬' },
  { value: 'travel', label: 'Travel & Tourism', emoji: '✈️' },
  { value: 'other', label: 'Other', emoji: '✨' },
];

export default function CreateIdea() {
  const navigate = useNavigate();
  const { addIdea } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    industry: '',
    target_market: '',
    problem: '',
    solution: '',
    uniqueness: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const idea = await ideaService.create(formData);
      addIdea(idea);
      navigate(`/ideas/${idea.id}`);
    } catch (error) {
      console.error('Error creating idea:', error);
      setIsLoading(false);
    }
  };

  const isStep1Valid = formData.title && formData.description && formData.industry;
  const isStep2Valid = formData.target_market && formData.problem && formData.solution;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Idea</h1>
        <p className="text-gray-500 mt-1">Share your business idea and let AI build a complete plan</p>
      </div>

      <Progress
        value={step === 1 ? 33 : step === 2 ? 66 : 100}
        color="primary"
        classNames={{ base: 'mb-8' }}
      />

      <Card>
        <CardBody className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                  <p className="text-sm text-gray-500">Tell us about your business idea</p>
                </div>
              </div>

              <Input
                label="Business Idea Title"
                placeholder="e.g., AI-Powered Personal Fitness Coach"
                value={formData.title}
                onValueChange={(value) => setFormData({ ...formData, title: value })}
                size="lg"
                isRequired
              />

              <Textarea
                label="Describe Your Idea"
                placeholder="What does your business do? What problem does it solve?"
                value={formData.description}
                onValueChange={(value) => setFormData({ ...formData, description: value })}
                minRows={4}
                isRequired
              />

              <Select
                label="Industry"
                placeholder="Select an industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                isRequired
                size="lg"
              >
                {industries.map((industry) => (
                  <SelectItem key={industry.value} value={industry.value}>
                    {industry.emoji} {industry.label}
                  </SelectItem>
                ))}
              </Select>

              <div className="flex justify-end pt-4">
                <Button
                  color="primary"
                  size="lg"
                  onClick={() => setStep(2)}
                  isDisabled={!isStep1Valid}
                  endContent={<ArrowRightIcon className="w-5 h-5" />}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-secondary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">More Details</h2>
                  <p className="text-sm text-gray-500">Help us understand your idea better</p>
                </div>
              </div>

              <Input
                label="Target Market"
                placeholder="Who are your customers? What demographics?"
                value={formData.target_market}
                onValueChange={(value) => setFormData({ ...formData, target_market: value })}
                size="lg"
              />

              <Textarea
                label="Problem Statement"
                placeholder="What problem does your product/service solve?"
                value={formData.problem}
                onValueChange={(value) => setFormData({ ...formData, problem: value })}
                minRows={3}
              />

              <Textarea
                label="Your Solution"
                placeholder="How does your product/service solve this problem?"
                value={formData.solution}
                onValueChange={(value) => setFormData({ ...formData, solution: value })}
                minRows={3}
              />

              <Textarea
                label="What Makes You Unique"
                placeholder="What differentiates you from competitors?"
                value={formData.uniqueness}
                onValueChange={(value) => setFormData({ ...formData, uniqueness: value })}
                minRows={3}
              />

              <div className="flex justify-between pt-4">
                <Button variant="light" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  color="primary"
                  size="lg"
                  onClick={() => setStep(3)}
                  isDisabled={!isStep2Valid}
                  endContent={<ArrowRightIcon className="w-5 h-5" />}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Ready to Generate!</h2>
                <p className="text-gray-500 mt-2">
                  We'll use AI to create a comprehensive business plan, financial model, and more.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Idea Title</p>
                  <p className="text-gray-900 font-medium">{formData.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Industry</p>
                  <p className="text-gray-900">
                    {industries.find((i) => i.value === formData.industry)?.label}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="text-gray-900">{formData.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-primary-50 border border-primary-100">
                  <CardBody className="p-4">
                    <DocumentTextIcon className="w-6 h-6 text-primary-600 mb-2" />
                    <p className="font-medium text-gray-900">Business Plan</p>
                    <p className="text-sm text-gray-500">Executive summary, strategy, operations</p>
                  </CardBody>
                </Card>
                <Card className="bg-secondary-50 border border-secondary-100">
                  <CardBody className="p-4">
                    <SparklesIcon className="w-6 h-6 text-secondary-600 mb-2" />
                    <p className="font-medium text-gray-900">Financial Model</p>
                    <p className="text-sm text-gray-500">Projections, break-even, funding needs</p>
                  </CardBody>
                </Card>
                <Card className="bg-success-50 border border-success-100">
                  <CardBody className="p-4">
                    <SparklesIcon className="w-6 h-6 text-success-600 mb-2" />
                    <p className="font-medium text-gray-900">Market Research</p>
                    <p className="text-sm text-gray-500">TAM, SAM, SOM, trends</p>
                  </CardBody>
                </Card>
                <Card className="bg-warning-50 border border-warning-100">
                  <CardBody className="p-4">
                    <SparklesIcon className="w-6 h-6 text-warning-600 mb-2" />
                    <p className="font-medium text-gray-900">Pitch Deck</p>
                    <p className="text-sm text-gray-500">Investor-ready presentation</p>
                  </CardBody>
                </Card>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="light" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  color="primary"
                  size="lg"
                  onClick={handleSubmit}
                  isLoading={isLoading}
                  startContent={<SparklesIcon className="w-5 h-5" />}
                >
                  Generate Business Plan
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
