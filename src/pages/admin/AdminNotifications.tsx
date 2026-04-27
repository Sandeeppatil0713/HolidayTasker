import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Send, Users, Megaphone, AlertTriangle, Info, CheckCircle2, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { sendAnnouncementEmails } from "@/services/notificationService";

interface Announcement {
  id: string;
  title: string;
  body: string;
  type: string;
  target: string;
  created_at: string;
}

const TYPE_STYLES: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  info:    { icon: Info,          color: "text-blue-400",    bg: "bg-blue-400/10" },
  warning: { icon: AlertTriangle, color: "text-yellow-400",  bg: "bg-yellow-400/10" },
  success: { icon: CheckCircle2,  color: "text-emerald-400", bg: "bg-emerald-400/10" },
  alert:   { icon: Bell,          color: "text-red-400",     bg: "bg-red-400/10" },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

export default function AdminNotifications() {
  const { toast } = useToast();
  const [sent,    setSent]    = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [title,   setTitle]   = useState("");
  const [body,    setBody]    = useState("");
  const [type,    setType]    = useState("info");
  const [target,  setTarget]  = useState("all");

  useEffect(() => {
    supabase.from("announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setSent(data); setLoading(false); });

    const channel = supabase
      .channel("announcements-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "announcements" },
        (payload) => { setSent(prev => [payload.new as Announcement, ...prev]); }
      )
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "announcements" },
        (payload) => { setSent(prev => prev.filter(a => a.id !== payload.old.id)); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast({ title: "Fill in title and message", variant: "destructive" }); return;
    }
    setSending(true);

    // 1. Insert announcement into DB (shows in notification bell for all users)
    const { error } = await supabase.from("announcements").insert([{ title, body, type, target }]);
    if (error) {
      setSending(false);
      toast({ title: "Failed to send announcement", variant: "destructive" });
      return;
    }

    // 2. Fetch user emails — filter by target (all users vs admins only)
    try {
      let query = supabase.from("profiles").select("email, username, role");
      if (target === "admins") {
        query = query.eq("role", "admin");
      }
      const { data: profiles, error: profilesError } = await query;

      if (profilesError || !profiles || profiles.length === 0) {
        toast({
          title: "Announcement sent",
          description: `Saved to DB, but no ${target === "admins" ? "admin" : ""} users found to email.`,
        });
        setSending(false);
        setTitle(""); setBody("");
        return;
      }

      // 3. Send emails via EmailJS
      const { sent, failed } = await sendAnnouncementEmails(profiles, title, body, type);

      toast({
        title: "Announcement sent",
        description: `Notification saved · ${sent} email${sent !== 1 ? "s" : ""} dispatched${failed > 0 ? ` · ${failed} failed` : ""}.`,
      });
    } catch (emailErr) {
      console.error("Email dispatch error:", emailErr);
      toast({
        title: "Announcement sent",
        description: "Saved to notification centre, but email dispatch failed.",
        variant: "destructive",
      });
    }

    setSending(false);
    setTitle("");
    setBody("");
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
      return;
    }
    // Update local state immediately — don't rely solely on realtime
    setSent(prev => prev.filter(a => a.id !== id));
    toast({ title: "Announcement deleted" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading heading-gradient">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">Send announcements and alerts to users · realtime</p>
      </div>

      {/* Compose */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-muted/40 border border-border p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-primary" /> New Announcement
        </h3>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title"
          className="bg-muted/40 border-border text-white placeholder:text-muted-foreground/60" />
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message..."
          rows={3}
          className="w-full rounded-lg bg-muted/40 border border-border text-white placeholder:text-muted-foreground/60 text-sm px-3 py-2 resize-none focus:outline-none focus:border-primary/50" />
        <div className="flex flex-wrap gap-3 items-center">
          <select value={type} onChange={e => setType(e.target.value)}
            className="rounded-lg bg-muted/40 border border-border text-foreground/70 text-sm px-3 py-2 focus:outline-none">
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="success">Success</option>
            <option value="alert">Alert</option>
          </select>
          <select value={target} onChange={e => setTarget(e.target.value)}
            className="rounded-lg bg-muted/40 border border-border text-foreground/70 text-sm px-3 py-2 focus:outline-none">
            <option value="all">All Users</option>
            <option value="admins">Admins Only</option>
          </select>
          <Button size="sm" onClick={handleSend} disabled={sending || !title || !body} className="ml-auto gap-2">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? "Sending emails..." : "Send & Email All"}
          </Button>
        </div>
      </motion.div>

      {/* Sent history */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          Sent Announcements
          <span className="text-xs text-muted-foreground/60 font-normal">({sent.length})</span>
          <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : sent.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground/60 text-sm">No announcements yet</div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {sent.map((n, i) => {
                const { icon: Icon, color, bg } = TYPE_STYLES[n.type] || TYPE_STYLES.info;
                return (
                  <motion.div key={n.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }} transition={{ delay: i * 0.03 }}
                    className="flex items-start gap-4 rounded-xl bg-muted/40 border border-border px-5 py-4">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-white">{n.title}</p>
                        <span className="text-xs text-muted-foreground/60">{timeAgo(n.created_at)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Users className="h-3 w-3 text-muted-foreground/60" />
                        <span className="text-xs text-muted-foreground/60 capitalize">{n.target === "all" ? "All Users" : "Admins Only"}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(n.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-muted-foreground/60 hover:text-red-400 transition-colors shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
