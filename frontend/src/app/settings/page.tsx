'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Save } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/lib/store/auth.store';
import { apiClient } from '@/lib/api/client';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState('');

  const { register, handleSubmit } = useForm({
    defaultValues: { firstName: user?.firstName, lastName: user?.lastName },
  });

  const { register: regPw, handleSubmit: handlePwSubmit, reset: resetPw } = useForm<{ currentPassword: string; newPassword: string }>();

  const onSave = async (data: any) => {
    setSaving(true);
    try {
      await apiClient.patch('/users/me', data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  const onPasswordChange = async (data: any) => {
    setPwSaving(true);
    setPwError('');
    try {
      await apiClient.post('/auth/change-password', data);
      setPwSaved(true);
      resetPw();
      setTimeout(() => setPwSaved(false), 3000);
    } catch (e: any) {
      setPwError(e.response?.data?.message || 'Failed to change password');
    }
    setPwSaving(false);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl p-8">
        <h1 className="mb-8 text-2xl font-bold text-gray-900">Account Settings</h1>

        <div className="space-y-6">
          {/* Personal info */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-gray-900">Personal Information</h2>
            <form onSubmit={handleSubmit(onSave)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                  <input {...register('firstName')} className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                  <input {...register('lastName')} className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input value={user?.email} disabled className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500" />
              </div>
              <div className="flex items-center gap-3">
                <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save changes
                </button>
                {saved && <span className="text-sm text-emerald-600 font-medium">Saved!</span>}
              </div>
            </form>
          </div>

          {/* Account info */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-gray-900">Account</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Role</span>
                <span className="font-medium text-gray-900">{user?.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Billing status</span>
                <span className="font-medium text-gray-900">{user?.billingOverride === 'FREE_FOREVER' ? 'Free Forever' : 'Standard'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Current plan</span>
                <span className="font-medium text-gray-900">{user?.subscription?.plan ?? 'Free'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
