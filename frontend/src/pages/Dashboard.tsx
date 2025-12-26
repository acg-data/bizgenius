import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Progress,
  Chip,
  Avatar,
  Badge,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react';
import {
  PlusIcon,
  SparklesIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuthStore } from '../store';
import type { Idea } from '../types';

const chartData = [
  { name: 'Jan', value: 4 },
  { name: 'Feb', value: 6 },
  { name: 'Mar', value: 8 },
  { name: 'Apr', value: 12 },
  { name: 'May', value: 15 },
  { name: 'Jun', value: 18 },
];

const recentActivity = [
  { type: 'created', idea: 'Eco-Friendly Packaging', time: '2 hours ago', status: 'completed' },
  { type: 'generated', idea: 'AI-Powered Tutoring Platform', time: '5 hours ago', status: 'completed' },
  { type: 'created', idea: 'Telemedicine App', time: '1 day ago', status: 'in_progress' },
  { type: 'exported', idea: 'Fitness Tracker SaaS', time: '2 days ago', status: 'completed' },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load ideas (mock data for now)
    setIdeas([
      {
        id: 1,
        title: 'AI-Powered Tutoring Platform',
        description: 'An adaptive learning platform that uses AI to personalize education',
        industry: 'EdTech',
        user_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Eco-Friendly Packaging Solution',
        description: 'Sustainable packaging alternatives for e-commerce businesses',
        industry: 'Sustainability',
        user_id: 1,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ]);
    setIsLoading(false);
  }, []);

  const stats = [
    {
      title: 'Total Ideas',
      value: '12',
      change: '+3 this month',
      icon: SparklesIcon,
      color: 'primary',
    },
    {
      title: 'Business Plans',
      value: '8',
      change: '+2 this week',
      icon: DocumentTextIcon,
      color: 'secondary',
    },
    {
      title: 'Pitch Decks',
      value: '5',
      change: '+1 this week',
      icon: ChartBarIcon,
      color: 'success',
    },
    {
      title: 'Funding Raised',
      value: '$2.5M',
      change: 'Via our plans',
      icon: ArrowTrendingUpIcon,
      color: 'warning',
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.full_name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening with your business ideas
          </p>
        </div>
        <Link to="/ideas/new">
          <Button color="primary" size="lg" startContent={<PlusIcon className="w-5 h-5" />}>
            New Idea
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="card-hover">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <Chip size="sm" color="success" variant="flat">
                  {stat.change.split(' ')[0]}
                </Chip>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.title}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Ideas Generated</h2>
              <p className="text-sm text-gray-500">Your progress over the last 6 months</p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#667eea"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    {activity.status === 'completed' ? (
                      <CheckCircleIcon className="w-4 h-4 text-primary-600" />
                    ) : (
                      <ClockIcon className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.idea}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.type === 'created' && 'Created new idea'}
                      {activity.type === 'generated' && 'Generated documents'}
                      {activity.type === 'exported' && 'Exported documents'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Recent Ideas</h2>
            <p className="text-sm text-gray-500">Your latest business ideas</p>
          </div>
          <Link to="/ideas">
            <Button variant="light" color="primary">View All</Button>
          </Link>
        </CardHeader>
        <CardBody>
          <Table aria-label="Recent ideas">
            <TableHeader>
              <TableColumn>IDEA</TableColumn>
              <TableColumn>INDUSTRY</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>CREATED</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {ideas.map((idea) => (
                <TableRow key={idea.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{idea.title}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">{idea.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat">{idea.industry || 'General'}</Chip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={idea.business_plan ? 'success' : 'warning'}
                      variant="flat"
                    >
                      {idea.business_plan ? 'Completed' : 'In Progress'}
                    </Chip>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {new Date(idea.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Link to={`/ideas/${idea.id}`}>
                      <Button size="sm" variant="light" color="primary">View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
