'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Check } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge, statusBadgeVariant } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/store/auth.store';
import { apiClient } from '@/lib/api/client';
import { planDisplayName } from '@/lib/utils';

export default function SettingsPage() {
  const user    = useAuthStore((s) => s.user);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: { firstName: user?.firstName, lastName: user?.lastName },
  });

  const onSave = async (data: any) => {
    setSaving(true);
    setSaved(false);
    try {
      await apiClient.patch('/users/me', data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  return (
    <DashboardLayout
      pageTitle="Account Settings"
      actions={
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-success-600 animate-fade-in">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}
          <Button size="sm" loading={saving} onClick={handleSubmit(onSave)}>
            Save changes
          </Button>
        </div>
      }
    >
      <div className="mx-auto max-w-2xl space-y-5">
        {/* Personal info */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-900">Personal information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="First name" {...register('firstName')} />
            <Input label="Last name"  {...register('lastName')} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-800">Email address</label>
            <input
              value={user?.email}
              disabled
              className="input-base bg-neutral-50 cursor-not-allowed"
            />
            <p className="mt-1.5 text-xs text-neutral-500">Email address cannot be changed from here.</p>
          </div>
        </div>

        {/* Account info */}
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-neutral-900">Account</h2>
          <div className="space-y-3">
            {[
              { label: 'Role', value: user?.role, badge: true },
              { label: 'Access level', value: user?.billingOverride === 'FREE_FOREVER' ? 'Free Forever' : 'Standard', badge: false },
              { label: 'Current plan', value: planDisplayName(user?.subscription?.plan ?? 'FREE'), badge: true },
              { label: 'User ID',  value: user?.id, mono: true },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <span className="text-sm text-neutral-600">{row.label}</span>
                {row.badge ? (
                  <Badge variant={statusBadgeVariant(row.value ?? '')} size="md">{row.value}</Badge>
                ) : (
                  <span className={`text-sm font-medium text-neutral-900 ${row.mono ? 'font-mono text-xs' : ''}`}>
                    {row.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
