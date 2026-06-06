import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

const button = cva('btn-base', {
  variants: {
    variant: {
      primary:     'bg-plum-900 text-white hover:bg-plum-dark shadow-xs focus-visible:ring-plum-900',
      secondary:   'bg-neutral-0 border border-neutral-300 text-neutral-800 hover:bg-neutral-50 hover:border-neutral-400 shadow-xs focus-visible:ring-neutral-400',
      ghost:       'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-neutral-400',
      destructive: 'bg-danger-600 text-white hover:bg-danger-700 shadow-xs focus-visible:ring-danger-600',
      plum:        'bg-plum-900 text-white hover:bg-plum-dark shadow-xs focus-visible:ring-plum-900',
      outline:     'border border-plum-900 text-plum-900 hover:bg-plum-50 focus-visible:ring-plum-900',
      link:        'text-sky-600 hover:text-sky-700 underline-offset-2 hover:underline p-0 h-auto',
    },
    size: {
      xs:  'h-7 px-2.5 text-xs rounded',
      sm:  'h-8 px-3 text-sm rounded-md',
      md:  'h-9 px-4 text-sm rounded-md',
      lg:  'h-10 px-5 text-sm rounded-lg',
      xl:  'h-12 px-6 text-base rounded-lg',
      icon:'h-9 w-9 p-0 rounded-md',
      'icon-sm': 'h-7 w-7 p-0 rounded',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(button({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';

export { Button, button };
