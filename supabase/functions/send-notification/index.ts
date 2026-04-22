import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_EMAIL = "Holiday Tasker <notifications@holidaytasker.app>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  type: "task_reminder" | "vacation_alert" | "email_digest";
  to: string;
  userName: string;
  data?: Record<string, any>;
}

function taskReminderHtml(userName: string, data: Record<string, any>) {
  const tasks: any[] = data.tasks ?? [];
  const rows = tasks
    .map(
      (t) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#111827;">${t.title}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;">${t.category}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;">
          <span style="background:${t.priority === "High" ? "#fee2e2" : t.priority === "Medium" ? "#fef9c3" : "#dcfce7"};
            color:${t.priority === "High" ? "#dc2626" : t.priority === "Medium" ? "#ca8a04" : "#16a34a"};
            padding:2px 8px;border-radius:9999px;font-size:12px;font-weight:600;">${t.priority}</span>
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;">${t.due_date ?? "—"}</td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">✅ Task Reminders</h1>
      <p style="margin:8px 0 0;color:#e0e7ff;font-size:14px;">Hey ${userName}, you have tasks due soon!</p>
    </div>
    <div style="padding:32px 40px;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;">Task</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;">Category</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;">Priority</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;">Due</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;">Stay on top of your tasks — you've got this! 🚀</p>
    </div>
    <div style="padding:16px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">Holiday Tasker · You're receiving this because task reminders are enabled.</p>
    </div>
  </div>
</body>
</html>`;
}

function vacationAlertHtml(userName: string, data: Record<string, any>) {
  const trips: any[] = data.trips ?? [];
  const cards = trips
    .map(
      (t) => `
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:24px;">✈️</span>
          <div>
            <p style="margin:0;font-size:15px;font-weight:600;color:#111827;">${t.name}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">📅 ${t.dates}</p>
          </div>
        </div>
      </div>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#0ea5e9,#6366f1);padding:32px 40px;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">🌴 Vacation Alert</h1>
      <p style="margin:8px 0 0;color:#e0f2fe;font-size:14px;">Hey ${userName}, your upcoming trips are coming up!</p>
    </div>
    <div style="padding:32px 40px;">
      ${cards || '<p style="color:#6b7280;font-size:14px;">No upcoming trips found.</p>'}
      <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;">Pack your bags and get ready for an adventure! 🗺️</p>
    </div>
    <div style="padding:16px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">Holiday Tasker · You're receiving this because vacation alerts are enabled.</p>
    </div>
  </div>
</body>
</html>`;
}

function emailDigestHtml(userName: string, data: Record<string, any>) {
  const tasks: any[] = data.tasks ?? [];
  const trips: any[] = data.trips ?? [];

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:32px 40px;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">📬 Your Daily Digest</h1>
      <p style="margin:8px 0 0;color:#fef3c7;font-size:14px;">Hey ${userName}, here's your summary for today!</p>
    </div>
    <div style="padding:32px 40px;">
      <h2 style="font-size:16px;font-weight:600;color:#111827;margin:0 0 12px;">✅ Pending Tasks (${tasks.length})</h2>
      ${tasks.length
        ? tasks.map((t) => `<p style="margin:0 0 6px;font-size:14px;color:#374151;">• ${t.title} <span style="color:#9ca3af;">(${t.due_date ?? "no due date"})</span></p>`).join("")
        : '<p style="font-size:14px;color:#9ca3af;">All caught up! No pending tasks.</p>'
      }
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
      <h2 style="font-size:16px;font-weight:600;color:#111827;margin:0 0 12px;">✈️ Upcoming Trips (${trips.length})</h2>
      ${trips.length
        ? trips.map((t) => `<p style="margin:0 0 6px;font-size:14px;color:#374151;">• ${t.name} — ${t.dates}</p>`).join("")
        : '<p style="font-size:14px;color:#9ca3af;">No upcoming trips planned.</p>'
      }
    </div>
    <div style="padding:16px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">Holiday Tasker · You're receiving this because email notifications are enabled.</p>
    </div>
  </div>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();
    const { type, to, userName, data = {} } = payload;

    let subject = "";
    let html = "";

    if (type === "task_reminder") {
      subject = `⏰ Task Reminder — ${data.tasks?.length ?? 0} task(s) due soon`;
      html = taskReminderHtml(userName, data);
    } else if (type === "vacation_alert") {
      subject = `✈️ Vacation Alert — Upcoming trip reminder`;
      html = vacationAlertHtml(userName, data);
    } else if (type === "email_digest") {
      subject = `📬 Your Daily Holiday Tasker Digest`;
      html = emailDigestHtml(userName, data);
    } else {
      return new Response(JSON.stringify({ error: "Unknown notification type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("Resend error:", result);
      return new Response(JSON.stringify({ error: result }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
