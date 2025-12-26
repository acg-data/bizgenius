import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardBody,
  Button,
  Input,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Progress,
} from '@heroui/react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  DocumentTextIcon,
  ChartBarIcon,
  SparklesIcon,
  EyeIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import type { Idea } from '../types';

const mockIdeas: Idea[] = [
  {
    id: 1,
    title: 'AI-Powered Tutoring Platform',
    description: 'An adaptive learning platform that uses AI to personalize education for students of all ages',
    industry: 'EdTech',
    target_market: 'K-12 students, Parents, Schools',
    user_id: 1,
    business_plan: { executive_summary: 'Test' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Eco-Friendly Packaging Solution',
    description: 'Sustainable packaging alternatives for e-commerce businesses using biodegradable materials',
    industry: 'Sustainability',
    target_market: 'E-commerce businesses, Retailers',
    user_id: 1,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    title: 'Telemedicine App',
    description: 'Mobile app connecting patients with healthcare providers for virtual consultations',
    industry: 'Healthcare',
    target_market: 'Patients, Healthcare providers, Insurance companies',
    user_id: 1,
    financial_model: { assumptions: { market_size: 'Test' } },
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 4,
    title: 'Fitness Tracker SaaS',
    description: 'Comprehensive fitness and wellness platform with AI-powered workout recommendations',
    industry: 'Health & Fitness',
    target_market: 'Fitness enthusiasts, Gyms, Corporate wellness programs',
    user_id: 1,
    pitch_deck: { slides: [] },
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 259200000).toISOString(),
  },
];

const industries = ['All', 'EdTech', 'Healthcare', 'Sustainability', 'Health & Fitness', 'Finance', 'E-commerce'];

export default function IdeasList() {
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredIdeas = mockIdeas.filter((idea) => {
    const matchesSearch = idea.title.toLowerCase().includes(search.toLowerCase()) ||
      idea.description.toLowerCase().includes(search.toLowerCase());
    const matchesIndustry = selectedIndustry === 'All' || idea.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const getStatus = (idea: Idea) => {
    const generated = [
      idea.business_plan ? 1 : 0,
      idea.financial_model ? 1 : 0,
      idea.market_research ? 1 : 0,
      idea.pitch_deck ? 1 : 0,
    ].reduce((a, b) => a + b, 0);
    return { count: generated, total: 4 };
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Ideas</h1>
          <p className="text-gray-500 mt-1">Manage and develop your business ideas</p>
        </div>
        <Link to="/ideas/new">
          <Button color="primary" size="lg" startContent={<PlusIcon className="w-5 h-5" />}>
            New Idea
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search ideas..."
          value={search}
          onValueChange={setSearch}
          startContent={<MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />}
          className="flex-1"
          size="lg"
        />
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered" size="lg">
              {selectedIndustry}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Industry filter"
            onAction={(key) => setSelectedIndustry(key as string)}
          >
            {industries.map((industry) => (
              <DropdownItem key={industry}>{industry}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIdeas.map((idea) => {
          const status = getStatus(idea);
          return (
            <Card key={idea.id} className="card-hover">
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <Chip size="sm" color="primary" variant="flat">
                    {idea.industry || 'General'}
                  </Chip>
                  <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                      <Button isIconOnly variant="light" size="sm">
                        <EllipsisVerticalIcon className="w-5 h-5" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Actions">
                      <DropdownItem
                        key="view"
                        startContent={<EyeIcon className="w-4 h-4" />}
                        as={Link}
                        to={`/ideas/${idea.id}`}
                      >
                        View Details
                      </DropdownItem>
                      <DropdownItem
                        key="edit"
                        startContent={<PencilIcon className="w-4 h-4" />}
                      >
                        Edit
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        color="danger"
                        startContent={<TrashIcon className="w-4 h-4" />}
                      >
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                  {idea.title}
                </h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                  {idea.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium">{status.count}/4 generated</span>
                  </div>
                  <Progress
                    value={(status.count / status.total) * 100}
                    size="sm"
                    color="primary"
                    classNames={{
                      base: 'w-full',
                      track: 'bg-gray-200',
                    }}
                  />
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  {idea.business_plan && (
                    <Chip size="sm" variant="flat" startContent={<DocumentTextIcon className="w-3 h-3" />}>
                      Plan
                    </Chip>
                  )}
                  {idea.financial_model && (
                    <Chip size="sm" variant="flat" color="secondary" startContent={<ChartBarIcon className="w-3 h-3" />}>
                      Financial
                    </Chip>
                  )}
                  {idea.pitch_deck && (
                    <Chip size="sm" variant="flat" color="success" startContent={<SparklesIcon className="w-3 h-3" />}>
                      Deck
                    </Chip>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {new Date(idea.created_at).toLocaleDateString()}
                  </span>
                  <Link to={`/ideas/${idea.id}`}>
                    <Button size="sm" color="primary" variant="light">
                      Continue →
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          );
        })}

        <Card className="border-2 border-dashed border-gray-300">
          <CardBody className="p-6 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
              <PlusIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">New Business Idea</h3>
            <p className="text-gray-500 text-sm mb-4">
              Have an idea? Let AI help you build a complete business plan.
            </p>
            <Link to="/ideas/new">
              <Button color="primary">Get Started</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
