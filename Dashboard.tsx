import { FolderKanban, CheckCircle2, Clock, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';
import type { ProjectWithStats } from '../lib/supabase';
import { ProgressRing } from '../components/ProgressRing';
import { PROJECT_STATUS_META, relativeDeadline } from '../lib/meta';

interface DashboardProps {
  projects: ProjectWithStats[];
  loading: boolean;
  onOpenProject: (id: string) => void;
  onNewProject: () => void;
}

export function Dashboard({ projects, loading, onOpenProject, onNewProject }: DashboardProps) {
  const totalTasks = projects.reduce((s, p) => s + p.task_count, 0);
  const doneTasks = projects.reduce((s, p) => s + p.done_count, 0);
  const overdue = projects.reduce((s, p) => s + p.overdue_count, 0);
  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const overall = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const stats = [
    { label: 'Active projects', value: activeProjects, icon: FolderKanban, tone: 'text-brand-600 bg-brand-50' },
    { label: 'Total tasks', value: totalTasks, icon: TrendingUp, tone: 'text-sky-600 bg-sky-50' },
    { label: 'Completed', value: doneTasks, icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50' },
    { label: 'Overdue', value: overdue, icon: AlertTriangle, tone: 'text-rose-600 bg-rose-50' },
  ];

  const recent = [...projects].slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white p-6 sm:p-8 animate-fade-up">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl animate-float" />
        <div className="absolute right-20 bottom-0 h-32 w-32 rounded-full bg-brand-400/30 blur-2xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-brand-200 text-sm font-medium">Welcome back</p>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold mt-1">Vanshika Tool workspace</h1>
            <p className="text-brand-100 mt-2 max-w-md text-sm">Plan projects, assign tasks, set deadlines, and track progress — all in one place.</p>
            <button onClick={onNewProject} className="mt-4 btn bg-white text-brand-700 hover:bg-brand-50 px-4 py-2.5 text-sm font-semibold shadow-soft">
              <FolderKanban size={16} /> New project
            </button>
          </div>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 ring-1 ring-white/20">
            <ProgressRing value={overall} size={72} stroke={7} color="#ffffff" trackColor="rgba(255,255,255,.2)" />
            <div>
              <p className="text-brand-100 text-xs">Overall progress</p>
              <p className="font-display text-2xl font-bold">{overall}%</p>
              <p className="text-brand-200 text-xs">{doneTasks} of {totalTasks} tasks done</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={s.label} className="card p-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between">
              <span className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.tone}`}>
                <s.icon size={20} />
              </span>
              <span className="font-display text-2xl font-bold text-ink-900">{loading ? '—' : s.value}</span>
            </div>
            <p className="text-sm text-ink-500 mt-2">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent projects */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-bold text-ink-900">Recent projects</h2>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="card p-5 h-32 shimmer-bg animate-shimmer" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="card p-10 text-center">
            <FolderKanban size={32} className="mx-auto text-ink-300" />
            <p className="text-ink-500 mt-3 font-medium">No projects yet</p>
            <p className="text-ink-400 text-sm mt-1">Create your first project to get started.</p>
            <button onClick={onNewProject} className="btn-primary mt-4 px-4 py-2.5 text-sm">Create project</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recent.map((p, i) => {
              const sm = PROJECT_STATUS_META[p.status];
              const dl = relativeDeadline(p.deadline);
              return (
                <button
                  key={p.id}
                  onClick={() => onOpenProject(p.id)}
                  className="card p-5 text-left hover:shadow-lift hover:border-ink-200 transition-all duration-200 group animate-fade-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="h-10 w-10 rounded-xl shrink-0" style={{ backgroundColor: p.color }} />
                      <div className="min-w-0">
                        <p className="font-semibold text-ink-900 truncate group-hover:text-brand-700 transition-colors">{p.name}</p>
                        <span className={`chip ${sm.chip} mt-1`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${sm.dot}`} />
                          {sm.label}
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-ink-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex-1">
                      <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${p.progress}%`, backgroundColor: p.color }} />
                      </div>
                      <p className="text-xs text-ink-500 mt-1.5">{p.done_count}/{p.task_count} tasks · {p.progress}%</p>
                    </div>
                    <span className={`chip ${dl.tone === 'overdue' ? 'text-rose-600 bg-rose-50' : dl.tone === 'soon' ? 'text-amber-600 bg-amber-50' : 'text-ink-500 bg-ink-100'}`}>
                      <Clock size={10} /> {dl.text}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
