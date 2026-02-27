import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckCircle2, Circle, Trash2, Flag, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface Task {
  id: string;
  title: string;
  done: boolean;
  category: string;
  priority: string;
  dueDate: string;
}

const initialTasks: Task[] = [
  { id: "1", title: "Review Q4 report", done: false, category: "Work", priority: "High", dueDate: "2026-02-28" },
  { id: "2", title: "Book Bali accommodation", done: false, category: "Travel", priority: "Medium", dueDate: "2026-03-01" },
  { id: "3", title: "Morning jog", done: true, category: "Personal", priority: "Low", dueDate: "2026-02-27" },
  { id: "4", title: "Submit project proposal", done: false, category: "Work", priority: "High", dueDate: "2026-02-28" },
  { id: "5", title: "Pack for weekend trip", done: true, category: "Travel", priority: "Medium", dueDate: "2026-02-27" },
  { id: "6", title: "Call dentist", done: false, category: "Personal", priority: "Low", dueDate: "2026-03-05" },
];

const categoryColors: Record<string, string> = {
  Work: "bg-primary/10 text-primary",
  Personal: "bg-secondary/10 text-secondary",
  Travel: "bg-accent/10 text-accent",
  Urgent: "bg-destructive/10 text-destructive",
};

const priorityColors: Record<string, string> = {
  High: "text-destructive",
  Medium: "text-accent",
  Low: "text-secondary",
};

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Work");
  const [newPriority, setNewPriority] = useState("Medium");
  const [filter, setFilter] = useState("All");

  const completedCount = tasks.filter((t) => t.done).length;
  const progress = tasks.length ? (completedCount / tasks.length) * 100 : 0;

  const filteredTasks = filter === "All" ? tasks : tasks.filter((t) => t.category === filter);

  const addTask = () => {
    if (!newTitle.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now().toString(), title: newTitle, done: false, category: newCategory, priority: newPriority, dueDate: new Date().toISOString().split("T")[0] },
    ]);
    setNewTitle("");
  };

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">My Tasks</h1>
        <p className="text-sm text-muted-foreground">{completedCount} of {tasks.length} tasks completed</p>
      </div>

      {/* Progress */}
      <div className="rounded-xl bg-card p-5 shadow-card border border-border/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Daily Progress</span>
          <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Add task */}
      <div className="rounded-xl bg-card p-5 shadow-card border border-border/50">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input placeholder="Add a new task..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} className="flex-1" />
          <Select value={newCategory} onValueChange={setNewCategory}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Work", "Personal", "Travel", "Urgent"].map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={newPriority} onValueChange={setNewPriority}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Low", "Medium", "High"].map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
            </SelectContent>
          </Select>
          <Button onClick={addTask}><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["All", "Work", "Personal", "Travel", "Urgent"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-2">
        <AnimatePresence>
          {filteredTasks.map((task) => (
            <motion.div key={task.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }}
              className={`flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-card border border-border/50 group transition-all ${task.done ? "opacity-60" : ""}`}>
              <button onClick={() => toggleTask(task.id)}>
                {task.done ? <CheckCircle2 className="h-5 w-5 text-secondary" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
              </button>
              <span className={`flex-1 text-sm font-medium ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[task.category]}`}>{task.category}</span>
              <Flag className={`h-3.5 w-3.5 ${priorityColors[task.priority]}`} />
              <span className="text-xs text-muted-foreground hidden sm:inline">{task.dueDate}</span>
              <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TasksPage;
