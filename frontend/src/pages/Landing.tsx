import { Link } from 'react-router-dom';
import { Button, Card, CardBody, CardFooter } from '@heroui/react';
import {
  SparklesIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UsersIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: DocumentTextIcon,
    title: 'Business Plans',
    description: 'Comprehensive business plans generated in minutes with executive summaries, marketing strategies, and operations plans.',
  },
  {
    icon: ChartBarIcon,
    title: 'Financial Models',
    description: 'Detailed financial projections, break-even analysis, funding requirements, and key metrics forecasting.',
  },
  {
    icon: UsersIcon,
    title: 'Market Research',
    description: 'In-depth market analysis including TAM/SAM/SOM, competitor landscape, and customer segmentation.',
  },
  {
    icon: SparklesIcon,
    title: 'Pitch Decks',
    description: 'Professional investor-ready pitch decks with compelling narratives and data visualizations.',
  },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Founder, TechStart',
    content: 'BizGenius saved me weeks of research. The financial model helped me secure seed funding!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
  },
  {
    name: 'Marcus Johnson',
    role: 'CEO, Green Solutions',
    content: 'The competitor analysis was incredibly thorough. Best business planning tool I\'ve used.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Founder, EduTech Inc',
    content: 'Generated a complete business plan in under an hour. The quality is remarkable.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">BizGenius</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</Link>
              <Link to="/about" className="text-gray-600 hover:text-gray-900 font-medium">About</Link>
              <Link to="/contact" className="text-gray-600 hover:text-gray-900 font-medium">Contact</Link>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="light" className="font-medium">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button color="primary" className="font-medium">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-6">
            <SparklesIcon className="w-4 h-4" />
            AI-Powered Business Planning
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Turn Your Ideas Into
            <span className="block text-gradient">Complete Businesses</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Generate comprehensive business plans, financial models, pitch decks, and market research 
            in minutes with our AI-powered platform.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" color="primary" className="font-semibold px-8 h-12 text-lg">
                Start Free Trial
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="bordered" className="font-semibold px-8 h-12 text-lg">
                Watch Demo
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              14-day free trial
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Launch
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From idea to investment-ready business plan in minutes
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="card-hover">
                <CardBody className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Why Choose BizGenius?
              </h2>
              <div className="space-y-6">
                {[
                  { title: 'AI-Powered Accuracy', desc: 'Advanced AI generates accurate, data-driven business plans based on your industry and market.' },
                  { title: 'Save Weeks of Research', desc: 'Skip the hours of market research and competitor analysis. Our AI does it all for you.' },
                  { title: 'Investor-Ready Documents', desc: 'Create professional pitch decks and financial models that impress investors.' },
                  { title: 'Always Up-to-Date', desc: 'Our AI uses the latest market data and trends to provide current insights.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl transform rotate-3 opacity-10"></div>
              <Card className="relative">
                <CardBody className="p-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <SparklesIcon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Business Plan Generated</p>
                        <p className="text-sm text-gray-500">Just now</p>
                      </div>
                    </div>
                    <div className="h-px bg-gray-200" />
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">5</p>
                        <p className="text-xs text-gray-500">Year Plan</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">$2.5M</p>
                        <p className="text-xs text-gray-500">Revenue Target</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">18mo</p>
                        <p className="text-xs text-gray-500">Break-even</p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Entrepreneurs
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of founders who trust BizGenius
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="card-hover">
                <CardBody className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Ready to Turn Your Idea Into Reality?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Start your free 14-day trial today. No credit card required.
          </p>
          <Link to="/register">
            <Button size="lg" color="primary" className="font-semibold px-12 h-14 text-lg">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl">BizGenius</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered business planning for entrepreneurs and startups.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/features" className="hover:text-white">Features</Link></li>
                <li><Link to="/about" className="hover:text-white">About</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link to="/docs" className="hover:text-white">API Docs</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/privacy" className="hover:text-white">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            © 2024 BizGenius. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
