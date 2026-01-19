import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Tabs,
  Tab,
  Chip,
  Divider,
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

import { mockIdea } from '../data/mockIdea';
import type { Idea } from '../types';

const tabs = [
  { id: 'overview', title: 'Overview', icon: DocumentTextIcon },
  { id: 'financial', title: 'Financial Model', icon: ChartBarIcon },
  { id: 'market', title: 'Market Research', icon: UserGroupIcon },
  { id: 'competitors', title: 'Competitors', icon: UserGroupIcon },
  { id: 'pitch', title: 'Pitch Deck', icon: SparklesIcon },
];

const actionButtons = [
  { label: 'Export', icon: ArrowDownTrayIcon },
  { label: 'Share', icon: ShareIcon },
];

export default function IdeaDetail() {
  const [idea] = useState<Idea>(mockIdea);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const {
    business_plan: plan,
    financial_model: financial,
    market_research: market,
    pitch_deck: pitch,
  } = idea;

  const generationStatus = [
    { name: 'Business Plan', completed: !!plan, icon: DocumentTextIcon },
    { name: 'Financial Model', completed: !!financial, icon: ChartBarIcon },
    { name: 'Market Research', completed: !!market, icon: UserGroupIcon },
    { name: 'Competitor Analysis', completed: !!idea.competitor_analysis, icon: UserGroupIcon },
    { name: 'Pitch Deck', completed: !!pitch, icon: SparklesIcon },
  ];

  const swotCards = plan?.swot_analysis ? [
    {
      title: 'Strengths',
      cardClass: 'bg-success-50',
      titleClass: 'text-success-700',
      textClass: 'text-success-600',
      items: plan.swot_analysis.strengths,
    },
    {
      title: 'Weaknesses',
      cardClass: 'bg-warning-50',
      titleClass: 'text-warning-700',
      textClass: 'text-warning-600',
      items: plan.swot_analysis.weaknesses,
    },
    {
      title: 'Opportunities',
      cardClass: 'bg-primary-50',
      titleClass: 'text-primary-700',
      textClass: 'text-primary-600',
      items: plan.swot_analysis.opportunities,
    },
    {
      title: 'Threats',
      cardClass: 'bg-danger-50',
      titleClass: 'text-danger-700',
      textClass: 'text-danger-600',
      items: plan.swot_analysis.threats,
    },
  ] : [];

  const keyMetrics = financial?.key_metrics;
  const metricCards = keyMetrics ? [
    { value: keyMetrics.cac, label: 'Customer Acquisition Cost', cardClass: 'bg-primary-50', textClass: 'text-primary-600' },
    { value: keyMetrics.ltv, label: 'Lifetime Value', cardClass: 'bg-secondary-50', textClass: 'text-secondary-600' },
    { value: `${keyMetrics.ltv_cac_ratio}x`, label: 'LTV/CAC Ratio', cardClass: 'bg-success-50', textClass: 'text-success-600' },
  ] : [];

  const marketCards = market ? [
    { value: market.tam.value, label: 'TAM', description: market.tam.description, cardClass: 'bg-primary-50', textClass: 'text-primary-600' },
    { value: market.sam.value, label: 'SAM', description: market.sam.description, cardClass: 'bg-secondary-50', textClass: 'text-secondary-600' },
    { value: market.som.value, label: 'SOM', description: market.som.description, cardClass: 'bg-success-50', textClass: 'text-success-600' },
  ] : [];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const overviewContent = plan && (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Executive Summary</h2>
        <p className="text-gray-600">{plan.executive_summary}</p>
      </div>
      
      <Divider />
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Mission</h3>
          <p className="text-gray-600">{plan.mission}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Vision</h3>
          <p className="text-gray-600">{plan.vision}</p>
        </div>
      </div>
      
      <Divider />
      
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Objectives</h3>
        <ul className="space-y-2">
          {plan.objectives.map((obj, i) => (
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
          {swotCards.map((card) => (
            <Card key={card.title} className={card.cardClass}>
              <CardBody>
                <h4 className={`font-semibold ${card.titleClass} mb-2`}>{card.title}</h4>
                <ul className={`text-sm ${card.textClass} space-y-1`}>
                  {card.items.map((item, i) => <li key={i}>â€¢ {item}</li>)}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const financialContent = financial && (
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
            {financial.projections.map((proj) => (
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
        {metricCards.map((metric) => (
          <Card key={metric.label} className={metric.cardClass}>
            <CardBody className="text-center">
              <p className={`text-2xl font-bold ${metric.textClass}`}>{metric.value}</p>
              <p className={`text-sm ${metric.textClass}`}>{metric.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>
      
      <Card className="bg-warning-50">
        <CardBody>
          <h3 className="font-semibold text-warning-700 mb-2">Break-Even Analysis</h3>
          <p className="text-warning-600">
            Expected break-even: {financial.break_even.month} with approximately {financial.break_even.customers_needed.toLocaleString()} customers.
          </p>
        </CardBody>
      </Card>
    </div>
  );

  const marketContent = market && (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        {marketCards.map((card) => (
          <Card key={card.label} className={card.cardClass}>
            <CardBody className="text-center">
              <p className={`text-3xl font-bold ${card.textClass}`}>{card.value}</p>
              <p className={`text-sm ${card.textClass}`}>{card.label}</p>
              <p className="text-xs text-gray-500 mt-1">{card.description}</p>
            </CardBody>
          </Card>
        ))}
      </div>
      
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Market Trends</h3>
        <div className="flex flex-wrap gap-2">
          {market.market_trends.map((trend, i) => (
            <Chip key={i} color="primary" variant="flat">{trend}</Chip>
          ))}
        </div>
      </div>
    </div>
  );

  const pitchContent = pitch && (
    <div className="space-y-6">
      <div className="bg-gray-900 text-white rounded-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Pitch Deck Preview</h2>
            <p className="text-gray-400">{pitch.recommended_length}</p>
          </div>
          <Button color="primary" startContent={<PlayIcon className="w-4 h-4" />}>
            Present
          </Button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {pitch.slides.map((slide, i) => (
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
  );

  const tabContent: Record<string, JSX.Element | null> = {
    overview: overviewContent,
    financial: financialContent,
    market: marketContent,
    competitors: null,
    pitch: pitchContent,
  };

  return (
    <div className="p-6 lg:p-8 font-sans antialiased">
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
            {actionButtons.map((action) => (
              <Button key={action.label} variant="bordered" startContent={<action.icon className="w-4 h-4" />}>
                {action.label}
              </Button>
            ))}
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
              {tabContent[activeTab]}
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
