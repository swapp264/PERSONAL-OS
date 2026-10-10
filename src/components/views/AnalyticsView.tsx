import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Dumbbell,
  GraduationCap,
  Flame,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useApp } from '../../context/AppContext.tsx';
import {
  getTodayDateString,
  getWeekDates,
  addDays,
} from '../../utils/dateUtils.ts';
import { formatMinutesToHours, formatCurrency } from '../../utils/formatters.ts';

export const AnalyticsView: React.FC = () => {
  const {
    tasks,
    workoutSessions,
    runningRecords,
    habits,
    habitLogs,
    learningLogs,
    focusSessions,
    transactions,
    dailyCheckIns,
    userSettings,
  } = useApp();

  const today = getTodayDateString();
  const currencySymbol = userSettings?.currencySymbol || '₹';
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');

  // Past 7 Days data
  const weeklyData = useMemo(() => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(today, -i);
      const dayTasks = tasks.filter((t) => t.date === d);
      const tasksCompleted = dayTasks.filter((t) => t.status === 'completed').length;
      const workoutDone = workoutSessions.some((w) => w.date === d && w.completed);
      const runKm = runningRecords
        .filter((r) => r.date === d)
        .reduce((sum, r) => sum + r.distanceKm, 0);

      const focusMins = focusSessions
        .filter((f) => f.date === d)
        .reduce((sum, f) => sum + f.durationMinutes, 0);
      const learnMins = learningLogs
        .filter((l) => l.date === d)
        .reduce((sum, l) => sum + l.durationMinutes, 0);

      const habitCount = habitLogs.filter((h) => h.date === d && h.completed).length;

      const spentPaise = transactions
        .filter((t) => t.date === d && t.type === 'expense')
        .reduce((sum, t) => sum + t.amountPaise, 0);

      list.push({
        day: d.slice(5),
        tasksCompleted,
        tasksTotal: dayTasks.length,
        workoutDone: workoutDone ? 1 : 0,
        runningKm: Math.round(runKm * 10) / 10,
        focusHours: Math.round(((focusMins + learnMins) / 60) * 10) / 10,
        habitsCompleted: habitCount,
        spentRupees: Math.round(spentPaise / 100),
      });
    }
    return list;
  }, [today, tasks, workoutSessions, runningRecords, focusSessions, learningLogs, habitLogs, transactions]);

  // Total weekly aggregations
  const totalWeeklyRunKm = weeklyData.reduce((s, d) => s + d.runningKm, 0);
  const totalWeeklyFocusHours = weeklyData.reduce((s, d) => s + d.focusHours, 0);
  const totalWeeklyTasksCompleted = weeklyData.reduce((s, d) => s + d.tasksCompleted, 0);
  const totalWeeklyWorkoutsCompleted = weeklyData.reduce((s, d) => s + d.workoutDone, 0);
  const totalWeeklySpent = weeklyData.reduce((s, d) => s + d.spentRupees, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-neutral-900 border border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <span>Transparent Records & Objective Data</span>
            <span aria-hidden="true">·</span>
            <span>Zero Slop / No Arbitrary Scores</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-100">
            Performance & Habit Analytics
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Transparent metrics computed directly from completed sessions, distance ran, hours focused, and verified financial entries.
          </p>
        </div>

        <div className="flex items-center p-1 bg-neutral-950 rounded-md border border-neutral-800 text-xs font-medium">
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-3 py-1 rounded transition-colors ${
              timeframe === 'weekly' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400'
            }`}
          >
            Past 7 Days
          </button>
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-xs text-neutral-400 mb-1">Running Volume</div>
          <div className="text-xl font-bold font-mono text-cyan-400 tabular-nums">
            {totalWeeklyRunKm.toFixed(1)} <span className="text-xs font-normal text-neutral-400">km</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Past 7 days aerobic base</p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-xs text-neutral-400 mb-1">Focus & Studies</div>
          <div className="text-xl font-bold font-mono text-neutral-100 tabular-nums">
            {totalWeeklyFocusHours.toFixed(1)} <span className="text-xs font-normal text-neutral-400">hrs</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Deep work & problem solving</p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-xs text-neutral-400 mb-1">Workouts Logged</div>
          <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
            {totalWeeklyWorkoutsCompleted} <span className="text-xs font-normal text-neutral-400">sessions</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Hybrid strength & power</p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-xs text-neutral-400 mb-1">Tasks Completed</div>
          <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
            {totalWeeklyTasksCompleted} <span className="text-xs font-normal text-neutral-400">tasks</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Deliberate execution</p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 col-span-2 md:col-span-1">
          <div className="text-xs text-neutral-400 mb-1">Weekly Spending</div>
          <div className="text-xl font-bold font-mono text-rose-400 tabular-nums">
            {currencySymbol}{totalWeeklySpent}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Past 7 days outlay</p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Focus Hours by Day */}
        <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <Clock size={14} className="text-neutral-400" />
              <span>Daily Focus & Study Hours</span>
            </h3>
            <span className="text-xs font-mono text-neutral-400">Hours</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" stroke="#525252" fontSize={11} />
                <YAxis stroke="#525252" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [`${val} hrs`, 'Focus Time']}
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', fontSize: '11px', borderRadius: '8px' }}
                />
                <Bar dataKey="focusHours" fill="#E5E5E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Running Kilometres by Day */}
        <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <Dumbbell size={14} className="text-neutral-400" />
              <span>Running Mileage (km)</span>
            </h3>
            <span className="text-xs font-mono text-neutral-400">Kilometres</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" stroke="#525252" fontSize={11} />
                <YAxis stroke="#525252" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [`${val} km`, 'Distance']}
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', fontSize: '11px', borderRadius: '8px' }}
                />
                <Bar dataKey="runningKm" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Habit Consistency by Day */}
        <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <Flame size={14} className="text-orange-400" />
              <span>Habits Completed Daily</span>
            </h3>
            <span className="text-xs font-mono text-neutral-400">Completed count</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" stroke="#525252" fontSize={11} />
                <YAxis stroke="#525252" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [val, 'Habits Done']}
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', fontSize: '11px', borderRadius: '8px' }}
                />
                <Bar dataKey="habitsCompleted" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Daily Spending Trend */}
        <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <IndianRupee size={14} className="text-rose-400" />
              <span>Daily Spending Trend</span>
            </h3>
            <span className="text-xs font-mono text-neutral-400">{currencySymbol}</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <XAxis dataKey="day" stroke="#525252" fontSize={11} />
                <YAxis stroke="#525252" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [`${currencySymbol}${val}`, 'Expenses']}
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', fontSize: '11px', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="spentRupees" stroke="#F43F5E" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
