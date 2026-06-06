import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'xs' | 'sm' | 'md';
  color?: 'plum' | 'success' | 'warning' | 'danger' | 'neutral';
  className?: string;
}

const trackHeight = { xs: 'h-1', sm: 'h-1.5', md: 'h-2.5' };
const fillColor = {
  plum:    'bg-plum-900',
  success: 'bg-success-600',
  warning: 'bg-warning-600',
  danger:  'bg-danger-600',
  neutral: 'bg-neutral-400',
};

export function Progress({
  value,
  max = 10,
  label,
  showValue,
  size = 'sm',
  color = 'plum',
  className,
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const autoColor = (): typeof color => {
    if (max === 10) {
      if (pct >= 80) return 'success';
      if (pct >= 55) return 'warning';
      return 'danger';
    }
    return color;
  };

  const c = color === 'plum' && max === 10 ? autoColor() : color;

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && <span className="text-sm font-medium text-neutral-700">{label}</span>}
          {showValue && (
            <span className={cn('text-sm font-bold', {
              'text-success-600': c === 'success',
              'text-warning-700': c === 'warning',
              'text-danger-600':  c === 'danger',
              'text-plum-900':    c === 'plum',
              'text-neutral-700': c === 'neutral',
            })}>
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full overflow-hidden rounded-full bg-neutral-100', trackHeight[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', fillColor[c])}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}

// Score card variant for feedback reports
export function ScoreBar({ label, score, className }: { label: string; score: number; className?: string }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-700">{label}</span>
        <span className={cn('text-sm font-bold tabular-nums', {
          'text-success-600': score >= 7,
          'text-warning-700': score >= 5 && score < 7,
          'text-danger-600':  score < 5,
        })}>
          {score?.toFixed(1)}
        </span>
      </div>
      <Progress value={score} max={10} size="sm" />
    </div>
  );
}
