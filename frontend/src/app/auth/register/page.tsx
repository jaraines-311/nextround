'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/auth.store';

const industries = [
  { value: 'SOFTWARE_ENGINEERING', label: 'Software Engineering' },
  { value: 'DATA_ENGINEERING', label: 'Data Engineering' },
  { value: 'PRODUCT_MANAGEMENT', label: 'Product Management' },
  { value: 'SALES', label: 'Sales' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'CUSTOMER_SUCCESS', label: 'Customer Success' },
  { value: 'OTHER', label: 'Other' },
];

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
  targetIndustry: z.string().min(1, 'Select an industry'),
  accessCode: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
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
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-brand-600 p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-white" />
          <span className="text-2xl font-bold text-white">NextRound</span>
        </Link>
        <div>
          <h1 className="text-4xl font-extrabold text-white">Your interview flight simulator.</h1>
          <p className="mt-4 text-lg text-brand-100">
            Practice with AI, get real feedback, land your next role. 3 free voice interviews included.
          </p>
        </div>
        <div className="text-brand-200 text-sm">© {new Date().getFullYear()} NextRound</div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-brand-600" />
              <span className="text-xl font-bold">NextRound</span>
            </Link>
          </div>

          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First name</label>
                <input
                  {...register('firstName')}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last name</label>
                <input
                  {...register('lastName')}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                {...register('email')}
                type="email"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                {...register('password')}
                type="password"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Target industry</label>
              <select
                {...register('targetIndustry')}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {industries.map((i) => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </select>
              {errors.targetIndustry && <p className="mt-1 text-xs text-red-600">{errors.targetIndustry.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Access code <span className="text-gray-400">(optional)</span>
              </label>
              <input
                {...register('accessCode')}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="Enter if you have one"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create account
            </button>

            <p className="text-center text-xs text-gray-500">
              By signing up you agree to our{' '}
              <Link href="/terms" className="text-brand-600 hover:underline">Terms of Service</Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
