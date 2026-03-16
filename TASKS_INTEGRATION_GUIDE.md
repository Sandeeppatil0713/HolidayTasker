# Tasks Integration with Supabase - Complete Guide

This guide explains how the Tasks module has been integrated with Supabase for persistent data storage.

## What Was Implemented

### 1. Database Schema
A `tasks` table was designed with the following structure:
- **id**: UUID (Primary Key, auto-generated)
- **user_id**: UUID (Foreign Key to auth.users)
- **title**: TEXT (Task description)
- **done**: BOOLEAN (Completion status)
- **category**: TEXT (Work, Personal, Travel, Urgent)
- **priority**: TEXT (Low, Medium, High)
- **due_date**: DATE (Task due date)
- **created_at**: TIMESTAMP (Auto-generated)
- **updated_at**: TIMESTAMP (Auto-updated)

### 2. Row Level Security (RLS)
Implemented security policies to ensure:
- Users can only view their own tasks
- Users can only create tasks for themselves
- Users can only update their own tasks
- Users can only delete their own tasks

### 3. Tasks Service (`src/services/tasksService.ts`)
Created a service layer with the following functions:
- `fetchTasks()`: Load all tasks for the current user
- `createTask()`: Create a new task
- `updateTask()`: Update task details
- `toggleTaskDone()`: Toggle task completion status
- `deleteTask()`: Delete a task

### 4. Updated TasksPage Component
The TasksPage now:
- Loads tasks from Supabase on mount
- Shows a loading spinner while fetching data
- Creates tasks in the database
- Updates task status in real-time
- Deletes tasks from the database
- Shows toast notifications for all operations
- Displays empty state when no tasks exist

## Setup Instructions

### Step 1: Create the Database Table

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the SQL from `DATABASE_SETUP.md`
5. Click **Run** to execute

### Step 2: Verify the Setup

1. Go to **Table Editor** in Supabase
2. You should see the `tasks` table
3. Check that RLS is enabled (shield icon should be visible)

### Step 3: Test the Integration

1. Make sure your `.env` file has the correct Supabase credentials
2. Start your development server: `npm run dev`
3. Log in to your account
4. Navigate to the Tasks page
5. Try creating, completing, and deleting tasks

## Features

### ✅ Create Tasks
- Enter task title
- Select category (Work, Personal, Travel, Urgent)
- Select priority (Low, Medium, High)
- Due date is automatically set to today
- Task is saved to Supabase immediately

### ✅ View Tasks
- All tasks are loaded from Supabase on page load
- Tasks are sorted by due date (ascending)
- Filter tasks by category
- See completion progress

### ✅ Update Tasks
- Click the circle icon to mark as complete
- Click the checkmark icon to mark as incomplete
- Status is updated in Supabase immediately

### ✅ Delete Tasks
- Hover over a task to see the delete button
- Click to delete
- Task is removed from Supabase immediately

### ✅ Real-time Feedback
- Loading spinner while fetching tasks
- Toast notifications for all operations
- Success messages for create/delete
- Error messages if something goes wrong

## Data Flow

```
User Action → TasksPage Component → Tasks Service → Supabase → Database
                                                        ↓
                                                   Response
                                                        ↓
                                              Update UI State
```

### Example: Creating a Task

1. User enters task title and clicks "Add"
2. `addTask()` function is called
3. `createTask()` service function is invoked
4. Service gets current user ID from Supabase Auth
5. Task is inserted into the database with user_id
6. Database returns the created task
7. Task is added to local state
8. UI updates to show the new task
9. Success toast is displayed

### Example: Toggling Task Status

1. User clicks the circle/checkmark icon
2. `toggleTask()` function is called
3. `toggleTaskDone()` service function is invoked
4. Task status is updated in the database
5. Database returns the updated task
6. Local state is updated
7. UI reflects the new status

## Security Features

### Row Level Security (RLS)
All database operations are protected by RLS policies:

```sql
-- Users can only see their own tasks
CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);
```

This means:
- User A cannot see User B's tasks
- User A cannot modify User B's tasks
- User A cannot delete User B's tasks

### Authentication Required
All task operations require authentication:
- The `user_id` is automatically set from the authenticated user
- Unauthenticated users cannot access the tasks API
- Protected routes ensure only logged-in users can access the Tasks page

## Error Handling

The integration includes comprehensive error handling:

### Network Errors
- Caught and displayed in toast notifications
- User-friendly error messages
- Console logging for debugging

### Authentication Errors
- Redirects to login if user is not authenticated
- Shows error if user session expires

### Database Errors
- Validation errors from Supabase
- Permission errors from RLS policies
- Connection errors

## Testing Checklist

- [ ] Database table created successfully
- [ ] RLS policies are enabled
- [ ] Can create new tasks
- [ ] Tasks appear in the list immediately
- [ ] Can mark tasks as complete
- [ ] Can mark tasks as incomplete
- [ ] Can delete tasks
- [ ] Tasks persist after page refresh
- [ ] Tasks are filtered by category correctly
- [ ] Progress bar updates correctly
- [ ] Toast notifications appear for all actions
- [ ] Loading spinner shows while fetching
- [ ] Empty state shows when no tasks exist
- [ ] Cannot see other users' tasks

## Troubleshooting

### Tasks not loading
**Problem**: Page shows loading spinner indefinitely

**Solutions**:
1. Check browser console for errors
2. Verify Supabase credentials in `.env`
3. Check that the `tasks` table exists
4. Verify RLS policies are created
5. Make sure you're logged in

### "Permission denied" error
**Problem**: Cannot create/update/delete tasks

**Solutions**:
1. Verify RLS policies are created correctly
2. Check that you're authenticated
3. Verify `user_id` matches your auth user
4. Check Supabase logs for details

### Tasks not persisting
**Problem**: Tasks disappear after page refresh

**Solutions**:
1. Check that tasks are being saved to Supabase
2. Verify the `createTask()` function is working
3. Check browser console for errors
4. Look at Supabase Table Editor to see if tasks exist

### Duplicate tasks appearing
**Problem**: Same task shows up multiple times

**Solutions**:
1. Check that you're not calling `loadTasks()` multiple times
2. Verify the `useEffect` dependency array is correct
3. Clear browser cache and reload

## Advanced Features (Future Enhancements)

### Real-time Subscriptions
Add real-time updates when tasks change:
```typescript
supabase
  .channel('tasks')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'tasks' 
  }, (payload) => {
    // Update UI when tasks change
  })
  .subscribe();
```

### Task Editing
Add ability to edit task title, category, priority, and due date:
```typescript
export async function updateTaskDetails(
  id: string, 
  updates: Partial<TaskInput>
): Promise<Task> {
  // Implementation
}
```

### Task Sorting
Add sorting options:
- By due date
- By priority
- By category
- By creation date

### Task Search
Add search functionality to filter tasks by title.

### Recurring Tasks
Add support for tasks that repeat daily, weekly, or monthly.

## Files Modified/Created

### Created:
1. `src/services/tasksService.ts` - Tasks service layer
2. `DATABASE_SETUP.md` - Database setup SQL
3. `TASKS_INTEGRATION_GUIDE.md` - This file

### Modified:
1. `src/pages/TasksPage.tsx` - Updated to use Supabase

## Summary

The Tasks module is now fully integrated with Supabase, providing:
- ✅ Persistent data storage
- ✅ User-specific task isolation
- ✅ Real-time updates
- ✅ Secure data access
- ✅ Error handling
- ✅ Loading states
- ✅ User feedback

All tasks are now stored in the cloud and will persist across sessions and devices!
