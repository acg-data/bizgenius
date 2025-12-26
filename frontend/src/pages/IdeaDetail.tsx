import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Tabs,
  Tab,
  Chip,
  Progress,
  Divider,
  Accordion,
  AccordionItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserGroupIcon,
  SparklesIcon,
  PlayIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { Idea } from '../types';

const mockIdea: Idea = {
  id: 1,
  title: 'AI-Powered Tutoring Platform',
  description: 'An adaptive learning platform that uses AI to personalize education for students of all ages',
  industry: 'EdTech',
  target_market: 'K-12 students, Parents, Schools',
  user_id: 1,
  business_plan: {
    executive_summary: 'An innovative AI-powered tutoring platform that revolutionizes personalized learning.',
    mission: 'To make quality education accessible to every student through AI-driven personalized learning.',
    vision: 'A world where every student receives a personalized education tailored to their unique needs.',
    objectives: [
      'Launch MVP within 6 months',
      'Acquire 10,000 active users in first year',
      'Expand to 5 additional subjects',
      'Partner with 100 schools',
    ],
    company_description: 'We are building an AI-powered tutoring platform that adapts to each student\'s learning style.',
    products_services: ['AI Tutor', 'Progress Analytics', 'Parent Dashboard', 'Teacher Tools'],
    marketing_strategy: 'Content marketing, school partnerships, social media campaigns',
    operations_plan: 'Cloud-based infrastructure with 24/7 monitoring',
    management_team: ['CEO: John Doe', 'CTO: Jane Smith', 'CPO: Bob Johnson'],
    swot_analysis: {
      strengths: ['AI technology', 'Experienced team', 'Large market opportunity'],
      weaknesses: ['New market entry', 'Need for initial funding'],
      opportunities: ['Growing EdTech market', 'Increasing adoption of AI'],
      threats: ['Established competitors', 'Regulatory changes'],
    },
  },
  financial_model: {
    assumptions: {
      market_size: '$404 billion EdTech market',
      growth_rate: '15% annually',
      pricing_model: '$19.99/month subscription',
      customer_acquisition_cost: '$45',
      lifetime_value: '$240',
      operating_margin: '25%',
    },
    projections: [
      { year: 1, revenue: 500000, costs: 800000, profit: -300000 },
      { year: 2, revenue: 2000000, costs: 1800000, profit: 200000 },
      { year: 3, revenue: 5000000, costs: 3500000, profit: 1500000 },
      { year: 4, revenue: 10000000, costs: 6000000, profit: 4000000 },
      { year: 5, revenue: 20000000, costs: 10000000, profit: 10000000 },
    ],
    break_even: { month: 'Month 18', customers_needed: 15000 },
    funding_needed: { amount: '$2M', use_of_funds: ['Product development', 'Marketing', 'Team expansion'] },
    key_metrics: {
      cac: '$45',
      ltv: '$240',
      ltv_cac_ratio: '5.3',
      burn_rate: '$66,667/month',
      runway: '30 months',
    },
  },
  market_research: {
    market_overview: 'The EdTech market is experiencing unprecedented growth.',
    tam: { value: '$404B', description: 'Global EdTech market by 2025' },
    sam: { value: '$50B', description: 'K-12 online tutoring in US and Europe' },
    som: { value: '$5B', description: 'AI-powered tutoring market' },
    market_trends: ['AI integration', 'Personalization', 'Mobile-first learning', 'Gamification'],
    target_segments: ['K-12 students', 'Parents', 'Schools', 'Tutors'],
    customer_needs: ['Personalized learning', 'Flexibility', 'Progress tracking', 'Affordability'],
    regulatory_considerations: 'FERPA compliance, data privacy regulations',
    barriers_to_entry: ['Trust building', 'Content development', 'User acquisition'],
  },
  competitor_analysis: {
    competitors: [
      {
        name: 'Khan Academy',
        description: 'Free educational platform',
        strengths: ['Free', 'Trusted brand', 'Large content library'],
        weaknesses: ['Not personalized', 'Limited interactivity'],
        market_position: 'Market leader in free education',
        pricing: 'Free',
        target_audience: 'Students worldwide',
      },
      {
        name: 'Chegg',
        description: 'Homework help platform',
        strengths: ['Large tutor network', 'Quick answers', 'Trusted by students'],
        weaknesses: ['Expensive', 'Reactive not proactive'],
        market_position: 'Homework help leader',
        pricing: '$14.99/month',
        target_audience: 'High school and college students',
      },
    ],
    competitive_advantages: ['AI personalization', 'Adaptive learning', 'Engaging UX'],
    differentiation_strategy: 'Focus on proactive, adaptive learning',
    threats_from_competitors: ['Established brands', 'Larger marketing budgets'],
    recommendations: ['Build strong content library', 'Partner with schools', 'Focus on UX'],
  },
  pitch_deck: {
    slides: [
      { title: 'Problem', content: 'Students struggle with personalized learning', visuals: 'Data visualization', speaker_notes: 'Address the pain point' },
      { title: 'Solution', content: 'AI-powered adaptive tutoring', visuals: 'Product screenshot', speaker_notes: 'Show the product' },
      { title: 'Market', content: '$404B opportunity', visuals: 'Market size chart', speaker_notes: 'Show the opportunity' },
    ],
    recommended_length: '10-12 slides',
    key_messages: ['AI personalization works', 'Large market', 'Experienced team'],
    call_to_action: 'Join us in revolutionizing education',
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const tabs = [
  { id: 'overview', title: 'Overview', icon: DocumentTextIcon },
  { id: 'financial', title: 'Financial Model', icon: ChartBarIcon },
  { id: 'market', title: 'Market Research', icon: UserGroupIcon },
  { id: 'competitors', title: 'Competitors', icon: UserGroupIcon },
  { id: 'pitch', title: 'Pitch Deck', icon: SparklesIcon },
];

export default function IdeaDetail() {
  const { id } = useParams();
  const [idea] = useState<Idea>(mockIdea);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const generationStatus = [
    { name: 'Business Plan', completed: !!idea.business_plan, icon: DocumentTextIcon },
    { name: 'Financial Model', completed: !!idea.financial_model, icon: ChartBarIcon },
    { name: 'Market Research', completed: !!idea.market_research, icon: UserGroupIcon },
    { name: 'Competitor Analysis', completed: !!idea.competitor_analysis, icon: UserGroupIcon },
    { name: 'Pitch Deck', completed: !!idea.pitch_deck, icon: SparklesIcon },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <Link to="/ideas" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Ideas
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{idea.title}</h1>
            <p className="text-gray-500 mt-1">{idea.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Chip size="sm" color="primary" variant="flat">{idea.industry}</Chip>
              <Chip size="sm" variant="flat">Created {new Date(idea.created_at).toLocaleDateString()}</Chip>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="bordered" startContent={<ArrowDownTrayIcon className="w-4 h-4" />}>
              Export
            </Button>
            <Button variant="bordered" startContent={<ShareIcon className="w-4 h-4" />}>
              Share
            </Button>
            <Button color="primary" startContent={<SparklesIcon className="w-4 h-4" />} isLoading={isGenerating} onClick={handleGenerate}>
              Generate
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="border-b border-gray-100">
              <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as string)}
                variant="underlined"
                classNames={{
                  tabList: 'gap-6',
                  cursor: 'bg-primary-500',
                  tab: 'px-0 h-12',
                }}
              >
                {tabs.map((tab) => (
                  <Tab
                    key={tab.id}
                    title={
                      <div className="flex items-center gap-2">
                        <tab.icon className="w-4 h-4" />
                        {tab.title}
                      </div>
                    }
                  />
                ))}
              </Tabs>
            </CardHeader>
            
            <CardBody className="p-6">
              {activeTab === 'overview' && idea.business_plan && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Executive Summary</h2>
                    <p className="text-gray-600">{idea.business_plan.executive_summary}</p>
                  </div>
                  
                  <Divider />
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Mission</h3>
                      <p className="text-gray-600">{idea.business_plan.mission}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Vision</h3>
                      <p className="text-gray-600">{idea.business_plan.vision}</p>
                    </div>
                  </div>
                  
                  <Divider />
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Objectives</h3>
                    <ul className="space-y-2">
                      {idea.business_plan.objectives.map((obj, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-600">
                          <CheckCircleIcon className="w-4 h-4 text-primary-500" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Divider />
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">SWOT Analysis</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="bg-success-50">
                        <CardBody>
                          <h4 className="font-semibold text-success-700 mb-2">Strengths</h4>
                          <ul className="text-sm text-success-600 space-y-1">
                            {idea.business_plan.swot_analysis.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                          </ul>
                        </CardBody>
                      </Card>
                      <Card className="bg-warning-50">
                        <CardBody>
                          <h4 className="font-semibold text-warning-700 mb-2">Weaknesses</h4>
                          <ul className="text-sm text-warning-600 space-y-1">
                            {idea.business_plan.swot_analysis.weaknesses.map((w, i) => <li key={i}>• {w}</li>)}
                          </ul>
                        </CardBody>
                      </Card>
                      <Card className="bg-primary-50">
                        <CardBody>
                          <h4 className="font-semibold text-primary-700 mb-2">Opportunities</h4>
                          <ul className="text-sm text-primary-600 space-y-1">
                            {idea.business_plan.swot_analysis.opportunities.map((o, i) => <li key={i}>• {o}</li>)}
                          </ul>
                        </CardBody>
                      </Card>
                      <Card className="bg-danger-50">
                        <CardBody>
                          <h4 className="font-semibold text-danger-700 mb-2">Threats</h4>
                          <ul className="text-sm text-danger-600 space-y-1">
                            {idea.business_plan.swot_analysis.threats.map((t, i) => <li key={i}>• {t}</li>)}
                          </ul>
                        </CardBody>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'financial' && idea.financial_model && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Projections</h2>
                    <Table aria-label="Financial projections">
                      <TableHeader>
                        <TableColumn>YEAR</TableColumn>
                        <TableColumn>REVENUE</TableColumn>
                        <TableColumn>COSTS</TableColumn>
                        <TableColumn>PROFIT</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {idea.financial_model.projections.map((proj) => (
                          <TableRow key={proj.year}>
                            <TableCell>Year {proj.year}</TableCell>
                            <TableCell>${proj.revenue.toLocaleString()}</TableCell>
                            <TableCell>${proj.costs.toLocaleString()}</TableCell>
                            <TableCell className={proj.profit >= 0 ? 'text-success' : 'text-danger'}>
                              ${proj.profit.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="bg-primary-50">
                      <CardBody className="text-center">
                        <p className="text-2xl font-bold text-primary-600">{idea.financial_model.key_metrics.cac}</p>
                        <p className="text-sm text-primary-600">Customer Acquisition Cost</p>
                      </CardBody>
                    </Card>
                    <Card className="bg-secondary-50">
                      <CardBody className="text-center">
                        <p className="text-2xl font-bold text-secondary-600">{idea.financial_model.key_metrics.ltv}</p>
                        <p className="text-sm text-secondary-600">Lifetime Value</p>
                      </CardBody>
                    </Card>
                    <Card className="bg-success-50">
                      <CardBody className="text-center">
                        <p className="text-2xl font-bold text-success-600">{idea.financial_model.key_metrics.ltv_cac_ratio}x</p>
                        <p className="text-sm text-success-600">LTV/CAC Ratio</p>
                      </CardBody>
                    </Card>
                  </div>
                  
                  <Card className="bg-warning-50">
                    <CardBody>
                      <h3 className="font-semibold text-warning-700 mb-2">Break-Even Analysis</h3>
                      <p className="text-warning-600">
                        Expected break-even: {idea.financial_model.break_even.month} with approximately {idea.financial_model.break_even.customers_needed.toLocaleString()} customers.
                      </p>
                    </CardBody>
                  </Card>
                </div>
              )}
              
              {activeTab === 'market' && idea.market_research && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="bg-primary-50">
                      <CardBody className="text-center">
                        <p className="text-3xl font-bold text-primary-600">{idea.market_research.tam.value}</p>
                        <p className="text-sm text-primary-600">TAM</p>
                        <p className="text-xs text-gray-500 mt-1">{idea.market_research.tam.description}</p>
                      </CardBody>
                    </Card>
                    <Card className="bg-secondary-50">
                      <CardBody className="text-center">
                        <p className="text-3xl font-bold text-secondary-600">{idea.market_research.sam.value}</p>
                        <p className="text-sm text-secondary-600">SAM</p>
                        <p className="text-xs text-gray-500 mt-1">{idea.market_research.sam.description}</p>
                      </CardBody>
                    </Card>
                    <Card className="bg-success-50">
                      <CardBody className="text-center">
                        <p className="text-3xl font-bold text-success-600">{idea.market_research.som.value}</p>
                        <p className="text-sm text-success-600">SOM</p>
                        <p className="text-xs text-gray-500 mt-1">{idea.market_research.som.description}</p>
                      </CardBody>
                    </Card>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Market Trends</h3>
                    <div className="flex flex-wrap gap-2">
                      {idea.market_research.market_trends.map((trend, i) => (
                        <Chip key={i} color="primary" variant="flat">{trend}</Chip>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'pitch' && idea.pitch_deck && (
                <div className="space-y-6">
                  <div className="bg-gray-900 text-white rounded-xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold">Pitch Deck Preview</h2>
                        <p className="text-gray-400">{idea.pitch_deck.recommended_length}</p>
                      </div>
                      <Button color="primary" startContent={<PlayIcon className="w-4 h-4" />}>
                        Present
                      </Button>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      {idea.pitch_deck.slides.map((slide, i) => (
                        <Card key={i} className="bg-gray-800">
                          <CardBody className="p-4">
                            <p className="text-sm font-medium text-white mb-2">{i + 1}. {slide.title}</p>
                            <p className="text-xs text-gray-400">{slide.content.substring(0, 60)}...</p>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Generation Status</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {generationStatus.map((status) => (
                <div key={status.name} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${status.completed ? 'bg-success-100' : 'bg-gray-100'}`}>
                    {status.completed ? (
                      <CheckCircleIcon className="w-5 h-5 text-success-600" />
                    ) : (
                      <ClockIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{status.name}</p>
                    <p className="text-xs text-gray-500">{status.completed ? 'Generated' : 'Not yet generated'}</p>
                  </div>
                </div>
              ))}
              
              <Divider />
              
              <Button color="primary" className="w-full" startContent={<SparklesIcon className="w-4 h-4" />} isLoading={isGenerating} onClick={handleGenerate}>
                Generate All
              </Button>
              
              <div className="text-xs text-gray-500 text-center">
                Generation uses AI credits. Pro plan includes unlimited generations.
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
