# Database Setup for Tasks

This guide will help you set up the Supabase database tables for storing tasks.

## Step 1: Create the Tasks Table

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the following SQL:

```sql
-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  done BOOLEAN DEFAULT false,
  category TEXT NOT NULL,
  priority TEXT NOT NULL,
  start_date DATE,
  due_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX tasks_user_id_idx ON tasks(user_id);

-- Create index on due_date for sorting
CREATE INDEX tasks_due_date_idx ON tasks(due_date);

-- Create index on start_date for sorting
CREATE INDEX tasks_start_date_idx ON tasks(start_date);

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own tasks
CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own tasks
CREATE POLICY "Users can insert their own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own tasks
CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own tasks
CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

5. Click **Run** to execute the SQL

## Step 2: Verify the Table

1. Go to **Table Editor** in the left sidebar
2. You should see the `tasks` table
3. Click on it to view the structure

## Table Schema

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| user_id | UUID | Foreign key to auth.users (current user) |
| title | TEXT | Task title/description |
| done | BOOLEAN | Task completion status |
| category | TEXT | Task category (Work, Personal, Travel, Urgent) |
| priority | TEXT | Task priority (Low, Medium, High) |
| due_date | DATE | Task due date |
| created_at | TIMESTAMP | When the task was created |
| updated_at | TIMESTAMP | When the task was last updated |

## Row Level Security (RLS)

The table has RLS enabled with the following policies:

- **SELECT**: Users can only view their own tasks
- **INSERT**: Users can only create tasks for themselves
- **UPDATE**: Users can only update their own tasks
- **DELETE**: Users can only delete their own tasks

This ensures that users cannot access or modify other users' tasks.

## Testing the Setup

After running the SQL, you can test it by:

1. Going to **Table Editor** → **tasks**
2. Trying to insert a test row manually
3. The `user_id` should be set to your authenticated user's ID

## Next Steps

Once the table is created, the application will automatically:
- Load tasks from Supabase when you visit the Tasks page
- Save new tasks to Supabase
- Update tasks in real-time
- Delete tasks from the database

## Troubleshooting

### "permission denied for table tasks"
- Make sure RLS policies are created correctly
- Verify you're logged in with a valid user

### "null value in column user_id"
- The user must be authenticated
- Check that `auth.uid()` returns a valid user ID

### Tasks not showing up
- Check the browser console for errors
- Verify the user_id matches your authenticated user
- Check Supabase logs in the dashboard
