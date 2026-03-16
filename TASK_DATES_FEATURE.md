# Task Start and Due Dates Feature

## Overview
Tasks now support both start dates and due dates, allowing users to better plan and schedule their work.

## Features

### Start Date (Optional)
- Users can optionally specify when they plan to start working on a task
- Helps with planning and scheduling
- Can be left empty if not needed

### Due Date (Required)
- Every task must have a due date
- Helps prioritize tasks and manage deadlines
- Displayed prominently in the task list

## User Interface

### Add Task Form

The form now includes:
1. **Task Title** - Text input for task description
2. **Category** - Dropdown (Work, Personal, Travel, Urgent)
3. **Priority** - Dropdown (Low, Medium, High)
4. **Start Date** - Date picker (optional)
5. **Due Date** - Date picker (required)
6. **Add Button** - Creates the task

### Form Layout

**Desktop View:**
```
┌─────────────────────────────────────────────────────────┐
│ Task Title Input (full width)                          │
├─────────────────────────────────────────────────────────┤
│ [Category ▼] [Priority ▼] [Start Date] [Due Date] [Add]│
└─────────────────────────────────────────────────────────┘
```

**Mobile View:**
```
┌──────────────────────┐
│ Task Title Input     │
├──────────────────────┤
│ [Category ▼]         │
├──────────────────────┤
│ [Priority ▼]         │
├──────────────────────┤
│ Start Date (Optional)│
│ [Date Picker]        │
├──────────────────────┤
│ Due Date *           │
│ [Date Picker]        │
├──────────────────────┤
│ [Add Task Button]    │
└──────────────────────┘
```

### Task List Display

Each task now shows:
- Task title with completion checkbox
- Category badge
- Priority flag
- **Start date** (if set): "Start: YYYY-MM-DD"
- **Due date**: "Due: YYYY-MM-DD"
- Delete button (on hover)

**Example Task Card:**
```
┌─────────────────────────────────────────────────────────┐
│ ○ Review Q4 report                                      │
│   [Work] 🚩 Start: 2026-03-06  Due: 2026-03-10  🗑️     │
└─────────────────────────────────────────────────────────┘
```

## Validation Rules

### 1. Due Date Required
- Users must select a due date before creating a task
- Error message: "Please select a due date"

### 2. Start Date Before Due Date
- If both dates are set, start date must be before or equal to due date
- Error message: "Start date cannot be after due date"

### 3. Date Format
- Dates are stored in ISO format: YYYY-MM-DD
- Displayed in the same format for consistency

## Database Schema

### Updated Table Structure

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  done BOOLEAN DEFAULT false,
  category TEXT NOT NULL,
  priority TEXT NOT NULL,
  start_date DATE,              -- NEW: Optional start date
  due_date DATE NOT NULL,       -- UPDATED: Still required
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

### Migration for Existing Databases

If you already have the tasks table, run this migration:

```sql
-- Add start_date column
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date DATE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS tasks_start_date_idx ON tasks(start_date);
```

See [DATABASE_MIGRATION_ADD_START_DATE.md](./DATABASE_MIGRATION_ADD_START_DATE.md) for details.

## API Changes

### TaskInput Interface

```typescript
export interface TaskInput {
  title: string;
  category: string;
  priority: string;
  start_date?: string | null;  // NEW: Optional start date
  due_date: string;             // Required due date
  done?: boolean;
}
```

### Task Interface

```typescript
export interface Task {
  id: string;
  user_id: string;
  title: string;
  done: boolean;
  category: string;
  priority: string;
  start_date?: string | null;  // NEW: Optional start date
  due_date: string;             // Required due date
  created_at?: string;
  updated_at?: string;
}
```

## User Experience

### Creating a Task

1. User enters task title
2. Selects category and priority
3. (Optional) Selects start date
4. Selects due date (required)
5. Clicks "Add" button
6. Task is created and appears in the list

### Viewing Tasks

- Tasks display both start and due dates
- Start date only shows if it was set
- Due date always shows
- Dates are clearly labeled
- Responsive layout for mobile and desktop

### Date Validation

- Real-time validation prevents invalid date combinations
- Clear error messages guide the user
- Form submission blocked until dates are valid

## Benefits

### For Users

1. **Better Planning**: Know when to start and when to finish
2. **Improved Scheduling**: See task timeline at a glance
3. **Deadline Management**: Clear due dates for all tasks
4. **Flexibility**: Start date is optional for simple tasks

### For Productivity

1. **Time Management**: Plan work based on available time
2. **Prioritization**: See which tasks are due soon
3. **Progress Tracking**: Monitor task timelines
4. **Realistic Planning**: Set achievable start and end dates

## Future Enhancements

### Potential Features

1. **Date Filtering**
   - Filter by due date range
   - Show overdue tasks
   - Show tasks starting soon

2. **Visual Indicators**
   - Color-code overdue tasks (red)
   - Highlight tasks starting today (yellow)
   - Show tasks due soon (orange)

3. **Calendar View**
   - Display tasks on a calendar
   - Drag and drop to reschedule
   - Month/week/day views

4. **Reminders**
   - Notify when start date arrives
   - Alert before due date
   - Customizable reminder times

5. **Duration Calculation**
   - Show task duration (due - start)
   - Estimate time needed
   - Track actual vs. planned time

6. **Recurring Tasks**
   - Set tasks to repeat
   - Automatic date updates
   - Skip or modify occurrences

## Testing Checklist

- [ ] Can create task with only due date
- [ ] Can create task with both start and due dates
- [ ] Cannot create task without due date
- [ ] Cannot set start date after due date
- [ ] Start date displays correctly in task list
- [ ] Due date displays correctly in task list
- [ ] Tasks without start date show only due date
- [ ] Date validation shows appropriate errors
- [ ] Form resets after creating task
- [ ] Dates persist after page refresh
- [ ] Mobile layout displays dates correctly
- [ ] Desktop layout displays dates correctly

## Code Locations

### Files Modified

1. **src/services/tasksService.ts**
   - Updated Task interface
   - Updated TaskInput interface
   - Modified createTask function

2. **src/pages/TasksPage.tsx**
   - Added start_date and due_date state
   - Updated form UI with date inputs
   - Added date validation
   - Updated task display to show dates

3. **DATABASE_SETUP.md**
   - Updated schema with start_date column
   - Added index for start_date

### Files Created

1. **DATABASE_MIGRATION_ADD_START_DATE.md**
   - Migration script for existing databases
   - Rollback instructions

2. **TASK_DATES_FEATURE.md**
   - This documentation file

## Summary

The start and due date feature enhances task management by:

✅ Providing clear deadlines for all tasks  
✅ Allowing optional start date planning  
✅ Validating date logic to prevent errors  
✅ Displaying dates clearly in the task list  
✅ Maintaining responsive design  
✅ Supporting flexible task scheduling  

This feature makes Holiday Tasker more powerful for planning and managing tasks with specific timelines!
