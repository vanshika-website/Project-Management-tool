import { useEffect, useState } from 'react';
import { LayoutDashboard, FolderKanban, Plus, Sparkles } from 'lucide-react';
import { ToastProvider, useToast } from './components/Toast';
import { ProjectForm } from './components/ProjectForm';
import { Dashboard } from './views/Dashboard';
import { ProjectsView } from './views/ProjectsView';
import { ProjectDetail } from './views/ProjectDetail';
import { useProjects } from './lib/hooks';
import type { ProjectWithStats, ProjectStatus } from './lib/supabase';

type View = 'dashboard' | 'projects' | 'detail';

function AppInner() {
  const toast = useToast();
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects();
  const [view, setView] = useState<View>('dashboard');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithStats | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ProjectWithStats | null>(null);

  const activeProject = projects.find((p) => p.id === activeId) ?? null;

  useEffect(() => {
    if (activeId && !activeProject && !loading) {
      setActiveId(null);
      setView('projects');
    }
  }, [activeId, activeProject, loading]);

  const openProject = (id: string) => {
    setActiveId(id);
    setView('detail');
  };

  const newProject = () => {
    setEditingProject(null);
    setProjectFormOpen(true);
  };

  const editProject = (p: ProjectWithStats) => {
    setEditingProject(p);
    setProjectFormOpen(true);
  };

  const submitProject = async (data: { name: string; description: string; color: string; deadline: string | null; status: ProjectStatus }) => {
    if (editingProject) {
      await updateProject(editingProject.id, data);
      toast('success', 'Project updated');
    } else {
      const p = await createProject(data);
      toast('success', 'Project created');
      openProject(p.id);
    }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    const wasActive = activeId === confirmDelete.id;
    await deleteProject(confirmDelete.id);
    toast('success', 'Project deleted');
    setConfirmDelete(null);
    if (wasActive) { setActiveId(null); setView('projects'); }
  };

  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects' as View, label: 'Projects', icon: FolderKanban },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-ink-100 bg-white">
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-ink-100">
          <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow">
            <Sparkles size={18} className="text-white" />
            <span className="absolute inset-0 rounded-xl ring-2 ring-brand-400/30 animate-pulse-ring" />
          </div>
          <div>
            <p className="font-display font-extrabold text-ink-900 leading-none">Vanshika</p>
            <p className="text-[11px] text-ink-400 font-medium tracking-wide uppercase mt-0.5">Tool</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((n) => (
            <button
              key={n.id}
              onClick={() => { setView(n.id); setActiveId(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${view === n.id ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'}`}
            >
              <n.icon size={18} />
              {n.label}
            </button>
          ))}
        </nav>
        <div className="p-3">
          <button onClick={newProject} className="w-full btn-primary py-2.5 text-sm">
            <Plus size={16} /> New project
          </button>
        </div>
        <div className="p-4 border-t border-ink-100">
          <div className="rounded-xl bg-gradient-to-br from-brand-50 to-brand-100/50 p-3.5">
            <p className="text-xs font-semibold text-brand-700">Vanshika Tool</p>
            <p className="text-[11px] text-ink-500 mt-1 leading-relaxed">Plan, assign, and track your team's work in one beautiful workspace.</p>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 bg-white/90 backdrop-blur-md border-b border-ink-100 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <p className="font-display font-extrabold text-ink-900">Vanshika Tool</p>
        </div>
        <button onClick={newProject} className="btn-primary px-3 py-1.5 text-sm"><Plus size={15} /> New</button>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-16 bg-white/90 backdrop-blur-md border-t border-ink-100 flex items-center justify-around px-4">
        {navItems.map((n) => (
          <button
            key={n.id}
            onClick={() => { setView(n.id); setActiveId(null); }}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors ${view === n.id ? 'text-brand-700' : 'text-ink-400'}`}
          >
            <n.icon size={20} />
            <span className="text-[10px] font-medium">{n.label}</span>
          </button>
        ))}
      </div>

      {/* Main */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pt-20 lg:pt-8 pb-24 lg:pb-8 max-w-[1400px] mx-auto w-full">
        {view === 'dashboard' && (
          <Dashboard projects={projects} loading={loading} onOpenProject={openProject} onNewProject={newProject} />
        )}
        {view === 'projects' && (
          <ProjectsView
            projects={projects}
            loading={loading}
            onOpen={openProject}
            onNew={newProject}
            onEdit={editProject}
            onDelete={(p) => setConfirmDelete(p)}
          />
        )}
        {view === 'detail' && activeProject && (
          <ProjectDetail
            project={activeProject}
            onBack={() => { setView('projects'); setActiveId(null); }}
            onEditProject={() => editProject(activeProject)}
            onDeleteProject={() => setConfirmDelete(activeProject)}
          />
        )}
      </main>

      <ProjectForm
        open={projectFormOpen}
        onClose={() => setProjectFormOpen(false)}
        onSubmit={submitProject}
        initial={editingProject}
      />

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm animate-fade-in" onClick={() => setConfirmDelete(null)} />
          <div className="relative card p-6 max-w-sm w-full animate-scale-in">
            <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
              <Plus size={22} className="text-rose-600 rotate-45" />
            </div>
            <h3 className="font-display text-lg font-bold text-ink-900">Delete project?</h3>
            <p className="text-sm text-ink-500 mt-1">"{confirmDelete.name}" and all its tasks will be permanently removed. This cannot be undone.</p>
            <div className="flex justify-end gap-2 mt-5">
              <button className="btn-ghost px-4 py-2.5" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn bg-rose-600 text-white hover:bg-rose-700 px-4 py-2.5" onClick={doDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
