import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  CalendarCheck,
  GraduationCap,
  IndianRupee,
  BookOpen,
  Flame,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import {
  getTodayDateString,
  formatDateDisplay,
  getMonthDays,
  getWeekDates,
  addDays,
} from '../../utils/dateUtils.ts';
import { formatCurrency } from '../../utils/formatters.ts';

export const CalendarView: React.FC = () => {
  const {
    tasks,
    workoutSessions,
    foodEntries,
    transactions,
    habitLogs,
    habits,
    journalEntries,
    focusSessions,
    userSettings,
    selectedCalendarDate,
    setSelectedCalendarDate,
  } = useApp();

  const today = getTodayDateString();
  const currencySymbol = userSettings?.currencySymbol || '₹';

  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState(() => new Date().getMonth()); // 0-11
  const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'day'>('month');

  // Days of month
  const monthDays = useMemo(() => {
    return getMonthDays(currentYear, currentMonthIndex);
  }, [currentYear, currentMonthIndex]);

  // First day of month offset
  const startDayOfWeek = useMemo(() => {
    return new Date(currentYear, currentMonthIndex, 1).getDay(); // 0=Sun
  }, [currentYear, currentMonthIndex]);

  const monthName = new Date(currentYear, currentMonthIndex, 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  // Inspect selected date activities
  const inspectedTasks = tasks.filter((t) => t.date === selectedCalendarDate);
  const inspectedWorkout = workoutSessions.find((w) => w.date === selectedCalendarDate);
  const inspectedTx = transactions.filter((t) => t.date === selectedCalendarDate);
  const inspectedJournal = journalEntries.filter((j) => j.date === selectedCalendarDate);
  const inspectedFocus = focusSessions.filter((f) => f.date === selectedCalendarDate);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-neutral-900 border border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <span>Unified Activity & Schedule Timeline</span>
            <span aria-hidden="true">·</span>
            <span>Local Calendar</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-100">
            Unified Calendar
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Cross-domain view of tasks, hybrid workouts, focus blocks, expenses, and reflections.
          </p>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="text-sm font-bold text-neutral-100 min-w-[140px] text-center font-mono">
            {monthName}
          </div>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => {
              setCurrentYear(new Date().getFullYear());
              setCurrentMonthIndex(new Date().getMonth());
              setSelectedCalendarDate(today);
            }}
            className="px-2.5 py-1 text-xs rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
          >
            Today
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar Month Matrix (Left 2 cols) + Selected Day Inspector (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month Grid (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-mono text-neutral-500 pb-2 border-b border-neutral-800">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank offset tiles */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[80px] rounded-lg bg-neutral-950/20" />
            ))}

            {/* Actual day tiles */}
            {monthDays.map((dateStr) => {
              const dayNum = dateStr.slice(8);
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedCalendarDate;

              const dayTasks = tasks.filter((t) => t.date === dateStr);
              const dayWorkout = workoutSessions.find((w) => w.date === dateStr);
              const dayExpenses = transactions.filter((t) => t.date === dateStr && t.type === 'expense');
              const hasJournal = journalEntries.some((j) => j.date === dateStr);

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedCalendarDate(dateStr)}
                  className={`min-h-[85px] p-1.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-neutral-900 border-neutral-400 ring-1 ring-neutral-400'
                      : isToday
                      ? 'bg-neutral-900/90 border-neutral-600'
                      : 'bg-neutral-950 border-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                        isToday ? 'bg-amber-400 text-neutral-950' : 'text-neutral-300'
                      }`}
                    >
                      {parseInt(dayNum)}
                    </span>
                    {dayExpenses.length > 0 && (
                      <span className="text-[10px] text-rose-400 font-mono">
                        {currencySymbol}{Math.round(dayExpenses.reduce((s, t) => s + t.amountPaise, 0) / 100)}
                      </span>
                    )}
                  </div>

                  {/* Activity badges */}
                  <div className="space-y-1 mt-1">
                    {dayWorkout && (
                      <div
                        className={`text-[9px] px-1 py-0.5 rounded truncate font-medium ${
                          dayWorkout.completed
                            ? 'bg-emerald-950 text-emerald-400'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        🏋 {dayWorkout.title.split(' ')[0]}
                      </div>
                    )}

                    {dayTasks.length > 0 && (
                      <div className="text-[9px] px-1 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 truncate">
                        ✓ {dayTasks.filter((t) => t.status === 'completed').length}/{dayTasks.length} tasks
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Inspector Drawer (1 Col) */}
        <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="pb-3 border-b border-neutral-800">
            <span className="text-xs text-neutral-400">Inspecting Day</span>
            <h3 className="text-sm font-bold text-neutral-100">
              {formatDateDisplay(selectedCalendarDate, { includeWeekday: true })}
            </h3>
          </div>

          {/* Workout on Date */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
              <Dumbbell size={13} className="text-amber-400" />
              <span>Workout Session</span>
            </h4>
            {inspectedWorkout ? (
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs">
                <div className="font-semibold text-neutral-200">{inspectedWorkout.title}</div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  {inspectedWorkout.exercises.length} exercises ·{' '}
                  <span className={inspectedWorkout.completed ? 'text-emerald-400' : 'text-neutral-400'}>
                    {inspectedWorkout.completed ? 'Completed' : 'Planned'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-2.5 text-xs text-neutral-500 rounded bg-neutral-950">
                No workout recorded for this date.
              </div>
            )}
          </div>

          {/* Tasks on Date */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
              <CalendarCheck size={13} className="text-cyan-400" />
              <span>Planned Tasks ({inspectedTasks.length})</span>
            </h4>
            {inspectedTasks.length === 0 ? (
              <div className="p-2.5 text-xs text-neutral-500 rounded bg-neutral-950">
                No tasks scheduled on this date.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {inspectedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-2 rounded bg-neutral-950 border border-neutral-800 text-xs flex items-center justify-between"
                  >
                    <span className={`truncate ${t.status === 'completed' ? 'line-through text-neutral-500' : 'text-neutral-200'}`}>
                      {t.title}
                    </span>
                    <span className="text-[10px] text-neutral-500 uppercase ml-2">{t.timeOfDay}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transactions on Date */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
              <IndianRupee size={13} className="text-emerald-400" />
              <span>Financial Records</span>
            </h4>
            {inspectedTx.length === 0 ? (
              <div className="p-2.5 text-xs text-neutral-500 rounded bg-neutral-950">
                No transactions recorded.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {inspectedTx.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2 rounded bg-neutral-950 border border-neutral-800 text-xs flex justify-between items-center"
                  >
                    <span className="truncate text-neutral-300">{tx.title}</span>
                    <span
                      className={`font-mono tabular-nums ${
                        tx.type === 'expense' ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {formatCurrency(tx.amountPaise, currencySymbol)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Journal Entries on Date */}
          {inspectedJournal.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
                <BookOpen size={13} className="text-purple-400" />
                <span>Journal Entries</span>
              </h4>
              <div className="space-y-1.5">
                {inspectedJournal.map((j) => (
                  <div key={j.id} className="p-2 rounded bg-neutral-950 border border-neutral-800 text-xs">
                    <div className="font-semibold text-neutral-200">{j.title}</div>
                    <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2">{j.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
