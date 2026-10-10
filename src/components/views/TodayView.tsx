import React, { useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  Dumbbell,
  Salad,
  IndianRupee,
  Flame,
  Clock,
  Droplet,
  Moon,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { getTodayDateString, formatDateDisplay, getGreeting } from '../../utils/dateUtils.ts';
import { formatCurrency, formatMinutesToHours } from '../../utils/formatters.ts';

export const TodayView: React.FC = () => {
  const {
    userSettings,
    tasks,
    toggleTaskComplete,
    workoutSessions,
    foodEntries,
    waterEntries,
    addWaterEntry,
    transactions,
    habits,
    habitLogs,
    toggleHabitLog,
    getHabitStreak,
    learningLogs,
    focusSessions,
    goals,
    dailyCheckIns,
    openQuickModal,
    setActiveSection,
    startFocusTimer,
    skills,
  } = useApp();

  const today = getTodayDateString();

  // Filter tasks for today
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => t.date === today);
  }, [tasks, today]);

  const completedTasks = useMemo(() => {
    return todayTasks.filter((t) => t.status === 'completed');
  }, [todayTasks]);

  const taskCompletionRate = todayTasks.length > 0 ? Math.round((completedTasks.length / todayTasks.length) * 100) : 0;

  // Top 3 priorities
  const topPriorities = useMemo(() => {
    return [...todayTasks]
      .sort((a, b) => {
        const pOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
        return (pOrder[b.priority] || 1) - (pOrder[a.priority] || 1);
      })
      .slice(0, 3);
  }, [todayTasks]);

  // Today's workout
  const todayWorkout = useMemo(() => {
    return workoutSessions.find((w) => w.date === today);
  }, [workoutSessions, today]);

  // Nutrition calculations
  const nutritionTotals = useMemo(() => {
    const todayFoods = foodEntries.filter((f) => f.date === today);
    return todayFoods.reduce(
      (acc, item) => ({
        calories: acc.calories + (item.calories || 0),
        protein: acc.protein + (item.protein || 0),
        carbs: acc.carbs + (item.carbs || 0),
        fat: acc.fat + (item.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [foodEntries, today]);

  // Water intake
  const todayWaterTotalMl = useMemo(() => {
    return waterEntries.filter((w) => w.date === today).reduce((sum, w) => sum + (w.amountMl || 0), 0);
  }, [waterEntries, today]);

  // Today's learning / focus time
  const todayFocusMinutes = useMemo(() => {
    const focusMins = focusSessions.filter((f) => f.date === today).reduce((sum, f) => sum + (f.durationMinutes || 0), 0);
    const learnMins = learningLogs.filter((l) => l.date === today).reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
    return focusMins + learnMins;
  }, [focusSessions, learningLogs, today]);

  // Financial statistics
  const todaySpendingPaise = useMemo(() => {
    return transactions
      .filter((t) => t.date === today && t.type === 'expense')
      .reduce((sum, t) => sum + t.amountPaise, 0);
  }, [transactions, today]);

  const monthSpendingPaise = useMemo(() => {
    const currentMonthPrefix = today.slice(0, 7); // YYYY-MM
    return transactions
      .filter((t) => t.date.startsWith(currentMonthPrefix) && t.type === 'expense')
      .reduce((sum, t) => sum + t.amountPaise, 0);
  }, [transactions, today]);

  // Today check-in
  const todayCheckIn = useMemo(() => {
    return dailyCheckIns.find((c) => c.date === today);
  }, [dailyCheckIns, today]);

  // Active goals
  const activeGoals = useMemo(() => {
    return goals.filter((g) => g.status === 'active').slice(0, 3);
  }, [goals]);

  const targets = userSettings?.nutritionTargets || {
    dailyCalories: 2400,
    dailyProtein: 130,
    dailyCarbs: 280,
    dailyFat: 65,
    dailyWaterMl: 3500,
  };

  const currencySymbol = userSettings?.currencySymbol || '₹';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Hero Greeting & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-neutral-900 border border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <span>{formatDateDisplay(today, { includeWeekday: true })}</span>
            <span aria-hidden="true">·</span>
            <span>Local Command Center</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-100">
            {getGreeting(userSettings?.userName)}
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Hybrid athlete training, structured learning, and clear daily execution.
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openQuickModal('task')}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Plus size={13} />
            <span>Task</span>
          </button>
          <button
            onClick={() => setActiveSection('fitness')}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Dumbbell size={13} />
            <span>Workout</span>
          </button>
          <button
            onClick={() => openQuickModal('meal')}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Salad size={13} />
            <span>Meal</span>
          </button>
          <button
            onClick={() => openQuickModal('expense')}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <IndianRupee size={13} />
            <span>Expense</span>
          </button>
          <button
            onClick={() => openQuickModal('focus')}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Clock size={13} />
            <span>Focus</span>
          </button>
          <button
            onClick={() => openQuickModal('recovery')}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Moon size={13} />
            <span>Recovery</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Task Completion */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
            <span>Daily Tasks</span>
            <span className="font-mono tabular-nums">{completedTasks.length}/{todayTasks.length}</span>
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-100">
            {taskCompletionRate}%
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-neutral-200 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, taskCompletionRate)}%` }}
            />
          </div>
        </div>

        {/* Protein & Nutrition */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
            <span>Protein</span>
            <span className="font-mono tabular-nums">{Math.round(nutritionTotals.protein)}g / {targets.dailyProtein}g</span>
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-400">
            {Math.round(nutritionTotals.protein)}g
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round((nutritionTotals.protein / targets.dailyProtein) * 100))}%` }}
            />
          </div>
        </div>

        {/* Focus & Learning */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
            <span>Focus & Studies</span>
            <span className="text-[11px]">Today</span>
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-100">
            {formatMinutesToHours(todayFocusMinutes)}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            Coding, DSA & Technical blocks
          </p>
        </div>

        {/* Daily Spending */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
            <span>Today's Spending</span>
            <span className="text-[11px] font-mono text-neutral-400">Mo: {formatCurrency(monthSpendingPaise, currencySymbol)}</span>
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-100">
            {formatCurrency(todaySpendingPaise, currencySymbol)}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            Manual verified expenses
          </p>
        </div>
      </div>

      {/* Two Column Layout: Daily Execution & Hybrid Training Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tasks & Planner Summary (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top 3 Priorities */}
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-neutral-100">Top Priorities Today</h3>
                <span className="text-xs text-neutral-500">·</span>
                <span className="text-xs text-neutral-400">High leverage targets</span>
              </div>
              <button
                onClick={() => setActiveSection('planner')}
                className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors flex items-center gap-1"
              >
                <span>Full Planner</span>
                <ArrowRight size={12} />
              </button>
            </div>

            {topPriorities.length === 0 ? (
              <div className="p-4 text-center rounded-lg bg-neutral-950 border border-neutral-800/80">
                <p className="text-xs text-neutral-400">No priority tasks added for today yet.</p>
                <button
                  onClick={() => openQuickModal('task')}
                  className="mt-2 text-xs text-neutral-200 underline underline-offset-4 hover:text-white"
                >
                  Create your first priority
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {topPriorities.map((task) => {
                  const isDone = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                        isDone
                          ? 'bg-neutral-950/60 border-neutral-800/60 opacity-60'
                          : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className="mt-0.5 text-neutral-400 hover:text-neutral-100 transition-colors shrink-0"
                      >
                        {isDone ? (
                          <CheckCircle2 size={16} className="text-neutral-300" />
                        ) : (
                          <Circle size={16} />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-medium tracking-tight ${
                            isDone ? 'line-through text-neutral-400' : 'text-neutral-100'
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
                          <span className="capitalize">{task.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize">{task.timeOfDay || 'all day'}</span>
                          {task.estimatedDuration && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono tabular-nums">{task.estimatedDuration}m</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Today's Hybrid Athlete Workout */}
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell size={16} className="text-amber-400" />
                <h3 className="text-sm font-semibold text-neutral-100">Hybrid Athlete Training</h3>
              </div>
              <button
                onClick={() => setActiveSection('fitness')}
                className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors flex items-center gap-1"
              >
                <span>Training Center</span>
                <ArrowRight size={12} />
              </button>
            </div>

            {todayWorkout ? (
              <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-200">{todayWorkout.title}</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">{todayWorkout.notes || 'Strict technique and controlled pacing.'}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      todayWorkout.completed
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {todayWorkout.completed ? 'Completed' : 'Planned'}
                  </span>
                </div>

                {/* Exercises overview */}
                <div className="pt-2 border-t border-neutral-800/80">
                  <div className="text-[11px] text-neutral-400 mb-2">
                    Exercises ({todayWorkout.exercises.length} movements):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                    {todayWorkout.exercises.map((ex, i) => (
                      <div
                        key={ex.id || i}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded bg-neutral-900/60 border border-neutral-800/60 text-neutral-300"
                      >
                        <span className="truncate">{ex.name}</span>
                        <span className="font-mono text-[11px] text-neutral-400 ml-2 shrink-0">
                          {ex.sets} sets
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setActiveSection('fitness')}
                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-950 hover:bg-white transition-colors"
                  >
                    {todayWorkout.completed ? 'Review Workout Log' : 'Start / Log Workout'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center rounded-lg bg-neutral-950 border border-neutral-800">
                <p className="text-xs text-neutral-400">No workout assigned for today.</p>
                <button
                  onClick={() => setActiveSection('fitness')}
                  className="mt-2 text-xs text-neutral-200 underline hover:text-white"
                >
                  Schedule today's training session
                </button>
              </div>
            )}
          </div>

          {/* Daily Habit Consistency Checklist */}
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame size={16} className="text-orange-400" />
                <h3 className="text-sm font-semibold text-neutral-100">Daily Habit Consistency</h3>
              </div>
              <button
                onClick={() => setActiveSection('habits')}
                className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors flex items-center gap-1"
              >
                <span>All Habits</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {habits.slice(0, 6).map((habit) => {
                const log = habitLogs.find((l) => l.habitId === habit.id && l.date === today);
                const isCompleted = !!log?.completed;
                const streak = getHabitStreak(habit.id);

                return (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabitLog(habit.id, today)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-colors ${
                      isCompleted
                        ? 'bg-neutral-950 border-neutral-800 text-neutral-100'
                        : 'bg-neutral-950/40 border-neutral-800/60 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isCompleted ? (
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      ) : (
                        <Circle size={16} className="text-neutral-600 shrink-0" />
                      )}
                      <span className={`text-xs truncate ${isCompleted ? 'font-medium' : ''}`}>
                        {habit.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono tabular-nums text-neutral-500 ml-2 shrink-0">
                      {streak.currentStreak}d
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Nutrition, Hydration, Recovery & Goals (1 Col) */}
        <div className="space-y-6">
          {/* Hydration Tracker */}
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplet size={16} className="text-cyan-400" />
                <h3 className="text-sm font-semibold text-neutral-100">Hydration</h3>
              </div>
              <span className="text-xs font-mono tabular-nums text-neutral-400">
                {todayWaterTotalMl} / {targets.dailyWaterMl} ml
              </span>
            </div>

            <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((todayWaterTotalMl / targets.dailyWaterMl) * 100))}%` }}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => addWaterEntry(250)}
                className="flex-1 py-1.5 rounded bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-cyan-300 transition-colors"
              >
                +250ml
              </button>
              <button
                onClick={() => addWaterEntry(500)}
                className="flex-1 py-1.5 rounded bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-cyan-300 transition-colors"
              >
                +500ml
              </button>
              <button
                onClick={() => addWaterEntry(1000)}
                className="flex-1 py-1.5 rounded bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-cyan-300 transition-colors"
              >
                +1L
              </button>
            </div>
          </div>

          {/* Daily Macros Snapshot */}
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-100">Macro Targets</h3>
              <button
                onClick={() => setActiveSection('nutrition')}
                className="text-xs text-neutral-400 hover:text-neutral-200"
              >
                Log Food
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Calories</span>
                  <span className="font-mono tabular-nums">
                    {Math.round(nutritionTotals.calories)} / {targets.dailyCalories} kcal
                  </span>
                </div>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full"
                    style={{ width: `${Math.min(100, (nutritionTotals.calories / targets.dailyCalories) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Carbs</span>
                  <span className="font-mono tabular-nums">
                    {Math.round(nutritionTotals.carbs)}g / {targets.dailyCarbs}g
                  </span>
                </div>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-400 h-full rounded-full"
                    style={{ width: `${Math.min(100, (nutritionTotals.carbs / targets.dailyCarbs) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Fat</span>
                  <span className="font-mono tabular-nums">
                    {Math.round(nutritionTotals.fat)}g / {targets.dailyFat}g
                  </span>
                </div>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-400 h-full rounded-full"
                    style={{ width: `${Math.min(100, (nutritionTotals.fat / targets.dailyFat) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sleep & Wellbeing Check-in Card */}
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon size={16} className="text-indigo-400" />
                <h3 className="text-sm font-semibold text-neutral-100">Recovery & Sleep</h3>
              </div>
              <button
                onClick={() => openQuickModal('recovery')}
                className="text-xs text-neutral-400 hover:text-neutral-200"
              >
                {todayCheckIn ? 'Edit' : '+ Check-in'}
              </button>
            </div>

            {todayCheckIn ? (
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Sleep Duration:</span>
                  <span className="font-mono font-medium text-neutral-200">{todayCheckIn.sleepHours} hrs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Sleep Quality:</span>
                  <span className="font-mono text-neutral-200">{todayCheckIn.sleepQuality}/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Energy & Mood:</span>
                  <span className="font-mono text-neutral-200">
                    E:{todayCheckIn.energy}/5 · M:{todayCheckIn.mood}/5
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Soreness Level:</span>
                  <span className="font-mono text-neutral-200">{todayCheckIn.muscleSoreness}/5</span>
                </div>
              </div>
            ) : (
              <div className="p-3 text-center rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-400">
                <p>No check-in logged for today yet.</p>
                <button
                  onClick={() => openQuickModal('recovery')}
                  className="mt-1.5 text-xs text-neutral-200 underline hover:text-white"
                >
                  Record sleep & energy
                </button>
              </div>
            )}
          </div>

          {/* Active Goals Progress */}
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-400" />
                <h3 className="text-sm font-semibold text-neutral-100">Active Goals</h3>
              </div>
              <button
                onClick={() => setActiveSection('goals')}
                className="text-xs text-neutral-400 hover:text-neutral-200"
              >
                View All
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {activeGoals.map((goal) => {
                const completedMilestones = goal.milestones.filter((m) => m.completed).length;
                const totalMilestones = goal.milestones.length;
                const pct =
                  totalMilestones > 0
                    ? Math.round((completedMilestones / totalMilestones) * 100)
                    : goal.targetValue && goal.currentValue
                    ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
                    : 50;

                return (
                  <div key={goal.id} className="p-2.5 rounded bg-neutral-950 border border-neutral-800">
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <span className="font-medium text-neutral-200 truncate">{goal.title}</span>
                      <span className="font-mono text-[11px] text-neutral-400 tabular-nums shrink-0">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-neutral-200 h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
