import { Link } from 'react-router-dom';
import { Card, CardBody, Button, Input } from '@heroui/react';
import {
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  VideoCameraIcon,
  EnvelopeIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      { q: 'How do I create my first business idea?', a: 'Click "New Idea" in your dashboard or navigate to the Ideas page and click the "+" card. Fill in your business idea details and our AI will generate a comprehensive plan.' },
      { q: 'What information do I need to provide?', a: 'The more details you share about your idea, target market, and unique value proposition, the better your generated business plan will be.' },
      { q: 'How long does generation take?', a: 'Most business plans are generated within 2-5 minutes. Complex requests with full financial models may take up to 10 minutes.' },
    ],
  },
  {
    category: 'Billing & Subscription',
    questions: [
      { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time from Settings > Billing. You\'ll keep access until the end of your billing period.' },
      { q: 'Do you offer refunds?', a: 'We offer a 30-day money-back guarantee. Contact support within 30 days of purchase for a full refund.' },
      { q: 'How does the Daily Coach work?', a: 'Daily Coach provides AI-powered guidance, action items, and weekly progress reports to help you execute on your business plan.' },
    ],
  },
  {
    category: 'Documents & Export',
    questions: [
      { q: 'What formats can I export to?', a: 'Pro plans can export to PDF, PowerPoint (PPTX), and Excel. Free plans can export to PDF only.' },
      { q: 'Can I edit generated documents?', a: 'Yes, all generated content is editable. You can modify any section directly in the app before exporting.' },
      { q: 'Is my data secure?', a: 'We use industry-standard encryption and never share your data. Your business ideas are private to your account.' },
    ],
  },
];

const resources = [
  { icon: BookOpenIcon, title: 'Documentation', desc: 'Learn how to use BizGenius', link: '#' },
  { icon: VideoCameraIcon, title: 'Video Tutorials', desc: 'Step-by-step guides', link: '#' },
  { icon: ChatBubbleLeftRightIcon, title: 'Community Forum', desc: 'Connect with other users', link: '#' },
];

export default function Help() {
  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">How can we help?</h1>
          <Input
            placeholder="Search for help..."
            startContent={<MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />}
            size="lg"
            className="max-w-xl mx-auto"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {resources.map((resource) => (
            <Card key={resource.title} isHoverable className="card-hover">
              <CardBody className="p-6 text-center">
                <resource.icon className="w-10 h-10 text-primary-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{resource.desc}</p>
                <Button variant="light" color="primary" endContent={<ChevronRightIcon className="w-4 h-4" />}>
                  View
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="space-y-12">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.category}</h2>
              <div className="space-y-4">
                {section.questions.map((faq, index) => (
                  <Card key={index}>
                    <CardBody className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                      <p className="text-gray-600">{faq.a}</p>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Card className="mt-12 bg-primary-50 border border-primary-100">
          <CardBody className="p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Still need help?</h3>
            <p className="text-gray-600 mb-6">Our support team is here to assist you</p>
            <Button color="primary" size="lg" startContent={<EnvelopeIcon className="w-5 h-5" />}>
              Contact Support
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
