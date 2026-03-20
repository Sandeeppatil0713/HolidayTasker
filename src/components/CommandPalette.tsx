import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Search, LayoutDashboard, CheckSquare, Plane, Calendar,
  PieChart, Plus, ClipboardList, X,
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  icon: React.ElementType;
  section: string;
  action: () => void;
}

interface Props {
  recentSearches?: string[];
}

export function CommandPalette({ recentSearches = ["Q2 vacation plan", "pending tasks"] }: Props) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const go = useCallback((url: string) => {
    navigate(url);
    close();
  }, [navigate, close]);

  const ALL_ITEMS: CommandItem[] = [
    { id: "dashboard", label: "Dashboard",           icon: LayoutDashboard, section: "Navigation",    action: () => go("/dashboard") },
    { id: "tasks",     label: "My Tasks",             icon: CheckSquare,     section: "Navigation",    action: () => go("/dashboard/tasks") },
    { id: "vacations", label: "Vacation Planner",     icon: Plane,           section: "Navigation",    action: () => go("/dashboard/vacations") },
    { id: "calendar",  label: "Calendar",             icon: Calendar,        section: "Navigation",    action: () => go("/dashboard/calendar") },
    { id: "analytics", label: "Analytics",            icon: PieChart,        section: "Navigation",    action: () => go("/dashboard/analytics") },
    { id: "add-task",  label: "Add New Task",          icon: Plus,            section: "Quick Actions", action: () => go("/dashboard/tasks") },
    { id: "new-plan",  label: "Create Vacation Plan",  icon: ClipboardList,   section: "Quick Actions", action: () => go("/dashboard/vacations") },
  ];

  const filtered = query.trim()
    ? ALL_ITEMS.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))
    : ALL_ITEMS;

  const sections = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    (acc[item.section] ??= []).push(item);
    return acc;
  }, {});

  const flatItems = Object.values(sections).flat();

  // Global Ctrl+K / ⌘K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => setActiveIndex(0), [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`) as HTMLElement;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown")  { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1)); }
    else if (e.key === "ArrowUp")  { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter")    { e.preventDefault(); flatItems[activeIndex]?.action(); }
    else if (e.key === "Escape")   { e.preventDefault(); close(); }
  };

  let flatIdx = 0;

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
        className={[
          "flex items-center gap-2 h-9 px-3 rounded-full",
          "w-[200px] sm:w-[280px]",
          "bg-slate-100 dark:bg-gray-800",
          "border border-slate-200 dark:border-gray-700",
          "text-sm text-slate-400 dark:text-gray-500",
          "hover:border-indigo-300 dark:hover:border-indigo-600",
          "hover:bg-white dark:hover:bg-gray-750",
          "transition-all duration-200 cursor-pointer shadow-sm",
        ].join(" ")}
      >
        <Search className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-gray-500" />
        <span className="flex-1 text-left text-xs sm:text-sm">Search…</span>
        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-slate-400 dark:text-gray-400 shadow-sm">
          ⌘K
        </kbd>
      </button>

      {/* Portal: backdrop + palette */}
      {open && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998] bg-black/20 dark:bg-black/50 backdrop-blur-sm"
            onClick={close}
          />

          {/* Palette panel */}
          <div
            className={[
              "fixed left-1/2 top-[10vh] -translate-x-1/2 z-[9999]",
              "w-[calc(100vw-2rem)] sm:w-[440px]",
              "rounded-2xl overflow-hidden",
              "bg-white dark:bg-gray-900",
              "border border-slate-200/80 dark:border-gray-700/80",
              "shadow-[0_24px_64px_rgba(0,0,0,0.15)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.5)]",
              "animate-palette-in",
            ].join(" ")}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-gray-800">
              <Search className="w-4 h-4 shrink-0 text-slate-400 dark:text-gray-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search pages, actions…"
                className="flex-1 bg-transparent text-sm text-slate-800 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <kbd
                onClick={close}
                className="cursor-pointer inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-400 dark:text-gray-500"
              >
                Esc
              </kbd>
            </div>

            {/* Results list */}
            <ul ref={listRef} className="max-h-[340px] overflow-y-auto py-2 scroll-smooth">
              {/* Recent searches */}
              {!query && recentSearches.length > 0 && (
                <>
                  <li className="px-4 pt-1 pb-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-gray-500">Recent</span>
                  </li>
                  {recentSearches.map((s) => (
                    <li key={s}>
                      <button
                        onClick={() => setQuery(s)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Search className="w-3.5 h-3.5 shrink-0 text-slate-300 dark:text-gray-600" />
                        {s}
                      </button>
                    </li>
                  ))}
                  <li className="mx-4 my-2 border-t border-slate-100 dark:border-gray-800" />
                </>
              )}

              {flatItems.length === 0 && (
                <li className="px-4 py-8 text-center text-sm text-slate-400 dark:text-gray-500">
                  No results for "{query}"
                </li>
              )}

              {Object.entries(sections).map(([section, items]) => (
                <li key={section}>
                  <div className="px-4 pt-2 pb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-gray-500">{section}</span>
                  </div>
                  <ul>
                    {items.map((item) => {
                      const idx = flatIdx++;
                      const isActive = idx === activeIndex;
                      return (
                        <li key={item.id} data-index={idx}>
                          <button
                            onMouseEnter={() => setActiveIndex(idx)}
                            onClick={item.action}
                            className={[
                              "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-100",
                              isActive
                                ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                                : "text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800",
                            ].join(" ")}
                          >
                            <span className={[
                              "flex items-center justify-center w-7 h-7 rounded-lg shrink-0",
                              isActive ? "bg-indigo-100 dark:bg-indigo-800/50" : "bg-slate-100 dark:bg-gray-800",
                            ].join(" ")}>
                              <item.icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-gray-400"}`} />
                            </span>
                            <span className="flex-1 text-left font-medium">{item.label}</span>
                            {isActive && (
                              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-800/50 text-indigo-500 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700">↵</kbd>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>

            {/* Footer hints */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-slate-100 dark:border-gray-800 bg-slate-50/60 dark:bg-gray-900/60">
              {[["↑↓", "navigate"], ["↵", "select"], ["Esc", "close"]].map(([key, label]) => (
                <span key={key} className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-gray-500">
                  <kbd className="px-1 py-0.5 rounded bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-[10px] font-medium text-slate-500 dark:text-gray-400 shadow-sm">
                    {key}
                  </kbd>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
