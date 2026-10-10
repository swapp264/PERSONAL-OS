import React from 'react';
import { Plus, BookOpenCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { getTodayDateString, formatDateDisplay } from '../../utils/dateUtils.ts';

const SECTION_TITLES: Record<string, string> = {
  today: 'Today / Command Center',
  planner: 'Planner & Time Blocking',
  fitness: 'Hybrid Athlete Training',
  nutrition: 'Nutrition & Hydration Diary',
  expenses: 'Expenses & Personal Finance',
  habits: 'Habits & Consistency Routines',
  skills: 'Skills, Coding & Focus',
  journal: 'Daily Reflection & Retrospective',
  goals: 'Goals & Milestones',
  projects: 'Projects & Knowledge Vault',
  recovery: 'Recovery & Wellbeing Check-in',
  calendar: 'Unified Schedule Calendar',
  analytics: 'Performance & Trend Analytics',
  coach: 'AI Personal Coach Insights',
  settings: 'Settings & Data Backup',
};

export const Header: React.FC = () => {
  const {
    activeSection,
    setActiveSection,
    sidebarCollapsed,
    openQuickModal,
  } = useApp();

  const todayStr = getTodayDateString();

  return (
    <header
      className={`sticky top-0 z-20 h-14 border-b flex items-center justify-between gap-8 px-6 backdrop-blur-md transition-all duration-200 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      } bg-neutral-950/80 border-neutral-800 text-neutral-100`}
    >
      {/* Zone 1: Brand / Contextual Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-sm font-semibold tracking-tight text-neutral-100 whitespace-nowrap truncate">
          {SECTION_TITLES[activeSection] || 'Personal OS'}
        </h1>
        <span className="hidden md:inline text-xs text-neutral-400" aria-hidden="true">·</span>
        <span className="hidden md:inline text-xs font-mono text-neutral-400 tabular-nums whitespace-nowrap">
          {formatDateDisplay(todayStr, { includeWeekday: true })}
        </span>
      </div>

      {/* Zone 2: Navigation shortcuts */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-neutral-400 shrink-0">
        <button
          onClick={() => setActiveSection('today')}
          className={`transition-colors whitespace-nowrap ${
            activeSection === 'today' ? 'text-neutral-100 font-semibold' : 'hover:text-neutral-200'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setActiveSection('planner')}
          className={`transition-colors whitespace-nowrap ${
            activeSection === 'planner' ? 'text-neutral-100 font-semibold' : 'hover:text-neutral-200'
          }`}
        >
          Planner
        </button>
        <button
          onClick={() => setActiveSection('fitness')}
          className={`transition-colors whitespace-nowrap ${
            activeSection === 'fitness' ? 'text-neutral-100 font-semibold' : 'hover:text-neutral-200'
          }`}
        >
          Hybrid Training
        </button>
        <button
          onClick={() => setActiveSection('nutrition')}
          className={`transition-colors whitespace-nowrap ${
            activeSection === 'nutrition' ? 'text-neutral-100 font-semibold' : 'hover:text-neutral-200'
          }`}
        >
          Nutrition
        </button>
        <button
          onClick={() => setActiveSection('expenses')}
          className={`transition-colors whitespace-nowrap ${
            activeSection === 'expenses' ? 'text-neutral-100 font-semibold' : 'hover:text-neutral-200'
          }`}
        >
          Expenses
        </button>
      </nav>

      {/* Zone 3: Primary Action & Quick Review */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={() => openQuickModal('journal')}
          title="Daily Review Checklist"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-700/80 rounded-md hover:bg-neutral-800 hover:text-white transition-colors whitespace-nowrap"
        >
          <BookOpenCheck size={13} className="text-amber-400" />
          <span>Daily Review</span>
        </button>

        <button
          onClick={() => openQuickModal('task')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-neutral-950 bg-neutral-100 rounded-md hover:bg-white active:scale-98 transition-all whitespace-nowrap shadow-xs"
        >
          <Plus size={13} strokeWidth={2.5} />
          <span>Quick Entry</span>
        </button>
      </div>
    </header>
  );
};
