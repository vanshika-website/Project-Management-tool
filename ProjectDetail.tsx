import { useMemo, useState } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2, Calendar, Users, CheckCircle2 } from 'lucide-react';
import type { ProjectWithStats, Task, TaskStatus, Priority } from '../lib/supabase';
import { useTasks } from '../lib/hooks';
import { TaskCard } from '../components/TaskCard';
import { TaskForm } from '../components/TaskForm';
import { ProgressRing } from '../components/ProgressRing';
import { Avatar } from '../components/Avatar';
import { TASK_STATUS_META, TASK_STATUS_ORDER, PROJECT_STATUS_META, relativeDeadline } from '../lib/meta';

interface ProjectDetailProps {
  project: ProjectWithStats;
  onBack: () => void;
  onEditProject: () => void;
  onDeleteProject: () => void;
}

export function ProjectDetail({ project, onBack, onEditProject, onDeleteProject }: ProjectDetailProps) {
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks(project.id);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');

  const sm = PROJECT_STATUS_META[project.status];
  const dl = relativeDeadline(project.deadline);

  const byStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], review: [], done: [] };
    tasks.forEach((t) => map[t.status].push(t));
    return map;
  }, [tasks]);

  const assignees = useMemo(() => {
    const names = new Set(tasks.map((t) => t.assignee).filter(Boolean));
    return Array.from(names);
  }, [tasks]);

  const handleCreate = async (data: { title: string; description: string; assignee: string; priority: Priority; status: TaskStatus; due_date: string | null }) => {
    await createTask({ project_id: project.id, ...data });
  };

  const handleUpdate = async (data: { title: string; description: string; assignee: string; priority: Priority; status: TaskStatus; due_date: string | null }) => {
    if (!editing) return;
    await updateTask(editing.id, data);
    setEditing(null);
  };

  const openNew = (status: TaskStatus) => {
    setEditing(null);
    setDefaultStatus(status);
    setFormOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setFormOpen(true);
  };

  const progress = tasks.length ? Math.round((byStatus.done.length / tasks.length) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="animate-fade-up">
        <button onClick={onBack} className="btn-ghost px-2 py-1.5 -ml-2 text-sm mb-3">
          <ArrowLeft size={16} /> All projects
        </button>
        <div className="card p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1.5" style={{ backgroundColor: project.color }} />
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="h-12 w-12 rounded-xl shrink-0 flex items-center justify-center text-white font-display font-bold text-xl" style={{ backgroundColor: project.color }}>
                  {project.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <h1 className="font-display text-xl sm:text-2xl font-bold text-ink-900 truncate">{project.name}</h1>
                  <span className={`chip ${sm.chip} mt-0.5`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${sm.dot}`} /> {sm.label}
                  </span>
                </div>
              </div>
              {project.description && <p className="text-sm text-ink-500 mt-3 max-w-2xl">{project.description}</p>}
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <span className="flex items-center gap-1.5 text-sm text-ink-500">
                  <Calendar size={15} className={dl.tone === 'overdue' ? 'text-rose-500' : dl.tone === 'soon' ? 'text-amber-500' : 'text-ink-400'} />
                  {dl.text}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-ink-500">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  {byStatus.done.length}/{tasks.length} done
                </span>
                {assignees.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Users size={15} className="text-ink-400" />
                    <div className="flex -space-x-2">
                      {assignees.slice(0, 5).map((a) => <Avatar key={a} name={a} size={24} />)}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <ProgressRing value={progress} size={64} stroke={6} color={project.color} />
                <p className="text-xs text-ink-500 mt-1.5">Progress</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <button onClick={onEditProject} className="btn-outline px-3 py-2 text-sm"><Pencil size={14} /> Edit</button>
                <button onClick={onDeleteProject} className="btn-ghost px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"><Trash2 size={14} /> Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {TASK_STATUS_ORDER.map((status, i) => {
          const m = TASK_STATUS_META[status];
          const colTasks = byStatus[status];
          return (
            <div key={status} className="flex flex-col gap-3 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${m.bar}`} />
                  <h3 className="font-semibold text-sm text-ink-700">{m.label}</h3>
                  <span className="text-xs text-ink-400 font-medium">{colTasks.length}</span>
                </div>
                <button onClick={() => openNew(status)} className="btn-ghost h-7 w-7 rounded-lg p-0 hover:text-brand-600">
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-2.5 min-h-[120px]">
                {loading ? (
                  [0, 1].map((j) => <div key={j} className="card h-24 shimmer-bg animate-shimmer" />)
                ) : colTasks.length === 0 ? (
                  <div className="card border-dashed border-ink-200 p-6 text-center">
                    <p className="text-xs text-ink-400">No tasks</p>
                  </div>
                ) : (
                  colTasks.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onEdit={() => openEdit(t)}
                      onDelete={() => deleteTask(t.id)}
                      onStatusChange={(s) => updateTask(t.id, { status: s })}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TaskForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={editing ? handleUpdate : handleCreate}
        initial={editing}
        defaultStatus={defaultStatus}
      />
    </div>
  );
}
