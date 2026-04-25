import emailjs from "@emailjs/browser";
import { Task } from "./tasksService";

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Initialise EmailJS with the public key once
emailjs.init(PUBLIC_KEY);

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

async function send(to: string, name: string, subject: string, title: string, content: string) {
  console.log("EmailJS sending to:", to, "| SERVICE:", SERVICE_ID, "| TEMPLATE:", TEMPLATE_ID);
  const response = await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    { to_email: to, to_name: name, subject, title, content }
  );
  console.log("EmailJS response:", response);
  return response;
}

export async function sendTaskReminderEmail(to: string, userName: string, tasks: Task[]) {
  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

  const dueSoon = tasks.filter((t) => {
    if (t.done || !t.due_date) return false;
    const due = new Date(t.due_date); due.setHours(0, 0, 0, 0);
    return due.getTime() === today.getTime() || due.getTime() === tomorrow.getTime();
  });

  if (dueSoon.length === 0) return { skipped: true };

  const content = dueSoon
    .map((t) => `• ${t.title} — ${t.priority} priority, due ${t.due_date}`)
    .join("\n");

  await send(to, userName, "⏰ Task Reminder — Tasks due soon!", "Task Reminder", content);
  return { sent: true, count: dueSoon.length };
}

export async function sendVacationAlertEmail(
  to: string,
  userName: string,
  trips: { name: string; dates: string }[]
) {
  const content = trips.map((t) => `• ${t.name} — ${t.dates}`).join("\n");
  await send(to, userName, "✈️ Vacation Alert — Upcoming trip reminder", "Vacation Alert", content);
  return { sent: true };
}

export async function sendEmailDigest(
  to: string,
  userName: string,
  tasks: Task[],
  trips: { name: string; dates: string }[]
) {
  const pending  = tasks.filter((t) => !t.done);
  const taskText = pending.length
    ? pending.map((t) => `• ${t.title} (due ${t.due_date ?? "no date"})`).join("\n")
    : "No pending tasks.";
  const tripText = trips.length
    ? trips.map((t) => `• ${t.name} — ${t.dates}`).join("\n")
    : "No upcoming trips.";

  const content = `Pending Tasks:\n${taskText}\n\nUpcoming Trips:\n${tripText}`;
  await send(to, userName, "📬 Your Daily Holiday Tasker Digest", "Daily Digest", content);
  return { sent: true };
}

// ── Announcement broadcast ───────────────────────────────────────────────────
export async function sendAnnouncementEmails(
  users: { email: string; username: string | null }[],
  title: string,
  body: string,
  type: string
): Promise<{ sent: number; failed: number }> {
  const typeLabel: Record<string, string> = {
    info:    "📢 Announcement",
    warning: "⚠️ Important Notice",
    success: "✅ Good News",
    alert:   "🚨 Alert",
  };
  const subject = `${typeLabel[type] ?? "📢 Announcement"}: ${title}`;

  let sent = 0;
  let failed = 0;

  // Send sequentially to avoid EmailJS rate limits
  for (const user of users) {
    if (!user.email) continue;
    const name = user.username || user.email.split("@")[0];
    try {
      await send(user.email, name, subject, title, body);
      sent++;
      // Small delay between sends to stay within EmailJS rate limits
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.error(`Failed to send announcement to ${user.email}:`, err);
      failed++;
    }
  }

  return { sent, failed };
}
