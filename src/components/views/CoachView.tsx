import React, { useMemo, useState } from 'react';
import {
  Sparkles,
  Bot,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Dumbbell,
  Lightbulb,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { getTodayDateString, getWeekDates, addDays } from '../../utils/dateUtils.ts';
import { formatMinutesToHours, formatCurrency } from '../../utils/formatters.ts';

export const CoachView: React.FC = () => {
  const {
    tasks,
    workoutSessions,
    runningRecords,
    foodEntries,
    waterEntries,
    transactions,
    habits,
    habitLogs,
    skills,
    learningLogs,
    focusSessions,
    goals,
    dailyCheckIns,
    userSettings,
  } = useApp();

  const today = getTodayDateString();
  const currencySymbol = userSettings?.currencySymbol || '₹';

  // Compute real heuristics from data
  const insights = useMemo(() => {
    // 1. Weekly Tasks completion
    const past7Days = Array.from({ length: 7 }, (_, i) => addDays(today, -i));
    const recentTasks = tasks.filter((t) => past7Days.includes(t.date));
    const completedTasks = recentTasks.filter((t) => t.status === 'completed');
    const taskRate = recentTasks.length > 0 ? Math.round((completedTasks.length / recentTasks.length) * 100) : 0;

    // 2. Hybrid athletic training compliance & sprint safety
    const recentWorkouts = workoutSessions.filter((w) => past7Days.includes(w.date));
    const completedWorkouts = recentWorkouts.filter((w) => w.completed);
    const sprintCount = recentWorkouts.filter((w) => w.workoutType === 'sprint_lower').length;
    const recentTotalKm = runningRecords
      .filter((r) => past7Days.includes(r.date))
      .reduce((s, r) => s + r.distanceKm, 0);

    // 3. Recovery check
    const recentCheckIns = dailyCheckIns.filter((c) => past7Days.includes(c.date));
    const avgSleep =
      recentCheckIns.length > 0
        ? recentCheckIns.reduce((s, c) => s + c.sleepHours, 0) / recentCheckIns.length
        : 7.5;
    const avgSoreness =
      recentCheckIns.length > 0
        ? recentCheckIns.reduce((s, c) => s + c.muscleSoreness, 0) / recentCheckIns.length
        : 2;

    // 4. Learning & Coding Focus
    const focusMins = focusSessions
      .filter((f) => past7Days.includes(f.date))
      .reduce((s, f) => s + f.durationMinutes, 0);
    const learnMins = learningLogs
      .filter((l) => past7Days.includes(l.date))
      .reduce((s, l) => s + l.durationMinutes, 0);
    const totalFocusMinutes = focusMins + learnMins;

    // 5. Unfinished / Lagging Goals
    const activeGoals = goals.filter((g) => g.status === 'active');
    const laggingGoals = activeGoals.filter((g) => {
      const completedMilestones = g.milestones.filter((m) => m.completed).length;
      return g.milestones.length > 0 && completedMilestones === 0;
    });

    // 6. Synthesis Recommendations
    const recommendations: string[] = [];

    if (sprintCount > 1) {
      recommendations.push(
        'Sprint volume is above the recommended 1 session/wk baseline. Ensure hamstrings and Achilles tendons are granted 72+ hours of recovery before intense speed work.'
      );
    } else {
      recommendations.push(
        'Sprint frequency is safely locked at 1 session/wk. High neuromuscular quality maintained.'
      );
    }

    if (avgSleep < 7.0) {
      recommendations.push(
        `Average sleep over the past 7 days is ${avgSleep.toFixed(1)} hrs. Increase bedtime consistency to preserve hormone balance and avoid chronic fatigue.`
      );
    }

    if (totalFocusMinutes < 180) {
      recommendations.push(
        'Deep coding & study hours fell below 3 hours this week. Schedule a 45-minute distraction-free LeetCode or architecture block tomorrow.'
      );
    } else {
      recommendations.push(
        `Consistent cognitive output: ${formatMinutesToHours(totalFocusMinutes)} of deep study logged this week.`
      );
    }

    return {
      taskRate,
      completedWorkoutsCount: completedWorkouts.length,
      recentTotalKm: Math.round(recentTotalKm * 10) / 10,
      avgSleep: avgSleep.toFixed(1),
      avgSoreness: avgSoreness.toFixed(1),
      totalFocusMinutes,
      laggingGoals,
      recommendations,
    };
  }, [today, tasks, workoutSessions, runningRecords, dailyCheckIns, focusSessions, learningLogs, goals]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-neutral-900 border border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <span>Deterministic Synthesis & AI Personal Coach</span>
            <span aria-hidden="true">·</span>
            <span>Local Grounded Analysis</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400" />
            <span>Weekly Coach Synthesis</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Objective pattern detection across training load, recovery metrics, learning hours, and execution discipline.
          </p>
        </div>
      </div>

      {/* Synthesis Summary Card */}
      <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-800">
          <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-amber-400">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-100">Weekly Performance Retrospective</h3>
            <span className="text-xs text-neutral-400">Computed strictly from real saved records</span>
          </div>
        </div>

        {/* 4 Pillars Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-400 block mb-1">Execution Rate</span>
            <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
              {insights.taskRate}%
            </span>
            <p className="text-[11px] text-neutral-500 mt-1">Daily tasks completed</p>
          </div>

          <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-400 block mb-1">Hybrid Aerobic Base</span>
            <span className="text-lg font-bold font-mono text-cyan-400 tabular-nums">
              {insights.recentTotalKm} km
            </span>
            <p className="text-[11px] text-neutral-500 mt-1">{insights.completedWorkoutsCount} workouts finished</p>
          </div>

          <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-400 block mb-1">Sleep & Soreness</span>
            <span className="text-lg font-bold font-mono text-indigo-400 tabular-nums">
              {insights.avgSleep}h avg
            </span>
            <p className="text-[11px] text-neutral-500 mt-1">Soreness: {insights.avgSoreness}/5</p>
          </div>

          <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-400 block mb-1">Technical Deep Work</span>
            <span className="text-lg font-bold font-mono text-neutral-100 tabular-nums">
              {formatMinutesToHours(insights.totalFocusMinutes)}
            </span>
            <p className="text-[11px] text-neutral-500 mt-1">Coding & learning logged</p>
          </div>
        </div>

        {/* Actionable Strategic Recommendations */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
            <Lightbulb size={13} className="text-amber-400" />
            <span>Coach Action Points & Adjustments</span>
          </h4>

          <div className="space-y-2 text-xs">
            {insights.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 text-neutral-300 flex items-start gap-2.5"
              >
                <span className="text-amber-400 font-bold shrink-0 mt-0.5">0{idx + 1}.</span>
                <span className="leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lagging Goals Attention */}
        {insights.laggingGoals.length > 0 && (
          <div className="pt-4 border-t border-neutral-800 space-y-2">
            <span className="text-xs font-semibold text-neutral-400">Goals needing momentum:</span>
            <div className="space-y-1.5 text-xs">
              {insights.laggingGoals.map((g) => (
                <div
                  key={g.id}
                  className="p-2.5 rounded bg-neutral-950 border border-neutral-800 flex justify-between items-center text-neutral-300"
                >
                  <span className="font-medium truncate">{g.title}</span>
                  <span className="text-[11px] font-mono text-neutral-500 uppercase">{g.category}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
