import Dexie, { Table } from 'dexie';
import {
  Task,
  WorkoutSession,
  WorkoutType,
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
import { getTodayDateString, getDayOfWeekIndex } from '../utils/dateUtils.ts';

export class PersonalOSDatabase extends Dexie {
  tasks!: Table<Task, string>;
  workoutSessions!: Table<WorkoutSession, string>;
  runningRecords!: Table<RunningRecord, string>;
  sprintSessions!: Table<SprintSession, string>;
  personalRecords!: Table<PersonalRecord, string>;
  foodEntries!: Table<FoodEntry, string>;
  waterEntries!: Table<WaterEntry, string>;
  expenseCategories!: Table<ExpenseCategory, string>;
  transactions!: Table<FinancialTransaction, string>;
  habits!: Table<Habit, string>;
  habitLogs!: Table<HabitLog, string>;
  skills!: Table<Skill, string>;
  focusSessions!: Table<FocusSession, string>;
  learningLogs!: Table<LearningLog, string>;
  journalEntries!: Table<JournalEntry, string>;
  goals!: Table<Goal, string>;
  projects!: Table<Project, string>;
  knowledgeNotes!: Table<KnowledgeNote, string>;
  dailyCheckIns!: Table<DailyCheckIn, string>;
  userSettings!: Table<UserSettings, string>;

  constructor() {
    super('PersonalOS_DB');
    this.version(1).stores({
      tasks: 'id, date, status, priority, category, goalId, projectId, timeOfDay',
      workoutSessions: 'id, date, workoutType, planned, completed',
      runningRecords: 'id, date, runType',
      sprintSessions: 'id, date',
      personalRecords: 'id, exercise, category',
      foodEntries: 'id, date, mealCategory',
      waterEntries: 'id, date',
      expenseCategories: 'id, name, isArchived',
      transactions: 'id, type, categoryId, date, paymentMethod, isRecurring',
      habits: 'id, category, frequency, archived',
      habitLogs: 'id, [habitId+date], habitId, date, completed',
      skills: 'id, category, status',
      focusSessions: 'id, date, skillId, taskId, projectId',
      learningLogs: 'id, date, skillId',
      journalEntries: 'id, date, isDailyReview',
      goals: 'id, category, status, deadline',
      projects: 'id, status, priority',
      knowledgeNotes: 'id, category, projectId, skillId',
      dailyCheckIns: 'id, date',
      userSettings: 'id',
    });
  }
}

export const db = new PersonalOSDatabase();

// ----------------- DEFAULT SEED DATA -----------------
export const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'cat-food', name: 'Food & Groceries', icon: 'Utensils', color: '#10B981', monthlyBudgetPaise: 1200000 },
  { id: 'cat-dining', name: 'Restaurants & Snacks', icon: 'Coffee', color: '#F59E0B', monthlyBudgetPaise: 400000 },
  { id: 'cat-transport', name: 'Transport & Fuel', icon: 'Car', color: '#3B82F6', monthlyBudgetPaise: 300000 },
  { id: 'cat-education', name: 'Education & Courses', icon: 'GraduationCap', color: '#8B5CF6', monthlyBudgetPaise: 250000 },
  { id: 'cat-shopping', name: 'Shopping & Gear', icon: 'ShoppingBag', color: '#EC4899', monthlyBudgetPaise: 400000 },
  { id: 'cat-bills', name: 'Bills & Utilities', icon: 'Zap', color: '#06B6D4', monthlyBudgetPaise: 350000 },
  { id: 'cat-rent', name: 'Rent & Household', icon: 'Home', color: '#6366F1', monthlyBudgetPaise: 1500000 },
  { id: 'cat-fitness', name: 'Health & Fitness', icon: 'Activity', color: '#14B8A6', monthlyBudgetPaise: 200000 },
  { id: 'cat-entertainment', name: 'Subscriptions & Media', icon: 'Film', color: '#F43F5E', monthlyBudgetPaise: 100000 },
  { id: 'cat-travel', name: 'Travel', icon: 'Compass', color: '#D97706', monthlyBudgetPaise: 0 },
  { id: 'cat-personal', name: 'Personal Care', icon: 'Smile', color: '#84CC16', monthlyBudgetPaise: 100000 },
  { id: 'cat-gifts', name: 'Gifts & Donations', icon: 'Heart', color: '#E11D48', monthlyBudgetPaise: 50000 },
  { id: 'cat-other', name: 'Uncategorized / Other', icon: 'HelpCircle', color: '#94A3B8', monthlyBudgetPaise: 0 },
];

export const VEGETARIAN_FOOD_DATABASE = [
  { name: 'Dal Tadka (Cooked Yellow Lentils)', quantity: 1, unit: 'katori (150g)', calories: 180, protein: 9, carbs: 24, fat: 5 },
  { name: 'Chana Masala (Cooked Chickpeas)', quantity: 1, unit: 'katori (150g)', calories: 210, protein: 10, carbs: 32, fat: 4 },
  { name: 'Paneer (Raw Indian Cottage Cheese)', quantity: 100, unit: 'g', calories: 265, protein: 18, carbs: 4, fat: 20 },
  { name: 'Curd / Dahi (Plain)', quantity: 150, unit: 'g', calories: 95, protein: 5, carbs: 7, fat: 5 },
  { name: 'Cow Milk', quantity: 250, unit: 'ml', calories: 155, protein: 8, carbs: 12, fat: 8 },
  { name: 'Tofu (Firm)', quantity: 100, unit: 'g', calories: 130, protein: 14, carbs: 3, fat: 8 },
  { name: 'Soy Chunks (Cooked / Boiled)', quantity: 50, unit: 'g dry (approx)', calories: 170, protein: 26, carbs: 16, fat: 1 },
  { name: 'Steamed White Rice', quantity: 1, unit: 'cup (150g)', calories: 195, protein: 4, carbs: 43, fat: 0.5 },
  { name: 'Whole Wheat Roti / Chapati (Plain)', quantity: 1, unit: 'piece', calories: 85, protein: 3, carbs: 17, fat: 0.5 },
  { name: 'Rolled Oats (with water)', quantity: 50, unit: 'g dry', calories: 190, protein: 6, carbs: 33, fat: 3.5 },
  { name: 'Banana (Medium)', quantity: 1, unit: 'piece', calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
  { name: 'Peanut Butter (Natural)', quantity: 2, unit: 'tbsp (32g)', calories: 190, protein: 8, carbs: 7, fat: 16 },
  { name: 'Mixed Sprouted Moong Dal', quantity: 100, unit: 'g', calories: 105, protein: 7, carbs: 19, fat: 0.8 },
  { name: 'Almonds / Badam', quantity: 15, unit: 'nuts (18g)', calories: 105, protein: 4, carbs: 3, fat: 9 },
  { name: 'Boiled Rajma (Kidney Beans)', quantity: 1, unit: 'katori (150g)', calories: 195, protein: 9, carbs: 33, fat: 1 },
];

export const STARTER_HYBRID_TEMPLATES: Array<{
  dayName: string;
  dayIndex: number; // 1=Mon, 2=Tue...
  workoutType: WorkoutType;
  title: string;
  exercises: Array<{ name: string; sets: number; targetReps: string; targetLoad: string }>;
  notes: string;
}> = [
  {
    dayName: 'Monday',
    dayIndex: 1,
    workoutType: 'sprint_lower',
    title: 'Sprint Technique & Lower-Body Strength',
    notes: 'Primary weekly sprint session. Emphasize crisp posture, aggressive arm drive, and full recovery.',
    exercises: [
      { name: 'Dynamic Warm-up & A-Skips', sets: 3, targetReps: '30m', targetLoad: 'Bodyweight' },
      { name: 'Short Acceleration Sprints (30-40m)', sets: 5, targetReps: '1 rep', targetLoad: 'Max Speed (2-3 min rest)' },
      { name: 'Bodyweight Squats (Controlled tempo)', sets: 4, targetReps: '15 reps', targetLoad: 'Bodyweight' },
      { name: 'Reverse Lunges', sets: 3, targetReps: '10 / leg', targetLoad: 'Bodyweight' },
      { name: 'Calf Raises (Full stretch & pause)', sets: 4, targetReps: '15 reps', targetLoad: 'Bodyweight' },
      { name: 'Glute Bridges (Pause at top)', sets: 3, targetReps: '12 reps', targetLoad: 'Bodyweight' },
    ],
  },
  {
    dayName: 'Tuesday',
    dayIndex: 2,
    workoutType: 'easy_run',
    title: 'Easy Aerobic Endurance Run',
    notes: 'Zone 2 conversational pace. You should be able to speak full sentences without gasping.',
    exercises: [
      { name: 'Easy Aerobic Run', sets: 1, targetReps: '30-40 min', targetLoad: 'Conversational pace' },
      { name: 'Post-Run Ankle & Hip Mobility', sets: 1, targetReps: '10 min', targetLoad: 'Bodyweight' },
    ],
  },
  {
    dayName: 'Wednesday',
    dayIndex: 3,
    workoutType: 'upper_strength_core',
    title: 'Upper-Body Strength & Core',
    notes: 'Focus on full range of motion, scapular control, and strict body alignment.',
    exercises: [
      { name: 'Pull-ups or Band-Assisted Pull-ups', sets: 4, targetReps: '6-8 reps', targetLoad: 'Bodyweight / Band' },
      { name: 'Standard / Diamond Push-ups', sets: 4, targetReps: '12-15 reps', targetLoad: 'Bodyweight' },
      { name: 'Backpack / Inverted Rows', sets: 3, targetReps: '10-12 reps', targetLoad: 'Loaded Backpack' },
      { name: 'Pike Push-ups (Vertical push)', sets: 3, targetReps: '8-10 reps', targetLoad: 'Bodyweight' },
      { name: 'Dead Bugs (Core control)', sets: 3, targetReps: '10 / side', targetLoad: 'Bodyweight' },
      { name: 'Elbow Plank (Strict bracing)', sets: 3, targetReps: '45-60 sec', targetLoad: 'Bodyweight' },
    ],
  },
  {
    dayName: 'Thursday',
    dayIndex: 4,
    workoutType: 'recovery_mobility',
    title: 'Active Recovery & Mobility',
    notes: 'Promote blood flow without accumulating nervous system or muscular fatigue.',
    exercises: [
      { name: 'Easy Outdoor Brisk Walk', sets: 1, targetReps: '30 min', targetLoad: 'Zone 1' },
      { name: 'Thoracic Spine & Hip Flow', sets: 2, targetReps: '10 min', targetLoad: 'Bodyweight' },
    ],
  },
  {
    dayName: 'Friday',
    dayIndex: 5,
    workoutType: 'full_body_power',
    title: 'Full-Body Strength & Controlled Power',
    notes: 'Low-volume broad jumps for quality and reactive speed. Clean unilateral stability.',
    exercises: [
      { name: 'Low-Volume Standing Broad Jumps', sets: 4, targetReps: '3 reps (max distance & stick landing)', targetLoad: 'Quality only' },
      { name: 'Bulgarian Split Squats', sets: 3, targetReps: '8-10 / leg', targetLoad: 'Bodyweight' },
      { name: 'Strict Push-ups (Chest to ground)', sets: 3, targetReps: '12-15 reps', targetLoad: 'Bodyweight' },
      { name: 'Pull-ups or Strict Chin-ups', sets: 3, targetReps: '5-8 reps', targetLoad: 'Bodyweight' },
      { name: 'Single-Leg Glute Bridges', sets: 3, targetReps: '10 / leg', targetLoad: 'Bodyweight' },
      { name: 'Side Planks', sets: 3, targetReps: '30-40 sec / side', targetLoad: 'Bodyweight' },
    ],
  },
  {
    dayName: 'Saturday',
    dayIndex: 6,
    workoutType: 'long_run',
    title: 'Long Easy Aerobic Run',
    notes: 'Comfortable endurance builder. Keep heart rate steady and feet light.',
    exercises: [
      { name: 'Long Aerobic Run', sets: 1, targetReps: '35-45 min', targetLoad: 'Conversational pace' },
      { name: 'Core Hollow Body Holds', sets: 3, targetReps: '30 sec', targetLoad: 'Bodyweight' },
    ],
  },
  {
    dayName: 'Sunday',
    dayIndex: 0,
    workoutType: 'rest',
    title: 'Full Rest & Nervous System Reset',
    notes: 'Complete rest day. Hydrate, eat nutritious whole foods, and sleep 8+ hours.',
    exercises: [
      { name: 'Total Rest & Hydration', sets: 1, targetReps: 'Full Day', targetLoad: 'Recovery' },
    ],
  },
];

export async function initializeDatabaseSeed() {
  const settingsCount = await db.userSettings.count();
  if (settingsCount === 0) {
    // Seed initial user settings
    await db.userSettings.put({
      id: 'default',
      userName: 'Athlete & Engineer',
      theme: 'dark',
      currencySymbol: '₹',
      currencyCode: 'INR',
      nutritionTargets: {
        dailyCalories: 2400,
        dailyProtein: 130,
        dailyCarbs: 280,
        dailyFat: 65,
        dailyWaterMl: 3500,
      },
      budgetConfig: {
        overallMonthlyPaise: 3500000, // ₹35,000 monthly target
        currencySymbol: '₹',
        currencyCode: 'INR',
      },
      weeklySprintTarget: 1,
      allowSecondSprintWeekly: false,
    });
  }

  // Seed expense categories if empty
  const categoriesCount = await db.expenseCategories.count();
  if (categoriesCount === 0) {
    await db.expenseCategories.bulkAdd(DEFAULT_EXPENSE_CATEGORIES);
  }

  // Seed default habits if empty
  const habitCount = await db.habits.count();
  if (habitCount === 0) {
    const today = getTodayDateString();
    await db.habits.bulkAdd([
      {
        id: 'habit-hybrid-train',
        name: 'Hybrid Training / Run',
        description: 'Complete scheduled run, sprint or strength block',
        category: 'Fitness',
        frequency: 'daily',
        weeklyTargetDays: 6,
        scheduledDays: [1, 2, 3, 4, 5, 6],
        preferredTimeOfDay: 'morning',
        startDate: today,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'habit-water',
        name: 'Hit 3.5L Water Intake',
        description: 'Maintain cellular hydration for muscle performance',
        category: 'Health',
        frequency: 'daily',
        weeklyTargetDays: 7,
        scheduledDays: [0, 1, 2, 3, 4, 5, 6],
        preferredTimeOfDay: 'any',
        startDate: today,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'habit-dsa-coding',
        name: 'Deep Coding & Skill Practice (45m+)',
        description: 'Consistent deliberate practice on core technical foundations',
        category: 'Skills',
        frequency: 'weekdays',
        weeklyTargetDays: 5,
        scheduledDays: [1, 2, 3, 4, 5],
        preferredTimeOfDay: 'afternoon',
        startDate: today,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'habit-protein',
        name: 'Hit 130g Protein Target',
        description: 'Fuel recovery and lean muscle tissue',
        category: 'Nutrition',
        frequency: 'daily',
        weeklyTargetDays: 7,
        scheduledDays: [0, 1, 2, 3, 4, 5, 6],
        preferredTimeOfDay: 'any',
        startDate: today,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'habit-journal',
        name: 'Evening Journal & Daily Review',
        description: '8-question retrospective and priority setting for tomorrow',
        category: 'Mindset',
        frequency: 'daily',
        weeklyTargetDays: 7,
        scheduledDays: [0, 1, 2, 3, 4, 5, 6],
        preferredTimeOfDay: 'evening',
        startDate: today,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'habit-sleep',
        name: 'Sleep by 11:00 PM',
        description: 'Ensure 7.5 - 8.5 hours of uninterrupted recovery',
        category: 'Recovery',
        frequency: 'daily',
        weeklyTargetDays: 7,
        scheduledDays: [0, 1, 2, 3, 4, 5, 6],
        preferredTimeOfDay: 'evening',
        startDate: today,
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  // Seed skills if empty
  const skillCount = await db.skills.count();
  if (skillCount === 0) {
    await db.skills.bulkAdd([
      {
        id: 'skill-dsa',
        name: 'Data Structures & Algorithms',
        category: 'Computer Science',
        description: 'Trees, Graphs, DP, Two-Pointers, and sliding window patterns',
        targetHours: 120,
        loggedMinutes: 1840,
        proficiency: 'intermediate',
        status: 'active',
        resources: ['LeetCode', 'NeetCode 150', 'CLRS'],
        notes: 'Currently drilling graph traversals (BFS/DFS) and cycle detection.',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'skill-webdev',
        name: 'Full-Stack & Distributed Systems',
        category: 'Software Engineering',
        description: 'React, TypeScript, Node.js, database indexing, caching',
        targetHours: 150,
        loggedMinutes: 3200,
        proficiency: 'advanced',
        status: 'active',
        resources: ['Official Docs', 'Designing Data-Intensive Applications'],
        notes: 'Building clean local-first architectures with indexed client state.',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'skill-hybrid-athlete',
        name: 'Hybrid Athletic Conditioning',
        category: 'Athletics',
        description: 'Sprint mechanics, VO2 max zone 2 base, calisthenic upper body strength',
        targetHours: 200,
        loggedMinutes: 2400,
        proficiency: 'intermediate',
        status: 'active',
        resources: ['Sprint Mechanics Handbook', 'Zone 2 Physiology'],
        notes: 'Sprint volume must remain strictly 1 session/wk until tissue resilience improves.',
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  // Seed personal records if empty
  const prCount = await db.personalRecords.count();
  if (prCount === 0) {
    const today = getTodayDateString();
    await db.personalRecords.bulkAdd([
      {
        id: 'pr-pullups',
        exercise: 'Strict Dead-Hang Pull-ups',
        category: 'strength',
        recordValue: '12 clean reps',
        numericValue: 12,
        unit: 'reps',
        achievedDate: today,
        notes: 'Full lockout at bottom, chin clearly clearing the bar.',
      },
      {
        id: 'pr-pushups',
        exercise: 'Continuous Strict Push-ups',
        category: 'strength',
        recordValue: '38 reps',
        numericValue: 38,
        unit: 'reps',
        achievedDate: today,
        notes: 'Chest touching ground, locked elbows at apex.',
      },
      {
        id: 'pr-5k',
        exercise: '5km Aerobic Run Time',
        category: 'endurance',
        recordValue: '24m 45s (4:57/km)',
        numericValue: 24.75,
        unit: 'minutes',
        achievedDate: today,
        notes: 'Even pacing across all 5 kilometres.',
      },
      {
        id: 'pr-sprint',
        exercise: '40m Acceleration Sprint',
        category: 'sprint',
        recordValue: '5.42 seconds',
        numericValue: 5.42,
        unit: 'seconds',
        achievedDate: today,
        notes: 'Natural turf, 3-point track start.',
      },
      {
        id: 'pr-plank',
        exercise: 'Strict Forearm Plank',
        category: 'strength',
        recordValue: '2m 15s',
        numericValue: 135,
        unit: 'seconds',
        achievedDate: today,
        notes: 'Posterior pelvic tilt, zero hip sag.',
      },
    ]);
  }

  // Seed today's scheduled workout if no workout logged for today
  const today = getTodayDateString();
  const existingTodayWorkout = await db.workoutSessions.where('date').equals(today).first();
  if (!existingTodayWorkout) {
    const todayDayIndex = getDayOfWeekIndex(today);
    const template = STARTER_HYBRID_TEMPLATES.find((t) => t.dayIndex === todayDayIndex) || STARTER_HYBRID_TEMPLATES[0];

    await db.workoutSessions.put({
      id: `workout-${today}`,
      date: today,
      title: template.title,
      workoutType: template.workoutType,
      planned: true,
      completed: false,
      notes: template.notes,
      exercises: template.exercises.map((ex, i) => ({
        id: `ex-${i}-${Date.now()}`,
        name: ex.name,
        sets: ex.sets,
        targetReps: ex.targetReps,
        targetLoad: ex.targetLoad,
        actualReps: '',
        actualLoad: '',
        completed: false,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Seed sample starter tasks for today if none exist
  const existingTodayTasks = await db.tasks.where('date').equals(today).count();
  if (existingTodayTasks === 0) {
    await db.tasks.bulkAdd([
      {
        id: `task-1-${today}`,
        title: 'Complete morning hybrid workout session',
        description: 'Focus on warm-up, strict execution form and record actual sets',
        category: 'fitness',
        priority: 'high',
        status: 'planned',
        date: today,
        timeOfDay: 'morning',
        startTime: '07:00',
        endTime: '08:00',
        estimatedDuration: 60,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `task-2-${today}`,
        title: 'DSA Practice: LeetCode Graph Traversal problems (2 problems)',
        description: 'Solve Course Schedule and Number of Islands using BFS/DFS',
        category: 'coding',
        priority: 'high',
        status: 'planned',
        date: today,
        timeOfDay: 'afternoon',
        startTime: '14:00',
        endTime: '15:15',
        estimatedDuration: 75,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `task-3-${today}`,
        title: 'Log daily expenses and check category budget',
        description: 'Ensure all morning and daytime UPI transactions are recorded',
        category: 'personal',
        priority: 'medium',
        status: 'planned',
        date: today,
        timeOfDay: 'evening',
        startTime: '20:30',
        endTime: '20:45',
        estimatedDuration: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `task-4-${today}`,
        title: 'Review weekly hybrid athlete recovery metrics',
        description: 'Check sleep consistency, soreness levels, and water hydration balance',
        category: 'fitness',
        priority: 'low',
        status: 'planned',
        date: today,
        timeOfDay: 'evening',
        startTime: '21:00',
        endTime: '21:20',
        estimatedDuration: 20,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }

  // Seed starter goals if none exist
  const goalsCount = await db.goals.count();
  if (goalsCount === 0) {
    await db.goals.bulkAdd([
      {
        id: 'goal-pullups',
        title: 'Achieve 15 Strict Dead-Hang Pull-ups',
        description: 'Build robust relative upper-body pulling strength and scapular depression control.',
        category: 'strength',
        startDate: today,
        deadline: '2026-12-31',
        targetValue: 15,
        currentValue: 12,
        unit: 'reps',
        status: 'active',
        milestones: [
          { id: 'm1', title: '10 strict reps with 2s pause', completed: true },
          { id: 'm2', title: '12 strict reps smooth rhythm', completed: true },
          { id: 'm3', title: '14 strict reps continuous', completed: false },
          { id: 'm4', title: '15 strict dead-hang reps with chest touch', completed: false },
        ],
        notes: 'Track reps only when chin clears bar without kipping.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'goal-sub23-5k',
        title: 'Run Sub-23 Minute 5K at Controlled Aerobic Effort',
        category: 'endurance',
        description: 'Build sustained Zone 2 threshold base through weekly long runs.',
        startDate: today,
        deadline: '2026-11-30',
        targetValue: 23,
        currentValue: 24.75,
        unit: 'minutes',
        status: 'active',
        milestones: [
          { id: 'm10', title: '5k under 25:00', completed: true },
          { id: 'm11', title: '5k under 24:00', completed: false },
          { id: 'm12', title: '5k under 23:00 on flat course', completed: false },
        ],
        notes: 'Keep easy runs strictly conversational.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'goal-dsa-150',
        title: 'Complete 150 Core Data Structures & Algorithm Problems',
        category: 'learning',
        description: 'Master patterns across arrays, linked lists, binary trees, graphs, and dynamic programming.',
        startDate: today,
        deadline: '2026-12-15',
        targetValue: 150,
        currentValue: 64,
        unit: 'problems',
        status: 'active',
        milestones: [
          { id: 'm20', title: 'Complete first 50 warm-up arrays & strings', completed: true },
          { id: 'm21', title: 'Solve 25 linked lists and tree recursion problems', completed: true },
          { id: 'm22', title: 'Complete 30 graph BFS/DFS problems', completed: false },
          { id: 'm23', title: 'Finish 45 dynamic programming and backtracking problems', completed: false },
        ],
        notes: 'Write clean time and space complexities for each solution.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }

  // Seed starter projects if none exist
  const projectsCount = await db.projects.count();
  if (projectsCount === 0) {
    await db.projects.bulkAdd([
      {
        id: 'proj-personal-os',
        name: 'Personal Operating System',
        description: 'Private, offline-capable local personal planner, fitness log, and financial tracker.',
        status: 'active',
        priority: 'high',
        deadline: '2026-10-31',
        milestones: [
          { id: 'pm1', title: 'IndexedDB local data architecture & reactive state', completed: true },
          { id: 'pm2', title: 'Hybrid athlete workouts and running pace calculator', completed: true },
          { id: 'pm3', title: 'Full expense and INR budget management', completed: true },
          { id: 'pm4', title: 'Unified calendar and performance analytics', completed: true },
        ],
        resourceLinks: ['https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API'],
        notes: 'Keep dependencies minimal and local-first.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }
}
