import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Send, Users, Megaphone, AlertTriangle, Info, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const SENT = [
  { id: 1, title: "Scheduled Maintenance",  body: "App will be down on Sunday 2am–4am.", type: "warning", time: "2 hr ago",  recipients: "All Users" },
  { id: 2, title: "New Feature Released",   body: "Calendar integration is now live!",   type: "info",    time: "1 day ago", recipients: "All Users" },
  { id: 3, title: "Task Reminder Update",   body: "Reminder settings have been improved.", type: "success", time: "3 days ago", recipients: "All Users" },
];

const TYPE_STYLES: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  info:    { icon: Info,         color: "text-blue-400",    bg: "bg-blue-400/10" },
  warning: { icon: AlertTriangle,color: "text-yellow-400",  bg: "bg-yellow-400/10" },
  success: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  alert:   { icon: Bell,         color: "text-red-400",     bg: "bg-red-400/10" },
};

export default function AdminNotifications() {
  const { toast } = useToast();
  const [title, setTitle]       = useState("");
  const [body, setBody]         = useState("");
  const [type, setType]         = useState("info");
  const [target, setTarget]     = useState("all");
  const [sent, setSent]         = useState(SENT);

  const handleSend = () => {
    if (!title.trim() || !body.trim()) { toast({ title: "Fill in title and message", variant: "destructive" }); return; }
    setSent(p => [{ id: Date.now(), title, body, type, time: "Just now", recipients: target === "all" ? "All Users" : "Admins" }, ...p]);
    toast({ title: "Announcement sent" });
    setTitle(""); setBody("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading heading-gradient">Notifications</h1>
        <p className="text-sm text-white/50 mt-1">Send announcements and alerts to users</p>
      </div>

      {/* Compose */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-primary" /> New Announcement
        </h3>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message..."
          rows={3}
          className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm px-3 py-2 resize-none focus:outline-none focus:border-primary/50" />
        <div className="flex flex-wrap gap-3 items-center">
          <select value={type} onChange={e => setType(e.target.value)}
            className="rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm px-3 py-2 focus:outline-none">
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="success">Success</option>
            <option value="alert">Alert</option>
          </select>
          <select value={target} onChange={e => setTarget(e.target.value)}
            className="rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm px-3 py-2 focus:outline-none">
            <option value="all">All Users</option>
            <option value="admins">Admins Only</option>
          </select>
          <Button size="sm" onClick={handleSend} className="ml-auto gap-2">
            <Send className="h-4 w-4" /> Send
          </Button>
        </div>
      </motion.div>

      {/* Sent history */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Sent Announcements</h3>
        <div className="space-y-3">
          {sent.map((n, i) => {
            const { icon: Icon, color, bg } = TYPE_STYLES[n.type] || TYPE_STYLES.info;
            return (
              <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-start gap-4 rounded-xl bg-white/5 border border-white/10 px-5 py-4">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-white">{n.title}</p>
                    <span className="text-xs text-white/30">{n.time}</span>
                  </div>
                  <p className="text-xs text-white/50 mt-0.5">{n.body}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Users className="h-3 w-3 text-white/30" />
                    <span className="text-xs text-white/30">{n.recipients}</span>
                  </div>
                </div>
                <button onClick={() => setSent(p => p.filter(x => x.id !== n.id))}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors shrink-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
