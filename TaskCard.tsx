import { Calendar, MoreHorizontal, Pencil, Trash2, Flag } from 'lucide-react';
import { useState } from 'react';
import type { Task } from '../lib/supabase';
import { PRIORITY_META, relativeDeadline } from '../lib/meta';
import { Avatar } from './Avatar';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: Task['status']) => void;
}

const TONE_STYLES = {
  overdue: 'text-rose-600 bg-rose-50',
  soon: 'text-amber-600 bg-amber-50',
  normal: 'text-ink-500 bg-ink-100',
  none: 'text-ink-400 bg-ink-100',
};

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const [menu, setMenu] = useState(false);
  const pm = PRIORITY_META[task.priority];
  const dl = relativeDeadline(task.due_date);

  return (
    <div className="group card p-3.5 hover:shadow-lift hover:border-ink-200 transition-all duration-200 cursor-grab active:cursor-grabbing animate-fade-up">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink-900 leading-snug">{task.title}</p>
          {task.description && <p className="text-xs text-ink-500 mt-1 line-clamp-2">{task.description}</p>}
        </div>
        <div className="relative shrink-0">
          <button onClick={() => setMenu((m) => !m)} className="btn-ghost h-7 w-7 rounded-lg p-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal size={16} />
          </button>
          {menu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
              <div className="absolute right-0 top-8 z-20 w-36 card p-1 animate-scale-in">
                <button onClick={() => { setMenu(false); onEdit(); }} className="w-full flex items-center gap-2 px-2.5 py-1.5 text-sm text-ink-700 hover:bg-ink-100 rounded-lg">
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={() => { setMenu(false); onDelete(); }} className="w-full flex items-center gap-2 px-2.5 py-1.5 text-sm text-rose-600 hover:bg-rose-50 rounded-lg">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mt-3">
        <div className="flex items-center gap-1.5">
          <span className={`chip ${pm.chip}`}>
            <Flag size={10} className={pm.icon} />
            {pm.label}
          </span>
          {task.due_date && (
            <span className={`chip ${TONE_STYLES[dl.tone]}`}>
              <Calendar size={10} />
              {dl.text}
            </span>
          )}
        </div>
        {task.assignee ? <Avatar name={task.assignee} size={24} /> : null}
      </div>

      <select
        value={task.status}
        onChange={(e) => onStatusChange(e.target.value as Task['status'])}
        className="mt-2.5 w-full text-xs font-medium text-ink-600 bg-ink-50 border border-ink-100 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
      >
        <option value="todo">To do</option>
        <option value="in_progress">In progress</option>
        <option value="review">In review</option>
        <option value="done">Done</option>
      </select>
    </div>
  );
}
