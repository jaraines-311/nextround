'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Zap, LayoutDashboard, User, FileText, Briefcase,
  MessageSquare, BarChart3, Settings, CreditCard, LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth.store';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/resume', label: 'Resume', icon: FileText },
  { href: '/jobs', label: 'Job Descriptions', icon: Briefcase },
  { href: '/interviews', label: 'Interviews', icon: MessageSquare },
  { href: '/feedback', label: 'Feedback', icon: BarChart3 },
];

const bottomItems = [
  { href: '/billing', label: 'Billing', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, isHydrated, logout } = useAuthStore();

  useEffect(() => {
    if (isHydrated && !token) {
      router.push('/auth/login');
    }
  }, [isHydrated, token, router]);

  if (!isHydrated || !user) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const creditTotal =
    (user.creditBalance?.subscriptionCredits ?? 0) +
    (user.creditBalance?.purchasedCredits ?? 0);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
          <Zap className="h-5 w-5 text-brand-600" />
          <span className="text-lg font-bold text-gray-900">NextRound</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className={`h-4 w-4 ${active ? 'text-brand-600' : 'text-gray-400'}`} />
                {item.label}
              </Link>
            );
          })}

          {user.role === 'ADMIN' && (
            <Link
              href="/admin"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname.startsWith('/admin')
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-amber-500" />
              Admin
            </Link>
          )}
        </nav>

        {/* Credits badge */}
        <div className="mx-4 mb-3 rounded-lg bg-brand-50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-700">AI Credits</span>
            <span className="text-sm font-bold text-brand-600">{creditTotal.toLocaleString()}</span>
          </div>
          <Link href="/billing" className="mt-1 block text-xs text-brand-500 hover:text-brand-700">
            Buy more credits →
          </Link>
        </div>

        <div className="border-t border-gray-200 p-4 space-y-1">
          {bottomItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname === item.href ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-4 w-4 text-gray-400" />
              {item.label}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4 text-gray-400" />
            Sign out
          </button>
        </div>

        {/* User info */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
              {user.firstName[0]}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-gray-500">
                {user.subscription?.plan ?? 'Free'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
