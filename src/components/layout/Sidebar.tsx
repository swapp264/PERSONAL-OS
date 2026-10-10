import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Dumbbell,
  Salad,
  IndianRupee,
  Flame,
  GraduationCap,
  BookOpen,
  Target,
  FolderGit2,
  HeartPulse,
  CalendarDays,
  BarChart3,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Clock,
  Play,
  Pause,
  Square,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { NavSection } from '../../types/index.ts';
import { formatSecondsToTimer } from '../../utils/formatters.ts';

interface NavItem {
  id: NavSection;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

export const Sidebar: React.FC = () => {
  const {
    activeSection,
    setActiveSection,
    sidebarCollapsed,
    toggleSidebar,
    theme,
    toggleTheme,
    tasks,
    activeTimer,
    pauseFocusTimer,
    resumeFocusTimer,
    finishFocusTimer,
  } = useApp();

  // Calculate pending tasks count for today
  const pendingTasksCount = tasks.filter((t) => t.status === 'planned' || t.status === 'in_progress').length;

  const navItems: NavItem[] = [
    { id: 'today', label: 'Today', icon: LayoutDashboard },
    { id: 'planner', label: 'Planner', icon: CalendarCheck, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined },
    { id: 'fitness', label: 'Fitness', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrition', icon: Salad },
    { id: 'expenses', label: 'Expenses', icon: IndianRupee },
    { id: 'habits', label: 'Habits', icon: Flame },
    { id: 'skills', label: 'Skills & Focus', icon: GraduationCap },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'recovery', label: 'Recovery', icon: HeartPulse },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'coach', label: 'AI Coach', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-30 transition-all duration-200 border-r flex flex-col justify-between select-none ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      } bg-neutral-900/95 dark:bg-neutral-950/95 border-neutral-800 text-neutral-300 backdrop-blur-md`}
    >
      {/* Brand & collapse */}
      <div>
        <div className="h-14 border-b border-neutral-800/80 flex items-center justify-between px-3.5">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-md bg-neutral-100 text-neutral-950 flex items-center justify-center font-bold text-xs shrink-0 tracking-wider">
                OS
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold tracking-tight text-neutral-100 uppercase truncate">PERSONAL OS</span>
                <span className="text-[10px] text-neutral-400 truncate">Hybrid Athlete · Dev</span>
              </div>
            </div>
          ) : (
            <div className="w-7 h-7 mx-auto rounded-md bg-neutral-100 text-neutral-950 flex items-center justify-center font-bold text-xs tracking-wider">
              OS
            </div>
          )}

          <button
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 transition-colors shrink-0"
          >
            {sidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="p-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-12rem)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-medium transition-colors text-left group ${
                  isActive
                    ? 'bg-neutral-800 text-neutral-100 font-semibold shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                }`}
              >
                <Icon
                  size={16}
                  className={`shrink-0 transition-colors ${
                    isActive ? 'text-neutral-100' : 'text-neutral-400 group-hover:text-neutral-300'
                  }`}
                />
                {!sidebarCollapsed && (
                  <span className="truncate flex-1 tracking-normal">{item.label}</span>
                )}
                {!sidebarCollapsed && item.badge !== undefined && (
                  <span className="text-[11px] font-mono text-neutral-400 ml-auto tabular-nums">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Active Focus Timer Widget & User Controls */}
      <div className="p-2 border-t border-neutral-800/80 space-y-2">
        {/* Persistent timer pill widget if timer active */}
        {activeTimer.isActive && (
          <div
            className={`rounded-md p-2 bg-neutral-800/80 border border-neutral-700/60 ${
              sidebarCollapsed ? 'text-center' : ''
            }`}
          >
            {!sidebarCollapsed ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1.5 truncate">
                    <Clock size={12} className="text-amber-400 animate-pulse" />
                    <span className="truncate">{activeTimer.skillName || 'Focus Session'}</span>
                  </span>
                  <span className="font-mono text-neutral-200 font-medium tabular-nums">
                    {formatSecondsToTimer(activeTimer.remainingSeconds)}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-1">
                  {activeTimer.isPaused ? (
                    <button
                      onClick={resumeFocusTimer}
                      title="Resume"
                      className="p-1 rounded text-neutral-300 hover:bg-neutral-700 hover:text-white"
                    >
                      <Play size={11} />
                    </button>
                  ) : (
                    <button
                      onClick={pauseFocusTimer}
                      title="Pause"
                      className="p-1 rounded text-neutral-300 hover:bg-neutral-700 hover:text-white"
                    >
                      <Pause size={11} />
                    </button>
                  )}
                  <button
                    onClick={() => finishFocusTimer('Saved from sidebar')}
                    title="Stop & Log Session"
                    className="p-1 rounded text-neutral-300 hover:bg-emerald-800 hover:text-emerald-200"
                  >
                    <Square size={11} />
                  </button>
                </div>
              </div>
            ) : (
              <div
                title={`${activeTimer.skillName || 'Focus'}: ${formatSecondsToTimer(
                  activeTimer.remainingSeconds
                )}`}
                className="flex flex-col items-center gap-1 text-[10px] font-mono text-amber-400"
              >
                <Clock size={14} className="animate-pulse" />
                <span>{formatSecondsToTimer(activeTimer.remainingSeconds)}</span>
              </div>
            )}
          </div>
        )}

        {/* Theme and status */}
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between px-1'}`}>
          {!sidebarCollapsed && (
            <div className="text-[11px] text-neutral-400">
              <span>Local-First</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span className="text-emerald-400 font-medium">IndexedDB</span>
            </div>
          )}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 transition-colors"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </aside>
  );
};
