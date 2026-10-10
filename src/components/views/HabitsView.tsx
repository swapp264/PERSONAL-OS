import React, { useState, useMemo } from 'react';
import {
  Flame,
  CheckCircle2,
  Circle,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Award,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { Habit, HabitFrequency } from '../../types/index.ts';
import {
  getTodayDateString,
  getWeekDates,
  formatDateDisplay,
  getDayOfWeekIndex,
  addDays,
} from '../../utils/dateUtils.ts';

export const HabitsView: React.FC = () => {
  const {
    habits,
    habitLogs,
    addHabit,
    updateHabit,
    toggleHabitLog,
    getHabitStreak,
  } = useApp();

  const today = getTodayDateString();
  const weekDates = useMemo(() => getWeekDates(today), [today]);

  // Last 14 days for mini heatmap
  const last14Days = useMemo(() => {
    const list: string[] = [];
    for (let i = 13; i >= 0; i--) {
      list.push(addDays(today, -i));
    }
    return list;
  }, [today]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Fitness');
  const [formFrequency, setFormFrequency] = useState<HabitFrequency>('daily');
  const [formWeeklyTarget, setFormWeeklyTarget] = useState('7');
  const [formScheduledDays, setFormScheduledDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [formTimeOfDay, setFormTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'any'>('morning');

  const handleOpenNew = () => {
    setIsModalOpen(true);
    setEditingHabitId(null);
    setFormName('');
    setFormDescription('');
    setFormCategory('Fitness');
    setFormFrequency('daily');
    setFormWeeklyTarget('7');
    setFormScheduledDays([0, 1, 2, 3, 4, 5, 6]);
    setFormTimeOfDay('morning');
  };

  const handleEdit = (habit: Habit) => {
    setIsModalOpen(true);
    setEditingHabitId(habit.id);
    setFormName(habit.name);
    setFormDescription(habit.description || '');
    setFormCategory(habit.category);
    setFormFrequency(habit.frequency);
    setFormWeeklyTarget(String(habit.weeklyTargetDays));
    setFormScheduledDays(habit.scheduledDays || [0, 1, 2, 3, 4, 5, 6]);
    setFormTimeOfDay(habit.preferredTimeOfDay || 'morning');
  };

  const handleSaveHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingHabitId) {
      await updateHabit(editingHabitId, {
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        category: formCategory,
        frequency: formFrequency,
        weeklyTargetDays: parseInt(formWeeklyTarget) || 7,
        scheduledDays: formScheduledDays,
        preferredTimeOfDay: formTimeOfDay,
      });
    } else {
      await addHabit({
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        category: formCategory,
        frequency: formFrequency,
        weeklyTargetDays: parseInt(formWeeklyTarget) || 7,
        scheduledDays: formScheduledDays,
        preferredTimeOfDay: formTimeOfDay,
        startDate: today,
      });
    }
    setIsModalOpen(false);
  };

  const toggleDaySelection = (dayIdx: number) => {
    setFormScheduledDays((prev) =>
      prev.includes(dayIdx) ? prev.filter((d) => d !== dayIdx) : [...prev, dayIdx].sort()
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-neutral-900 border border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <span>Daily Discipline & Routines</span>
            <span aria-hidden="true">·</span>
            <span>Unbroken Consistency</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-100">
            Habit Tracker & Consistency Heatmaps
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Rest days never break your streak. Built for long-term athletic and cognitive adaptation.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-950 hover:bg-white flex items-center gap-1.5 shadow-xs"
        >
          <Plus size={13} />
          <span>New Habit</span>
        </button>
      </div>

      {/* Week Overview Grid */}
      <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <h3 className="text-sm font-bold text-neutral-100">Current Week Checklist</h3>
          <span className="text-xs font-mono text-neutral-500">
            Mon {weekDates[0].slice(5)} – Sun {weekDates[6].slice(5)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 font-medium pb-2">
                <th className="py-2 pl-2">Habit</th>
                <th className="py-2">Streak</th>
                {weekDates.map((wDate) => {
                  const isCurrentDay = wDate === today;
                  return (
                    <th
                      key={wDate}
                      className={`py-2 text-center font-mono ${
                        isCurrentDay ? 'text-amber-400 font-bold' : ''
                      }`}
                    >
                      {formatDateDisplay(wDate, { short: true }).split(' ')[0]}
                      <div className="text-[10px] text-neutral-500 font-normal">
                        {wDate.slice(8)}
                      </div>
                    </th>
                  );
                })}
                <th className="py-2 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {habits.map((habit) => {
                const streak = getHabitStreak(habit.id);

                return (
                  <tr key={habit.id} className="hover:bg-neutral-800/40 font-sans transition-colors">
                    <td className="py-3 pl-2 max-w-[200px]">
                      <div className="font-semibold text-neutral-200 truncate">{habit.name}</div>
                      <div className="text-[11px] text-neutral-500 flex items-center gap-1">
                        <span>{habit.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{habit.preferredTimeOfDay || 'Anytime'}</span>
                      </div>
                    </td>

                    <td className="py-3 whitespace-nowrap font-mono tabular-nums">
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Flame size={13} className="text-orange-500" />
                        {streak.currentStreak}d
                      </span>
                    </td>

                    {/* 7 Days check buttons */}
                    {weekDates.map((wDate) => {
                      const dayIdx = getDayOfWeekIndex(wDate);
                      const isScheduled = habit.scheduledDays.includes(dayIdx);
                      const log = habitLogs.find((l) => l.habitId === habit.id && l.date === wDate);
                      const isDone = !!log?.completed;

                      return (
                        <td key={wDate} className="py-3 text-center">
                          {isScheduled ? (
                            <button
                              onClick={() => toggleHabitLog(habit.id, wDate)}
                              title={`${habit.name} on ${wDate}`}
                              className="p-1 text-neutral-400 hover:text-white transition-colors"
                            >
                              {isDone ? (
                                <CheckCircle2 size={16} className="text-emerald-400 mx-auto" />
                              ) : (
                                <Circle size={16} className="text-neutral-700 hover:text-neutral-500 mx-auto" />
                              )}
                            </button>
                          ) : (
                            <span className="text-[10px] text-neutral-700 font-mono">rest</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-3 pr-2 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(habit)}
                        className="p-1 rounded text-neutral-500 hover:text-neutral-200"
                      >
                        <Edit2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 14-Day Consistency Heatmap Grid */}
      <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
          <TrendingUp size={14} className="text-neutral-400" />
          <span>14-Day Consistency Matrix</span>
        </h3>

        <div className="space-y-3">
          {habits.map((habit) => {
            const streak = getHabitStreak(habit.id);

            return (
              <div
                key={habit.id}
                className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-[180px]">
                  <span className="font-semibold text-neutral-200">{habit.name}</span>
                  <div className="text-[11px] text-neutral-500 font-mono">
                    Best: {streak.bestStreak}d · Target: {habit.weeklyTargetDays}d/wk
                  </div>
                </div>

                {/* 14 blocks */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {last14Days.map((dateStr) => {
                    const log = habitLogs.find((l) => l.habitId === habit.id && l.date === dateStr);
                    const isDone = !!log?.completed;
                    const dayIdx = getDayOfWeekIndex(dateStr);
                    const isScheduled = habit.scheduledDays.includes(dayIdx);

                    return (
                      <div
                        key={dateStr}
                        title={`${dateStr}: ${isDone ? 'Completed' : isScheduled ? 'Missed' : 'Rest day'}`}
                        className={`w-5 h-5 rounded-xs flex items-center justify-center font-mono text-[9px] ${
                          isDone
                            ? 'bg-emerald-500 text-neutral-950 font-bold'
                            : isScheduled
                            ? 'bg-neutral-800 text-neutral-500'
                            : 'bg-neutral-900 text-neutral-700'
                        }`}
                      >
                        {dateStr.slice(8)}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: New / Edit Habit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-neutral-100 mb-3">
              {editingHabitId ? 'Edit Habit' : 'Create Recurring Habit'}
            </h3>

            <form onSubmit={handleSaveHabit} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Habit Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. 40-minute zone 2 run or 3L water"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Description / Cue</label>
                <input
                  type="text"
                  placeholder="e.g. After morning coffee, put on shoes"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Category</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-200"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Time of Day</label>
                  <select
                    value={formTimeOfDay}
                    onChange={(e) => setFormTimeOfDay(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-200"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="any">Anytime</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Scheduled Days</label>
                <div className="flex items-center gap-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dName, idx) => {
                    const isSelected = formScheduledDays.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleDaySelection(idx)}
                        className={`flex-1 py-1 rounded text-center font-mono text-[11px] ${
                          isSelected
                            ? 'bg-neutral-100 text-neutral-950 font-bold'
                            : 'bg-neutral-950 text-neutral-500'
                        }`}
                      >
                        {dName}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-100 text-neutral-950 rounded font-medium hover:bg-white"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
