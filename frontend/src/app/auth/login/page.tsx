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
import { Button } from '@/components/ui/button';
import { NrSymbol } from '@/components/brand/NrSymbol';

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const login  = useAuthStore((s) => s.login);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const result = await authApi.login(data);
      login(result.token, result.user);
      router.push('/dashboard');
    } catch {
      setError('Incorrect email or password. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left: brand panel */}
      <div className="hidden w-2/5 flex-col justify-between p-12 lg:flex" style={{ background: 'var(--sidebar-bg)' }}>
        <div className="flex items-center gap-2">
          <NrSymbol className="h-8 w-8 flex-shrink-0" />
          <span className="text-xl font-bold">
            <span className="text-white">Next</span>
            <span style={{ color: '#60a5fa' }}>Round</span>
          </span>
        </div>

        <div>
          <blockquote className="mb-4 text-2xl font-bold leading-snug text-white">
            "Practice the interview before it matters."
          </blockquote>
          <p className="text-plum-200">
            Walk into your next interview with confidence — because you've already done it.
          </p>
        </div>

        <p className="text-sm text-plum-300">© {new Date().getFullYear()} NextRound</p>
      </div>

      {/* Right: form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-neutral-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-plum-900">
              <NrSymbol className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-neutral-900">NextRound</span>
          </Link>

          <div className="card p-8 shadow-md">
            <h1 className="mb-1 text-2xl font-bold text-neutral-900">Welcome back</h1>
            <p className="mb-6 text-sm text-neutral-600">
              Don't have an account?{' '}
              <Link href="/auth/register" className="font-semibold text-plum-900 hover:text-plum-dark transition-colors">
                Sign up free
              </Link>
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-medium text-neutral-800">Password</label>
                  <Link href="/auth/forgot-password" className="text-xs font-medium text-plum-900 hover:text-plum-dark">
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  autoComplete="current-password"
                  className={`input-base ${errors.password ? 'input-error' : ''}`}
                  {...register('password')}
                />
                {errors.password && <p className="mt-1.5 text-xs text-danger-600">{errors.password.message}</p>}
              </div>

              {error && (
                <div className="rounded-md border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-600">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
                Sign in
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
