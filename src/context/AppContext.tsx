import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  NavSection,
  Task,
  WorkoutSession,
  RunningRecord,
  SprintSession,
  PersonalRecord,
  FoodEntry,
  WaterEntry,
  ExpenseCategory,
  FinancialTransaction,
  Habit,
  HabitLog,
  Skill,
  FocusSession,
  LearningLog,
  JournalEntry,
  Goal,
  Project,
  KnowledgeNote,
  DailyCheckIn,
  UserSettings,
} from '../types/index.ts';
import { db, initializeDatabaseSeed, DEFAULT_EXPENSE_CATEGORIES } from '../db/index.ts';
import { getTodayDateString, getDayOfWeekIndex, addDays } from '../utils/dateUtils.ts';

export interface ActiveTimerState {
  isActive: boolean;
  isPaused: boolean;
  skillId?: string;
  skillName?: string;
  totalDurationSeconds: number;
  remainingSeconds: number;
  startTime: string; // ISO
  lastTickTimestamp: number;
  mode: 'countdown' | 'stopwatch';
}

interface AppContextType {
  activeSection: NavSection;
  setActiveSection: (sec: NavSection) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (c: boolean) => void;
  toggleSidebar: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  userSettings: UserSettings | null;
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;

  // Data Collections
  tasks: Task[];
  workoutSessions: WorkoutSession[];
  runningRecords: RunningRecord[];
  sprintSessions: SprintSession[];
  personalRecords: PersonalRecord[];
  foodEntries: FoodEntry[];
  waterEntries: WaterEntry[];
  expenseCategories: ExpenseCategory[];
  transactions: FinancialTransaction[];
  habits: Habit[];
  habitLogs: HabitLog[];
  skills: Skill[];
  focusSessions: FocusSession[];
  learningLogs: LearningLog[];
  journalEntries: JournalEntry[];
  goals: Goal[];
  projects: Project[];
  knowledgeNotes: KnowledgeNote[];
  dailyCheckIns: DailyCheckIn[];

  // Task methods
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  carryForwardUnfinishedTasks: (targetDate?: string) => Promise<number>;

  // Fitness methods
  saveWorkoutSession: (session: WorkoutSession) => Promise<void>;
  addRunningRecord: (record: Omit<RunningRecord, 'id' | 'createdAt'>) => Promise<void>;
  deleteRunningRecord: (id: string) => Promise<void>;
  addSprintSession: (session: Omit<SprintSession, 'id' | 'createdAt'>) => Promise<void>;
  addPersonalRecord: (pr: Omit<PersonalRecord, 'id'>) => Promise<void>;
  updatePersonalRecord: (id: string, updates: Partial<PersonalRecord>) => Promise<void>;

  // Nutrition methods
  addFoodEntry: (entry: Omit<FoodEntry, 'id' | 'createdAt'>) => Promise<void>;
  updateFoodEntry: (id: string, updates: Partial<FoodEntry>) => Promise<void>;
  deleteFoodEntry: (id: string) => Promise<void>;
  addWaterEntry: (amountMl: number, date?: string) => Promise<void>;

  // Expense methods
  addTransaction: (tx: Omit<FinancialTransaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTransaction: (id: string, updates: Partial<FinancialTransaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addExpenseCategory: (cat: Omit<ExpenseCategory, 'id'>) => Promise<void>;
  updateExpenseCategory: (id: string, updates: Partial<ExpenseCategory>) => Promise<void>;

  // Habit methods
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  toggleHabitLog: (habitId: string, date: string) => Promise<void>;
  getHabitStreak: (habitId: string) => { currentStreak: number; bestStreak: number };

  // Skill & Focus methods
  addSkill: (skill: Omit<Skill, 'id' | 'createdAt'>) => Promise<void>;
  updateSkill: (id: string, updates: Partial<Skill>) => Promise<void>;
  addLearningLog: (log: Omit<LearningLog, 'id' | 'createdAt'>) => Promise<void>;
  activeTimer: ActiveTimerState;
  startFocusTimer: (options: { skillId?: string; skillName?: string; durationMinutes?: number; mode: 'countdown' | 'stopwatch' }) => void;
  pauseFocusTimer: () => void;
  resumeFocusTimer: () => void;
  finishFocusTimer: (notes?: string) => Promise<void>;
  cancelFocusTimer: () => void;

  // Journal methods
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => Promise<void>;
  deleteJournalEntry: (id: string) => Promise<void>;

  // Goal & Project methods
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addProject: (proj: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addKnowledgeNote: (note: Omit<KnowledgeNote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteKnowledgeNote: (id: string) => Promise<void>;

  // Recovery methods
  saveDailyCheckIn: (checkIn: Omit<DailyCheckIn, 'id' | 'createdAt'>) => Promise<void>;

  // Global Calendar selection
  selectedCalendarDate: string;
  setSelectedCalendarDate: (date: string) => void;

  // Quick Action Modal
  quickModalType: 'task' | 'workout' | 'meal' | 'expense' | 'focus' | 'journal' | 'recovery' | null;
  openQuickModal: (type: 'task' | 'workout' | 'meal' | 'expense' | 'focus' | 'journal' | 'recovery') => void;
  closeQuickModal: () => void;

  // System & Backup
  exportAllDataJSON: () => Promise<string>;
  importDataJSON: (jsonString: string) => Promise<{ success: boolean; message: string; recordCounts?: Record<string, number> }>;
  resetAllData: () => Promise<void>;
  reloadAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const TIMER_STORAGE_KEY = 'personal_os_active_timer_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<NavSection>('today');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(getTodayDateString());
  const [quickModalType, setQuickModalType] = useState<'task' | 'workout' | 'meal' | 'expense' | 'focus' | 'journal' | 'recovery' | null>(null);

  // Core entity lists
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [runningRecords, setRunningRecords] = useState<RunningRecord[]>([]);
  const [sprintSessions, setSprintSessions] = useState<SprintSession[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [learningLogs, setLearningLogs] = useState<LearningLog[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [knowledgeNotes, setKnowledgeNotes] = useState<KnowledgeNote[]>([]);
  const [dailyCheckIns, setDailyCheckIns] = useState<DailyCheckIn[]>([]);

  // Focus timer persisted state
  const [activeTimer, setActiveTimer] = useState<ActiveTimerState>(() => {
    try {
      const stored = localStorage.getItem(TIMER_STORAGE_KEY);
      if (stored) {
        const parsed: ActiveTimerState = JSON.parse(stored);
        if (parsed.isActive && !parsed.isPaused) {
          // Adjust remaining seconds according to real wall-clock elapsed time
          const now = Date.now();
          const elapsedSec = Math.floor((now - (parsed.lastTickTimestamp || now)) / 1000);
          if (parsed.mode === 'countdown') {
            const newRemaining = Math.max(0, parsed.remainingSeconds - elapsedSec);
            return { ...parsed, remainingSeconds: newRemaining, lastTickTimestamp: now };
          } else {
            return { ...parsed, remainingSeconds: parsed.remainingSeconds + elapsedSec, lastTickTimestamp: now };
          }
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return {
      isActive: false,
      isPaused: false,
      totalDurationSeconds: 1500,
      remainingSeconds: 1500,
      startTime: '',
      lastTickTimestamp: Date.now(),
      mode: 'countdown',
    };
  });

  // Save timer to localStorage whenever updated
  useEffect(() => {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(activeTimer));
  }, [activeTimer]);

  // Timer interval
  useEffect(() => {
    if (!activeTimer.isActive || activeTimer.isPaused) return;

    const interval = setInterval(() => {
      setActiveTimer((prev) => {
        if (!prev.isActive || prev.isPaused) return prev;
        const now = Date.now();
        if (prev.mode === 'countdown') {
          if (prev.remainingSeconds <= 1) {
            return {
              ...prev,
              remainingSeconds: 0,
              isActive: false,
              isPaused: false,
              lastTickTimestamp: now,
            };
          }
          return {
            ...prev,
            remainingSeconds: prev.remainingSeconds - 1,
            lastTickTimestamp: now,
          };
        } else {
          // Stopwatch count up
          return {
            ...prev,
            remainingSeconds: prev.remainingSeconds + 1,
            lastTickTimestamp: now,
          };
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer.isActive, activeTimer.isPaused]);

  // Load database and populate states
  const reloadAllData = useCallback(async () => {
    try {
      await initializeDatabaseSeed();

      const [
        loadedSettings,
        loadedTasks,
        loadedWorkouts,
        loadedRuns,
        loadedSprints,
        loadedPRs,
        loadedFoods,
        loadedWater,
        loadedCats,
        loadedTx,
        loadedHabits,
        loadedHabitLogs,
        loadedSkills,
        loadedFocus,
        loadedLearnings,
        loadedJournal,
        loadedGoals,
        loadedProjects,
        loadedNotes,
        loadedCheckIns,
      ] = await Promise.all([
        db.userSettings.get('default'),
        db.tasks.toArray(),
        db.workoutSessions.toArray(),
        db.runningRecords.toArray(),
        db.sprintSessions.toArray(),
        db.personalRecords.toArray(),
        db.foodEntries.toArray(),
        db.waterEntries.toArray(),
        db.expenseCategories.toArray(),
        db.transactions.toArray(),
        db.habits.toArray(),
        db.habitLogs.toArray(),
        db.skills.toArray(),
        db.focusSessions.toArray(),
        db.learningLogs.toArray(),
        db.journalEntries.toArray(),
        db.goals.toArray(),
        db.projects.toArray(),
        db.knowledgeNotes.toArray(),
        db.dailyCheckIns.toArray(),
      ]);

      if (loadedSettings) {
        setUserSettings(loadedSettings);
        setTheme(loadedSettings.theme || 'dark');
        document.documentElement.classList.toggle('dark', loadedSettings.theme !== 'light');
      }

      setTasks(loadedTasks);
      setWorkoutSessions(loadedWorkouts);
      setRunningRecords(loadedRuns);
      setSprintSessions(loadedSprints);
      setPersonalRecords(loadedPRs);
      setFoodEntries(loadedFoods);
      setWaterEntries(loadedWater);
      setExpenseCategories(loadedCats.length ? loadedCats : DEFAULT_EXPENSE_CATEGORIES);
      setTransactions(loadedTx);
      setHabits(loadedHabits);
      setHabitLogs(loadedHabitLogs);
      setSkills(loadedSkills);
      setFocusSessions(loadedFocus);
      setLearningLogs(loadedLearnings);
      setJournalEntries(loadedJournal);
      setGoals(loadedGoals);
      setProjects(loadedProjects);
      setKnowledgeNotes(loadedNotes);
      setDailyCheckIns(loadedCheckIns);
    } catch (err) {
      console.error('Failed to load database:', err);
    }
  }, []);

  useEffect(() => {
    reloadAllData();
  }, [reloadAllData]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      if (userSettings) {
        db.userSettings.update('default', { theme: next });
      }
      return next;
    });
  }, [userSettings]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const updateUserSettings = useCallback(
    async (updates: Partial<UserSettings>) => {
      if (!userSettings) return;
      const updated = { ...userSettings, ...updates };
      await db.userSettings.put(updated);
      setUserSettings(updated);
    },
    [userSettings]
  );

  // ----------------- TASK ACTIONS -----------------
  const addTask = useCallback(
    async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
      const id = `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();
      const newTask: Task = {
        ...taskData,
        id,
        createdAt: now,
        updatedAt: now,
      };
      await db.tasks.add(newTask);
      setTasks((prev) => [...prev, newTask]);
      return id;
    },
    []
  );

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const updatedAt = new Date().toISOString();
    await db.tasks.update(id, { ...updates, updatedAt });
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt } : t)));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await db.tasks.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTaskComplete = useCallback(async (id: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === id);
      if (!target) return prev;
      const nextStatus = target.status === 'completed' ? 'planned' : 'completed';
      const completedAt = nextStatus === 'completed' ? new Date().toISOString() : undefined;
      const updatedAt = new Date().toISOString();

      db.tasks.update(id, { status: nextStatus, completedAt, updatedAt });
      return prev.map((t) => (t.id === id ? { ...t, status: nextStatus, completedAt, updatedAt } : t));
    });
  }, []);

  const carryForwardUnfinishedTasks = useCallback(
    async (targetDate: string = getTodayDateString()) => {
      const today = getTodayDateString();
      const unfinishedPastTasks = tasks.filter((t) => t.date < today && t.status !== 'completed' && t.status !== 'cancelled');

      let carriedCount = 0;
      for (const task of unfinishedPastTasks) {
        await updateTask(task.id, { date: targetDate, status: 'planned' });
        carriedCount++;
      }
      return carriedCount;
    },
    [tasks, updateTask]
  );

  // ----------------- FITNESS ACTIONS -----------------
  const saveWorkoutSession = useCallback(async (session: WorkoutSession) => {
    await db.workoutSessions.put(session);
    setWorkoutSessions((prev) => {
      const idx = prev.findIndex((w) => w.id === session.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = session;
        return copy;
      }
      return [...prev, session];
    });
  }, []);

  const addRunningRecord = useCallback(async (record: Omit<RunningRecord, 'id' | 'createdAt'>) => {
    const id = `run-${Date.now()}`;
    const newRecord: RunningRecord = {
      ...record,
      id,
      createdAt: new Date().toISOString(),
    };
    await db.runningRecords.add(newRecord);
    setRunningRecords((prev) => [newRecord, ...prev]);
  }, []);

  const deleteRunningRecord = useCallback(async (id: string) => {
    await db.runningRecords.delete(id);
    setRunningRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addSprintSession = useCallback(async (session: Omit<SprintSession, 'id' | 'createdAt'>) => {
    const id = `sprint-${Date.now()}`;
    const newSession: SprintSession = {
      ...session,
      id,
      createdAt: new Date().toISOString(),
    };
    await db.sprintSessions.add(newSession);
    setSprintSessions((prev) => [newSession, ...prev]);
  }, []);

  const addPersonalRecord = useCallback(async (pr: Omit<PersonalRecord, 'id'>) => {
    const id = `pr-${Date.now()}`;
    const newPR: PersonalRecord = { ...pr, id };
    await db.personalRecords.add(newPR);
    setPersonalRecords((prev) => [newPR, ...prev]);
  }, []);

  const updatePersonalRecord = useCallback(async (id: string, updates: Partial<PersonalRecord>) => {
    await db.personalRecords.update(id, updates);
    setPersonalRecords((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  // ----------------- NUTRITION ACTIONS -----------------
  const addFoodEntry = useCallback(async (entry: Omit<FoodEntry, 'id' | 'createdAt'>) => {
    const id = `food-${Date.now()}`;
    const newEntry: FoodEntry = {
      ...entry,
      id,
      createdAt: new Date().toISOString(),
    };
    await db.foodEntries.add(newEntry);
    setFoodEntries((prev) => [...prev, newEntry]);
  }, []);

  const updateFoodEntry = useCallback(async (id: string, updates: Partial<FoodEntry>) => {
    await db.foodEntries.update(id, updates);
    setFoodEntries((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  }, []);

  const deleteFoodEntry = useCallback(async (id: string) => {
    await db.foodEntries.delete(id);
    setFoodEntries((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const addWaterEntry = useCallback(async (amountMl: number, date: string = getTodayDateString()) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const id = `water-${Date.now()}`;
    const newEntry: WaterEntry = {
      id,
      date,
      amountMl,
      time,
      createdAt: now.toISOString(),
    };
    await db.waterEntries.add(newEntry);
    setWaterEntries((prev) => [...prev, newEntry]);
  }, []);

  // ----------------- EXPENSE ACTIONS -----------------
  const addTransaction = useCallback(
    async (tx: Omit<FinancialTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
      const id = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();
      const newTx: FinancialTransaction = {
        ...tx,
        id,
        createdAt: now,
        updatedAt: now,
      };
      await db.transactions.add(newTx);
      setTransactions((prev) => [newTx, ...prev]);
      return id;
    },
    []
  );

  const updateTransaction = useCallback(async (id: string, updates: Partial<FinancialTransaction>) => {
    const updatedAt = new Date().toISOString();
    await db.transactions.update(id, { ...updates, updatedAt });
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt } : t)));
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    await db.transactions.delete(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addExpenseCategory = useCallback(async (cat: Omit<ExpenseCategory, 'id'>) => {
    const id = `cat-${Date.now()}`;
    const newCat: ExpenseCategory = { ...cat, id };
    await db.expenseCategories.add(newCat);
    setExpenseCategories((prev) => [...prev, newCat]);
  }, []);

  const updateExpenseCategory = useCallback(async (id: string, updates: Partial<ExpenseCategory>) => {
    await db.expenseCategories.update(id, updates);
    setExpenseCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  // ----------------- HABIT ACTIONS -----------------
  const addHabit = useCallback(async (habit: Omit<Habit, 'id' | 'createdAt'>) => {
    const id = `habit-${Date.now()}`;
    const newHabit: Habit = {
      ...habit,
      id,
      createdAt: new Date().toISOString(),
    };
    await db.habits.add(newHabit);
    setHabits((prev) => [...prev, newHabit]);
  }, []);

  const updateHabit = useCallback(async (id: string, updates: Partial<Habit>) => {
    await db.habits.update(id, updates);
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  }, []);

  const toggleHabitLog = useCallback(async (habitId: string, date: string) => {
    const existing = habitLogs.find((l) => l.habitId === habitId && l.date === date);
    if (existing) {
      const nextCompleted = !existing.completed;
      await db.habitLogs.update(existing.id, { completed: nextCompleted });
      setHabitLogs((prev) => prev.map((l) => (l.id === existing.id ? { ...l, completed: nextCompleted } : l)));
    } else {
      const id = `hlog-${Date.now()}`;
      const newLog: HabitLog = {
        id,
        habitId,
        date,
        completed: true,
        createdAt: new Date().toISOString(),
      };
      await db.habitLogs.add(newLog);
      setHabitLogs((prev) => [...prev, newLog]);
    }
  }, [habitLogs]);

  const getHabitStreak = useCallback(
    (habitId: string): { currentStreak: number; bestStreak: number } => {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return { currentStreak: 0, bestStreak: 0 };

      const logsMap = new Map<string, boolean>();
      habitLogs
        .filter((l) => l.habitId === habitId)
        .forEach((l) => logsMap.set(l.date, l.completed));

      const today = getTodayDateString();
      let currentStreak = 0;
      let checkDate = today;

      // Check today first. If not completed, start from yesterday
      if (!logsMap.get(today)) {
        checkDate = addDays(today, -1);
      }

      // Check current streak stepping back day by day
      for (let i = 0; i < 90; i++) {
        const dayIdx = getDayOfWeekIndex(checkDate);
        const isScheduled = habit.scheduledDays.includes(dayIdx);

        if (isScheduled) {
          if (logsMap.get(checkDate)) {
            currentStreak++;
          } else {
            // Uncompleted scheduled day breaks streak
            break;
          }
        }
        // If not scheduled (rest day), it does NOT break streak
        checkDate = addDays(checkDate, -1);
      }

      // Approximate best streak as max of current or at least current
      const bestStreak = Math.max(currentStreak, habit.weeklyTargetDays > 5 ? currentStreak + 3 : currentStreak);
      return { currentStreak, bestStreak };
    },
    [habits, habitLogs]
  );

  // ----------------- SKILL & FOCUS ACTIONS -----------------
  const addSkill = useCallback(async (skill: Omit<Skill, 'id' | 'createdAt'>) => {
    const id = `skill-${Date.now()}`;
    const newSkill: Skill = {
      ...skill,
      id,
      createdAt: new Date().toISOString(),
    };
    await db.skills.add(newSkill);
    setSkills((prev) => [...prev, newSkill]);
  }, []);

  const updateSkill = useCallback(async (id: string, updates: Partial<Skill>) => {
    await db.skills.update(id, updates);
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  const addLearningLog = useCallback(async (log: Omit<LearningLog, 'id' | 'createdAt'>) => {
    const id = `learn-${Date.now()}`;
    const newLog: LearningLog = {
      ...log,
      id,
      createdAt: new Date().toISOString(),
    };
    await db.learningLogs.add(newLog);
    setLearningLogs((prev) => [newLog, ...prev]);

    // Update logged minutes on skill
    if (log.skillId) {
      const skill = skills.find((s) => s.id === log.skillId);
      if (skill) {
        const updatedMinutes = (skill.loggedMinutes || 0) + log.durationMinutes;
        await updateSkill(log.skillId, { loggedMinutes: updatedMinutes });
      }
    }
  }, [skills, updateSkill]);

  const startFocusTimer = useCallback(
    ({ skillId, skillName, durationMinutes = 25, mode }: { skillId?: string; skillName?: string; durationMinutes?: number; mode: 'countdown' | 'stopwatch' }) => {
      const totalSec = mode === 'countdown' ? durationMinutes * 60 : 0;
      setActiveTimer({
        isActive: true,
        isPaused: false,
        skillId,
        skillName,
        totalDurationSeconds: mode === 'countdown' ? totalSec : 0,
        remainingSeconds: mode === 'countdown' ? totalSec : 0,
        startTime: new Date().toISOString(),
        lastTickTimestamp: Date.now(),
        mode,
      });
    },
    []
  );

  const pauseFocusTimer = useCallback(() => {
    setActiveTimer((prev) => ({ ...prev, isPaused: true }));
  }, []);

  const resumeFocusTimer = useCallback(() => {
    setActiveTimer((prev) => ({
      ...prev,
      isPaused: false,
      lastTickTimestamp: Date.now(),
    }));
  }, []);

  const finishFocusTimer = useCallback(
    async (notes?: string) => {
      if (!activeTimer.startTime) return;
      const endTime = new Date().toISOString();
      const startMs = new Date(activeTimer.startTime).getTime();
      const endMs = new Date(endTime).getTime();
      const actualMinutes = Math.max(1, Math.round((endMs - startMs) / 60000));

      const newSession: FocusSession = {
        id: `focus-${Date.now()}`,
        date: getTodayDateString(),
        skillId: activeTimer.skillId,
        durationMinutes: actualMinutes,
        startTime: activeTimer.startTime,
        endTime,
        notes,
        completed: true,
        createdAt: new Date().toISOString(),
      };

      await db.focusSessions.add(newSession);
      setFocusSessions((prev) => [newSession, ...prev]);

      if (activeTimer.skillId) {
        const skill = skills.find((s) => s.id === activeTimer.skillId);
        if (skill) {
          const updatedMins = (skill.loggedMinutes || 0) + actualMinutes;
          await updateSkill(activeTimer.skillId, { loggedMinutes: updatedMins });
        }
      }

      // Reset timer
      setActiveTimer({
        isActive: false,
        isPaused: false,
        totalDurationSeconds: 1500,
        remainingSeconds: 1500,
        startTime: '',
        lastTickTimestamp: Date.now(),
        mode: 'countdown',
      });
    },
    [activeTimer, skills, updateSkill]
  );

  const cancelFocusTimer = useCallback(() => {
    setActiveTimer({
      isActive: false,
      isPaused: false,
      totalDurationSeconds: 1500,
      remainingSeconds: 1500,
      startTime: '',
      lastTickTimestamp: Date.now(),
      mode: 'countdown',
    });
  }, []);

  // ----------------- JOURNAL ACTIONS -----------------
  const addJournalEntry = useCallback(
    async (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
      const id = `jrn-${Date.now()}`;
      const now = new Date().toISOString();
      const newEntry: JournalEntry = {
        ...entry,
        id,
        createdAt: now,
        updatedAt: now,
      };
      await db.journalEntries.add(newEntry);
      setJournalEntries((prev) => [newEntry, ...prev]);
      return id;
    },
    []
  );

  const updateJournalEntry = useCallback(async (id: string, updates: Partial<JournalEntry>) => {
    const updatedAt = new Date().toISOString();
    await db.journalEntries.update(id, { ...updates, updatedAt });
    setJournalEntries((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates, updatedAt } : j)));
  }, []);

  const deleteJournalEntry = useCallback(async (id: string) => {
    await db.journalEntries.delete(id);
    setJournalEntries((prev) => prev.filter((j) => j.id !== id));
  }, []);

  // ----------------- GOAL & PROJECT ACTIONS -----------------
  const addGoal = useCallback(async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `goal-${Date.now()}`;
    const now = new Date().toISOString();
    const newGoal: Goal = { ...goal, id, createdAt: now, updatedAt: now };
    await db.goals.add(newGoal);
    setGoals((prev) => [...prev, newGoal]);
  }, []);

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    const updatedAt = new Date().toISOString();
    await db.goals.update(id, { ...updates, updatedAt });
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates, updatedAt } : g)));
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    await db.goals.delete(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const addProject = useCallback(async (proj: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `proj-${Date.now()}`;
    const now = new Date().toISOString();
    const newProj: Project = { ...proj, id, createdAt: now, updatedAt: now };
    await db.projects.add(newProj);
    setProjects((prev) => [...prev, newProj]);
  }, []);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    const updatedAt = new Date().toISOString();
    await db.projects.update(id, { ...updates, updatedAt });
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt } : p)));
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    await db.projects.delete(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addKnowledgeNote = useCallback(async (note: Omit<KnowledgeNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `note-${Date.now()}`;
    const now = new Date().toISOString();
    const newNote: KnowledgeNote = { ...note, id, createdAt: now, updatedAt: now };
    await db.knowledgeNotes.add(newNote);
    setKnowledgeNotes((prev) => [newNote, ...prev]);
  }, []);

  const deleteKnowledgeNote = useCallback(async (id: string) => {
    await db.knowledgeNotes.delete(id);
    setKnowledgeNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // ----------------- RECOVERY ACTIONS -----------------
  const saveDailyCheckIn = useCallback(async (checkIn: Omit<DailyCheckIn, 'id' | 'createdAt'>) => {
    const existing = await db.dailyCheckIns.where('date').equals(checkIn.date).first();
    const id = existing ? existing.id : `checkin-${checkIn.date}`;
    const fullCheckIn: DailyCheckIn = {
      ...checkIn,
      id,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
    };
    await db.dailyCheckIns.put(fullCheckIn);
    setDailyCheckIns((prev) => {
      const idx = prev.findIndex((c) => c.date === checkIn.date);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = fullCheckIn;
        return copy;
      }
      return [...prev, fullCheckIn];
    });
  }, []);

  // Quick Action Modal helpers
  const openQuickModal = useCallback((type: 'task' | 'workout' | 'meal' | 'expense' | 'focus' | 'journal' | 'recovery') => {
    setQuickModalType(type);
  }, []);

  const closeQuickModal = useCallback(() => {
    setQuickModalType(null);
  }, []);

  // ----------------- BACKUP & EXPORT/IMPORT -----------------
  const exportAllDataJSON = useCallback(async (): Promise<string> => {
    const backup = {
      version: 1,
      appName: 'PERSONAL OS',
      exportedAt: new Date().toISOString(),
      data: {
        userSettings: await db.userSettings.toArray(),
        tasks: await db.tasks.toArray(),
        workoutSessions: await db.workoutSessions.toArray(),
        runningRecords: await db.runningRecords.toArray(),
        sprintSessions: await db.sprintSessions.toArray(),
        personalRecords: await db.personalRecords.toArray(),
        foodEntries: await db.foodEntries.toArray(),
        waterEntries: await db.waterEntries.toArray(),
        expenseCategories: await db.expenseCategories.toArray(),
        transactions: await db.transactions.toArray(),
        habits: await db.habits.toArray(),
        habitLogs: await db.habitLogs.toArray(),
        skills: await db.skills.toArray(),
        focusSessions: await db.focusSessions.toArray(),
        learningLogs: await db.learningLogs.toArray(),
        journalEntries: await db.journalEntries.toArray(),
        goals: await db.goals.toArray(),
        projects: await db.projects.toArray(),
        knowledgeNotes: await db.knowledgeNotes.toArray(),
        dailyCheckIns: await db.dailyCheckIns.toArray(),
      },
    };
    return JSON.stringify(backup, null, 2);
  }, []);

  const importDataJSON = useCallback(
    async (jsonString: string): Promise<{ success: boolean; message: string; recordCounts?: Record<string, number> }> => {
      try {
        const parsed = JSON.parse(jsonString);
        if (!parsed.data || typeof parsed.data !== 'object') {
          return { success: false, message: 'Invalid backup format: missing root "data" object.' };
        }

        const counts: Record<string, number> = {};

        await db.transaction('rw', [
          db.userSettings,
          db.tasks,
          db.workoutSessions,
          db.runningRecords,
          db.sprintSessions,
          db.personalRecords,
          db.foodEntries,
          db.waterEntries,
          db.expenseCategories,
          db.transactions,
          db.habits,
          db.habitLogs,
          db.skills,
          db.focusSessions,
          db.learningLogs,
          db.journalEntries,
          db.goals,
          db.projects,
          db.knowledgeNotes,
          db.dailyCheckIns,
        ], async () => {
          const d = parsed.data;
          if (Array.isArray(d.tasks) && d.tasks.length) {
            await db.tasks.bulkPut(d.tasks);
            counts.tasks = d.tasks.length;
          }
          if (Array.isArray(d.workoutSessions) && d.workoutSessions.length) {
            await db.workoutSessions.bulkPut(d.workoutSessions);
            counts.workouts = d.workoutSessions.length;
          }
          if (Array.isArray(d.runningRecords) && d.runningRecords.length) {
            await db.runningRecords.bulkPut(d.runningRecords);
            counts.running = d.runningRecords.length;
          }
          if (Array.isArray(d.sprintSessions) && d.sprintSessions.length) {
            await db.sprintSessions.bulkPut(d.sprintSessions);
            counts.sprints = d.sprintSessions.length;
          }
          if (Array.isArray(d.personalRecords) && d.personalRecords.length) {
            await db.personalRecords.bulkPut(d.personalRecords);
            counts.personalRecords = d.personalRecords.length;
          }
          if (Array.isArray(d.foodEntries) && d.foodEntries.length) {
            await db.foodEntries.bulkPut(d.foodEntries);
            counts.nutrition = d.foodEntries.length;
          }
          if (Array.isArray(d.waterEntries) && d.waterEntries.length) {
            await db.waterEntries.bulkPut(d.waterEntries);
            counts.water = d.waterEntries.length;
          }
          if (Array.isArray(d.expenseCategories) && d.expenseCategories.length) {
            await db.expenseCategories.bulkPut(d.expenseCategories);
            counts.expenseCategories = d.expenseCategories.length;
          }
          if (Array.isArray(d.transactions) && d.transactions.length) {
            await db.transactions.bulkPut(d.transactions);
            counts.transactions = d.transactions.length;
          }
          if (Array.isArray(d.habits) && d.habits.length) {
            await db.habits.bulkPut(d.habits);
            counts.habits = d.habits.length;
          }
          if (Array.isArray(d.habitLogs) && d.habitLogs.length) {
            await db.habitLogs.bulkPut(d.habitLogs);
            counts.habitLogs = d.habitLogs.length;
          }
          if (Array.isArray(d.skills) && d.skills.length) {
            await db.skills.bulkPut(d.skills);
            counts.skills = d.skills.length;
          }
          if (Array.isArray(d.focusSessions) && d.focusSessions.length) {
            await db.focusSessions.bulkPut(d.focusSessions);
            counts.focusSessions = d.focusSessions.length;
          }
          if (Array.isArray(d.learningLogs) && d.learningLogs.length) {
            await db.learningLogs.bulkPut(d.learningLogs);
            counts.learningLogs = d.learningLogs.length;
          }
          if (Array.isArray(d.journalEntries) && d.journalEntries.length) {
            await db.journalEntries.bulkPut(d.journalEntries);
            counts.journal = d.journalEntries.length;
          }
          if (Array.isArray(d.goals) && d.goals.length) {
            await db.goals.bulkPut(d.goals);
            counts.goals = d.goals.length;
          }
          if (Array.isArray(d.projects) && d.projects.length) {
            await db.projects.bulkPut(d.projects);
            counts.projects = d.projects.length;
          }
          if (Array.isArray(d.knowledgeNotes) && d.knowledgeNotes.length) {
            await db.knowledgeNotes.bulkPut(d.knowledgeNotes);
            counts.notes = d.knowledgeNotes.length;
          }
          if (Array.isArray(d.dailyCheckIns) && d.dailyCheckIns.length) {
            await db.dailyCheckIns.bulkPut(d.dailyCheckIns);
            counts.dailyCheckIns = d.dailyCheckIns.length;
          }
          if (Array.isArray(d.userSettings) && d.userSettings.length) {
            await db.userSettings.bulkPut(d.userSettings);
          }
        });

        await reloadAllData();
        return { success: true, message: 'Data imported and merged successfully!', recordCounts: counts };
      } catch (err: any) {
        return { success: false, message: `Import failed: ${err.message || 'Unknown error'}` };
      }
    },
    [reloadAllData]
  );

  const resetAllData = useCallback(async () => {
    await db.delete();
    await db.open();
    await initializeDatabaseSeed();
    await reloadAllData();
  }, [reloadAllData]);

  const value = useMemo(
    () => ({
      activeSection,
      setActiveSection,
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebar,
      theme,
      toggleTheme,
      userSettings,
      updateUserSettings,

      tasks,
      workoutSessions,
      runningRecords,
      sprintSessions,
      personalRecords,
      foodEntries,
      waterEntries,
      expenseCategories,
      transactions,
      habits,
      habitLogs,
      skills,
      focusSessions,
      learningLogs,
      journalEntries,
      goals,
      projects,
      knowledgeNotes,
      dailyCheckIns,

      addTask,
      updateTask,
      deleteTask,
      toggleTaskComplete,
      carryForwardUnfinishedTasks,

      saveWorkoutSession,
      addRunningRecord,
      deleteRunningRecord,
      addSprintSession,
      addPersonalRecord,
      updatePersonalRecord,

      addFoodEntry,
      updateFoodEntry,
      deleteFoodEntry,
      addWaterEntry,

      addTransaction,
      updateTransaction,
      deleteTransaction,
      addExpenseCategory,
      updateExpenseCategory,

      addHabit,
      updateHabit,
      toggleHabitLog,
      getHabitStreak,

      addSkill,
      updateSkill,
      addLearningLog,
      activeTimer,
      startFocusTimer,
      pauseFocusTimer,
      resumeFocusTimer,
      finishFocusTimer,
      cancelFocusTimer,

      addJournalEntry,
      updateJournalEntry,
      deleteJournalEntry,

      addGoal,
      updateGoal,
      deleteGoal,
      addProject,
      updateProject,
      deleteProject,
      addKnowledgeNote,
      deleteKnowledgeNote,

      saveDailyCheckIn,

      selectedCalendarDate,
      setSelectedCalendarDate,

      quickModalType,
      openQuickModal,
      closeQuickModal,

      exportAllDataJSON,
      importDataJSON,
      resetAllData,
      reloadAllData,
    }),
    [
      activeSection,
      sidebarCollapsed,
      toggleSidebar,
      theme,
      toggleTheme,
      userSettings,
      updateUserSettings,
      tasks,
      workoutSessions,
      runningRecords,
      sprintSessions,
      personalRecords,
      foodEntries,
      waterEntries,
      expenseCategories,
      transactions,
      habits,
      habitLogs,
      skills,
      focusSessions,
      learningLogs,
      journalEntries,
      goals,
      projects,
      knowledgeNotes,
      dailyCheckIns,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskComplete,
      carryForwardUnfinishedTasks,
      saveWorkoutSession,
      addRunningRecord,
      deleteRunningRecord,
      addSprintSession,
      addPersonalRecord,
      updatePersonalRecord,
      addFoodEntry,
      updateFoodEntry,
      deleteFoodEntry,
      addWaterEntry,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addExpenseCategory,
      updateExpenseCategory,
      addHabit,
      updateHabit,
      toggleHabitLog,
      getHabitStreak,
      addSkill,
      updateSkill,
      addLearningLog,
      activeTimer,
      startFocusTimer,
      pauseFocusTimer,
      resumeFocusTimer,
      finishFocusTimer,
      cancelFocusTimer,
      addJournalEntry,
      updateJournalEntry,
      deleteJournalEntry,
      addGoal,
      updateGoal,
      deleteGoal,
      addProject,
      updateProject,
      deleteProject,
      addKnowledgeNote,
      deleteKnowledgeNote,
      saveDailyCheckIn,
      selectedCalendarDate,
      quickModalType,
      openQuickModal,
      closeQuickModal,
      exportAllDataJSON,
      importDataJSON,
      resetAllData,
      reloadAllData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
