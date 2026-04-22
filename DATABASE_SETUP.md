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


---

## Notification Emails — Supabase Edge Function Setup

Emails are sent via a Supabase Edge Function (`send-notification`) using [Resend](https://resend.com).

### 1. Get a Resend API Key
1. Sign up at [resend.com](https://resend.com) (free tier: 3,000 emails/month)
2. Go to **API Keys** → Create a new key
3. Verify your sending domain (or use `onboarding@resend.dev` for testing)

### 2. Deploy the Edge Function
```bash
npx supabase login
npx supabase link --project-ref krgnjxklbmzejekfxioz
npx supabase functions deploy send-notification
```

### 3. Set the Secret
```bash
npx supabase secrets set RESEND_API_KEY=re_your_key_here
```

### 4. Update the FROM address
In `supabase/functions/send-notification/index.ts`, update:
```ts
const FROM_EMAIL = "Holiday Tasker <notifications@yourdomain.com>";
```
Use a domain you've verified in Resend. For testing you can use `onboarding@resend.dev`.

### How it works
| Toggle | Email sent |
|---|---|
| Task Reminders ON | Tasks due today or tomorrow |
| Vacation Alerts ON | Upcoming trip summary |
| Email Notifications ON | Full digest (pending tasks + trips) |
| "Send now" button | Manually trigger any of the above |

All emails go to the logged-in user's email address.


---

## Account Deletion — Edge Function Setup

Account deletion uses a second Edge Function (`delete-account`) that runs with the Supabase service role key server-side.

### Deploy the function
```bash
npx supabase functions deploy delete-account
```

### Set the service role secret
Get your service role key from **Supabase Dashboard → Project Settings → API → service_role key** (keep this secret, never put it in the frontend).

```bash
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

> `SUPABASE_URL` and `SUPABASE_ANON_KEY` are automatically available inside Edge Functions — no need to set them manually.

### What each button does
| Button | What happens |
|---|---|
| **Clear Saved Data** | Deletes all tasks from the DB for that user + clears localStorage. Requires confirmation dialog. |
| **Delete Account** | Calls the edge function which uses `auth.admin.deleteUser()` to permanently remove the account + all cascaded data. Requires typing `DELETE` to confirm. |


---

## Delete Account — SQL Function (No Edge Function needed)

Run this in **Supabase Dashboard → SQL Editor**:

```sql
create or replace function delete_user()
returns void
language sql security definer
as $$
  delete from auth.users where id = auth.uid();
$$;
```

This lets the logged-in user delete themselves from within the DB using their own JWT — no service role key or Edge Function required.


---

## Profiles Table

Run this in **Supabase Dashboard → SQL Editor**:

```sql
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text,
  phone text,
  location text,
  avatar_url text,
  bio text,
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users manage own profile" on profiles
  for all using (auth.uid() = id);

-- Auto-create a profile row when a user signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```
