import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: { value: number; label?: string };
  className?: string;
}

export function StatCard({ label, value, sub, icon: Icon, iconColor, trend, className }: StatCardProps) {
  return (
    <div className={cn('card px-5 py-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
          <p className="text-2xl font-bold text-neutral-900 tabular-nums">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-neutral-500">{sub}</p>}
          {trend !== undefined && (
            <p className={cn('mt-1 text-xs font-medium', trend.value >= 0 ? 'text-success-600' : 'text-danger-600')}>
              {trend.value >= 0 ? '+' : ''}{trend.value}{trend.label ? ` ${trend.label}` : '%'}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100', iconColor)}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}
