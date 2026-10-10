import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  CalendarCheck,
  Dumbbell,
  Salad,
  IndianRupee,
  Clock,
  BookOpen,
  HeartPulse,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { VEGETARIAN_FOOD_DATABASE } from '../../db/index.ts';
import { getTodayDateString } from '../../utils/dateUtils.ts';
import { parseRupeesToPaise } from '../../utils/formatters.ts';
import {
  TaskCategory,
  TaskPriority,
  TimeOfDay,
  MealCategory,
  TransactionType,
  PaymentMethod,
} from '../../types/index.ts';

export const QuickActionModal: React.FC = () => {
  const {
    quickModalType,
    closeQuickModal,
    openQuickModal,
    addTask,
    addFoodEntry,
    addTransaction,
    startFocusTimer,
    skills,
    expenseCategories,
    saveDailyCheckIn,
    addJournalEntry,
  } = useApp();

  const today = getTodayDateString();

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('coding');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskTimeOfDay, setTaskTimeOfDay] = useState<TimeOfDay>('morning');
  const [taskDuration, setTaskDuration] = useState('30');

  // Meal form state
  const [mealCategory, setMealCategory] = useState<MealCategory>('lunch');
  const [foodName, setFoodName] = useState('');
  const [foodQuantity, setFoodQuantity] = useState('1');
  const [foodUnit, setFoodUnit] = useState('serving');
  const [calories, setCalories] = useState('200');
  const [protein, setProtein] = useState('15');
  const [carbs, setCarbs] = useState('25');
  const [fat, setFat] = useState('5');

  // Expense form state
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txTitle, setTxTitle] = useState('');
  const [txCategory, setTxCategory] = useState(expenseCategories[0]?.id || 'cat-food');
  const [txPaymentMethod, setTxPaymentMethod] = useState<PaymentMethod>('upi');

  // Focus timer state
  const [focusSkillId, setFocusSkillId] = useState(skills[0]?.id || '');
  const [focusDuration, setFocusDuration] = useState('25');
  const [focusMode, setFocusMode] = useState<'countdown' | 'stopwatch'>('countdown');

  // Sleep / Recovery state
  const [sleepHours, setSleepHours] = useState('7.5');
  const [sleepQuality, setSleepQuality] = useState(4);
  const [moodRating, setMoodRating] = useState(4);
  const [energyRating, setEnergyRating] = useState(4);
  const [sorenessRating, setSorenessRating] = useState(2);

  // Journal quick state
  const [journalTitle, setJournalTitle] = useState('Daily Reflection');
  const [journalContent, setJournalContent] = useState('');
  const [journalWins, setJournalWins] = useState('');
  const [journalNext, setJournalNext] = useState('');

  if (!quickModalType) return null;

  // Handlers
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    await addTask({
      title: taskTitle.trim(),
      category: taskCategory,
      priority: taskPriority,
      status: 'planned',
      date: today,
      timeOfDay: taskTimeOfDay,
      estimatedDuration: parseInt(taskDuration) || 30,
    });
    setTaskTitle('');
    closeQuickModal();
  };

  const handleCreateMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    await addFoodEntry({
      date: today,
      time,
      name: foodName.trim(),
      mealCategory,
      quantity: parseFloat(foodQuantity) || 1,
      unit: foodUnit,
      calories: parseFloat(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
    });
    setFoodName('');
    closeQuickModal();
  };

  const handleSelectPresetFood = (item: (typeof VEGETARIAN_FOOD_DATABASE)[0]) => {
    setFoodName(item.name);
    setFoodQuantity(String(item.quantity));
    setFoodUnit(item.unit);
    setCalories(String(item.calories));
    setProtein(String(item.protein));
    setCarbs(String(item.carbs));
    setFat(String(item.fat));
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || !txTitle.trim()) return;
    const amountPaise = parseRupeesToPaise(txAmount);
    if (amountPaise <= 0) return;

    await addTransaction({
      type: txType,
      amountPaise,
      title: txTitle.trim(),
      categoryId: txCategory,
      date: today,
      paymentMethod: txPaymentMethod,
    });
    setTxAmount('');
    setTxTitle('');
    closeQuickModal();
  };

  const handleStartFocus = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedSkill = skills.find((s) => s.id === focusSkillId);
    startFocusTimer({
      skillId: focusSkillId || undefined,
      skillName: selectedSkill ? selectedSkill.name : 'Focus Session',
      durationMinutes: parseInt(focusDuration) || 25,
      mode: focusMode,
    });
    closeQuickModal();
  };

  const handleSaveRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveDailyCheckIn({
      date: today,
      sleepHours: parseFloat(sleepHours) || 7.5,
      sleepQuality,
      mood: moodRating,
      energy: energyRating,
      stress: 2,
      muscleSoreness: sorenessRating,
      motivation: 4,
    });
    closeQuickModal();
  };

  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalContent.trim() && !journalWins.trim()) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    await addJournalEntry({
      date: today,
      time,
      title: journalTitle || 'Daily Reflection',
      content: journalContent.trim() || 'Quick reflection recorded.',
      moodRating: 4,
      energyRating: 4,
      tags: ['quick-entry'],
      wins: journalWins ? [journalWins.trim()] : [],
      lessons: journalNext ? [`Priority: ${journalNext.trim()}`] : [],
    });
    setJournalContent('');
    closeQuickModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden">
        {/* Header with tabs */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3 bg-neutral-950/60">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => openQuickModal('task')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                quickModalType === 'task' ? 'bg-neutral-800 text-white shadow-xs' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <CalendarCheck size={12} />
              <span>Task</span>
            </button>
            <button
              onClick={() => openQuickModal('meal')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                quickModalType === 'meal' ? 'bg-neutral-800 text-white shadow-xs' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Salad size={12} />
              <span>Meal</span>
            </button>
            <button
              onClick={() => openQuickModal('expense')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                quickModalType === 'expense' ? 'bg-neutral-800 text-white shadow-xs' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <IndianRupee size={12} />
              <span>Expense</span>
            </button>
            <button
              onClick={() => openQuickModal('focus')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                quickModalType === 'focus' ? 'bg-neutral-800 text-white shadow-xs' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Clock size={12} />
              <span>Focus</span>
            </button>
            <button
              onClick={() => openQuickModal('recovery')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                quickModalType === 'recovery' ? 'bg-neutral-800 text-white shadow-xs' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <HeartPulse size={12} />
              <span>Recovery</span>
            </button>
            <button
              onClick={() => openQuickModal('journal')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                quickModalType === 'journal' ? 'bg-neutral-800 text-white shadow-xs' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <BookOpen size={12} />
              <span>Journal</span>
            </button>
          </div>
          <button
            onClick={closeQuickModal}
            className="p-1 text-neutral-400 hover:text-white rounded-md transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[75vh] overflow-y-auto">
          {/* TASK FORM */}
          {quickModalType === 'task' && (
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">Task Title</label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. 5x40m Acceleration Sprints with full recovery"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-md text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden focus:border-neutral-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Category</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as TaskCategory)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-md text-xs text-neutral-200"
                  >
                    <option value="fitness">Fitness / Workout</option>
                    <option value="coding">Coding / Tech</option>
                    <option value="studies">Studies / Academics</option>
                    <option value="career">Career / Work</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-md text-xs text-neutral-200"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Section</label>
                  <select
                    value={taskTimeOfDay}
                    onChange={(e) => setTaskTimeOfDay(e.target.value as TimeOfDay)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-md text-xs text-neutral-200"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={taskDuration}
                    onChange={(e) => setTaskDuration(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-md text-xs text-neutral-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={closeQuickModal}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!taskTitle.trim()}
                  className="px-4 py-1.5 text-xs font-medium bg-neutral-100 text-neutral-950 rounded-md hover:bg-white disabled:opacity-50"
                >
                  Create Task
                </button>
              </div>
            </form>
          )}

          {/* MEAL FORM */}
          {quickModalType === 'meal' && (
            <form onSubmit={handleCreateMeal} className="space-y-4">
              <div className="flex items-center gap-1.5 p-1 bg-neutral-950 rounded-md border border-neutral-800">
                {(['breakfast', 'lunch', 'snacks', 'dinner'] as MealCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMealCategory(cat)}
                    className={`flex-1 py-1 text-xs font-medium capitalize rounded-xs transition-colors ${
                      mealCategory === cat ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Vegetarian Quick Presets */}
              <div>
                <span className="text-[11px] text-neutral-400 block mb-1">Quick Select Indian Vegetarian Staples:</span>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-neutral-950/60 rounded border border-neutral-800 text-[11px]">
                  {VEGETARIAN_FOOD_DATABASE.slice(0, 8).map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPresetFood(item)}
                      className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-[11px] truncate"
                    >
                      {item.name.split('(')[0].trim()} ({item.protein}g P)
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Food Name</label>
                <input
                  type="text"
                  placeholder="e.g. 100g Paneer + 2 Plain Roti"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-md text-xs text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Calories</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full px-2 py-1 bg-neutral-950 border border-neutral-700 rounded text-xs text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-emerald-400 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="w-full px-2 py-1 bg-neutral-950 border border-neutral-700 rounded text-xs text-center text-emerald-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className="w-full px-2 py-1 bg-neutral-950 border border-neutral-700 rounded text-xs text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Fat (g)</label>
                  <input
                    type="number"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    className="w-full px-2 py-1 bg-neutral-950 border border-neutral-700 rounded text-xs text-center"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={closeQuickModal}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!foodName.trim()}
                  className="px-4 py-1.5 text-xs font-medium bg-neutral-100 text-neutral-950 rounded-md hover:bg-white disabled:opacity-50"
                >
                  Log Food Entry
                </button>
              </div>
            </form>
          )}

          {/* EXPENSE FORM */}
          {quickModalType === 'expense' && (
            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div className="flex items-center gap-1.5 p-1 bg-neutral-950 rounded-md border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`flex-1 py-1 text-xs font-medium rounded-xs transition-colors ${
                    txType === 'expense' ? 'bg-rose-950/80 text-rose-300 border border-rose-800/50' : 'text-neutral-400'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  className={`flex-1 py-1 text-xs font-medium rounded-xs transition-colors ${
                    txType === 'income' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50' : 'text-neutral-400'
                  }`}
                >
                  Income
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Amount (₹ INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm text-neutral-400 font-mono">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    autoFocus
                    placeholder="0.00"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-neutral-950 border border-neutral-700 rounded-md text-base font-mono font-medium text-neutral-100 placeholder:text-neutral-600 focus:outline-hidden focus:border-neutral-500 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Description / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Groceries at local store, Running socks, Books"
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-md text-xs text-neutral-100 placeholder:text-neutral-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Category</label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-md text-xs text-neutral-200"
                  >
                    {expenseCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Payment Method</label>
                  <select
                    value={txPaymentMethod}
                    onChange={(e) => setTxPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-md text-xs text-neutral-200"
                  >
                    <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="cash">Cash</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="bank_transfer">Net Banking / Transfer</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={closeQuickModal}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!txAmount || !txTitle.trim()}
                  className="px-4 py-1.5 text-xs font-medium bg-neutral-100 text-neutral-950 rounded-md hover:bg-white disabled:opacity-50"
                >
                  Record Transaction
                </button>
              </div>
            </form>
          )}

          {/* FOCUS TIMER FORM */}
          {quickModalType === 'focus' && (
            <form onSubmit={handleStartFocus} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Focus Skill / Topic</label>
                <select
                  value={focusSkillId}
                  onChange={(e) => setFocusSkillId(e.target.value)}
                  className="w-full px-2.5 py-2 bg-neutral-950 border border-neutral-700 rounded-md text-xs text-neutral-200"
                >
                  {skills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                  <option value="">General Focus / Deep Work</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Session Mode</label>
                  <select
                    value={focusMode}
                    onChange={(e) => setFocusMode(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-md text-xs text-neutral-200"
                  >
                    <option value="countdown">Countdown Timer</option>
                    <option value="stopwatch">Open Stopwatch</option>
                  </select>
                </div>
                {focusMode === 'countdown' && (
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Duration (min)</label>
                    <select
                      value={focusDuration}
                      onChange={(e) => setFocusDuration(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded-md text-xs text-neutral-200 font-mono"
                    >
                      <option value="25">25 min (Standard Pomodoro)</option>
                      <option value="45">45 min (Deep Block)</option>
                      <option value="60">60 min (Full Hour)</option>
                      <option value="90">90 min (Ultradian Cycle)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={closeQuickModal}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-neutral-100 text-neutral-950 rounded-md hover:bg-white"
                >
                  Start Focus Timer
                </button>
              </div>
            </form>
          )}

          {/* RECOVERY CHECK-IN */}
          {quickModalType === 'recovery' && (
            <form onSubmit={handleSaveRecovery} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Sleep Duration</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.25"
                      min="3"
                      max="14"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value)}
                      className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-md text-xs font-mono tabular-nums"
                    />
                    <span className="text-xs text-neutral-400">hours</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Sleep Quality (1-5)</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSleepQuality(num)}
                        className={`flex-1 py-1 rounded text-xs font-mono ${
                          sleepQuality === num ? 'bg-neutral-100 text-neutral-950 font-bold' : 'bg-neutral-950 text-neutral-400'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Mood (1-5)</label>
                  <select
                    value={moodRating}
                    onChange={(e) => setMoodRating(Number(e.target.value))}
                    className="w-full px-2 py-1 bg-neutral-950 border border-neutral-700 rounded text-xs"
                  >
                    <option value={1}>1 - Low / Depleted</option>
                    <option value={2}>2 - Subdued</option>
                    <option value={3}>3 - Neutral</option>
                    <option value={4}>4 - Good</option>
                    <option value={5}>5 - Excellent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Energy (1-5)</label>
                  <select
                    value={energyRating}
                    onChange={(e) => setEnergyRating(Number(e.target.value))}
                    className="w-full px-2 py-1 bg-neutral-950 border border-neutral-700 rounded text-xs"
                  >
                    <option value={1}>1 - Exhausted</option>
                    <option value={2}>2 - Tired</option>
                    <option value={3}>3 - Moderate</option>
                    <option value={4}>4 - High</option>
                    <option value={5}>5 - Peaking</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Soreness (1-5)</label>
                  <select
                    value={sorenessRating}
                    onChange={(e) => setSorenessRating(Number(e.target.value))}
                    className="w-full px-2 py-1 bg-neutral-950 border border-neutral-700 rounded text-xs"
                  >
                    <option value={1}>1 - None</option>
                    <option value={2}>2 - Light</option>
                    <option value={3}>3 - Moderate</option>
                    <option value={4}>4 - Heavy DOMS</option>
                    <option value={5}>5 - Very Sore</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={closeQuickModal}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-neutral-100 text-neutral-950 rounded-md hover:bg-white"
                >
                  Save Check-in
                </button>
              </div>
            </form>
          )}

          {/* JOURNAL & DAILY REVIEW */}
          {quickModalType === 'journal' && (
            <form onSubmit={handleSaveJournal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Entry Title</label>
                <input
                  type="text"
                  value={journalTitle}
                  onChange={(e) => setJournalTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-md text-xs text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">What went well today? (Wins)</label>
                <input
                  type="text"
                  placeholder="e.g. Strict pace on Tuesday run, finished BFS leetcode problem cleanly"
                  value={journalWins}
                  onChange={(e) => setJournalWins(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-md text-xs text-neutral-100 placeholder:text-neutral-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Reflection / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Thoughts on training, focus level, diet, or challenges..."
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-md text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Top priority for tomorrow</label>
                <input
                  type="text"
                  placeholder="e.g. Upper body push/pull workout at 7 AM"
                  value={journalNext}
                  onChange={(e) => setJournalNext(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-md text-xs text-neutral-100 placeholder:text-neutral-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={closeQuickModal}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-neutral-100 text-neutral-950 rounded-md hover:bg-white"
                >
                  Save Journal Entry
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
