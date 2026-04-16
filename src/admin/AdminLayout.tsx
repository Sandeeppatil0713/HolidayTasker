import { ReactNode, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, BarChart3, Bell, MessageSquare,
  Settings, LogOut, Shield, ChevronLeft, ChevronRight, Menu, X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV = [
  { label: "Dashboard",    icon: LayoutDashboard, path: "/admin" },
  { label: "Users",        icon: Users,           path: "/admin/users" },
  { label: "Analytics",    icon: BarChart3,        path: "/admin/analytics" },
  { label: "Notifications",icon: Bell,             path: "/admin/notifications" },
  { label: "Feedback",     icon: MessageSquare,    path: "/admin/feedback" },
  { label: "Settings",     icon: Settings,         path: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out" });
    navigate("/");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-white" />
        </div>
        {!collapsed && <span className="text-white font-bold text-base tracking-tight">Admin Panel</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                active
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/60 hover:bg-white/10 hover:text-white",
                collapsed ? "justify-center" : "",
              ].join(" ")}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className={`px-3 py-4 border-t border-white/10 space-y-1`}>
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.user_metadata?.username || "Admin"}
              </p>
              <p className="text-[10px] text-white/50 truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className={[
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all",
            collapsed ? "justify-center" : "",
          ].join(" ")}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-gray-950">
      {/* Desktop sidebar */}
      <aside
        className={[
          "hidden md:flex flex-col shrink-0 transition-all duration-300",
          "bg-gradient-to-b from-indigo-700 via-indigo-800 to-indigo-900",
          collapsed ? "w-16" : "w-56",
        ].join(" ")}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-full w-5 h-10 bg-indigo-700 rounded-r-lg flex items-center justify-center text-white/60 hover:text-white transition-colors z-10"
          style={{ marginLeft: collapsed ? "4rem" : "14rem", transition: "margin 0.3s" }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-gradient-to-b from-indigo-700 via-indigo-800 to-indigo-900 z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-4 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5 text-slate-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-slate-800 dark:text-gray-100">
                {NAV.find((n) => n.path === location.pathname)?.label ?? "Admin"}
              </h1>
              <p className="text-[11px] text-slate-400 dark:text-gray-500 hidden sm:block">
                Holiday Tasker · Admin Console
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
              <Shield className="w-3 h-3" /> Admin
            </span>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
