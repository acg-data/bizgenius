import { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Input, Avatar, Divider } from '@heroui/react';
import { UserIcon, EnvelopeIcon, CameraIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../store';

export default function Profile() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: '',
    company: '',
    bio: '',
  });

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal information</p>
      </div>

      <Card className="mb-6">
        <CardBody className="p-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <Avatar
                isBordered
                className="w-24 h-24 text-2xl"
                color="primary"
                name={user?.full_name || user?.email || 'User'}
              />
              <Button
                isIconOnly
                size="sm"
                className="absolute bottom-0 right-0"
                aria-label="Change photo"
              >
                <CameraIcon className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.full_name || 'User'}</h2>
              <p className="text-gray-500">{user?.email}</p>
              <p className="text-sm text-primary-600 mt-1 capitalize">{user?.subscription_tier} Plan</p>
            </div>
          </div>

          <Divider className="mb-6" />

          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              value={formData.fullName}
              onValueChange={(value) => setFormData({ ...formData, fullName: value })}
              startContent={<UserIcon className="w-4 h-4 text-gray-400" />}
              isReadOnly={!isEditing}
              size="lg"
            />
            
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onValueChange={(value) => setFormData({ ...formData, email: value })}
              startContent={<EnvelopeIcon className="w-4 h-4 text-gray-400" />}
              isReadOnly
              size="lg"
            />
            
            <Input
              label="Phone"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onValueChange={(value) => setFormData({ ...formData, phone: value })}
              isReadOnly={!isEditing}
              size="lg"
            />
            
            <Input
              label="Company"
              placeholder="Your company name"
              value={formData.company}
              onValueChange={(value) => setFormData({ ...formData, company: value })}
              isReadOnly={!isEditing}
              size="lg"
            />
          </div>

          <div className="mt-6">
            <Input
              label="Bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onValueChange={(value) => setFormData({ ...formData, bio: value })}
              isReadOnly={!isEditing}
              size="lg"
            />
          </div>

          <div className="mt-6 flex justify-end">
            {isEditing ? (
              <div className="flex gap-3">
                <Button variant="light" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button color="primary" onClick={handleSave}>Save Changes</Button>
              </div>
            ) : (
              <Button color="primary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
        </CardHeader>
        <CardBody className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Member since</p>
              <p className="font-medium text-gray-900">
                {new Date(user?.created_at || Date.now()).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Subscription status</p>
              <p className="font-medium text-gray-900 capitalize">{user?.subscription_status || 'Active'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ideas created</p>
              <p className="font-medium text-gray-900">12</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Documents generated</p>
              <p className="font-medium text-gray-900">48</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
