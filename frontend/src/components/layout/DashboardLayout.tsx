'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '@/lib/store/auth.store';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  actions?: React.ReactNode;
  noPadding?: boolean;
  className?: string;
}

export default function DashboardLayout({
  children,
  pageTitle,
  pageDescription,
  actions,
  noPadding,
  className,
}: DashboardLayoutProps) {
  const router = useRouter();
  const { token, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated && !token) {
      router.push('/auth/login');
    }
  }, [isHydrated, token, router]);

  if (!isHydrated || !token) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-plum-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Page header */}
        {(pageTitle || actions) && (
          <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-neutral-200 bg-neutral-0 px-6">
            <div>
              {pageTitle && <h1 className="text-base font-semibold text-neutral-900">{pageTitle}</h1>}
              {pageDescription && <p className="text-xs text-neutral-500">{pageDescription}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </header>
        )}

        {/* Content */}
        <main className={cn('flex-1 overflow-y-auto', !noPadding && 'p-6', className)}>
          {children}
        </main>
      </div>
    </div>
  );
}
