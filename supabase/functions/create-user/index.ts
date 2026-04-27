import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL          = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, password, username, role } = await req.json();

    if (!email || !password || !username) {
      return new Response(
        JSON.stringify({ error: "email, password and username are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role client — this creates the user without affecting the caller's session
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
    });

    // Create the auth user with email auto-confirmed
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,   // auto-confirm so user can log in immediately
      user_metadata: { username, role: role ?? "user" },
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upsert profile row (trigger may already do this, but belt-and-suspenders)
    if (data.user) {
      await admin.from("profiles").upsert({
        id:         data.user.id,
        email:      email,
        username:   username,
        role:       role ?? "user",
        created_at: new Date().toISOString(),
      }, { onConflict: "id" });
    }

    return new Response(
      JSON.stringify({ success: true, userId: data.user?.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("create-user error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
