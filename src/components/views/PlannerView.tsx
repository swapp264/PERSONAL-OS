import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ArrowRight,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  RotateCcw,
  CalendarCheck2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Task,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  TimeOfDay,
} from '../../types/index.ts';
import {
  getTodayDateString,
  formatDateDisplay,
  addDays,
  getWeekDates,
} from '../../utils/dateUtils.ts';

export const PlannerView: React.FC = () => {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    carryForwardUnfinishedTasks,
    goals,
    projects,
  } = useApp();

  const today = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [plannerMode, setPlannerMode] = useState<'daily' | 'weekly'>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // New / Edit task state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<TaskCategory>('coding');
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium');
  const [formTimeOfDay, setFormTimeOfDay] = useState<TimeOfDay>('morning');
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndTime, setFormEndTime] = useState('10:00');
  const [formDuration, setFormDuration] = useState('60');
  const [formGoalId, setFormGoalId] = useState('');
  const [formProjectId, setFormProjectId] = useState('');

  // Weekly dates
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  // Tasks for selected date
  const dayTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.date !== selectedDate) return false;
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      return true;
    });
  }, [tasks, selectedDate, searchQuery, categoryFilter, priorityFilter]);

  // Overdue count from past days
  const overdueTasks = useMemo(() => {
    return tasks.filter((t) => t.date < today && t.status !== 'completed' && t.status !== 'cancelled');
  }, [tasks, today]);

  // Overlap detection for time-blocked tasks
  const overlappingTaskIds = useMemo(() => {
    const timedTasks = dayTasks.filter((t) => t.startTime && t.endTime);
    const conflicts = new Set<string>();

    for (let i = 0; i < timedTasks.length; i++) {
      for (let j = i + 1; j < timedTasks.length; j++) {
        const a = timedTasks[i];
        const b = timedTasks[j];
        if (a.startTime! < b.endTime! && b.startTime! < a.endTime!) {
          conflicts.add(a.id);
          conflicts.add(b.id);
        }
      }
    }
    return conflicts;
  }, [dayTasks]);

  // Group tasks by time of day
  const morningTasks = dayTasks.filter((t) => t.timeOfDay === 'morning' || (!t.timeOfDay && t.startTime && t.startTime < '12:00'));
  const afternoonTasks = dayTasks.filter((t) => t.timeOfDay === 'afternoon' || (!t.timeOfDay && t.startTime && t.startTime >= '12:00' && t.startTime < '17:00'));
  const eveningTasks = dayTasks.filter((t) => t.timeOfDay === 'evening' || (!t.timeOfDay && t.startTime && t.startTime >= '17:00') || (!t.timeOfDay && !t.startTime));

  const completedCount = dayTasks.filter((t) => t.status === 'completed').length;
  const completionRate = dayTasks.length > 0 ? Math.round((completedCount / dayTasks.length) * 100) : 0;

  const handleOpenNewTask = () => {
    setIsEditing(true);
    setEditingTaskId(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('coding');
    setFormPriority('medium');
    setFormTimeOfDay('morning');
    setFormStartTime('09:00');
    setFormEndTime('10:00');
    setFormDuration('60');
    setFormGoalId('');
    setFormProjectId('');
  };

  const handleEditTask = (task: Task) => {
    setIsEditing(true);
    setEditingTaskId(task.id);
    setFormTitle(task.title);
    setFormDescription(task.description || '');
    setFormCategory(task.category);
    setFormPriority(task.priority);
    setFormTimeOfDay(task.timeOfDay || 'morning');
    setFormStartTime(task.startTime || '09:00');
    setFormEndTime(task.endTime || '10:00');
    setFormDuration(String(task.estimatedDuration || 60));
    setFormGoalId(task.goalId || '');
    setFormProjectId(task.projectId || '');
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTaskId) {
      await updateTask(editingTaskId, {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        category: formCategory,
        priority: formPriority,
        timeOfDay: formTimeOfDay,
        startTime: formStartTime,
        endTime: formEndTime,
        estimatedDuration: parseInt(formDuration) || 60,
        goalId: formGoalId || undefined,
        projectId: formProjectId || undefined,
      });
    } else {
      await addTask({
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        category: formCategory,
        priority: formPriority,
        status: 'planned',
        date: selectedDate,
        timeOfDay: formTimeOfDay,
        startTime: formStartTime,
        endTime: formEndTime,
        estimatedDuration: parseInt(formDuration) || 60,
        goalId: formGoalId || undefined,
        projectId: formProjectId || undefined,
      });
    }

    setIsEditing(false);
  };

  const handlePostponeTask = async (taskId: string) => {
    const nextDate = addDays(selectedDate, 1);
    await updateTask(taskId, { date: nextDate, status: 'postponed' });
  };

  const handleCarryForward = async () => {
    const count = await carryForwardUnfinishedTasks(selectedDate);
    alert(`Carried forward ${count} unfinished past tasks to ${selectedDate}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Day Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-neutral-900 border border-neutral-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <div className="text-xs text-neutral-400">Daily Execution Plan</div>
            <h2 className="text-lg font-bold text-neutral-100">
              {formatDateDisplay(selectedDate, { includeWeekday: true })}
            </h2>
          </div>
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
          {selectedDate !== today && (
            <button
              onClick={() => setSelectedDate(today)}
              className="ml-2 text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
            >
              Today
            </button>
          )}
        </div>

        {/* View Mode & Overdue Carry Forward */}
        <div className="flex items-center gap-3">
          {overdueTasks.length > 0 && (
            <button
              onClick={handleCarryForward}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-amber-950/60 border border-amber-800/80 text-amber-300 hover:bg-amber-900/60 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw size={12} />
              <span>Carry Forward ({overdueTasks.length}) Unfinished</span>
            </button>
          )}

          <div className="flex items-center p-1 bg-neutral-950 rounded-lg border border-neutral-800 text-xs font-medium">
            <button
              onClick={() => setPlannerMode('daily')}
              className={`px-3 py-1 rounded-md transition-colors ${
                plannerMode === 'daily' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setPlannerMode('weekly')}
              className={`px-3 py-1 rounded-md transition-colors ${
                plannerMode === 'weekly' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Weekly
            </button>
          </div>

          <button
            onClick={handleOpenNewTask}
            className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-950 hover:bg-white flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus size={14} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Overlap Conflict Banner */}
      {overlappingTaskIds.size > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-center gap-3 text-xs text-amber-300">
          <AlertTriangle size={16} className="shrink-0 text-amber-400" />
          <div className="flex-1">
            <span className="font-semibold">Schedule Conflict Detected:</span> You have overlapping time blocks scheduled for today. Adjust the start or end times below to resolve.
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-2.5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search tasks by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-md text-neutral-300 text-xs"
          >
            <option value="all">All Categories</option>
            <option value="fitness">Fitness</option>
            <option value="coding">Coding</option>
            <option value="studies">Studies</option>
            <option value="career">Career</option>
            <option value="personal">Personal</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-md text-neutral-300 text-xs"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* WEEKLY VIEW */}
      {plannerMode === 'weekly' ? (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDates.map((wDate) => {
            const wTasks = tasks.filter((t) => t.date === wDate);
            const wCompleted = wTasks.filter((t) => t.status === 'completed').length;
            const isToday = wDate === today;
            const isSelected = wDate === selectedDate;

            return (
              <div
                key={wDate}
                onClick={() => setSelectedDate(wDate)}
                className={`p-3 rounded-xl border cursor-pointer transition-all min-h-[220px] flex flex-col justify-between ${
                  isSelected
                    ? 'bg-neutral-900 border-neutral-600 ring-1 ring-neutral-500'
                    : isToday
                    ? 'bg-neutral-900/80 border-neutral-700'
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-800">
                    <span className={`font-semibold ${isToday ? 'text-amber-400' : 'text-neutral-300'}`}>
                      {formatDateDisplay(wDate, { short: true })}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-500 tabular-nums">
                      {wCompleted}/{wTasks.length}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1.5">
                    {wTasks.slice(0, 4).map((t) => (
                      <div
                        key={t.id}
                        className={`text-[11px] p-1.5 rounded truncate ${
                          t.status === 'completed'
                            ? 'line-through text-neutral-500 bg-neutral-900/50'
                            : 'text-neutral-200 bg-neutral-900 border border-neutral-800/80'
                        }`}
                      >
                        {t.title}
                      </div>
                    ))}
                    {wTasks.length > 4 && (
                      <div className="text-[10px] text-neutral-500 text-center">
                        +{wTasks.length - 4} more
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDate(wDate);
                    handleOpenNewTask();
                  }}
                  className="mt-3 text-[11px] text-neutral-500 hover:text-neutral-300 flex items-center justify-center gap-1 pt-2 border-t border-neutral-800/60"
                >
                  <Plus size={11} />
                  <span>Add</span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* DAILY VIEW WITH TIME-BLOCKING SECTIONS */
        <div className="space-y-6">
          {/* Daily Progress summary */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-neutral-400">Completion:</span>
              <span className="font-mono font-bold text-neutral-100 tabular-nums">
                {completedCount} / {dayTasks.length} ({completionRate}%)
              </span>
            </div>
            <div className="w-48 bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-neutral-200 h-full rounded-full transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          {/* Morning Section */}
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">Morning</span>
                <span className="text-xs text-neutral-500">·</span>
                <span className="text-xs text-neutral-400">06:00 – 12:00</span>
              </div>
              <span className="text-xs font-mono text-neutral-500">{morningTasks.length} tasks</span>
            </div>
            {renderTaskList(morningTasks)}
          </div>

          {/* Afternoon Section */}
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">Afternoon</span>
                <span className="text-xs text-neutral-500">·</span>
                <span className="text-xs text-neutral-400">12:00 – 17:00</span>
              </div>
              <span className="text-xs font-mono text-neutral-500">{afternoonTasks.length} tasks</span>
            </div>
            {renderTaskList(afternoonTasks)}
          </div>

          {/* Evening Section */}
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">Evening & Wind-Down</span>
                <span className="text-xs text-neutral-500">·</span>
                <span className="text-xs text-neutral-400">17:00 onwards</span>
              </div>
              <span className="text-xs font-mono text-neutral-500">{eveningTasks.length} tasks</span>
            </div>
            {renderTaskList(eveningTasks)}
          </div>
        </div>
      )}

      {/* Task Edit / Create Drawer/Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-neutral-100 mb-4">
              {editingTaskId ? 'Edit Task' : 'New Planned Task'}
            </h3>

            <form onSubmit={handleSaveTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Title</label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Task title..."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-md text-sm text-neutral-100 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Optional details or instructions..."
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-md text-neutral-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as TaskCategory)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-md text-neutral-200"
                  >
                    <option value="fitness">Fitness</option>
                    <option value="coding">Coding</option>
                    <option value="studies">Studies</option>
                    <option value="career">Career</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-md text-neutral-200"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Time Block</label>
                  <select
                    value={formTimeOfDay}
                    onChange={(e) => setFormTimeOfDay(e.target.value as TimeOfDay)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-md text-neutral-200"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-2 py-1.5 bg-neutral-950 border border-neutral-700 rounded-md text-neutral-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-2 py-1.5 bg-neutral-950 border border-neutral-700 rounded-md text-neutral-200 font-mono"
                  />
                </div>
              </div>

              {/* Linked Goal or Project */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Link to Goal (Optional)</label>
                  <select
                    value={formGoalId}
                    onChange={(e) => setFormGoalId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-md text-neutral-200"
                  >
                    <option value="">None</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Link to Project (Optional)</label>
                  <select
                    value={formProjectId}
                    onChange={(e) => setFormProjectId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-md text-neutral-200"
                  >
                    <option value="">None</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-100 text-neutral-950 rounded-md font-medium hover:bg-white"
                >
                  {editingTaskId ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  function renderTaskList(list: Task[]) {
    if (list.length === 0) {
      return (
        <div className="py-3 text-center text-xs text-neutral-500">
          No tasks scheduled for this section.
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {list.map((task) => {
          const isDone = task.status === 'completed';
          const hasConflict = overlappingTaskIds.has(task.id);

          return (
            <div
              key={task.id}
              className={`flex items-start justify-between gap-3 p-3 rounded-lg border transition-all ${
                isDone
                  ? 'bg-neutral-950/40 border-neutral-800/60 opacity-60'
                  : hasConflict
                  ? 'bg-amber-950/20 border-amber-800/60'
                  : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  onClick={() => toggleTaskComplete(task.id)}
                  className="mt-0.5 text-neutral-400 hover:text-neutral-100 transition-colors shrink-0"
                >
                  {isDone ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : (
                    <Circle size={16} />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-xs font-medium tracking-tight ${
                        isDone ? 'line-through text-neutral-400' : 'text-neutral-100'
                      }`}
                    >
                      {task.title}
                    </p>
                    {hasConflict && (
                      <span className="text-[10px] text-amber-400 flex items-center gap-1 font-mono">
                        <AlertTriangle size={11} /> Overlap
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{task.description}</p>
                  )}

                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-neutral-500">
                    <span className="capitalize">{task.category}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`capitalize ${
                        task.priority === 'high' ? 'text-rose-400' : task.priority === 'medium' ? 'text-amber-400' : ''
                      }`}
                    >
                      {task.priority}
                    </span>
                    {task.startTime && task.endTime && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums text-neutral-400">
                          {task.startTime} - {task.endTime}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {!isDone && (
                  <button
                    onClick={() => handlePostponeTask(task.id)}
                    title="Postpone to tomorrow"
                    className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
                  >
                    <ArrowRight size={13} />
                  </button>
                )}
                <button
                  onClick={() => handleEditTask(task)}
                  title="Edit task"
                  className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  title="Delete task"
                  className="p-1 rounded text-neutral-400 hover:text-rose-400 hover:bg-neutral-800"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
};
