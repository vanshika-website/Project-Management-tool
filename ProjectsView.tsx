import { useState } from 'react';
import { Plus, Search, LayoutGrid, List, Pencil, Trash2, Calendar, MoreHorizontal } from 'lucide-react';
import type { ProjectWithStats } from '../lib/supabase';
import { ProgressRing } from '../components/ProgressRing';
import { PROJECT_STATUS_META, relativeDeadline } from '../lib/meta';

interface ProjectsViewProps {
  projects: ProjectWithStats[];
  loading: boolean;
  onOpen: (id: string) => void;
  onNew: () => void;
  onEdit: (p: ProjectWithStats) => void;
  onDelete: (p: ProjectWithStats) => void;
}

export function ProjectsView({ projects, loading, onOpen, onNew, onEdit, onDelete }: ProjectsViewProps) {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [menuId, setMenuId] = useState<string | null>(null);

  const filtered = projects.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Projects</h1>
          <p className="text-sm text-ink-500 mt-0.5">{projects.length} {projects.length === 1 ? 'project' : 'projects'} in your workspace</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input className="input pl-9 w-44 sm:w-56" placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="flex rounded-xl border border-ink-200 bg-white p-0.5">
            <button onClick={() => setView('grid')} className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${view === 'grid' ? 'bg-brand-50 text-brand-700' : 'text-ink-400 hover:text-ink-700'}`}>
              <LayoutGrid size={16} />
            </button>
            <button onClick={() => setView('list')} className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${view === 'list' ? 'bg-brand-50 text-brand-700' : 'text-ink-400 hover:text-ink-700'}`}>
              <List size={16} />
            </button>
          </div>
          <button onClick={onNew} className="btn-primary px-3.5 py-2.5 text-sm">
            <Plus size={16} /> <span className="hidden sm:inline">New</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="card h-40 shimmer-bg animate-shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-ink-500 font-medium">{query ? 'No projects match your search.' : 'No projects yet.'}</p>
          {!query && <button onClick={onNew} className="btn-primary mt-4 px-4 py-2.5 text-sm">Create your first project</button>}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => {
            const sm = PROJECT_STATUS_META[p.status];
            const dl = relativeDeadline(p.deadline);
            return (
              <div key={p.id} className="card p-5 hover:shadow-lift hover:border-ink-200 transition-all duration-200 group animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-start justify-between">
                  <button onClick={() => onOpen(p.id)} className="flex items-center gap-3 min-w-0 flex-1 text-left">
                    <span className="h-11 w-11 rounded-xl shrink-0 flex items-center justify-center text-white font-display font-bold text-lg" style={{ backgroundColor: p.color }}>
                      {p.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-ink-900 truncate group-hover:text-brand-700 transition-colors">{p.name}</p>
                      <span className={`chip ${sm.chip} mt-0.5`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${sm.dot}`} /> {sm.label}
                      </span>
                    </div>
                  </button>
                  <div className="relative">
                    <button onClick={() => setMenuId(menuId === p.id ? null : p.id)} className="btn-ghost h-8 w-8 rounded-lg p-0">
                      <MoreHorizontal size={16} />
                    </button>
                    {menuId === p.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuId(null)} />
                        <div className="absolute right-0 top-9 z-20 w-32 card p-1 animate-scale-in">
                          <button onClick={() => { setMenuId(null); onEdit(p); }} className="w-full flex items-center gap-2 px-2.5 py-1.5 text-sm text-ink-700 hover:bg-ink-100 rounded-lg">
                            <Pencil size={14} /> Edit
                          </button>
                          <button onClick={() => { setMenuId(null); onDelete(p); }} className="w-full flex items-center gap-2 px-2.5 py-1.5 text-sm text-rose-600 hover:bg-rose-50 rounded-lg">
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {p.description && <p className="text-sm text-ink-500 mt-3 line-clamp-2">{p.description}</p>}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-ink-100">
                  <ProgressRing value={p.progress} size={48} stroke={5} color={p.color} />
                  <div className="text-right">
                    <p className="text-xs text-ink-500">{p.done_count}/{p.task_count} tasks</p>
                    <p className={`text-xs font-medium mt-0.5 ${dl.tone === 'overdue' ? 'text-rose-600' : dl.tone === 'soon' ? 'text-amber-600' : 'text-ink-500'}`}>
                      <Calendar size={10} className="inline mr-1" />{dl.text}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card overflow-hidden">
          {filtered.map((p, i) => {
            const sm = PROJECT_STATUS_META[p.status];
            const dl = relativeDeadline(p.deadline);
            return (
              <div key={p.id} className={`flex items-center gap-4 p-4 hover:bg-ink-50 transition-colors group ${i > 0 ? 'border-t border-ink-100' : ''}`}>
                <span className="h-9 w-9 rounded-lg shrink-0" style={{ backgroundColor: p.color }} />
                <button onClick={() => onOpen(p.id)} className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-ink-900 truncate group-hover:text-brand-700 transition-colors">{p.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`chip ${sm.chip}`}><span className={`h-1.5 w-1.5 rounded-full ${sm.dot}`} /> {sm.label}</span>
                    <span className="text-xs text-ink-400">{p.done_count}/{p.task_count} tasks</span>
                  </div>
                </button>
                <div className="hidden sm:block w-40">
                  <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${p.progress}%`, backgroundColor: p.color }} />
                  </div>
                </div>
                <span className={`text-xs font-medium w-24 text-right ${dl.tone === 'overdue' ? 'text-rose-600' : dl.tone === 'soon' ? 'text-amber-600' : 'text-ink-500'}`}>{dl.text}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => onEdit(p)} className="btn-ghost h-8 w-8 rounded-lg p-0 opacity-0 group-hover:opacity-100"><Pencil size={15} /></button>
                  <button onClick={() => onDelete(p)} className="btn-ghost h-8 w-8 rounded-lg p-0 opacity-0 group-hover:opacity-100 hover:text-rose-600"><Trash2 size={15} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
