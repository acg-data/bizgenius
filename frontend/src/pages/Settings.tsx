import { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Switch, Divider, Select, SelectItem, Chip } from '@heroui/react';
import {
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  TrashIcon,
  ArrowRightOnRectangleIcon,
  CpuChipIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useAuthActions } from "@convex-dev/auth/react";
import { useGeneration } from '../contexts/GenerationContext';
import { useQuery } from '../lib/convex';
import { api } from '../convex/_generated/api';
import { Provider } from '../convex/providers';

export default function Settings() {
  const { signOut } = useAuthActions();
  const {
    currentProvider,
    fallbackOrder,
    setActiveProvider,
  } = useGeneration();
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

  const costTrends = useQuery(api.admin.getCostTrends, { days: 7 });
  const recentGenerations = useQuery(api.admin.getRecentGenerations, { limit: 10 });
  const costsByProvider = useQuery(api.admin.getCostsByProvider, {
    startDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
    endDate: Date.now(),
  });

  const handleProviderChange = async (provider: Provider) => {
    try {
      await setActiveProvider(provider);
    } catch (error) {
      console.error('Failed to change provider:', error);
    }
  };

  const totalCostLast30Days = costsByProvider?.totalCost || 0;

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto font-sans antialiased">
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
          <CardHeader className="flex flex-row items-center gap-3">
            <CpuChipIcon className="w-6 h-6 text-primary-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Provider Settings</h2>
              <p className="text-sm text-gray-500">Manage AI generation providers and costs</p>
            </div>
          </CardHeader>
          <CardBody className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Active Provider</p>
                <p className="text-sm text-gray-500">Primary AI provider for generation</p>
              </div>
              <Select
                label="Select Provider"
                value={currentProvider}
                onChange={(e) => handleProviderChange(e.target.value as Provider)}
                classNames={{ base: 'max-w-xs' }}
              >
                <SelectItem key="novita">Novita AI (Mimo v2 Flash)</SelectItem>
                <SelectItem key="openrouter">OpenRouter (Claude/GPT)</SelectItem>
                <SelectItem key="cerebras">Cerebras (GLM 4.7)</SelectItem>
              </Select>
            </div>

            <Divider />

            <div>
              <p className="font-medium text-gray-900 mb-2">Failover Order</p>
              <p className="text-sm text-gray-500 mb-3">Provider fallback sequence if primary fails</p>
              <div className="flex gap-2">
                {fallbackOrder.map((provider, index) => (
                  <Chip key={provider} variant="flat" color="primary">
                    {index + 1}. {provider}
                  </Chip>
                ))}
              </div>
            </div>

            <Divider />

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-gray-900">Total Cost (30 Days)</p>
                <p className="text-2xl font-bold text-primary-600">${totalCostLast30Days.toFixed(4)}</p>
              </div>
              <p className="text-sm text-gray-500">Cost breakdown by provider:</p>
              {costsByProvider?.byProvider && Object.entries(costsByProvider.byProvider).map(([provider, data]: [string, any]) => (
                <div key={provider} className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600 capitalize">{provider}</span>
                  <span className="text-sm font-medium text-gray-900">${data.totalCost?.toFixed(4) || '0.00'}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <ChartBarIcon className="w-6 h-6 text-primary-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Cost Analytics</h2>
              <p className="text-sm text-gray-500">Track generation costs and trends</p>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            {recentGenerations && recentGenerations.length > 0 ? (
              <div className="space-y-3">
                {recentGenerations.slice(0, 5).map((gen: any) => (
                  <div key={gen.sessionId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{gen.sections.length} sections</p>
                      <p className="text-sm text-gray-500">{gen.provider} - {gen.model}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary-600">${gen.totalCost.toFixed(4)}</p>
                      <p className="text-sm text-gray-500">{gen.totalTokens.toLocaleString()} tokens</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No recent generations</p>
            )}
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
