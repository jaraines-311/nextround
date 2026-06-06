import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, optional, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 flex items-center gap-2 text-sm font-medium text-neutral-800">
            {label}
            {optional && <span className="text-xs font-normal text-neutral-500">Optional</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn('input-base', error && 'input-error', className)}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-danger-600">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
