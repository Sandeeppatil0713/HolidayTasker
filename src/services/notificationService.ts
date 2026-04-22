import { supabase } from "@/lib/supabase";
import { Task } from "./tasksService";

export type NotifPrefs = {
  allNotif: boolean;
  taskReminder: boolean;
  vacationNotif: boolean;
  emailNotif: boolean;
};

const PREFS_KEY = "notifPrefs";

export function loadNotifPrefs(): NotifPrefs {
  try {
    const saved = localStorage.getItem(PREFS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { allNotif: true, taskReminder: true, vacationNotif: true, emailNotif: true };
}

export function saveNotifPrefs(prefs: NotifPrefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

async function invokeNotification(type: string, to: string, userName: string, data: Record<string, any>) {
  const { error } = await supabase.functions.invoke("send-notification", {
    body: { type, to, userName, data },
  });
  if (error) throw error;
}

/** Send task reminder email for tasks due today or tomorrow */
export async function sendTaskReminderEmail(
  to: string,
  userName: string,
  tasks: Task[]
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dueSoon = tasks.filter((t) => {
    if (t.done || !t.due_date) return false;
    const due = new Date(t.due_date);
    due.setHours(0, 0, 0, 0);
    return due.getTime() === today.getTime() || due.getTime() === tomorrow.getTime();
  });

  if (dueSoon.length === 0) return { skipped: true, reason: "No tasks due today or tomorrow" };

  await invokeNotification("task_reminder", to, userName, { tasks: dueSoon });
  return { sent: true, count: dueSoon.length };
}

/** Send vacation alert email */
export async function sendVacationAlertEmail(
  to: string,
  userName: string,
  trips: { name: string; dates: string }[]
) {
  await invokeNotification("vacation_alert", to, userName, { trips });
  return { sent: true };
}

/** Send full email digest */
export async function sendEmailDigest(
  to: string,
  userName: string,
  tasks: Task[],
  trips: { name: string; dates: string }[]
) {
  const pending = tasks.filter((t) => !t.done);
  await invokeNotification("email_digest", to, userName, { tasks: pending, trips });
  return { sent: true };
}
