'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, User } from 'lucide-react';

export default function SettingsPage() {
  const { user, profile } = useAuth();

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <SettingsIcon className="h-8 w-8 text-cyan-400" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <p className="text-gray-400">Manage your account and preferences</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-cyan-400" />
              <CardTitle>Profile Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Email</label>
              <p className="text-white">{profile?.email || user?.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Full Name</label>
              <p className="text-white">{profile?.full_name || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Role</label>
              <p className="text-white capitalize">{profile?.role || 'staff'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Keyboard Shortcuts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Dashboard</span>
                <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">Alt+D</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Items</span>
                <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">Alt+I</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Receive</span>
                <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">Alt+R</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pick</span>
                <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">Alt+P</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Transfer</span>
                <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">Alt+T</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Scan</span>
                <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">Alt+S</kbd>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
