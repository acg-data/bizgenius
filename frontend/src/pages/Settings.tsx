import { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Switch, Divider, Select, SelectItem } from '@heroui/react';
import {
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  TrashIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuthActions } from "@convex-dev/auth/react";

export default function Settings() {
  const { signOut } = useAuthActions();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
    newFeatures: true,
    weeklyDigest: true,
  });
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'America/New_York',
    currency: 'USD',
  });

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account preferences</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <BellIcon className="w-6 h-6 text-primary-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-500">Choose what notifications you receive</p>
            </div>
          </CardHeader>
          <CardBody className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email notifications</p>
                <p className="text-sm text-gray-500">Receive important updates via email</p>
              </div>
              <Switch
                isSelected={notifications.email}
                onValueChange={(v) => setNotifications({ ...notifications, email: v })}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Push notifications</p>
                <p className="text-sm text-gray-500">Get notified in your browser</p>
              </div>
              <Switch
                isSelected={notifications.push}
                onValueChange={(v) => setNotifications({ ...notifications, push: v })}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Marketing emails</p>
                <p className="text-sm text-gray-500">Receive tips, news, and offers</p>
              </div>
              <Switch
                isSelected={notifications.marketing}
                onValueChange={(v) => setNotifications({ ...notifications, marketing: v })}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">New feature announcements</p>
                <p className="text-sm text-gray-500">Be the first to know about new features</p>
              </div>
              <Switch
                isSelected={notifications.newFeatures}
                onValueChange={(v) => setNotifications({ ...notifications, newFeatures: v })}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Weekly digest</p>
                <p className="text-sm text-gray-500">Summary of your activity each week</p>
              </div>
              <Switch
                isSelected={notifications.weeklyDigest}
                onValueChange={(v) => setNotifications({ ...notifications, weeklyDigest: v })}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <GlobeAltIcon className="w-6 h-6 text-primary-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
              <p className="text-sm text-gray-500">Customize your experience</p>
            </div>
          </CardHeader>
          <CardBody className="p-6 space-y-4">
            <Select
              label="Language"
              value={preferences.language}
              onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
              classNames={{ base: 'max-w-xs' }}
            >
              <SelectItem key="en">English</SelectItem>
              <SelectItem key="es">Español</SelectItem>
              <SelectItem key="fr">Français</SelectItem>
              <SelectItem key="de">Deutsch</SelectItem>
            </Select>
            
            <Select
              label="Timezone"
              value={preferences.timezone}
              onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
              classNames={{ base: 'max-w-xs' }}
            >
              <SelectItem key="America/New_York">Eastern Time (ET)</SelectItem>
              <SelectItem key="America/Chicago">Central Time (CT)</SelectItem>
              <SelectItem key="America/Denver">Mountain Time (MT)</SelectItem>
              <SelectItem key="America/Los_Angeles">Pacific Time (PT)</SelectItem>
              <SelectItem key="Europe/London">London (GMT)</SelectItem>
              <SelectItem key="Europe/Paris">Paris (CET)</SelectItem>
            </Select>
            
            <Select
              label="Currency"
              value={preferences.currency}
              onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
              classNames={{ base: 'max-w-xs' }}
            >
              <SelectItem key="USD">USD ($)</SelectItem>
              <SelectItem key="EUR">EUR (€)</SelectItem>
              <SelectItem key="GBP">GBP (£)</SelectItem>
              <SelectItem key="JPY">JPY (¥)</SelectItem>
            </Select>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <ShieldCheckIcon className="w-6 h-6 text-primary-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
              <p className="text-sm text-gray-500">Protect your account</p>
            </div>
          </CardHeader>
          <CardBody className="p-6 space-y-4">
            <Button variant="bordered" className="w-full justify-start h-14">
              <div className="text-left">
                <p className="font-medium text-gray-900">Change Password</p>
                <p className="text-sm text-gray-500">Update your password regularly</p>
              </div>
            </Button>
            
            <Divider />
            
            <Button variant="bordered" className="w-full justify-start h-14">
              <div className="text-left">
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
            </Button>
            
            <Divider />
            
            <Button variant="bordered" className="w-full justify-start h-14">
              <div className="text-left">
                <p className="font-medium text-gray-900">Active Sessions</p>
                <p className="text-sm text-gray-500">Manage devices logged into your account</p>
              </div>
            </Button>
          </CardBody>
        </Card>

        <Card className="border-danger-200">
          <CardHeader className="flex flex-row items-center gap-3">
            <TrashIcon className="w-6 h-6 text-danger-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Danger Zone</h2>
              <p className="text-sm text-gray-500">Irreversible actions</p>
            </div>
          </CardHeader>
          <CardBody className="p-6 space-y-4">
            <Button variant="bordered" color="danger" className="w-full justify-start h-14">
              <div className="text-left">
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
              </div>
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <Button
              color="danger"
              variant="light"
              startContent={<ArrowRightOnRectangleIcon className="w-5 h-5" />}
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
