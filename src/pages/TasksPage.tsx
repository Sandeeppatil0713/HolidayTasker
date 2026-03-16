import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckCircle2, Circle, Trash2, Flag, Loader2, PartyPopper, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { fetchTasks, createTask, toggleTaskDone, deleteTask, Task } from "@/services/tasksService";

interface Task {
  id: string;
  title: string;
  done: boolean;
  category: string;
  priority: string;
  start_date?: string | null;
  due_date: string;
}

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Work");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newStartDate, setNewStartDate] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [filter, setFilter] = useState("All");
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [completedTaskTitle, setCompletedTaskTitle] = useState("");
  const { toast } = useToast();

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await fetchTasks();
      setTasks(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const completedCount = tasks.filter((t) => t.done).length;
  const progress = tasks.length ? (completedCount / tasks.length) * 100 : 0;

  const filteredTasks = filter === "All" ? tasks : tasks.filter((t) => t.category === filter);

  const addTask = async () => {
    if (!newTitle.trim()) return;
    
    // Validate dates
    if (!newDueDate) {
      toast({
        title: "Error",
        description: "Please select a due date",
        variant: "destructive",
      });
      return;
    }

    if (newStartDate && newDueDate && new Date(newStartDate) > new Date(newDueDate)) {
      toast({
        title: "Error",
        description: "Start date cannot be after due date",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const newTask = await createTask({
        title: newTitle,
        category: newCategory,
        priority: newPriority,
        start_date: newStartDate || null,
        due_date: newDueDate,
      });
      
      setTasks((prev) => [...prev, newTask]);
      setNewTitle("");
      setNewStartDate("");
      setNewDueDate("");
      
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    try {
      const updatedTask = await toggleTaskDone(id, !task.done);
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
      
      // Show completion dialog when task is marked as done
      if (!task.done) {
        setCompletedTaskTitle(task.title);
        setShowCompletionDialog(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1920&q=80" 
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-3xl" />
      </div>

      <div className="relative z-10">
        <h1 className="text-2xl font-bold font-heading text-foreground">My Tasks</h1>
        <p className="text-sm text-muted-foreground">{completedCount} of {tasks.length} tasks completed</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 relative z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="rounded-xl bg-card/95 backdrop-blur-sm p-5 shadow-card border border-border/50 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Daily Progress</span>
              <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Add task */}
          <div className="rounded-xl bg-card p-5 shadow-card border border-border/50">
            <div className="flex flex-col gap-3">
              <Input 
                placeholder="Add a new task..." 
                value={newTitle} 
                onChange={(e) => setNewTitle(e.target.value)} 
                onKeyDown={(e) => e.key === "Enter" && addTask()} 
                className="w-full" 
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger className="w-full sm:w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Work", "Personal", "Travel", "Urgent"].map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Select value={newPriority} onValueChange={setNewPriority}>
                  <SelectTrigger className="w-full sm:w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Low", "Medium", "High"].map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                  </SelectContent>
                </Select>
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Start Date (Optional)</label>
                    <Input 
                      type="date" 
                      value={newStartDate} 
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Due Date *</label>
                    <Input 
                      type="date" 
                      value={newDueDate} 
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                </div>
                <Button onClick={addTask} className="w-full sm:w-auto"><Plus className="h-4 w-4 mr-1" /> Add</Button>
              </div>
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
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No tasks yet. Add your first task above!</p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredTasks.map((task) => (
                  <motion.div key={task.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }}
                    className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-card border border-border/50 group transition-all ${task.done ? "opacity-60" : ""}`}>
                    <div className="flex items-center gap-3 flex-1 w-full">
                      <button onClick={() => toggleTask(task.id)}>
                        {task.done ? <CheckCircle2 className="h-5 w-5 text-secondary" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                      </button>
                      <span className={`flex-1 text-sm font-medium ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.title}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap ml-8 sm:ml-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[task.category]}`}>{task.category}</span>
                      <Flag className={`h-3.5 w-3.5 ${priorityColors[task.priority]}`} />
                      <div className="flex flex-col text-xs text-muted-foreground">
                        {task.start_date && (
                          <span className="whitespace-nowrap">Start: {task.start_date}</span>
                        )}
                        <span className="whitespace-nowrap">Due: {task.due_date}</span>
                      </div>
                      <button onClick={() => handleDeleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </>
      )}

      {/* Task Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="relative"
              >
                <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-secondary" />
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="w-6 h-6 text-accent" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="absolute -bottom-2 -left-2"
                >
                  <PartyPopper className="w-6 h-6 text-primary" />
                </motion.div>
              </motion.div>
            </div>
            <DialogTitle className="text-center text-2xl">Task Completed!</DialogTitle>
            <DialogDescription className="text-center pt-2">
              <span className="text-base">Great job! You've completed:</span>
              <p className="font-semibold text-foreground mt-2 text-lg">"{completedTaskTitle}"</p>
              <p className="text-sm text-muted-foreground mt-4">
                Keep up the amazing work! 🎉
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button onClick={() => setShowCompletionDialog(false)} className="px-8">
              Awesome!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TasksPage;
