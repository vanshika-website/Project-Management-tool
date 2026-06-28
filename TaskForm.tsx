import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { PRIORITY_META, TASK_STATUS_META, TASK_STATUS_ORDER } from '../lib/meta';
import type { Task, Priority, TaskStatus } from '../lib/supabase';
import { Flag } from 'lucide-react';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; assignee: string; priority: Priority; status: TaskStatus; due_date: string | null }) => Promise<void>;
  initial?: Task | null;
  defaultStatus?: TaskStatus;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'urgent'];

export function TaskForm({ open, onClose, onSubmit, initial, defaultStatus }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? '');
      setDescription(initial?.description ?? '');
      setAssignee(initial?.assignee ?? '');
      setPriority(initial?.priority ?? 'medium');
      setStatus(initial?.status ?? defaultStatus ?? 'todo');
      setDueDate(initial?.due_date ?? '');
    }
  }, [open, initial, defaultStatus]);

  const submit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), assignee: assignee.trim(), priority, status, due_date: dueDate || null });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit task' : 'New task'}
      subtitle={initial ? 'Update the task details.' : 'Add a task to this project.'}
      size="sm"
      footer={
        <>
          <button className="btn-ghost px-4 py-2.5" onClick={onClose}>Cancel</button>
          <button className="btn-primary px-4 py-2.5" onClick={submit} disabled={saving || !title.trim()}>
            {saving ? 'Saving…' : initial ? 'Save' : 'Add task'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Task title</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Design landing page" autoFocus />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input resize-none" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional details" />
        </div>
        <div>
          <label className="label">Assignee</label>
          <input className="input" value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Who is responsible?" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Priority</label>
            <div className="flex flex-wrap gap-1.5">
              {PRIORITIES.map((p) => {
                const m = PRIORITY_META[p];
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`chip border transition-all ${priority === p ? `${m.chip} border-transparent` : 'bg-white border-ink-200 text-ink-500 hover:border-ink-300'}`}
                  >
                    <Flag size={11} className={m.icon} />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="label">Due date</label>
            <input type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Status</label>
          <div className="flex flex-wrap gap-1.5">
            {TASK_STATUS_ORDER.map((s) => {
              const m = TASK_STATUS_META[s];
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`chip border transition-all ${status === s ? `${m.chip} border-transparent` : 'bg-white border-ink-200 text-ink-500 hover:border-ink-300'}`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
