# Tasks Module - Quick Setup Guide

Follow these steps to enable cloud storage for your tasks.

## Prerequisites
✅ Supabase account created  
✅ Project created in Supabase  
✅ `.env` file configured with Supabase credentials

## Step-by-Step Setup

### 1. Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### 2. Run the Database Setup Script

Copy and paste this SQL script:

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

-- Create indexes
CREATE INDEX tasks_user_id_idx ON tasks(user_id);
CREATE INDEX tasks_due_date_idx ON tasks(due_date);
CREATE INDEX tasks_start_date_idx ON tasks(start_date);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 3. Execute the Script
Click the **Run** button (or press F5)

### 4. Verify the Setup
1. Go to **Table Editor** in the left sidebar
2. You should see the `tasks` table
3. Click on it to view the structure
4. Verify the shield icon (🛡️) is visible (RLS enabled)

### 5. Test the Integration
1. Start your dev server: `npm run dev`
2. Log in to your account
3. Navigate to **My Tasks** page
4. Create a test task
5. Refresh the page - task should still be there!

## What You Get

✅ **Cloud Storage**: All tasks saved to Supabase  
✅ **User Privacy**: Each user sees only their own tasks  
✅ **Real-time Updates**: Changes sync immediately  
✅ **Data Persistence**: Tasks survive page refreshes  
✅ **Secure Access**: Row Level Security protects data  

## Troubleshooting

### "permission denied for table tasks"
→ Make sure you ran ALL the SQL including the RLS policies

### Tasks not showing up
→ Check browser console for errors  
→ Verify you're logged in  
→ Check Supabase logs

### "relation tasks does not exist"
→ The table wasn't created  
→ Re-run the SQL script

## Next Steps

Once tasks are working, you can:
- Add more features (edit tasks, set reminders)
- Integrate other modules (vacations, analytics)
- Add real-time subscriptions
- Export/import tasks

## Need More Help?

📖 See [TASKS_INTEGRATION_GUIDE.md](./TASKS_INTEGRATION_GUIDE.md) for detailed documentation  
📖 See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for database details  
📖 Visit [Supabase Docs](https://supabase.com/docs) for Supabase help

---

**That's it!** Your tasks are now stored in the cloud! 🎉
