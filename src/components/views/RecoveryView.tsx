import React, { useState, useMemo } from 'react';
import {
  HeartPulse,
  Moon,
  Smile,
  Zap,
  Activity,
  AlertTriangle,
  Calendar,
  Plus,
  Save,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useApp } from '../../context/AppContext.tsx';
import { getTodayDateString, formatDateDisplay, addDays } from '../../utils/dateUtils.ts';

export const RecoveryView: React.FC = () => {
  const { dailyCheckIns, saveDailyCheckIn, workoutSessions, focusSessions } = useApp();
  const today = getTodayDateString();

  const todayCheckIn = useMemo(() => {
    return dailyCheckIns.find((c) => c.date === today);
  }, [dailyCheckIns, today]);

  // Form state
  const [sleepHours, setSleepHours] = useState(String(todayCheckIn?.sleepHours || 7.5));
  const [sleepQuality, setSleepQuality] = useState(todayCheckIn?.sleepQuality || 4);
  const [mood, setMood] = useState(todayCheckIn?.mood || 4);
  const [energy, setEnergy] = useState(todayCheckIn?.energy || 4);
  const [stress, setStress] = useState(todayCheckIn?.stress || 2);
  const [muscleSoreness, setMuscleSoreness] = useState(todayCheckIn?.muscleSoreness || 2);
  const [motivation, setMotivation] = useState(todayCheckIn?.motivation || 4);
  const [notes, setNotes] = useState(todayCheckIn?.notes || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Past 14 days chart data
  const chartData = useMemo(() => {
    const list = [];
    for (let i = 13; i >= 0; i--) {
      const d = addDays(today, -i);
      const checkIn = dailyCheckIns.find((c) => c.date === d);
      list.push({
        date: d.slice(5),
        sleep: checkIn?.sleepHours || null,
        energy: checkIn?.energy || null,
        soreness: checkIn?.muscleSoreness || null,
        mood: checkIn?.mood || null,
      });
    }
    return list;
  }, [dailyCheckIns, today]);

  const handleSaveCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveDailyCheckIn({
      date: today,
      sleepHours: parseFloat(sleepHours) || 7.5,
      sleepQuality,
      mood,
      energy,
      stress,
      muscleSoreness,
      motivation,
      notes: notes.trim() || undefined,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // High fatigue warning
  const isHighFatigue = muscleSoreness >= 4 || energy <= 2;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-neutral-900 border border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <span>Sleep, Central Nervous System & Recovery</span>
            <span aria-hidden="true">·</span>
            <span>Autonomic Balance</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-100">
            Recovery & Daily Physiological Check-in
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Log sleep metrics, energy, and muscle soreness to prevent overtraining and regulate sprint progression.
          </p>
        </div>

        {savedSuccess && (
          <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
            ✓ Check-in saved for today
          </div>
        )}
      </div>

      {/* Advisory Banner if high fatigue */}
      {isHighFatigue && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 flex items-center gap-3 text-xs text-rose-300">
          <AlertTriangle size={16} className="shrink-0 text-rose-400" />
          <div>
            <span className="font-semibold">Overtraining Precaution:</span> High muscle soreness ({muscleSoreness}/5) or depleted energy ({energy}/5) detected. Prioritize hydration (3.5L+), 8 hours of sleep, and consider light active recovery instead of maximal intensity lifting or sprints.
          </div>
        </div>
      )}

      {/* Check-in Form + Recent Trends Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Check-in Form (1 Col) */}
        <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-100">Today's Check-in</h3>
            <span className="text-xs font-mono text-neutral-400">{today}</span>
          </div>

          <form onSubmit={handleSaveCheckIn} className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">Sleep Duration (Hours)</label>
              <input
                type="number"
                step="0.25"
                min="3"
                max="14"
                required
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded font-mono text-sm text-neutral-100 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">Sleep Quality (1-5)</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSleepQuality(num)}
                    className={`flex-1 py-1 rounded text-center font-mono ${
                      sleepQuality === num ? 'bg-neutral-100 text-neutral-950 font-bold' : 'bg-neutral-950 text-neutral-400'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Energy (1-5)</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setEnergy(num)}
                      className={`flex-1 py-1 rounded text-center font-mono ${
                        energy === num ? 'bg-amber-400 text-neutral-950 font-bold' : 'bg-neutral-950 text-neutral-400'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Mood (1-5)</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMood(num)}
                      className={`flex-1 py-1 rounded text-center font-mono ${
                        mood === num ? 'bg-emerald-400 text-neutral-950 font-bold' : 'bg-neutral-950 text-neutral-400'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Muscle Soreness (1-5)</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMuscleSoreness(num)}
                      className={`flex-1 py-1 rounded text-center font-mono ${
                        muscleSoreness === num ? 'bg-rose-400 text-neutral-950 font-bold' : 'bg-neutral-950 text-neutral-400'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Stress (1-5)</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setStress(num)}
                      className={`flex-1 py-1 rounded text-center font-mono ${
                        stress === num ? 'bg-purple-400 text-neutral-950 font-bold' : 'bg-neutral-950 text-neutral-400'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Notes on Soreness / Joints / Recovery</label>
              <textarea
                rows={2}
                placeholder="e.g. Calves slightly tight from yesterday's sprints"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-neutral-100 text-neutral-950 font-bold rounded-md hover:bg-white text-xs flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Save size={13} />
              <span>Update Today's Recovery Log</span>
            </button>
          </form>
        </div>

        {/* 14-Day Recovery Charts (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-100">14-Day Sleep & Physiological Trends</h3>
            <span className="text-xs font-mono text-neutral-400">Sleep (hrs) vs Energy</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" stroke="#525252" fontSize={11} />
                <YAxis domain={[0, 10]} stroke="#525252" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', fontSize: '11px', borderRadius: '8px' }}
                />
                <Line
                  type="monotone"
                  dataKey="sleep"
                  name="Sleep (hrs)"
                  stroke="#38BDF8"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="energy"
                  name="Energy (1-5)"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="soreness"
                  name="Soreness (1-5)"
                  stroke="#F43F5E"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs border-t border-neutral-800/80">
            <div className="p-2 rounded bg-neutral-950">
              <span className="text-neutral-500 block text-[11px]">Avg Sleep (14d)</span>
              <span className="font-mono text-base font-bold text-sky-400 tabular-nums">
                {dailyCheckIns.length > 0
                  ? (
                      dailyCheckIns.reduce((s, c) => s + c.sleepHours, 0) / dailyCheckIns.length
                    ).toFixed(1)
                  : '7.5'}{' '}
                hrs
              </span>
            </div>
            <div className="p-2 rounded bg-neutral-950">
              <span className="text-neutral-500 block text-[11px]">Avg Energy</span>
              <span className="font-mono text-base font-bold text-amber-400 tabular-nums">
                {dailyCheckIns.length > 0
                  ? (dailyCheckIns.reduce((s, c) => s + c.energy, 0) / dailyCheckIns.length).toFixed(1)
                  : '4.0'}
                /5
              </span>
            </div>
            <div className="p-2 rounded bg-neutral-950">
              <span className="text-neutral-500 block text-[11px]">Avg Soreness</span>
              <span className="font-mono text-base font-bold text-rose-400 tabular-nums">
                {dailyCheckIns.length > 0
                  ? (
                      dailyCheckIns.reduce((s, c) => s + c.muscleSoreness, 0) / dailyCheckIns.length
                    ).toFixed(1)
                  : '2.0'}
                /5
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
