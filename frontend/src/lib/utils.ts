import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCredits(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

export function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function relativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (mins < 1)    return 'just now';
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days < 7)    return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function scoreToLabel(score: number): { label: string; color: string } {
  if (score >= 8.5) return { label: 'Excellent', color: 'text-success-600' };
  if (score >= 7)   return { label: 'Good',      color: 'text-success-600' };
  if (score >= 5.5) return { label: 'Fair',      color: 'text-warning-700' };
  return                    { label: 'Needs Work', color: 'text-danger-600' };
}

export function planDisplayName(plan: string): string {
  const map: Record<string, string> = { FREE: 'Free', PRO: 'Pro', PREMIUM: 'Premium' };
  return map[plan] ?? plan;
}
