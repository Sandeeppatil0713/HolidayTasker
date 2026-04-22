import { supabase } from '@/lib/supabase';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  done: boolean;
  category: string;
  priority: string;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

export type NewTask = Omit<Task, 'id' | 'user_id' | 'created_at' | 'completed_at'>;

export const tasksService = {
  async fetchTasks(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createTask(userId: string, task: Omit<NewTask, 'done'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...task, user_id: userId, done: false }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async toggleTask(id: string, done: boolean): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({ done, completed_at: done ? new Date().toISOString() : null })
      .eq('id', id);
    if (error) throw error;
  },

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async updateTask(id: string, updates: Partial<Pick<Task, 'title' | 'category' | 'priority' | 'start_date' | 'due_date'>>): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  },

  async clearAllTasks(userId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', userId);
    if (error) throw error;
  },
};
