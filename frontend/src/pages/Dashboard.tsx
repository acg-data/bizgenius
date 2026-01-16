import { Link } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
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
} from '@heroicons/react/24/outline';
import { useQuery, useMutation } from '../lib/convex';
import { api } from '../convex/_generated/api';
import { useAuth } from '../hooks/useAuth';
import { getLimitsForUser } from '../convex/lib/limits';

export default function Dashboard() {
  const { user } = useAuth();
  // Convex useQuery returns data directly (undefined while loading, null if no data)
  const ideas = useQuery(api.ideas.listIdeas, {});
  const usage = useQuery(api.users.checkUsageLimits, {});
  const isLoading = ideas === undefined;
  const deleteIdea = useMutation(api.ideas.deleteIdea);
  
  const limits = getLimitsForUser(user?.subscription_tier || "free");
  
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this idea?")) {
      await deleteIdea({ id });
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-apple-bg min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }
  
  const stats = [
    {
      title: 'Total Ideas',
      value: String(ideas?.length || 0),
      change: `${usage?.analyses_used || 0}/${usage?.analyses_limit === -1 ? '∞' : usage?.analyses_limit} this month`,
      icon: SparklesIcon,
      color: 'primary',
    },
    {
      title: 'Current Plan',
      value: user?.subscription_tier || "free",
      change: limits.maxIdeas === -1 ? "Unlimited" : `${limits.maxIdeas} ideas max`,
      icon: ChartBarIcon,
      color: 'secondary',
    },
    {
      title: 'Subscription Status',
      value: user?.subscription_status || "inactive",
      change: limits.hasExport ? "Export enabled" : "Basic tier",
      icon: DocumentTextIcon,
      color: 'success',
    },
  ];
  
  return (
    <div className="bg-apple-bg min-h-screen font-sans antialiased">
      <nav className="fixed top-0 w-full z-50 glass-panel">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <SparklesIcon className="w-5 h-5 text-apple-text" />
            <span className="text-lg tracking-tight">myCEO</span>
          </Link>
          <span className="text-sm font-medium text-apple-gray">
            Dashboard
          </span>
        </div>
      </nav>
      
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-apple-text mb-2">Welcome back, {user?.full_name?.split(' ')[0] || 'there'}!</h1>
          <p className="text-apple-gray">Here's what's happening with your business ideas</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="bg-white shadow-card border border-gray-100">
              <CardBody className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-apple-gray mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-apple-text">{stat.value}</p>
                    <p className="text-sm text-apple-gray mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full ${
                    stat.color === 'primary' ? 'bg-primary-100' :
                    stat.color === 'secondary' ? 'bg-secondary-100' :
                    stat.color === 'success' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <stat.icon className={`w-6 h-6 ${
                      stat.color === 'primary' ? 'text-primary-600' :
                      stat.color === 'secondary' ? 'text-secondary-600' :
                      stat.color === 'success' ? 'text-green-600' : 'text-gray-600'
                    }`} />
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
        
        {/* Upgrade Banner if needed */}
        {user?.subscription_tier === 'free' && (
          <Card className="bg-gradient-to-r from-primary-500 to-blue-600 text-white mb-8">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Upgrade to Unlock All Features</h3>
                  <p className="text-sm opacity-90 mb-4">
                    Get unlimited analyses, full financial projections, investor-ready pitch decks, and more.
                  </p>
                  <div className="flex gap-3">
                    <Link 
                      to="/pricing"
                      className="inline-flex items-center gap-2 bg-white text-primary-600 font-medium px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      View Plans
                      <ArrowTrendingUpIcon className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
        
        {/* Ideas List */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
          <CardHeader className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-apple-text">Your Business Ideas</h2>
              <Link 
                to="/ideas/new"
                className="inline-flex items-center gap-2 bg-apple-text text-white font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                New Idea
              </Link>
            </div>
          </CardHeader>
          
          {!ideas || ideas.length === 0 ? (
            <CardBody className="p-12 text-center">
              <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-apple-text mb-2">No ideas yet</h3>
              <p className="text-sm text-apple-gray mb-6">Create your first business idea to get started</p>
              <Link 
                to="/ideas/new"
                className="inline-flex items-center gap-2 bg-apple-text text-white font-medium px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Create Idea
              </Link>
            </CardBody>
          ) : (
            <Table aria-label="Ideas table">
              <TableHeader>
                <TableColumn className="w-12"> </TableColumn>
                <TableColumn className="w-1/4">Title</TableColumn>
                <TableColumn className="w-1/4">Industry</TableColumn>
                <TableColumn className="w-1/6">Created</TableColumn>
                <TableColumn className="w-1/6 text-right">Actions</TableColumn>
              </TableHeader>
              <TableBody>
                {ideas.map((idea) => (
                  <TableRow key={idea._id}>
                    <TableCell>
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <SparklesIcon className="w-4 h-4 text-primary-600" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link 
                        to={`/ideas/${idea._id}`}
                        className="font-medium text-apple-text hover:text-primary-600 transition-colors"
                      >
                        {idea.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-apple-gray">
                        {idea.industry || 'Not specified'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-apple-gray">
                        {new Date(idea.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/ideas/${idea._id}`}
                          className="text-sm font-medium text-apple-text hover:text-primary-600 transition-colors px-3 py-1.5 rounded hover:bg-gray-50"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(idea._id)}
                          className="text-sm font-medium text-red-600 hover:text-red-700 px-3 py-1.5 rounded hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
