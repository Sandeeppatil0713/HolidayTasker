import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, CheckSquare, Plane, FileText, Calendar, DollarSign, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const allItems = [
  { type: "task", title: "Review Q4 report", category: "Work", priority: "High", date: "2026-02-28", icon: CheckSquare },
  { type: "task", title: "Book Bali accommodation", category: "Travel", priority: "Medium", date: "2026-03-01", icon: CheckSquare },
  { type: "task", title: "Morning jog", category: "Personal", priority: "Low", date: "2026-02-27", icon: CheckSquare },
  { type: "trip", title: "Bali Adventure", category: "Travel", priority: "—", date: "Dec 15–22", icon: Plane },
  { type: "trip", title: "Kyoto Cherry Blossom", category: "Travel", priority: "—", date: "Mar 20–28", icon: Plane },
  { type: "note", title: "Packing list for Bali", category: "Travel", priority: "—", date: "2026-02-25", icon: FileText },
  { type: "task", title: "Team standup", category: "Work", priority: "High", date: "2026-02-27", icon: CheckSquare },
  { type: "task", title: "Submit tax documents", category: "Personal", priority: "High", date: "2026-04-15", icon: CheckSquare },
];

const typeColors: Record<string, string> = {
  task: "bg-primary/10 text-primary",
  trip: "bg-orange-100 text-orange-500",
  note: "bg-secondary/10 text-secondary",
};

const SmartSearchPage = () => {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const results = allItems.filter((item) => {
    const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesQuery && matchesType && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading heading-gradient">Smart Search</h1>
        <p className="text-sm text-muted-foreground">Find anything — tasks, trips, notes — instantly</p>
      </div>

      {/* Search bar */}
      <div className="rounded-xl card-glass p-5 ">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tasks, trips, notes..." value={query} onChange={(e) => setQuery(e.target.value)}
            className="pl-10 text-base" />
        </div>
        <div className="flex gap-3 mt-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="task">Tasks</SelectItem>
              <SelectItem value="trip">Trips</SelectItem>
              <SelectItem value="note">Notes</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Work">Work</SelectItem>
              <SelectItem value="Personal">Personal</SelectItem>
              <SelectItem value="Travel">Travel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">{results.length} results found</p>
        {results.map((item, i) => (
          <motion.div key={`${item.title}-${i}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="flex items-center gap-3 rounded-xl card-glass px-4 py-3  hover:shadow-card-hover transition-all cursor-pointer">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${typeColors[item.type]}`}>
              <item.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{item.title}</div>
              <div className="text-xs text-muted-foreground">{item.category} • {item.date}</div>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${typeColors[item.type]}`}>{item.type}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SmartSearchPage;


