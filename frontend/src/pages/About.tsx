import { Link } from 'react-router-dom';
import { Card, CardBody } from '@heroui/react';
import { SparklesIcon, UserGroupIcon, ChartBarIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

const stats = [
  { value: '10,000+', label: 'Business Plans Created' },
  { value: '5,000+', label: 'Active Users' },
  { value: '$500M+', label: 'Funding Raised' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const team = [
  { name: 'John Smith', role: 'CEO & Founder', bio: 'Former VC, 15 years in tech startups' },
  { name: 'Sarah Chen', role: 'CTO', bio: 'AI/ML expert, ex-Google' },
  { name: 'Marcus Johnson', role: 'Head of Product', bio: 'Product leader, 10 years SaaS experience' },
  { name: 'Emily Rodriguez', role: 'Head of Growth', bio: 'Marketing expert, scaled multiple startups' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-gray-900">BizGenius</span>
          </Link>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Democratizing Business Planning
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to help every entrepreneur turn their ideas into investor-ready businesses with the power of AI.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardBody className="p-6">
                  <p className="text-4xl font-bold text-primary-600 mb-2">{stat.value}</p>
                  <p className="text-gray-500">{stat.label}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Story</h2>
          <div className="space-y-8 text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">2022: The Beginning</h3>
              <p>Frustrated by the complexity and cost of traditional business planning, our founders set out to create a better way.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">2023: Launch</h3>
              <p>After 18 months of development, BizGenius launched with a simple promise: make business planning accessible to everyone.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">2024: Growth</h3>
              <p>Now serving thousands of entrepreneurs worldwide, with users raising over $500M in funding using our platform.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet the Team</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {team.map((member) => (
              <Card key={member.name}>
                <CardBody className="p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                    <UserGroupIcon className="w-10 h-10 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-primary-600 mb-2">{member.role}</p>
                  <p className="text-sm text-gray-500">{member.bio}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Values That Drive Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <RocketLaunchIcon className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600">Pushing the boundaries of what's possible with AI</p>
            </div>
            <div>
              <ChartBarIcon className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Impact</h3>
              <p className="text-gray-600">Focused on real outcomes for entrepreneurs</p>
            </div>
            <div>
              <UserGroupIcon className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Accessibility</h3>
              <p className="text-gray-600">Making business tools available to everyone</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
