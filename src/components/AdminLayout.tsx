import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
<<<<<<< HEAD
  LayoutDashboard, Users, BarChart3, Bell, MessageSquare,
  Settings, User, LogOut, Shield, Plane,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { title: "Dashboard",    url: "/admin",              icon: LayoutDashboard },
  { title: "Users",        url: "/admin/users",         icon: Users },
  { title: "Analytics",    url: "/admin/analytics",     icon: BarChart3 },
  { title: "Notifications",url: "/admin/notifications", icon: Bell },
  { title: "Feedback",     url: "/admin/feedback",      icon: MessageSquare },
  { title: "Settings",     url: "/admin/settings",      icon: Settings },
  { title: "Profile",      url: "/admin/profile",       icon: User },
=======
  LayoutDashboard, Users, BarChart3, Bell,
  Settings, User, LogOut, Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { title: "Dashboard",     url: "/admin",              icon: LayoutDashboard },
  { title: "Users",         url: "/admin/users",         icon: Users },
  { title: "Analytics",     url: "/admin/analytics",     icon: BarChart3 },
  { title: "Notifications", url: "/admin/notifications", icon: Bell },
  { title: "Settings",      url: "/admin/settings",      icon: Settings },
  { title: "Profile",       url: "/admin/profile",       icon: User },
>>>>>>> main
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out" });
    navigate("/");
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen flex bg-[#0f1117]">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col border-r border-white/10 bg-[#0f1117]">
        {/* Brand */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold font-heading text-white">Admin Panel</p>
            <p className="text-[10px] text-white/40">Holiday Tasker</p>
=======
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col border-r border-border bg-card">
        {/* Brand */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold font-heading text-foreground">Admin Panel</p>
            <p className="text-[10px] text-muted-foreground">Holiday Tasker</p>
>>>>>>> main
          </div>
        </div>

        {/* Admin info */}
<<<<<<< HEAD
        <div className="px-4 py-3 border-b border-white/10">
=======
        <div className="px-4 py-3 border-b border-border">
>>>>>>> main
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
<<<<<<< HEAD
              <p className="text-xs font-medium text-white truncate">
                {user?.user_metadata?.username?.split(' ')[0] || 'Admin'}
              </p>
              <p className="text-[10px] text-white/40 truncate">{user?.email}</p>
=======
              <p className="text-xs font-medium text-foreground truncate">
                {user?.user_metadata?.username?.split(' ')[0] || 'Admin'}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
>>>>>>> main
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.url;
            return (
              <Link key={item.url} to={item.url}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${active
<<<<<<< HEAD
                    ? "bg-primary text-white shadow-md"
                    : "text-white/60 hover:text-white hover:bg-white/8"}`}>
=======
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
>>>>>>> main
                <item.icon className="h-4 w-4 shrink-0" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
<<<<<<< HEAD
        <div className="px-3 py-4 border-t border-white/10">
          <button onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-all w-full">
=======
        <div className="px-3 py-4 border-t border-border">
          <button onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all w-full">
>>>>>>> main
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
<<<<<<< HEAD
        <header className="h-14 flex items-center justify-between px-6 border-b border-white/10 bg-[#0f1117]">
          <p className="text-sm text-white/50">
            Welcome, <span className="text-white font-semibold">{user?.user_metadata?.username?.split(' ')[0] || 'Admin'}</span> 👋
=======
        <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-card">
          <p className="text-sm text-muted-foreground">
            Welcome, <span className="text-foreground font-semibold">{user?.user_metadata?.username?.split(' ')[0] || 'Admin'}</span> 👋
>>>>>>> main
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/20 text-primary font-medium border border-primary/30">
              Admin
            </span>
            <ThemeToggle />
          </div>
        </header>
<<<<<<< HEAD
        <main className="flex-1 p-6 overflow-auto bg-[#13161e]">
=======
        <main className="flex-1 p-6 overflow-auto bg-background">
>>>>>>> main
          {children}
        </main>
      </div>
    </div>
  );
}
