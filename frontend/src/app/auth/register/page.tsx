'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/auth.store';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const INDUSTRIES = [
  { value: 'SOFTWARE_ENGINEERING', label: 'Software Engineering' },
  { value: 'DATA_ENGINEERING',     label: 'Data Engineering' },
  { value: 'PRODUCT_MANAGEMENT',   label: 'Product Management' },
  { value: 'SALES',                label: 'Sales' },
  { value: 'MARKETING',            label: 'Marketing' },
  { value: 'CUSTOMER_SUCCESS',     label: 'Customer Success' },
  { value: 'OTHER',                label: 'Other' },
];

const schema = z.object({
  firstName:      z.string().min(1, 'Required'),
  lastName:       z.string().min(1, 'Required'),
  email:          z.string().email('Enter a valid email'),
  password:       z.string().min(8, 'At least 8 characters'),
  targetIndustry: z.string().min(1, 'Select your target industry'),
  accessCode:     z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router  = useRouter();
  const login   = useAuthStore((s) => s.login);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { targetIndustry: 'SOFTWARE_ENGINEERING' },
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const result = await authApi.register(data);
      login(result.token, result.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left: brand panel */}
      <div className="hidden w-2/5 flex-col justify-between p-12 lg:flex" style={{ background: 'var(--sidebar-bg)' }}>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">NextRound</span>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-2xl font-bold text-white leading-snug">Start with 3 free voice interviews.</p>
            <p className="mt-2 text-plum-200">No credit card required. Cancel anytime.</p>
          </div>
          {[
            'Adaptive AI questions tailored to your resume',
            'Voice and text interview modes',
            'Detailed coaching reports after every session',
            'Study plans and suggested better answers',
          ].map((item) => (
            <div key={item} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm text-plum-100">{item}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-plum-300">© {new Date().getFullYear()} NextRound</p>
      </div>

      {/* Right: form */}
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-neutral-50 px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-plum-900">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-neutral-900">NextRound</span>
          </Link>

          <div className="card p-8 shadow-md">
            <h1 className="mb-1 text-2xl font-bold text-neutral-900">Create your account</h1>
            <p className="mb-6 text-sm text-neutral-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-plum-900 hover:text-plum-dark transition-colors">
                Sign in
              </Link>
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First name"
                  error={errors.firstName?.message}
                  {...register('firstName')}
                />
                <Input
                  label="Last name"
                  error={errors.lastName?.message}
                  {...register('lastName')}
                />
              </div>

              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Password"
                type="password"
                autoComplete="new-password"
                hint="Minimum 8 characters"
                error={errors.password?.message}
                {...register('password')}
              />

              <Select
                label="Target industry"
                options={INDUSTRIES}
                error={errors.targetIndustry?.message}
                {...register('targetIndustry')}
              />

              <Input
                label="Access code"
                optional
                placeholder="Leave blank if you don't have one"
                error={errors.accessCode?.message}
                {...register('accessCode')}
              />

              {error && (
                <div className="rounded-md border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-600">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
                Create account — it's free
              </Button>

              <p className="text-center text-xs text-neutral-500">
                By creating an account you agree to our{' '}
                <Link href="#" className="text-plum-900 hover:underline">Terms</Link>{' '}
                and{' '}
                <Link href="#" className="text-plum-900 hover:underline">Privacy Policy</Link>.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
