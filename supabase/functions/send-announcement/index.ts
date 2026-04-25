import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY    = Deno.env.get("RESEND_API_KEY") ?? "";
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const FROM_EMAIL        = "Holiday Tasker <notifications@holidaytasker.app>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnnouncementPayload {
  title: string;
  body: string;
  type: "info" | "warning" | "success" | "alert";
  target: "all" | "admins";
}

// ── Type → visual config ─────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { emoji: string; gradient: string; subColor: string }> = {
  info:    { emoji: "📢", gradient: "linear-gradient(135deg,#6366f1,#8b5cf6)", subColor: "#e0e7ff" },
  warning: { emoji: "⚠️", gradient: "linear-gradient(135deg,#f59e0b,#ef4444)", subColor: "#fef3c7" },
  success: { emoji: "✅", gradient: "linear-gradient(135deg,#10b981,#059669)", subColor: "#d1fae5" },
  alert:   { emoji: "🚨", gradient: "linear-gradient(135deg,#ef4444,#dc2626)", subColor: "#fee2e2" },
};

function buildAnnouncementHtml(userName: string, title: string, body: string, type: string): string {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.info;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:${cfg.gradient};padding:32px 40px;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">${cfg.emoji} ${title}</h1>
      <p style="margin:8px 0 0;color:${cfg.subColor};font-size:14px;">Hey ${userName}, you have a new announcement!</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 40px;">
      <p style="margin:0;font-size:15px;line-height:1.7;color:#374151;">${body.replace(/\n/g, "<br/>")}</p>
      <p style="margin:28px 0 0;font-size:13px;color:#9ca3af;">
        Log in to Holiday Tasker to view this and other announcements in your notification centre.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:16px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">
        Holiday Tasker &middot; You're receiving this because you have an active account.
      </p>
    </div>
  </div>
</body>
</html>`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: AnnouncementPayload = await req.json();
    const { title, body, type, target } = payload;

    if (!title || !body) {
      return new Response(JSON.stringify({ error: "title and body are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Fetch user emails via service-role client ────────────────────────────
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
    });

    // Get all users from auth.users (requires service role key)
    const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers({
      perPage: 1000,
    });

    if (usersError) {
      console.error("Failed to fetch users:", usersError);
      return new Response(JSON.stringify({ error: "Failed to fetch users" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const users = usersData?.users ?? [];

    if (users.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, message: "No users found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Send emails ──────────────────────────────────────────────────────────
    const typeLabel: Record<string, string> = {
      info:    "📢 Announcement",
      warning: "⚠️ Important Notice",
      success: "✅ Good News",
      alert:   "🚨 Alert",
    };
    const subject = `${typeLabel[type] ?? "📢 Announcement"}: ${title}`;

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    // Send in batches of 10 to avoid rate limits
    const BATCH_SIZE = 10;
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (user) => {
          const email = user.email;
          if (!email) return;

          const userName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            email.split("@")[0];

          const html = buildAnnouncementHtml(userName, title, body, type);

          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ from: FROM_EMAIL, to: email, subject, html }),
          });

          if (res.ok) {
            sent++;
          } else {
            const err = await res.json();
            console.error(`Failed to send to ${email}:`, err);
            errors.push(`${email}: ${err?.message ?? "unknown error"}`);
            failed++;
          }
        })
      );

      // Small delay between batches to be kind to the API
      if (i + BATCH_SIZE < users.length) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    console.log(`Announcement emails: ${sent} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({ success: true, sent, failed, errors: errors.slice(0, 10) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-announcement error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
