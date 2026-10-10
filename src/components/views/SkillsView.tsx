import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Clock,
  Play,
  Pause,
  Square,
  Plus,
  BookOpen,
  Edit2,
  Trash2,
  Award,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { Skill, ProficiencyLevel } from '../../types/index.ts';
import { formatMinutesToHours, formatSecondsToTimer } from '../../utils/formatters.ts';
import { getTodayDateString, formatDateDisplay } from '../../utils/dateUtils.ts';

export const SkillsView: React.FC = () => {
  const {
    skills,
    addSkill,
    updateSkill,
    learningLogs,
    addLearningLog,
    focusSessions,
    activeTimer,
    startFocusTimer,
    pauseFocusTimer,
    resumeFocusTimer,
    finishFocusTimer,
    cancelFocusTimer,
  } = useApp();

  const today = getTodayDateString();

  // Active Focus Setup State
  const [selectedSkillId, setSelectedSkillId] = useState<string>(skills[0]?.id || '');
  const [timerPreset, setTimerPreset] = useState<'25' | '50' | '90' | 'stopwatch'>('25');
  const [sessionNotes, setSessionNotes] = useState('');

  // Learning Log Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logSkillId, setLogSkillId] = useState<string>(skills[0]?.id || '');
  const [logTopic, setLogTopic] = useState('');
  const [logMinutes, setLogMinutes] = useState('45');
  const [logLearned, setLogLearned] = useState('');
  const [logDifficulties, setLogDifficulties] = useState('');
  const [logNextSteps, setLogNextSteps] = useState('');

  // New Skill Modal State
  const [isNewSkillModalOpen, setIsNewSkillModalOpen] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState('Software Engineering');
  const [skillTargetHours, setSkillTargetHours] = useState('100');
  const [skillProficiency, setSkillProficiency] = useState<ProficiencyLevel>('beginner');
  const [skillDescription, setSkillDescription] = useState('');

  // Total learning time
  const totalLoggedMinutes = useMemo(() => {
    return skills.reduce((sum, s) => sum + (s.loggedMinutes || 0), 0);
  }, [skills]);

  const handleStartTimer = () => {
    const selected = skills.find((s) => s.id === selectedSkillId);
    if (timerPreset === 'stopwatch') {
      startFocusTimer({
        skillId: selectedSkillId || undefined,
        skillName: selected ? selected.name : 'Deep Work Session',
        mode: 'stopwatch',
      });
    } else {
      startFocusTimer({
        skillId: selectedSkillId || undefined,
        skillName: selected ? selected.name : 'Focus Session',
        durationMinutes: parseInt(timerPreset) || 25,
        mode: 'countdown',
      });
    }
  };

  const handleSaveLearningLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTopic.trim()) return;

    await addLearningLog({
      date: today,
      skillId: logSkillId,
      topic: logTopic.trim(),
      durationMinutes: parseInt(logMinutes) || 30,
      whatILearned: logLearned.trim(),
      difficulties: logDifficulties.trim() || undefined,
      nextSteps: logNextSteps.trim() || undefined,
    });

    setLogTopic('');
    setLogLearned('');
    setLogDifficulties('');
    setLogNextSteps('');
    setIsLogModalOpen(false);
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    if (editingSkillId) {
      await updateSkill(editingSkillId, {
        name: skillName.trim(),
        category: skillCategory.trim(),
        targetHours: parseInt(skillTargetHours) || 50,
        proficiency: skillProficiency,
        description: skillDescription.trim() || undefined,
      });
    } else {
      await addSkill({
        name: skillName.trim(),
        category: skillCategory.trim(),
        targetHours: parseInt(skillTargetHours) || 50,
        loggedMinutes: 0,
        proficiency: skillProficiency,
        status: 'active',
        description: skillDescription.trim() || undefined,
      });
    }
    setIsNewSkillModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-neutral-900 border border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <span>Deliberate Practice & Technical Mastery</span>
            <span aria-hidden="true">·</span>
            <span>Total: {formatMinutesToHours(totalLoggedMinutes)}</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-100">
            Skills, Coding & Focus Sessions
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Pomodoro focus timer with browser-refresh recovery, LeetCode / CS trackers, and learning notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <BookOpen size={13} />
            <span>Record Learning Log</span>
          </button>

          <button
            onClick={() => {
              setIsNewSkillModalOpen(true);
              setEditingSkillId(null);
              setSkillName('');
              setSkillDescription('');
              setSkillCategory('Software Engineering');
              setSkillTargetHours('100');
              setSkillProficiency('beginner');
            }}
            className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-950 hover:bg-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={13} />
            <span>New Skill</span>
          </button>
        </div>
      </div>

      {/* Focus Timer Centerpiece */}
      <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-neutral-400">
            <Clock size={14} className="text-amber-400" />
            <span className="font-semibold text-neutral-300">
              {activeTimer.isActive ? 'Active Focus Session' : 'Ready to Focus'}
            </span>
            {activeTimer.isActive && (
              <span className="text-[11px] text-amber-400">· In Progress</span>
            )}
          </div>
          <div className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-neutral-100 tabular-nums">
            {formatSecondsToTimer(activeTimer.remainingSeconds)}
          </div>
          <p className="text-xs text-neutral-400">
            {activeTimer.isActive
              ? `Working on: ${activeTimer.skillName || 'Deep Focus'}`
              : 'Choose a skill and duration below to start uninterrupted practice.'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {!activeTimer.isActive ? (
            <>
              <select
                value={selectedSkillId}
                onChange={(e) => setSelectedSkillId(e.target.value)}
                className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-200"
              >
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
                <option value="">General Deep Work</option>
              </select>

              <div className="flex items-center p-1 bg-neutral-950 rounded-md border border-neutral-800 text-xs font-mono">
                {(['25', '50', '90', 'stopwatch'] as const).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setTimerPreset(preset)}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      timerPreset === preset ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400'
                    }`}
                  >
                    {preset === 'stopwatch' ? 'Stopwatch' : `${preset}m`}
                  </button>
                ))}
              </div>

              <button
                onClick={handleStartTimer}
                className="px-5 py-2 bg-neutral-100 text-neutral-950 font-bold rounded-md hover:bg-white text-xs flex items-center gap-2 shadow-xs"
              >
                <Play size={13} fill="currentColor" />
                <span>Start Session</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {activeTimer.isPaused ? (
                <button
                  onClick={resumeFocusTimer}
                  className="px-4 py-2 bg-neutral-800 text-neutral-200 rounded-md hover:bg-neutral-700 text-xs flex items-center gap-1.5"
                >
                  <Play size={13} />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  onClick={pauseFocusTimer}
                  className="px-4 py-2 bg-neutral-800 text-neutral-200 rounded-md hover:bg-neutral-700 text-xs flex items-center gap-1.5"
                >
                  <Pause size={13} />
                  <span>Pause</span>
                </button>
              )}

              <button
                onClick={() => finishFocusTimer(sessionNotes)}
                className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-500 text-xs flex items-center gap-1.5"
              >
                <Square size={13} />
                <span>Complete & Save</span>
              </button>

              <button
                onClick={cancelFocusTimer}
                className="px-3 py-2 text-neutral-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Skills Showcase Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-neutral-100">Core Skills & Competencies</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {skills.map((skill) => {
            const targetMins = skill.targetHours * 60;
            const pct = Math.min(100, Math.round(((skill.loggedMinutes || 0) / targetMins) * 100));

            return (
              <div
                key={skill.id}
                className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <span className="text-[11px] font-mono text-neutral-400 uppercase">{skill.category}</span>
                    <span className="text-xs font-mono capitalize text-amber-400">{skill.proficiency}</span>
                  </div>

                  <h4 className="text-sm font-bold text-neutral-100 mt-2">{skill.name}</h4>
                  {skill.description && (
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{skill.description}</p>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                  <div className="flex justify-between text-xs text-neutral-400 font-mono tabular-nums">
                    <span>{formatMinutesToHours(skill.loggedMinutes || 0)} logged</span>
                    <span>{skill.targetHours}h target ({pct}%)</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-neutral-200 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => {
                        setSelectedSkillId(skill.id);
                        handleStartTimer();
                      }}
                      className="text-xs text-neutral-300 hover:text-white flex items-center gap-1 font-medium"
                    >
                      <Play size={12} />
                      <span>Focus on Skill</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsNewSkillModalOpen(true);
                        setEditingSkillId(skill.id);
                        setSkillName(skill.name);
                        setSkillCategory(skill.category);
                        setSkillTargetHours(String(skill.targetHours));
                        setSkillProficiency(skill.proficiency);
                        setSkillDescription(skill.description || '');
                      }}
                      className="text-xs text-neutral-500 hover:text-neutral-300"
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Learning Log History Table */}
      <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-bold text-neutral-100">Learning Activity Log ({learningLogs.length})</h3>

        {learningLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No learning records logged yet. Click "Record Learning Log" above.
          </div>
        ) : (
          <div className="space-y-3">
            {learningLogs.map((log) => {
              const skill = skills.find((s) => s.id === log.skillId);
              return (
                <div key={log.id} className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-200">{log.topic}</span>
                      {skill && <span className="text-[11px] text-neutral-500">({skill.name})</span>}
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-400">
                      <span>{log.durationMinutes} mins</span>
                      <span aria-hidden="true">·</span>
                      <span>{log.date}</span>
                    </div>
                  </div>

                  <p className="text-neutral-300">{log.whatILearned}</p>
                  {log.difficulties && (
                    <p className="text-[11px] text-amber-400/80">Difficulties: {log.difficulties}</p>
                  )}
                  {log.nextSteps && (
                    <p className="text-[11px] text-neutral-400">Next step: {log.nextSteps}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: RECORD LEARNING LOG */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-neutral-100 mb-3">Record Learning Session</h3>

            <form onSubmit={handleSaveLearningLog} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Related Skill</label>
                  <select
                    value={logSkillId}
                    onChange={(e) => setLogSkillId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-200"
                  >
                    {skills.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    required
                    value={logMinutes}
                    onChange={(e) => setLogMinutes(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded font-mono text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Topic / Problem Solved</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Graph BFS, LeetCode Course Schedule II"
                  value={logTopic}
                  onChange={(e) => setLogTopic(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Key Principles Learned</label>
                <textarea
                  rows={2}
                  required
                  placeholder="What clicked? What pattern was reinforced?"
                  value={logLearned}
                  onChange={(e) => setLogLearned(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Difficulties / Edge Cases Encountered</label>
                <input
                  type="text"
                  placeholder="e.g. Cycle detection with in-degree array vs visited sets"
                  value={logDifficulties}
                  onChange={(e) => setLogDifficulties(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-200"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Next Immediate Action</label>
                <input
                  type="text"
                  placeholder="e.g. Implement Topological Sort using Kahn's algorithm"
                  value={logNextSteps}
                  onChange={(e) => setLogNextSteps(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-100 text-neutral-950 rounded font-medium hover:bg-white"
                >
                  Save Learning Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW / EDIT SKILL */}
      {isNewSkillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-neutral-100 mb-3">
              {editingSkillId ? 'Edit Skill Definition' : 'Add New Skill'}
            </h3>

            <form onSubmit={handleSaveSkill} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. System Design or Discrete Math"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Category</label>
                  <input
                    type="text"
                    value={skillCategory}
                    onChange={(e) => setSkillCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-200"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Target Hours</label>
                  <input
                    type="number"
                    value={skillTargetHours}
                    onChange={(e) => setSkillTargetHours(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded font-mono text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Manual Proficiency Level</label>
                <select
                  value={skillProficiency}
                  onChange={(e) => setSkillProficiency(e.target.value as ProficiencyLevel)}
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-200"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="mastery">Mastery</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Key milestones, books, or goals..."
                  value={skillDescription}
                  onChange={(e) => setSkillDescription(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsNewSkillModalOpen(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-100 text-neutral-950 rounded font-medium hover:bg-white"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
