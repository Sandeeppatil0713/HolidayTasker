import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Flag, Sparkles, PartyPopper, Edit3, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { tasksService, type Task } from "@/services/tasksService";

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
  const { user } = useAuth();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Work");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newStartDate, setNewStartDate] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [filter, setFilter] = useState("All");
  const [completedTask, setCompletedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  useEffect(() => {
    if (!user) return;
    tasksService.fetchTasks(user.id)
      .then(setTasks)
      .catch(() => toast({ title: "Error", description: "Failed to load tasks", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [user]);

  const completedCount = tasks.filter((t) => t.done).length;
  const progress = tasks.length ? (completedCount / tasks.length) * 100 : 0;
  const filteredTasks = filter === "All" ? tasks : tasks.filter((t) => t.category === filter);

  const addTask = async () => {
    if (!newTitle.trim() || !user) return;
    try {
      const task = await tasksService.createTask(user.id, {
        title: newTitle,
        category: newCategory,
        priority: newPriority,
        start_date: newStartDate || null,
        due_date: newDueDate || null,
      });
      setTasks((prev) => [task, ...prev]);
      setNewTitle("");
      setNewStartDate("");
      setNewDueDate("");
      toast({ title: "Task added" });
    } catch {
      toast({ title: "Error", description: "Failed to add task", variant: "destructive" });
    }
  };

  const toggleTask = async (task: Task) => {
    const newDone = !task.done;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: newDone } : t)));
    try {
      await tasksService.toggleTask(task.id, newDone);
      if (newDone) setCompletedTask(task);
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: task.done } : t)));
      toast({ title: "Error", description: "Failed to update task", variant: "destructive" });
    }
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await tasksService.deleteTask(id);
    } catch {
      toast({ title: "Error", description: "Failed to delete task", variant: "destructive" });
    }
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditCategory(task.category);
    setEditPriority(task.priority);
    setEditStartDate(task.start_date || "");
    setEditDueDate(task.due_date || "");
  };

  const saveEdit = async () => {
    if (!editingTask || !editTitle.trim()) return;
    const updates = {
      title: editTitle,
      category: editCategory,
      priority: editPriority,
      start_date: editStartDate || null,
      due_date: editDueDate || null,
    };
    setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...updates } : t));
    setEditingTask(null);
    try {
      await tasksService.updateTask(editingTask.id, updates);
      toast({ title: "Task updated" });
    } catch {
      toast({ title: "Error", description: "Failed to update task", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading heading-gradient">My Tasks</h1>
        <p className="text-sm text-muted-foreground">{completedCount} of {tasks.length} tasks completed</p>
      </div>

      {/* Progress */}
      <div className="rounded-xl card-glass p-5 ">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Daily Progress</span>
          <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Add task */}
      <div className="rounded-xl card-glass p-5  space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Add a new task..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            className="flex-1"
          />
          <Select value={newCategory} onValueChange={setNewCategory}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Work", "Personal", "Travel", "Urgent"].map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={newPriority} onValueChange={setNewPriority}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Low", "Medium", "High"].map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 space-y-1">
            <label className="text-xs text-muted-foreground">Start Date</label>
            <Input type="date" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs text-muted-foreground">Due Date</label>
            <Input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
          </div>
          <Button onClick={addTask} className="shrink-0"><Plus className="h-4 w-4 mr-1" /> Add Task</Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["All", "Work", "Personal", "Travel", "Urgent"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Task list */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No tasks yet. Add one above!</div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filteredTasks.map((task) => (
              <motion.div key={task.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }}
                className={`flex items-center gap-3 rounded-xl card-glass px-4 py-3  group transition-all ${task.done ? "opacity-60" : ""}`}>
                <label className="checkbox-container">
                  <div className="checkbox">
                    <input type="checkbox" checked={task.done} onChange={() => toggleTask(task)} />
                  </div>
                </label>
                <span className={`flex-1 text-sm font-medium ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {task.title}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[task.category] || "bg-muted text-muted-foreground"}`}>
                  {task.category}
                </span>
                <Flag className={`h-3.5 w-3.5 shrink-0 ${priorityColors[task.priority] || "text-muted-foreground"}`} />
                <div className="hidden sm:flex flex-col text-right">
                  {task.start_date && <span className="text-xs text-muted-foreground">Start: {task.start_date}</span>}
                  {task.due_date && <span className="text-xs text-muted-foreground">Due: {task.due_date}</span>}
                </div>
                <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>
                <button onClick={() => openEdit(task)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit3 className="h-4 w-4 text-muted-foreground hover:text-primary" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="max-w-md border-primary/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold font-heading text-foreground">Edit Task</h3>
          </div>
          <div className="space-y-3">
            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Task title" />
            <div className="flex gap-3">
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Work","Personal","Travel","Urgent"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={editPriority} onValueChange={setEditPriority}>
                <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Low","Medium","High"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground">Start Date</label>
                <Input type="date" value={editStartDate} onChange={e => setEditStartDate(e.target.value)} />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground">Due Date</label>
                <Input type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setEditingTask(null)} className="flex-1">
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button onClick={saveEdit} className="flex-1">
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Completion Pop-up */}
      <Dialog open={!!completedTask} onOpenChange={() => setCompletedTask(null)}>
        <DialogContent className="max-w-sm text-center border-primary/30">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex flex-col items-center gap-4 py-4"
          >
            <div className="flex items-center gap-2 text-3xl">
              <PartyPopper className="h-8 w-8 text-accent" />
              <Sparkles className="h-8 w-8 text-primary" />
              <PartyPopper className="h-8 w-8 text-secondary" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
              className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <svg className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <motion.path
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                />
              </svg>
            </motion.div>
            <div>
              <h3 className="text-lg font-bold font-heading text-foreground">Task Complete!</h3>
              <p className="text-sm text-muted-foreground mt-1">"{completedTask?.title}"</p>
            </div>
            <Button onClick={() => setCompletedTask(null)} className="mt-2 w-full">Awesome!</Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TasksPage;


