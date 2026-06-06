'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Check } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { profileApi } from '@/lib/api/profile';

const INDUSTRIES = [
  { value: 'SOFTWARE_ENGINEERING', label: 'Software Engineering' },
  { value: 'DATA_ENGINEERING',     label: 'Data Engineering' },
  { value: 'PRODUCT_MANAGEMENT',   label: 'Product Management' },
  { value: 'SALES',                label: 'Sales' },
  { value: 'MARKETING',            label: 'Marketing' },
  { value: 'CUSTOMER_SUCCESS',     label: 'Customer Success' },
  { value: 'OTHER',                label: 'Other' },
];

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    profileApi.get().then((p) => {
      reset({
        targetIndustry:   p.targetIndustry,
        yearsOfExperience: p.yearsOfExperience ?? '',
        summary:           p.summary ?? '',
        skills:            p.skills?.join(', ') ?? '',
        targetRoles:       p.targetRoles?.join(', ') ?? '',
        strengths:         p.strengths?.join(', ') ?? '',
        weaknesses:        p.weaknesses?.join(', ') ?? '',
        userNotes:         p.userNotes ?? '',
        linkedinUrl:       p.linkedinUrl ?? '',
        githubUrl:         p.githubUrl ?? '',
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data: any) => {
    setSaving(true);
    setSaved(false);
    const split = (val: string) => val ? val.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    try {
      await profileApi.update({
        ...data,
        yearsOfExperience: data.yearsOfExperience ? parseInt(data.yearsOfExperience) : null,
        skills:       split(data.skills),
        targetRoles:  split(data.targetRoles),
        strengths:    split(data.strengths),
        weaknesses:   split(data.weaknesses),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Profile">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-neutral-100" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      pageTitle="Candidate Profile"
      pageDescription="Your profile helps NextRound generate more relevant interview questions."
      actions={
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-success-600 animate-fade-in">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}
          <Button size="sm" loading={saving} onClick={handleSubmit(onSubmit)}>
            Save profile
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-5">
        {/* Professional */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-900">Professional Info</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Target industry"
              options={INDUSTRIES}
              {...register('targetIndustry')}
            />
            <Input
              label="Years of experience"
              type="number"
              min={0}
              max={50}
              {...register('yearsOfExperience')}
            />
          </div>
          <Textarea
            label="Professional summary"
            optional
            rows={3}
            placeholder="Brief summary of your background and what you're looking for…"
            {...register('summary')}
          />
        </div>

        {/* Skills & goals */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-900">Skills & Goals</h2>
          <Input
            label="Skills"
            optional
            hint="Comma-separated — e.g. Python, TypeScript, PostgreSQL, Docker"
            placeholder="Python, TypeScript, React, PostgreSQL, Docker"
            {...register('skills')}
          />
          <Input
            label="Target roles"
            optional
            hint="Comma-separated role titles you're targeting"
            placeholder="Senior Software Engineer, Staff Engineer"
            {...register('targetRoles')}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Strengths"
              optional
              hint="Comma-separated"
              placeholder="System design, communication"
              {...register('strengths')}
            />
            <Input
              label="Areas to improve"
              optional
              hint="Comma-separated"
              placeholder="Conciseness, public speaking"
              {...register('weaknesses')}
            />
          </div>
          <Textarea
            label="Personal notes"
            optional
            rows={3}
            placeholder="Anything else you want the AI to know about your background, preferences, or goals…"
            {...register('userNotes')}
          />
        </div>

        {/* Links */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-900">Links</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="LinkedIn" optional type="url" placeholder="https://linkedin.com/in/…" {...register('linkedinUrl')} />
            <Input label="GitHub"   optional type="url" placeholder="https://github.com/…"    {...register('githubUrl')} />
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
