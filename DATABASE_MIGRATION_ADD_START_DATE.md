# Database Migration: Add Start Date to Tasks

If you already have the tasks table created, run this migration to add the start_date column.

## Migration SQL

```sql
-- Add start_date column to existing tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date DATE;

-- Create index on start_date for better query performance
CREATE INDEX IF NOT EXISTS tasks_start_date_idx ON tasks(start_date);

-- Optional: Set start_date to created_at date for existing tasks
UPDATE tasks 
SET start_date = created_at::date 
WHERE start_date IS NULL;
```

## How to Run

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the SQL above
5. Click **Run** (or press F5)

## Verification

After running the migration:

1. Go to **Table Editor** → **tasks**
2. You should see the new `start_date` column
3. Existing tasks will have start_date set to their creation date
4. New tasks can have custom start dates

## Rollback (if needed)

If you need to remove the start_date column:

```sql
-- Remove the index
DROP INDEX IF EXISTS tasks_start_date_idx;

-- Remove the column
ALTER TABLE tasks DROP COLUMN IF EXISTS start_date;
```

## Notes

- The `start_date` column is optional (can be NULL)
- The `due_date` column remains required
- Existing tasks will have start_date automatically set
- New tasks can specify a custom start date
