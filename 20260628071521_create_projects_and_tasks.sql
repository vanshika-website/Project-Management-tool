/*
# Create projects and tasks tables (single-tenant, no auth)

1. New Tables
- `projects`
  - `id` (uuid, primary key)
  - `name` (text, not null) — project title
  - `description` (text) — optional longer description
  - `color` (text) — accent color used in the UI, defaults to a brand blue
  - `deadline` (date) — optional project deadline
  - `status` (text) — one of: planning, active, on_hold, completed (default active)
  - `created_at` (timestamptz, default now())
- `tasks`
  - `id` (uuid, primary key)
  - `project_id` (uuid, foreign key to projects, cascade on delete)
  - `title` (text, not null)
  - `description` (text) — optional task details
  - `assignee` (text) — name of the person assigned (free text, no auth)
  - `priority` (text) — one of: low, medium, high, urgent (default medium)
  - `status` (text) — one of: todo, in_progress, review, done (default todo)
  - `due_date` (date) — optional task deadline
  - `order` (int) — manual ordering within a project/column (default 0)
  - `created_at` (timestamptz, default now())

2. Indexes
- `tasks` on `project_id` (foreign key lookups)
- `tasks` on `status` (column filtering)
- `projects` on `status`

3. Security
- Enable RLS on both tables.
- This is a single-tenant app with no sign-in screen, so all CRUD is
  intentionally shared/public. Policies use `TO anon, authenticated`
  with `USING (true)` / `WITH CHECK (true)` because there is no per-user
  ownership to enforce.
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  color text NOT NULL DEFAULT '#2563eb',
  deadline date,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('planning', 'active', 'on_hold', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  assignee text DEFAULT '',
  priority text NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text NOT NULL DEFAULT 'todo'
    CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  due_date date,
  "order" int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_projects" ON projects;
CREATE POLICY "anon_insert_projects" ON projects FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_projects" ON projects;
CREATE POLICY "anon_update_projects" ON projects FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_projects" ON projects;
CREATE POLICY "anon_delete_projects" ON projects FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_tasks" ON tasks;
CREATE POLICY "anon_select_tasks" ON tasks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_tasks" ON tasks;
CREATE POLICY "anon_insert_tasks" ON tasks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_tasks" ON tasks;
CREATE POLICY "anon_update_tasks" ON tasks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_tasks" ON tasks;
CREATE POLICY "anon_delete_tasks" ON tasks FOR DELETE
  TO anon, authenticated USING (true);
