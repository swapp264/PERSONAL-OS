import React, { useState } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  Circle,
  TrendingUp,
  Award,
  Calendar,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { Goal, GoalCategory, Milestone } from '../../types/index.ts';
import { getTodayDateString, formatDateDisplay } from '../../utils/dateUtils.ts';

export const GoalsView: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useApp();
  const today = getTodayDateString();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<GoalCategory>('strength');
  const [formDescription, setFormDescription] = useState('');
  const [formDeadline, setFormDeadline] = useState('2026-12-31');
  const [formTargetValue, setFormTargetValue] = useState('');
  const [formCurrentValue, setFormCurrentValue] = useState('');
  const [formUnit, setFormUnit] = useState('reps');
  const [formMilestonesText, setFormMilestonesText] = useState('');

  const filteredGoals = goals.filter((g) => {
    if (categoryFilter !== 'all' && g.category !== categoryFilter) return false;
    return true;
  });

  const handleOpenNew = () => {
    setIsModalOpen(true);
    setEditingGoalId(null);
    setFormTitle('');
    setFormCategory('strength');
    setFormDescription('');
    setFormDeadline('2026-12-31');
    setFormTargetValue('15');
    setFormCurrentValue('10');
    setFormUnit('reps');
    setFormMilestonesText('10 strict reps, 12 smooth reps, 15 continuous reps');
  };

  const handleEdit = (goal: Goal) => {
    setIsModalOpen(true);
    setEditingGoalId(goal.id);
    setFormTitle(goal.title);
    setFormCategory(goal.category);
    setFormDescription(goal.description || '');
    setFormDeadline(goal.deadline);
    setFormTargetValue(goal.targetValue ? String(goal.targetValue) : '');
    setFormCurrentValue(goal.currentValue ? String(goal.currentValue) : '');
    setFormUnit(goal.unit || '');
    setFormMilestonesText(goal.milestones.map((m) => m.title).join('\n'));
  };

  const handleToggleMilestone = async (goal: Goal, milestoneId: string) => {
    const updatedMilestones = goal.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    const allDone = updatedMilestones.length > 0 && updatedMilestones.every((m) => m.completed);
    await updateGoal(goal.id, {
      milestones: updatedMilestones,
      status: allDone ? 'completed' : 'active',
    });
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const milestones: Milestone[] = formMilestonesText
      .split(/[\n,]/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((title, i) => ({
        id: `ms-${i}-${Date.now()}`,
        title,
        completed: false,
      }));

    if (editingGoalId) {
      await updateGoal(editingGoalId, {
        title: formTitle.trim(),
        category: formCategory,
        description: formDescription.trim() || undefined,
        deadline: formDeadline,
        targetValue: formTargetValue ? parseFloat(formTargetValue) : undefined,
        currentValue: formCurrentValue ? parseFloat(formCurrentValue) : undefined,
        unit: formUnit.trim() || undefined,
        milestones: milestones.length > 0 ? milestones : undefined,
      });
    } else {
      await addGoal({
        title: formTitle.trim(),
        category: formCategory,
        description: formDescription.trim() || undefined,
        startDate: today,
        deadline: formDeadline,
        targetValue: formTargetValue ? parseFloat(formTargetValue) : undefined,
        currentValue: formCurrentValue ? parseFloat(formCurrentValue) : undefined,
        unit: formUnit.trim() || undefined,
        status: 'active',
        milestones,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-neutral-900 border border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <span>Milestones & Long-Term Targets</span>
            <span aria-hidden="true">·</span>
            <span>Outcome Clarity</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-100">
            Goals, Targets & Milestone Tracking
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Measurable fitness, coding, academic, and career targets with milestone decomposition.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-950 hover:bg-white transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus size={13} />
          <span>New Goal</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-neutral-900 rounded-lg border border-neutral-800 text-xs font-medium overflow-x-auto">
        {(['all', 'fitness', 'endurance', 'strength', 'learning', 'career', 'personal'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-md capitalize whitespace-nowrap transition-colors ${
              categoryFilter === cat ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGoals.map((goal) => {
          const completedCount = goal.milestones.filter((m) => m.completed).length;
          const totalCount = goal.milestones.length;
          const pct =
            totalCount > 0
              ? Math.round((completedCount / totalCount) * 100)
              : goal.targetValue && goal.currentValue
              ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
              : 0;

          return (
            <div
              key={goal.id}
              className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-[11px] font-mono uppercase text-amber-400">{goal.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-400">
                      Target: {formatDateDisplay(goal.deadline, { short: true })}
                    </span>
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-1 text-neutral-500 hover:text-neutral-200"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1 text-neutral-500 hover:text-rose-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-neutral-100 mt-2">{goal.title}</h3>
                {goal.description && (
                  <p className="text-xs text-neutral-400 mt-1">{goal.description}</p>
                )}

                {goal.targetValue !== undefined && (
                  <div className="flex items-baseline justify-between mt-3 text-xs">
                    <span className="text-neutral-400">Metric Progress:</span>
                    <span className="font-mono font-bold text-neutral-100 tabular-nums">
                      {goal.currentValue ?? 0} / {goal.targetValue} {goal.unit}
                    </span>
                  </div>
                )}

                <div className="w-full bg-neutral-800 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-neutral-200 h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Milestones Checklist */}
              {goal.milestones.length > 0 && (
                <div className="pt-3 border-t border-neutral-800/80 space-y-1.5">
                  <div className="text-[11px] font-semibold text-neutral-400">
                    Milestones ({completedCount}/{totalCount}):
                  </div>
                  <div className="space-y-1">
                    {goal.milestones.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleToggleMilestone(goal, m.id)}
                        className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-neutral-800/50 text-left text-xs transition-colors"
                      >
                        {m.completed ? (
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                        ) : (
                          <Circle size={14} className="text-neutral-600 shrink-0" />
                        )}
                        <span className={`truncate ${m.completed ? 'line-through text-neutral-500' : 'text-neutral-300'}`}>
                          {m.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD / EDIT GOAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-neutral-100 mb-4">
              {editingGoalId ? 'Edit Goal' : 'Define New Goal'}
            </h3>

            <form onSubmit={handleSaveGoal} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15 strict pull-ups or Sub-23min 5K"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as GoalCategory)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-200"
                  >
                    <option value="fitness">Fitness</option>
                    <option value="endurance">Endurance</option>
                    <option value="strength">Strength</option>
                    <option value="learning">Learning</option>
                    <option value="academics">Academics</option>
                    <option value="career">Career</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Target Deadline</label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Current Value</label>
                  <input
                    type="number"
                    step="any"
                    value={formCurrentValue}
                    onChange={(e) => setFormCurrentValue(e.target.value)}
                    className="w-full px-2 py-1.5 bg-neutral-950 border border-neutral-700 rounded font-mono text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Target Value</label>
                  <input
                    type="number"
                    step="any"
                    value={formTargetValue}
                    onChange={(e) => setFormTargetValue(e.target.value)}
                    className="w-full px-2 py-1.5 bg-neutral-950 border border-neutral-700 rounded font-mono text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="reps, mins, km"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-2 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Milestones (one per line or comma-separated)</label>
                <textarea
                  rows={3}
                  placeholder="Phase 1: 10 reps&#10;Phase 2: 12 reps&#10;Phase 3: 15 reps"
                  value={formMilestonesText}
                  onChange={(e) => setFormMilestonesText(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100"
                />
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
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
