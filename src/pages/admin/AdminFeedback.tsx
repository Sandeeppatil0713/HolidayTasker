import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Star, CheckCircle2, Clock, AlertCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FEEDBACK = [
  { id: 1, user: "Alice Johnson",  email: "alice@example.com",  type: "bug",        rating: 2, message: "Calendar events don't save properly on mobile.", status: "open",     time: "1 hr ago" },
  { id: 2, user: "Bob Smith",      email: "bob@example.com",    type: "suggestion",  rating: 5, message: "Love the app! Would be great to have recurring tasks.", status: "resolved", time: "3 hr ago" },
  { id: 3, user: "Carol White",    email: "carol@example.com",  type: "complaint",   rating: 3, message: "Notifications are too frequent, need more control.", status: "open",     time: "1 day ago" },
  { id: 4, user: "David Lee",      email: "david@example.com",  type: "suggestion",  rating: 4, message: "Dark mode looks amazing! Can we get more themes?", status: "resolved", time: "2 days ago" },
  { id: 5, user: "Eva Martinez",   email: "eva@example.com",    type: "bug",         rating: 1, message: "App crashes when adding tasks with long titles.", status: "open",     time: "3 days ago" },
];

const TYPE_STYLES: Record<string, string> = {
  bug:        "bg-red-400/10 text-red-400",
  suggestion: "bg-blue-400/10 text-blue-400",
  complaint:  "bg-yellow-400/10 text-yellow-400",
};

export default function AdminFeedback() {
  const [query, setQuery]     = useState("");
  const [filter, setFilter]   = useState("all");
  const [items, setItems]     = useState(FEEDBACK);

  const filtered = items.filter(f => {
    const matchQ = f.user.toLowerCase().includes(query.toLowerCase()) || f.message.toLowerCase().includes(query.toLowerCase());
    const matchF = filter === "all" || f.status === filter || f.type === filter;
    return matchQ && matchF;
  });

  const resolve = (id: number) => setItems(p => p.map(f => f.id === id ? { ...f, status: "resolved" } : f));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading heading-gradient">Feedback & Support</h1>
        <p className="text-sm text-muted-foreground mt-1">{items.filter(f => f.status === "open").length} open tickets</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search feedback..."
            className="pl-10 bg-muted/40 border-border text-white placeholder:text-muted-foreground/60" />
        </div>
        <div className="flex gap-2">
          {["all","open","resolved","bug","suggestion","complaint"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize transition-all
                ${filter === f ? "bg-primary text-white" : "bg-muted/40 text-muted-foreground hover:bg-muted"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback list */}
      <div className="space-y-3">
        {filtered.map((f, i) => (
          <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-muted/40 border border-border p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{f.user.split(" ").map(w => w[0]).join("")}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{f.user}</p>
                  <p className="text-xs text-muted-foreground">{f.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${TYPE_STYLES[f.type]}`}>{f.type}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium
                  ${f.status === "open" ? "bg-yellow-400/10 text-yellow-400" : "bg-emerald-400/10 text-emerald-400"}`}>
                  {f.status}
                </span>
                <span className="text-xs text-muted-foreground/60">{f.time}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{f.message}</p>
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`h-3.5 w-3.5 ${s <= f.rating ? "fill-yellow-400 text-yellow-400" : "text-white/20"}`} />
                ))}
              </div>
              {f.status === "open" && (
                <Button size="sm" variant="outline" onClick={() => resolve(f.id)}
                  className="text-xs border-border text-muted-foreground hover:text-white hover:bg-muted">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark Resolved
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

