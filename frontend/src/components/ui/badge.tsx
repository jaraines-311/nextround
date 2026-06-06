import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badge = cva(
  'inline-flex items-center gap-1 rounded-full font-medium',
  {
    variants: {
      variant: {
        default:   'bg-neutral-100 text-neutral-700',
        plum:      'bg-plum-100 text-plum-900',
        success:   'bg-success-50 text-success-600',
        warning:   'bg-warning-50 text-warning-700',
        danger:    'bg-danger-50 text-danger-600',
        info:      'bg-sky-50 text-sky-600',
        outline:   'border border-neutral-300 text-neutral-600 bg-transparent',
        'plum-solid': 'bg-plum-900 text-white',
        'success-solid': 'bg-success-600 text-white',
      },
      size: {
        sm: 'px-2 py-0.5 text-2xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badge> {
  dot?: boolean;
}

export function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badge({ variant, size }), className)} {...props}>
      {dot && <span className={cn('score-dot', {
        'bg-success-600': variant === 'success' || variant === 'success-solid',
        'bg-warning-600': variant === 'warning',
        'bg-danger-600':  variant === 'danger',
        'bg-plum-900':    variant === 'plum' || variant === 'plum-solid',
        'bg-neutral-500': variant === 'default',
        'bg-sky-600':     variant === 'info',
      })} />}
      {children}
    </span>
  );
}

export const statusBadgeVariant = (status: string): BadgeProps['variant'] => {
  const map: Record<string, BadgeProps['variant']> = {
    COMPLETED:   'success',
    IN_PROGRESS: 'info',
    PENDING:     'default',
    ABANDONED:   'danger',
    ACTIVE:      'success',
    CANCELED:    'danger',
    PAST_DUE:    'warning',
    FREE:        'default',
    PRO:         'plum',
    PREMIUM:     'plum-solid',
  };
  return map[status] ?? 'default';
};
