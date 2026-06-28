import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { PROJECT_COLORS, PROJECT_STATUS_META } from '../lib/meta';
import type { Project, ProjectStatus } from '../lib/supabase';
import { Check } from 'lucide-react';

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; color: string; deadline: string | null; status: ProjectStatus }) => Promise<void>;
  initial?: Project | null;
}

const STATUSES: ProjectStatus[] = ['planning', 'active', 'on_hold', 'completed'];

export function ProjectForm({ open, onClose, onSubmit, initial }: ProjectFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '');
      setDescription(initial?.description ?? '');
      setColor(initial?.color ?? PROJECT_COLORS[0]);
      setDeadline(initial?.deadline ?? '');
      setStatus(initial?.status ?? 'active');
    }
  }, [open, initial]);

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), color, deadline: deadline || null, status });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit project' : 'New project'}
      subtitle={initial ? 'Update the project details below.' : 'Create a new project to organize your work.'}
      footer={
        <>
          <button className="btn-ghost px-4 py-2.5" onClick={onClose}>Cancel</button>
          <button className="btn-primary px-4 py-2.5" onClick={submit} disabled={saving || !name.trim()}>
            {saving ? 'Saving…' : initial ? 'Save changes' : 'Create project'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Project name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Website redesign" autoFocus />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input resize-none" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this project about?" />
        </div>
        <div>
          <label className="label">Accent color</label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="h-9 w-9 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : 'none' }}
              >
                {color === c && <Check size={16} className="text-white" />}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Deadline</label>
            <input type="date" className="input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <div>
            <label className="label">Status</label>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => {
                const m = PROJECT_STATUS_META[s];
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`chip border transition-all ${status === s ? `${m.chip} border-transparent ring-2 ring-current/20` : 'bg-white border-ink-200 text-ink-500 hover:border-ink-300'}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
