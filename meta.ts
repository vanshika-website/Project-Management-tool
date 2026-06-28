import type { ProjectStatus, TaskStatus, Priority } from './supabase';

export const PROJECT_STATUS_META: Record<ProjectStatus, { label: string; dot: string; chip: string }> = {
  planning: { label: 'Planning', dot: 'bg-ink-400', chip: 'bg-ink-100 text-ink-600' },
  active: { label: 'Active', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700' },
  on_hold: { label: 'On hold', dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700' },
  completed: { label: 'Completed', dot: 'bg-brand-500', chip: 'bg-brand-50 text-brand-700' },
};

export const TASK_STATUS_META: Record<TaskStatus, { label: string; chip: string; bar: string; ring: string }> = {
  todo: { label: 'To do', chip: 'bg-ink-100 text-ink-600', bar: 'bg-ink-400', ring: 'ring-ink-200' },
  in_progress: { label: 'In progress', chip: 'bg-blue-50 text-blue-700', bar: 'bg-blue-500', ring: 'ring-blue-200' },
  review: { label: 'In review', chip: 'bg-violet-50 text-violet-700', bar: 'bg-violet-500', ring: 'ring-violet-200' },
  done: { label: 'Done', chip: 'bg-emerald-50 text-emerald-700', bar: 'bg-emerald-500', ring: 'ring-emerald-200' },
};

export const TASK_STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];

export const PRIORITY_META: Record<Priority, { label: string; chip: string; icon: string }> = {
  low: { label: 'Low', chip: 'bg-ink-100 text-ink-600', icon: 'text-ink-400' },
  medium: { label: 'Medium', chip: 'bg-sky-50 text-sky-700', icon: 'text-sky-500' },
  high: { label: 'High', chip: 'bg-orange-50 text-orange-700', icon: 'text-orange-500' },
  urgent: { label: 'Urgent', chip: 'bg-rose-50 text-rose-700', icon: 'text-rose-500' },
};

export const PROJECT_COLORS = [
  '#2563eb', '#0ea5e9', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6',
];

export function formatDate(iso: string | null): string {
  if (!iso) return 'No deadline';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(iso + 'T00:00:00');
  return Math.round((due.getTime() - today.getTime()) / 86400000);
}

export function relativeDeadline(iso: string | null): { text: string; tone: 'overdue' | 'soon' | 'normal' | 'none' } {
  const d = daysUntil(iso);
  if (d === null) return { text: 'No deadline', tone: 'none' };
  if (d < 0) return { text: `${Math.abs(d)}d overdue`, tone: 'overdue' };
  if (d === 0) return { text: 'Due today', tone: 'soon' };
  if (d === 1) return { text: 'Due tomorrow', tone: 'soon' };
  if (d <= 3) return { text: `In ${d} days`, tone: 'soon' };
  return { text: `In ${d} days`, tone: 'normal' };
}

export function initials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
export function avatarColor(name: string): string {
  if (!name) return AVATAR_COLORS[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
