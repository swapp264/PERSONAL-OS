import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { Header } from './components/layout/Header.tsx';
import { QuickActionModal } from './components/modals/QuickActionModal.tsx';
import { TodayView } from './components/views/TodayView.tsx';
import { PlannerView } from './components/views/PlannerView.tsx';
import { FitnessView } from './components/views/FitnessView.tsx';
import { NutritionView } from './components/views/NutritionView.tsx';
import { ExpensesView } from './components/views/ExpensesView.tsx';
import { HabitsView } from './components/views/HabitsView.tsx';
import { SkillsView } from './components/views/SkillsView.tsx';
import { JournalView } from './components/views/JournalView.tsx';
import { GoalsView } from './components/views/GoalsView.tsx';
import { ProjectsView } from './components/views/ProjectsView.tsx';
import { RecoveryView } from './components/views/RecoveryView.tsx';
import { CalendarView } from './components/views/CalendarView.tsx';
import { AnalyticsView } from './components/views/AnalyticsView.tsx';
import { CoachView } from './components/views/CoachView.tsx';
import { SettingsView } from './components/views/SettingsView.tsx';
import {
  LayoutDashboard,
  CalendarCheck,
  Dumbbell,
  IndianRupee,
  Salad,
  Flame,
  Plus,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeSection, setActiveSection, sidebarCollapsed, openQuickModal } = useApp();

  const renderCurrentView = () => {
    switch (activeSection) {
      case 'today':
        return <TodayView />;
      case 'planner':
        return <PlannerView />;
      case 'fitness':
        return <FitnessView />;
      case 'nutrition':
        return <NutritionView />;
      case 'expenses':
        return <ExpensesView />;
      case 'habits':
        return <HabitsView />;
      case 'skills':
        return <SkillsView />;
      case 'journal':
        return <JournalView />;
      case 'goals':
        return <GoalsView />;
      case 'projects':
        return <ProjectsView />;
      case 'recovery':
        return <RecoveryView />;
      case 'calendar':
        return <CalendarView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'coach':
        return <CoachView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <TodayView />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-neutral-800 selection:text-white">
      {/* Collapsible Linear/Notion Sidebar for Desktop/Tablet */}
      <Sidebar />

      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main
        className={`flex-1 transition-all duration-200 p-4 md:p-8 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        } pb-20 md:pb-8`}
      >
        {renderCurrentView()}
      </main>

      {/* Mobile Bottom Navigation Bar (<15% viewport height compliance) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-neutral-950/95 border-t border-neutral-800 backdrop-blur-md flex items-center justify-around px-2">
        <button
          onClick={() => setActiveSection('today')}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${
            activeSection === 'today' ? 'text-white font-semibold' : 'text-neutral-400'
          }`}
        >
          <LayoutDashboard size={18} />
          <span>Today</span>
        </button>
        <button
          onClick={() => setActiveSection('planner')}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${
            activeSection === 'planner' ? 'text-white font-semibold' : 'text-neutral-400'
          }`}
        >
          <CalendarCheck size={18} />
          <span>Planner</span>
        </button>
        <button
          onClick={() => openQuickModal('task')}
          className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-950 flex items-center justify-center shadow-lg -mt-4 active:scale-95 transition-transform"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
        <button
          onClick={() => setActiveSection('fitness')}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${
            activeSection === 'fitness' ? 'text-white font-semibold' : 'text-neutral-400'
          }`}
        >
          <Dumbbell size={18} />
          <span>Fitness</span>
        </button>
        <button
          onClick={() => setActiveSection('expenses')}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${
            activeSection === 'expenses' ? 'text-white font-semibold' : 'text-neutral-400'
          }`}
        >
          <IndianRupee size={18} />
          <span>Expenses</span>
        </button>
      </div>

      {/* Global Quick Action Modal */}
      <QuickActionModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
