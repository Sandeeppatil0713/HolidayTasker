# Supabase Database Setup

Run the following SQL queries in your Supabase dashboard under **SQL Editor**.

---

## 1. Create the Tasks Table

```sql
create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  done boolean default false,
  category text default 'Work',
  priority text default 'Medium',
  start_date date,
  due_date date,
  created_at timestamptz default now()
);
```

**Column descriptions:**

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` | Auto-generated unique ID for each task |
| `user_id` | `uuid` | Links the task to the logged-in user via Supabase Auth |
| `title` | `text` | The task name — required, cannot be empty |
| `done` | `boolean` | Whether the task is completed — defaults to `false` |
| `category` | `text` | Task category (Work, Personal, Travel, Urgent) — defaults to `Work` |
| `priority` | `text` | Task priority level (Low, Medium, High) — defaults to `Medium` |
| `start_date` | `date` | Optional start date for the task |
| `due_date` | `date` | Optional due date for the task |
| `created_at` | `timestamptz` | Timestamp of when the task was created — auto-set |

---

## 2. Enable Row Level Security (RLS)

```sql
alter table tasks enable row level security;
```

**Why:** RLS ensures users can only access their own data. Without this, any logged-in user could read or modify everyone's tasks. This is a required security step.

---

## 3. Create RLS Policy

```sql
create policy "Users manage own tasks" on tasks
  for all using (auth.uid() = user_id);
```

**Why:** This policy allows a user to `SELECT`, `INSERT`, `UPDATE`, and `DELETE` only the rows where `user_id` matches their own Supabase Auth UID. Any request from a different user is automatically blocked at the database level.

---

## How the App Connects

The app uses `src/services/tasksService.ts` to talk to this table:

| Function | SQL Operation | Description |
|---|---|---|
| `fetchTasks(userId)` | `SELECT` | Loads all tasks for the logged-in user, ordered by newest first |
| `createTask(userId, task)` | `INSERT` | Adds a new task row with the user's ID |
| `toggleTask(id, done)` | `UPDATE` | Updates the `done` field to mark complete or incomplete |
| `deleteTask(id)` | `DELETE` | Permanently removes a task row by its ID |
