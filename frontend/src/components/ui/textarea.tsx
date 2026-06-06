import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
        <textarea
          ref={ref}
          id={inputId}
          className={cn('input-base resize-none', error && 'input-error', className)}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-danger-600">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
