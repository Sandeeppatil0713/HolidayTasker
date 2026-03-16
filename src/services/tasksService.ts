import { supabase } from '@/lib/supabase';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  done: boolean;
  category: string;
  priority: string;
  start_date?: string | null;
  due_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface TaskInput {
  title: string;
  category: string;
  priority: string;
  start_date?: string | null;
  due_date: string;
  done?: boolean;
}

// Fetch all tasks for the current user
export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('due_date', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }

  return data || [];
}

// Create a new task
export async function createTask(taskInput: TaskInput): Promise<Task> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert([
      {
        user_id: user.id,
        title: taskInput.title,
        category: taskInput.category,
        priority: taskInput.priority,
        start_date: taskInput.start_date || null,
        due_date: taskInput.due_date,
        done: taskInput.done || false,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    throw error;
  }

  return data;
}

// Update a task
export async function updateTask(id: string, updates: Partial<TaskInput>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }

  return data;
}

// Toggle task completion status
export async function toggleTaskDone(id: string, done: boolean): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ done })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error toggling task:', error);
    throw error;
  }

  return data;
}

// Delete a task
export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}
