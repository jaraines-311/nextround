'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Loader2, CheckCircle } from 'lucide-react';
import { authApi } from '@/lib/api/auth';

const schema = z.object({ email: z.string().email('Invalid email') });

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    await authApi.forgotPassword(data.email);
    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-brand-600" />
            <span className="text-2xl font-bold text-gray-900">NextRound</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {sent ? (
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
              <h1 className="mt-4 text-xl font-bold text-gray-900">Check your email</h1>
              <p className="mt-2 text-gray-600">If that email exists, we sent a password reset link.</p>
              <Link href="/auth/login" className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:underline">
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Forgot your password?</h1>
              <p className="mt-1 text-gray-600">Enter your email and we'll send a reset link.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input {...register('email')} type="email" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{String(errors.email.message)}</p>}
                </div>
                <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Send reset link
                </button>
                <Link href="/auth/login" className="block text-center text-sm text-brand-600 hover:underline">
                  Back to login
                </Link>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
