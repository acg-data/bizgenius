import { Link } from 'react-router-dom';
import { Card, CardBody, Button, Input, Textarea } from '@heroui/react';
import { EnvelopeIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';

export default function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your message! We\'ll get back to you soon.');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-600">Have questions? We'd love to hear from you.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardBody className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input label="Name" placeholder="Your name" />
                  <Input label="Email" type="email" placeholder="you@example.com" />
                </div>
                <Input label="Subject" placeholder="How can we help?" />
                <Textarea label="Message" placeholder="Tell us more..." minRows={5} />
                <Button type="submit" color="primary" size="lg" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardBody>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <EnvelopeIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-500">hello@bizgenius.com</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <PhoneIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-gray-500">+1 (555) 123-4567</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <MapPinIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Office</p>
                    <p className="text-gray-500">San Francisco, CA</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-primary-50 border border-primary-100">
              <CardBody className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Support Hours</h3>
                <p className="text-gray-600 text-sm">
                  Monday - Friday: 9am - 6pm PST<br />
                  Saturday: 10am - 4pm PST<br />
                  Sunday: Closed
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
