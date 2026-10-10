export type NavSection =
  | 'today'
  | 'planner'
  | 'fitness'
  | 'nutrition'
  | 'habits'
  | 'skills'
  | 'journal'
  | 'goals'
  | 'projects'
  | 'recovery'
  | 'calendar'
  | 'analytics'
  | 'expenses'
  | 'settings'
  | 'coach';

// ----------------- TASK & PLANNER -----------------
export type TaskCategory = 'fitness' | 'studies' | 'coding' | 'career' | 'personal' | 'custom';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'planned' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  date: string; // YYYY-MM-DD
  timeOfDay?: TimeOfDay;
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  estimatedDuration?: number; // minutes
  goalId?: string;
  projectId?: string;
  isRecurring?: boolean;
  recurringDays?: number[]; // 0=Sun, 1=Mon...
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------- FITNESS & HYBRID ATHLETE -----------------
export type WorkoutType =
  | 'sprint_lower'
  | 'easy_run'
  | 'upper_strength_core'
  | 'recovery_mobility'
  | 'full_body_power'
  | 'long_run'
  | 'rest'
  | 'custom';

export interface ExerciseItem {
  id: string;
  name: string;
  sets: number;
  targetReps?: string; // e.g. "8-10" or "60s"
  actualReps?: string;
  targetLoad?: string; // e.g. "Bodyweight" or "10kg"
  actualLoad?: string;
  completed: boolean;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  workoutType: WorkoutType;
  planned: boolean;
  completed: boolean;
  rpe?: number; // 1 to 10
  durationMinutes?: number;
  exercises: ExerciseItem[];
  painFlag?: boolean;
  painLocation?: string;
  painNotes?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type RunType = 'easy' | 'long' | 'recovery' | 'sprint' | 'intervals';

export interface RunningRecord {
  id: string;
  date: string; // YYYY-MM-DD
  distanceKm: number;
  durationMinutes: number;
  durationSeconds: number;
  calculatedPace: string; // e.g. "5:30 min/km"
  paceSecondsPerKm: number;
  runType: RunType;
  surface?: string; // 'road' | 'track' | 'trail' | 'grass'
  effortRating: number; // 1-10
  route?: string;
  notes?: string;
  createdAt: string;
}

export interface SprintRep {
  repNumber: number;
  timeSeconds?: number;
  recoverySeconds: number;
  effortRating: number; // 1-10
}

export interface SprintSession {
  id: string;
  date: string; // YYYY-MM-DD
  distanceMeters: number; // e.g. 40, 60, 100
  reps: SprintRep[];
  surface: string; // 'grass' | 'track' | 'turf' | 'tarmac'
  techniqueNotes?: string;
  notes?: string;
  createdAt: string;
}

export interface PersonalRecord {
  id: string;
  exercise: string;
  category: 'strength' | 'endurance' | 'sprint';
  recordValue: string; // e.g. "15 reps" or "22:15"
  numericValue: number;
  unit: string;
  achievedDate: string;
  notes?: string;
}

// ----------------- NUTRITION & HYDRATION -----------------
export type MealCategory = 'breakfast' | 'lunch' | 'snacks' | 'dinner' | 'other';

export interface FoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  name: string;
  mealCategory: MealCategory;
  quantity: number;
  unit: string; // 'g' | 'ml' | 'piece' | 'katori' | 'cup' | 'serving'
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  isEstimated?: boolean;
  notes?: string;
  createdAt: string;
}

export interface NutritionTargets {
  dailyCalories: number;
  dailyProtein: number; // g
  dailyCarbs: number; // g
  dailyFat: number; // g
  dailyWaterMl: number; // ml
}

export interface WaterEntry {
  id: string;
  date: string; // YYYY-MM-DD
  amountMl: number;
  time: string;
  createdAt: string;
}

// ----------------- EXPENSES & PERSONAL FINANCE -----------------
export type TransactionType = 'expense' | 'income';
export type PaymentMethod = 'cash' | 'upi' | 'debit_card' | 'credit_card' | 'bank_transfer' | 'custom';

export interface ExpenseCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  isCustom?: boolean;
  isArchived?: boolean;
  monthlyBudgetPaise?: number; // optional budget for this category
}

export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  amountPaise: number; // integer paise (e.g. ₹50.00 = 5000)
  title: string;
  categoryId: string; // references ExpenseCategory
  subCategory?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  paymentMethod: PaymentMethod;
  merchant?: string;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

export interface BudgetConfig {
  overallMonthlyPaise: number;
  currencySymbol: string; // '₹', '$', '€', etc.
  currencyCode: string; // 'INR', 'USD', etc.
}

// ----------------- HABITS & ROUTINES -----------------
export type HabitFrequency = 'daily' | 'weekdays' | 'custom';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: string;
  frequency: HabitFrequency;
  weeklyTargetDays: number;
  scheduledDays: number[]; // 0=Sun, 1=Mon...
  preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening' | 'any';
  startDate: string;
  endDate?: string;
  archived?: boolean;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  skipped?: boolean;
  notes?: string;
  createdAt: string;
}

// ----------------- SKILLS & FOCUS -----------------
export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'mastery';

export interface Skill {
  id: string;
  name: string;
  category: string; // e.g. "Coding", "DSA", "Web Dev", "Academics"
  description?: string;
  targetHours: number;
  loggedMinutes: number;
  proficiency: ProficiencyLevel;
  status: 'active' | 'paused' | 'completed';
  targetDate?: string;
  relatedProjectId?: string;
  resources?: string[];
  notes?: string;
  createdAt: string;
}

export interface FocusSession {
  id: string;
  date: string; // YYYY-MM-DD
  skillId?: string;
  taskId?: string;
  projectId?: string;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  notes?: string;
  completed: boolean;
  createdAt: string;
}

export interface LearningLog {
  id: string;
  date: string; // YYYY-MM-DD
  skillId: string;
  topic: string;
  durationMinutes: number;
  whatILearned: string;
  difficulties?: string;
  nextSteps?: string;
  resources?: string;
  createdAt: string;
}

// ----------------- JOURNAL & DAILY REVIEW -----------------
export interface DailyReviewQuestions {
  accomplishments: string;
  learnings: string;
  workoutDone: string;
  nutritionAdherence: string;
  whatWentWell: string;
  distractions: string;
  improvementsTomorrow: string;
  topThreeTomorrow: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  title: string;
  content: string;
  moodRating: number; // 1-5
  energyRating: number; // 1-5
  tags: string[];
  wins?: string[];
  challenges?: string[];
  lessons?: string[];
  gratitude?: string[];
  dailyReview?: DailyReviewQuestions;
  isDailyReview?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ----------------- GOALS & MILESTONES -----------------
export type GoalCategory = 'fitness' | 'endurance' | 'strength' | 'learning' | 'academics' | 'career' | 'personal';

export interface Milestone {
  id: string;
  title: string;
  targetDate?: string;
  completed: boolean;
  completedAt?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  startDate: string;
  deadline: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  status: 'active' | 'completed' | 'paused';
  milestones: Milestone[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------- PROJECTS & KNOWLEDGE VAULT -----------------
export type ProjectPriority = 'low' | 'medium' | 'high';
export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  deadline?: string;
  milestones: Milestone[];
  resourceLinks: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeNote {
  id: string;
  title: string;
  category: 'concept' | 'bug_fix' | 'solution' | 'idea' | 'lesson' | 'resource';
  content: string;
  tags: string[];
  projectId?: string;
  skillId?: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------- RECOVERY & DAILY CHECK-IN -----------------
export interface DailyCheckIn {
  id: string;
  date: string; // YYYY-MM-DD
  sleepHours: number;
  sleepQuality: number; // 1-5
  mood: number; // 1-5
  energy: number; // 1-5
  stress: number; // 1-5
  muscleSoreness: number; // 1-5
  motivation: number; // 1-5
  notes?: string;
  createdAt: string;
}

// ----------------- USER SETTINGS -----------------
export interface UserSettings {
  id: string;
  userName: string;
  theme: 'dark' | 'light';
  currencySymbol: string;
  currencyCode: string;
  nutritionTargets: NutritionTargets;
  budgetConfig: BudgetConfig;
  weeklySprintTarget: number;
  allowSecondSprintWeekly: boolean;
}
