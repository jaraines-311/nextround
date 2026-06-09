'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, MessageSquare, Briefcase, BarChart3,
  User, CreditCard, Settings, LogOut, ShieldCheck, Zap,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth.store';
import { formatCredits } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
}

const primary: NavItem[] = [
  { href: '/dashboard',   label: 'Dashboard',          icon: LayoutDashboard, exact: true },
  { href: '/interviews',  label: 'Practice',            icon: MessageSquare },
  { href: '/jobs',        label: 'Job Prospects',    icon: Briefcase },
  { href: '/feedback',    label: 'Feedback Reports',    icon: BarChart3 },
  { href: '/profile',     label: 'Profile',             icon: User },
];

const secondary: NavItem[] = [
  { href: '/billing',  label: 'Billing',  icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function NavLink({ href, label, icon: Icon, exact = false }: NavItem) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  return (
    <Link href={href} className={cn('sidebar-item', active && 'active')}>
      <Icon className="h-4 w-4 flex-shrink-0 opacity-80" />
      <span className="flex-1 leading-none">{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const creditTotal =
    (user?.creditBalance?.subscriptionCredits ?? 0) +
    (user?.creditBalance?.purchasedCredits ?? 0);

  const creditPct = Math.min(100, (creditTotal / 5000) * 100);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside
      className="flex h-full w-60 flex-shrink-0 flex-col"
      style={{ background: 'var(--sidebar-bg)' }}
    >
      {/* Brand */}
      <div
        className="flex h-14 items-center gap-2.5 px-4"
        style={{ borderBottom: '1px solid var(--sidebar-border)' }}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/15">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="text-[15px] font-bold text-white tracking-tight">NextRound</span>
      </div>

      {/* User / workspace */}
      <div className="px-3 py-3" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
        <div className="flex items-center gap-2.5 rounded px-2 py-1.5 cursor-pointer" style={{ color: 'var(--sidebar-text)' }}>
          <div className="flex h-7 w-7 items-center justify-center rounded bg-white/20 text-xs font-bold text-white flex-shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user?.firstName} {user?.lastName}</p>
            <p className="truncate text-2xs" style={{ color: 'var(--sidebar-text-muted)' }}>
              {user?.subscription?.plan ?? 'Free'} plan
            </p>
          </div>
        </div>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {primary.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}

        {user?.role === 'ADMIN' && (
          <>
            <div className="mx-2 my-2" style={{ height: '1px', background: 'var(--sidebar-border)' }} />
            <NavLink href="/admin/analytics" label="Analytics" icon={ShieldCheck} />
            <NavLink href="/admin/users" label="Users" icon={User} />
          </>
        )}
      </nav>

      {/* AI Credits widget */}
      {user?.billingOverride !== 'FREE_FOREVER' && user?.role !== 'ADMIN' && (
        <div className="mx-3 mb-3 rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase tracking-wide" style={{ color: 'var(--sidebar-text-muted)' }}>
              AI Credits
            </span>
            <span className="text-xs font-bold text-white">{formatCredits(creditTotal)}</span>
          </div>
          {/* Progress bar */}
          <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <div
              className="h-full rounded-full bg-white/60 transition-all duration-500"
              style={{ width: `${creditPct}%` }}
            />
          </div>
          <Link
            href="/billing"
            className="mt-2 flex items-center gap-1 text-2xs font-medium"
            style={{ color: 'var(--sidebar-text-muted)' }}
          >
            Buy more credits
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Bottom nav */}
      <div className="px-2 pb-2 space-y-0.5" style={{ borderTop: '1px solid var(--sidebar-border)', paddingTop: '8px' }}>
        {secondary.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-left"
        >
          <LogOut className="h-4 w-4 flex-shrink-0 opacity-70" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
