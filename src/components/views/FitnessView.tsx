import React, { useState, useMemo } from 'react';
import {
  Dumbbell,
  Timer,
  Flame,
  Award,
  AlertTriangle,
  Plus,
  Play,
  CheckCircle2,
  Circle,
  TrendingUp,
  RotateCcw,
  Clock,
  ChevronRight,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import {
  WorkoutSession,
  WorkoutType,
  ExerciseItem,
  RunningRecord,
  SprintSession,
  RunType,
} from '../../types/index.ts';
import {
  getTodayDateString,
  formatDateDisplay,
  getDayOfWeekIndex,
} from '../../utils/dateUtils.ts';
import { formatPace, formatSecondsToTimer } from '../../utils/formatters.ts';
import { STARTER_HYBRID_TEMPLATES } from '../../db/index.ts';

export const FitnessView: React.FC = () => {
  const {
    workoutSessions,
    saveWorkoutSession,
    runningRecords,
    addRunningRecord,
    deleteRunningRecord,
    sprintSessions,
    addSprintSession,
    personalRecords,
    addPersonalRecord,
    updatePersonalRecord,
    dailyCheckIns,
  } = useApp();

  const today = getTodayDateString();
  const [activeTab, setActiveTab] = useState<'daily_session' | 'weekly_plan' | 'running' | 'sprints' | 'prs'>('daily_session');

  // Currently viewed workout date
  const [sessionDate, setSessionDate] = useState<string>(today);

  // Active workout session
  const currentSession = useMemo(() => {
    return workoutSessions.find((w) => w.date === sessionDate);
  }, [workoutSessions, sessionDate]);

  // Recovery pain or fatigue warnings
  const recentCheckIn = dailyCheckIns.find((c) => c.date === today);
  const showFatigueWarning = recentCheckIn && (recentCheckIn.muscleSoreness >= 4 || recentCheckIn.energy <= 2);

  // Running form state
  const [runDistance, setRunDistance] = useState('5.0');
  const [runMinutes, setRunMinutes] = useState('28');
  const [runSeconds, setRunSeconds] = useState('30');
  const [runType, setRunType] = useState<RunType>('easy');
  const [runSurface, setRunSurface] = useState('road');
  const [runEffort, setRunEffort] = useState('5');
  const [runNotes, setRunNotes] = useState('');

  // Sprint form state
  const [sprintDistanceMeters, setSprintDistanceMeters] = useState('40');
  const [sprintRepsCount, setSprintRepsCount] = useState('5');
  const [sprintBestTime, setSprintBestTime] = useState('5.4');
  const [sprintRestSeconds, setSprintRestSeconds] = useState('120');
  const [sprintSurface, setSprintSurface] = useState('grass');
  const [sprintNotes, setSprintNotes] = useState('');

  // New PR state
  const [newPRExercise, setNewPRExercise] = useState('');
  const [newPRValue, setNewPRValue] = useState('');
  const [newPRCategory, setNewPRCategory] = useState<'strength' | 'endurance' | 'sprint'>('strength');

  // Load or create today's planned session from templates if missing
  const handleInitializeDaySession = () => {
    const dayIndex = getDayOfWeekIndex(sessionDate);
    const template = STARTER_HYBRID_TEMPLATES.find((t) => t.dayIndex === dayIndex) || STARTER_HYBRID_TEMPLATES[0];

    const newSession: WorkoutSession = {
      id: `workout-${sessionDate}-${Date.now()}`,
      date: sessionDate,
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
    };
    saveWorkoutSession(newSession);
  };

  const handleToggleExercise = (exerciseId: string) => {
    if (!currentSession) return;
    const updatedExercises = currentSession.exercises.map((ex) =>
      ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
    );
    const allDone = updatedExercises.length > 0 && updatedExercises.every((ex) => ex.completed);
    saveWorkoutSession({
      ...currentSession,
      exercises: updatedExercises,
      completed: allDone,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleUpdateExerciseActuals = (exerciseId: string, actualReps: string, actualLoad: string) => {
    if (!currentSession) return;
    const updatedExercises = currentSession.exercises.map((ex) =>
      ex.id === exerciseId ? { ...ex, actualReps, actualLoad } : ex
    );
    saveWorkoutSession({
      ...currentSession,
      exercises: updatedExercises,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddCustomExercise = () => {
    if (!currentSession) return;
    const newEx: ExerciseItem = {
      id: `ex-custom-${Date.now()}`,
      name: 'Custom Movement (e.g. Inverted Rows)',
      sets: 3,
      targetReps: '10-12',
      targetLoad: 'Bodyweight',
      actualReps: '',
      actualLoad: '',
      completed: false,
    };
    saveWorkoutSession({
      ...currentSession,
      exercises: [...currentSession.exercises, newEx],
      updatedAt: new Date().toISOString(),
    });
  };

  const handleLogRun = async (e: React.FormEvent) => {
    e.preventDefault();
    const dist = parseFloat(runDistance) || 0;
    const mins = parseInt(runMinutes) || 0;
    const secs = parseInt(runSeconds) || 0;
    const totalMinutes = mins + secs / 60;
    const { paceStr, secondsPerKm } = formatPace(totalMinutes, dist);

    await addRunningRecord({
      date: sessionDate,
      distanceKm: dist,
      durationMinutes: mins,
      durationSeconds: secs,
      calculatedPace: paceStr,
      paceSecondsPerKm: secondsPerKm,
      runType,
      surface: runSurface,
      effortRating: parseInt(runEffort) || 5,
      notes: runNotes.trim() || undefined,
    });

    setRunNotes('');
    alert(`Logged ${dist}km run at pace of ${paceStr}!`);
  };

  const handleLogSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    const dist = parseInt(sprintDistanceMeters) || 40;
    const reps = parseInt(sprintRepsCount) || 5;
    const bestTime = parseFloat(sprintBestTime) || undefined;
    const rest = parseInt(sprintRestSeconds) || 120;

    await addSprintSession({
      date: sessionDate,
      distanceMeters: dist,
      reps: Array.from({ length: reps }, (_, i) => ({
        repNumber: i + 1,
        timeSeconds: bestTime,
        recoverySeconds: rest,
        effortRating: 9,
      })),
      surface: sprintSurface,
      techniqueNotes: sprintNotes.trim() || undefined,
    });

    setSprintNotes('');
    alert(`Logged ${reps}x${dist}m sprint session on ${sprintSurface}!`);
  };

  const handleSavePR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPRExercise.trim() || !newPRValue.trim()) return;

    await addPersonalRecord({
      exercise: newPRExercise.trim(),
      category: newPRCategory,
      recordValue: newPRValue.trim(),
      numericValue: parseFloat(newPRValue) || 1,
      unit: newPRCategory === 'strength' ? 'reps' : newPRCategory === 'endurance' ? 'mins' : 'secs',
      achievedDate: today,
    });

    setNewPRExercise('');
    setNewPRValue('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Warnings */}
      <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
              <span>Hybrid Athlete System</span>
              <span aria-hidden="true">·</span>
              <span>Strength, Aerobic Base & Speed</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-100">
              Calisthenics, Running & Sprint Conditioning
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Strict 1 sprint session/wk limit for neuromuscular protection. Minimalist equipment (pull-up bar, bodyweight, roads).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Date:</span>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-md bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 font-mono"
            />
          </div>
        </div>

        {/* Fatigue or Pain Advisory */}
        {showFatigueWarning && (
          <div className="mt-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertTriangle size={15} className="shrink-0 text-rose-400 mt-0.5" />
            <div>
              <span className="font-semibold">Recovery Advisory:</span> High muscle soreness ({recentCheckIn?.muscleSoreness}/5) or depleted energy ({recentCheckIn?.energy}/5) detected today. Consider reducing volume, switching to active walking mobility, or avoiding maximal acceleration sprints.
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800 text-xs font-medium overflow-x-auto">
        <button
          onClick={() => setActiveTab('daily_session')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'daily_session' ? 'bg-neutral-800 text-white shadow-xs' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Dumbbell size={13} />
          <span>Active Workout Logger</span>
        </button>
        <button
          onClick={() => setActiveTab('weekly_plan')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'weekly_plan' ? 'bg-neutral-800 text-white shadow-xs' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <RotateCcw size={13} />
          <span>Weekly Hybrid Blueprint</span>
        </button>
        <button
          onClick={() => setActiveTab('running')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'running' ? 'bg-neutral-800 text-white shadow-xs' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Timer size={13} />
          <span>Running Log & Pace</span>
        </button>
        <button
          onClick={() => setActiveTab('sprints')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'sprints' ? 'bg-neutral-800 text-white shadow-xs' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Flame size={13} />
          <span>Sprint Sessions</span>
        </button>
        <button
          onClick={() => setActiveTab('prs')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'prs' ? 'bg-neutral-800 text-white shadow-xs' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Award size={13} />
          <span>Personal Records</span>
        </button>
      </div>

      {/* TAB 1: DAILY SESSION LOGGER */}
      {activeTab === 'daily_session' && (
        <div className="space-y-6">
          {!currentSession ? (
            <div className="p-8 text-center rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
              <p className="text-sm text-neutral-300">
                No workout recorded for {formatDateDisplay(sessionDate, { includeWeekday: true })}.
              </p>
              <button
                onClick={handleInitializeDaySession}
                className="px-4 py-2 bg-neutral-100 text-neutral-950 font-medium rounded-md hover:bg-white text-xs inline-flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Load Scheduled Hybrid Workout</span>
              </button>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-neutral-100">{currentSession.title}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-mono ${
                        currentSession.completed
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {currentSession.completed ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">{currentSession.notes}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      saveWorkoutSession({
                        ...currentSession,
                        completed: !currentSession.completed,
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      currentSession.completed
                        ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500'
                    }`}
                  >
                    {currentSession.completed ? 'Mark as Incomplete' : 'Mark Session as Completed'}
                  </button>
                </div>
              </div>

              {/* Exercises Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    Exercises & Performance Log
                  </h4>
                  <button
                    onClick={handleAddCustomExercise}
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    <Plus size={12} />
                    <span>Add Movement</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {currentSession.exercises.map((ex, idx) => (
                    <div
                      key={ex.id || idx}
                      className={`p-3 rounded-lg border transition-all ${
                        ex.completed
                          ? 'bg-neutral-950/60 border-neutral-800/80 opacity-80'
                          : 'bg-neutral-950 border-neutral-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <button
                            onClick={() => handleToggleExercise(ex.id)}
                            className="mt-0.5 text-neutral-400 hover:text-white shrink-0"
                          >
                            {ex.completed ? (
                              <CheckCircle2 size={18} className="text-emerald-400" />
                            ) : (
                              <Circle size={18} />
                            )}
                          </button>
                          <div>
                            <span className="text-xs font-semibold text-neutral-100">{ex.name}</span>
                            <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                              <span>Target: {ex.sets} sets × {ex.targetReps}</span>
                              <span aria-hidden="true">·</span>
                              <span>Load: {ex.targetLoad || 'BW'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actuals Input */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <input
                            type="text"
                            placeholder="Actual reps (e.g. 12,12,10)"
                            value={ex.actualReps || ''}
                            onChange={(e) => handleUpdateExerciseActuals(ex.id, e.target.value, ex.actualLoad || '')}
                            className="w-36 px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-xs text-neutral-100 placeholder:text-neutral-500 font-mono"
                          />
                          <input
                            type="text"
                            placeholder="Load (e.g. BW, +5kg)"
                            value={ex.actualLoad || ''}
                            onChange={(e) => handleUpdateExerciseActuals(ex.id, ex.actualReps || '', e.target.value)}
                            className="w-24 px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-xs text-neutral-100 placeholder:text-neutral-500 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RPE & Pain Check */}
              <div className="pt-4 border-t border-neutral-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">Perceived Exertion (RPE 1-10)</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() =>
                          saveWorkoutSession({
                            ...currentSession,
                            rpe: num,
                            updatedAt: new Date().toISOString(),
                          })
                        }
                        className={`flex-1 py-1 rounded text-xs font-mono ${
                          currentSession.rpe === num
                            ? 'bg-neutral-100 text-neutral-950 font-bold'
                            : 'bg-neutral-950 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Pain or Discomfort Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Left knee stiffness after lunges, right hamstring tight"
                    value={currentSession.painNotes || ''}
                    onChange={(e) =>
                      saveWorkoutSession({
                        ...currentSession,
                        painFlag: !!e.target.value.trim(),
                        painNotes: e.target.value,
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-xs text-neutral-100 placeholder:text-neutral-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WEEKLY HYBRID BLUEPRINT */}
      {activeTab === 'weekly_plan' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STARTER_HYBRID_TEMPLATES.map((tmpl) => (
            <div key={tmpl.dayIndex} className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs font-bold text-amber-400">{tmpl.dayName}</span>
                <span className="text-[11px] font-mono text-neutral-500 capitalize">{tmpl.workoutType.replace('_', ' ')}</span>
              </div>
              <h4 className="text-sm font-semibold text-neutral-100">{tmpl.title}</h4>
              <p className="text-xs text-neutral-400">{tmpl.notes}</p>
              <div className="pt-2 text-xs space-y-1 text-neutral-300">
                {tmpl.exercises.map((ex, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="truncate">{ex.name}</span>
                    <span className="font-mono text-neutral-500 shrink-0">{ex.sets} sets · {ex.targetReps}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: RUNNING LOG & PACE TRACKER */}
      {activeTab === 'running' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Running Form */}
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <Timer size={14} className="text-cyan-400" />
              <span>Log Running Session</span>
            </h3>

            <form onSubmit={handleLogRun} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Distance (km)</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  required
                  value={runDistance}
                  onChange={(e) => setRunDistance(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Minutes</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={runMinutes}
                    onChange={(e) => setRunMinutes(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Seconds</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={runSeconds}
                    onChange={(e) => setRunSeconds(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Run Type</label>
                  <select
                    value={runType}
                    onChange={(e) => setRunType(e.target.value as RunType)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-xs"
                  >
                    <option value="easy">Easy (Zone 2)</option>
                    <option value="long">Long Run</option>
                    <option value="recovery">Recovery</option>
                    <option value="sprint">Speed Intervals</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Surface</label>
                  <select
                    value={runSurface}
                    onChange={(e) => setRunSurface(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-xs"
                  >
                    <option value="road">Road / Tarmac</option>
                    <option value="trail">Trail / Dirt</option>
                    <option value="track">Synthetic Track</option>
                    <option value="grass">Grass Field</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Perceived Effort (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={runEffort}
                  onChange={(e) => setRunEffort(e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                  <span>1 (Casual)</span>
                  <span>Effort: {runEffort}</span>
                  <span>10 (Maximal)</span>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Route & Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Lake loop, conversational breath throughout"
                  value={runNotes}
                  onChange={(e) => setRunNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-neutral-100 text-neutral-950 font-medium rounded-md hover:bg-white text-xs mt-2"
              >
                Save Running Record
              </button>
            </form>
          </div>

          {/* Running History Table */}
          <div className="lg:col-span-2 p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-sm font-bold text-neutral-100">Running History & Pace Log</h3>

            {runningRecords.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                No running records saved yet. Log your first run on the left.
              </div>
            ) : (
              <div className="space-y-2 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-500 font-medium pb-2">
                      <th className="py-2">Date</th>
                      <th className="py-2">Distance</th>
                      <th className="py-2">Duration</th>
                      <th className="py-2">Calculated Pace</th>
                      <th className="py-2">Type</th>
                      <th className="py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-mono text-neutral-300">
                    {runningRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-neutral-800/40">
                        <td className="py-2.5 text-neutral-400">{r.date}</td>
                        <td className="py-2.5 font-bold text-neutral-100 tabular-nums">{r.distanceKm} km</td>
                        <td className="py-2.5 tabular-nums">
                          {r.durationMinutes}m {r.durationSeconds ? `${r.durationSeconds}s` : ''}
                        </td>
                        <td className="py-2.5 text-cyan-400 font-semibold tabular-nums">{r.calculatedPace}</td>
                        <td className="py-2.5 text-neutral-400 capitalize font-sans">{r.runType}</td>
                        <td className="py-2.5 text-right font-sans">
                          <button
                            onClick={() => deleteRunningRecord(r.id)}
                            className="text-neutral-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SPRINT SESSIONS */}
      {activeTab === 'sprints' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <Flame size={14} className="text-orange-400" />
              <span>Record Sprint Session</span>
            </h3>

            <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400">
              ⚡ <strong>Hybrid Sprint Rule:</strong> 1 high-quality sprint session per week. Rest 2–3 minutes between reps for full ATP-CP restoration.
            </div>

            <form onSubmit={handleLogSprint} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Sprint Distance (meters)</label>
                <select
                  value={sprintDistanceMeters}
                  onChange={(e) => setSprintDistanceMeters(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-xs font-mono"
                >
                  <option value="30">30 meters (Pure acceleration)</option>
                  <option value="40">40 meters (Standard speed test)</option>
                  <option value="60">60 meters (Max velocity transition)</option>
                  <option value="100">100 meters (Speed endurance)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Repetitions</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={sprintRepsCount}
                    onChange={(e) => setSprintRepsCount(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Best Rep Time (s)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 5.40"
                    value={sprintBestTime}
                    onChange={(e) => setSprintBestTime(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Recovery Between Reps</label>
                  <input
                    type="number"
                    value={sprintRestSeconds}
                    onChange={(e) => setSprintRestSeconds(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Surface</label>
                  <select
                    value={sprintSurface}
                    onChange={(e) => setSprintSurface(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-xs"
                  >
                    <option value="grass">Grass Field</option>
                    <option value="track">Synthetic Track</option>
                    <option value="turf">Turf</option>
                    <option value="tarmac">Tarmac</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Technique & Form Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Strong shin angle on first 3 steps, upright posture"
                  value={sprintNotes}
                  onChange={(e) => setSprintNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-neutral-100 text-neutral-950 font-medium rounded-md hover:bg-white text-xs mt-2"
              >
                Save Sprint Session
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-sm font-bold text-neutral-100">Sprint History Log</h3>

            {sprintSessions.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                No sprint sessions recorded yet. Record your weekly sprint session on the left.
              </div>
            ) : (
              <div className="space-y-3">
                {sprintSessions.map((s) => (
                  <div key={s.id} className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-200">
                        {s.reps.length} × {s.distanceMeters}m Sprints ({s.surface})
                      </span>
                      <span className="font-mono text-neutral-500 text-[11px]">{s.date}</span>
                    </div>
                    {s.techniqueNotes && (
                      <p className="text-[11px] text-neutral-400">{s.techniqueNotes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: PERSONAL RECORDS */}
      {activeTab === 'prs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <Award size={14} className="text-amber-400" />
              <span>Record New Milestone PR</span>
            </h3>

            <form onSubmit={handleSavePR} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Exercise / Movement</label>
                <input
                  type="text"
                  placeholder="e.g. Strict Dead-Hang Pull-ups"
                  required
                  value={newPRExercise}
                  onChange={(e) => setNewPRExercise(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-xs"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Category</label>
                <select
                  value={newPRCategory}
                  onChange={(e) => setNewPRCategory(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-xs"
                >
                  <option value="strength">Calisthenics & Strength</option>
                  <option value="endurance">Endurance & Running</option>
                  <option value="sprint">Sprint Speed</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Record Value</label>
                <input
                  type="text"
                  placeholder="e.g. 15 strict reps or 23:40 (5k)"
                  required
                  value={newPRValue}
                  onChange={(e) => setNewPRValue(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-neutral-100 text-neutral-950 font-medium rounded-md hover:bg-white text-xs mt-2"
              >
                Save Personal Record
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-sm font-bold text-neutral-100">All-Time Personal Records</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {personalRecords.map((pr) => (
                <div key={pr.id} className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-neutral-200">{pr.exercise}</span>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">{pr.category}</span>
                  </div>
                  <div className="text-base font-bold font-mono text-amber-400 tabular-nums">
                    {pr.recordValue}
                  </div>
                  {pr.notes && <p className="text-[11px] text-neutral-400">{pr.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
