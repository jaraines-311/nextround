import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void; href?: string };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
          <Icon className="h-6 w-6 text-neutral-400" />
        </div>
      )}
      <h3 className="mb-1 text-base font-semibold text-neutral-800">{title}</h3>
      {description && <p className="mb-5 max-w-xs text-sm text-neutral-500">{description}</p>}
      {action && (
        action.href ? (
          <a href={action.href}>
            <Button size="sm" variant="secondary">{action.label}</Button>
          </a>
        ) : (
          <Button size="sm" variant="secondary" onClick={action.onClick}>{action.label}</Button>
        )
      )}
    </div>
  );
}
