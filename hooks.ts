import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import type { Project, Task, ProjectWithStats, ProjectStatus, TaskStatus, Priority } from './supabase';

export function useProjects() {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('projects')
      .select('*, tasks(id, status, due_date)')
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
      setProjects([]);
    } else {
      const enriched = (data || []).map((p: any) => {
        const tasks: Task[] = p.tasks ?? [];
        const today = new Date().toISOString().slice(0, 10);
        return {
          id: p.id,
          name: p.name,
          description: p.description ?? '',
          color: p.color,
          deadline: p.deadline,
          status: p.status as ProjectStatus,
          created_at: p.created_at,
          task_count: tasks.length,
          done_count: tasks.filter((t) => t.status === 'done').length,
          overdue_count: tasks.filter((t) => t.status !== 'done' && t.due_date && t.due_date < today).length,
          progress: tasks.length ? Math.round((tasks.filter((t) => t.status === 'done').length / tasks.length) * 100) : 0,
        } as ProjectWithStats;
      });
      setProjects(enriched);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const createProject = useCallback(async (input: { name: string; description?: string; color?: string; deadline?: string | null; status?: ProjectStatus }) => {
    const { data, error } = await supabase.from('projects').insert({
      name: input.name,
      description: input.description ?? '',
      color: input.color ?? '#2563eb',
      deadline: input.deadline ?? null,
      status: input.status ?? 'active',
    }).select().single();
    if (error) throw error;
    await load();
    return data as Project;
  }, [load]);

  const updateProject = useCallback(async (id: string, patch: Partial<Project>) => {
    const { error } = await supabase.from('projects').update(patch).eq('id', id);
    if (error) throw error;
    await load();
  }, [load]);

  const deleteProject = useCallback(async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
    await load();
  }, [load]);

  return { projects, loading, error, reload: load, createProject, updateProject, deleteProject };
}

export function useTasks(projectId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!projectId) { setTasks([]); return; }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
      setTasks([]);
    } else {
      setTasks(data as Task[]);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const createTask = useCallback(async (input: { project_id: string; title: string; description?: string; assignee?: string; priority?: Priority; status?: TaskStatus; due_date?: string | null }) => {
    const { data, error } = await supabase.from('tasks').insert({
      project_id: input.project_id,
      title: input.title,
      description: input.description ?? '',
      assignee: input.assignee ?? '',
      priority: input.priority ?? 'medium',
      status: input.status ?? 'todo',
      due_date: input.due_date ?? null,
      order: 0,
    }).select().single();
    if (error) throw error;
    await load();
    return data as Task;
  }, [load]);

  const updateTask = useCallback(async (id: string, patch: Partial<Task>) => {
    const { error } = await supabase.from('tasks').update(patch).eq('id', id);
    if (error) throw error;
    await load();
  }, [load]);

  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
    await load();
  }, [load]);

  return { tasks, loading, error, reload: load, createTask, updateTask, deleteTask };
}
