import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Sparkles,
  Smile,
  Zap,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { JournalEntry, DailyReviewQuestions } from '../../types/index.ts';
import { getTodayDateString, formatDateDisplay } from '../../utils/dateUtils.ts';

export const JournalView: React.FC = () => {
  const { journalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useApp();

  const today = getTodayDateString();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Modal / Form state
  const [isWriting, setIsWriting] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [useDailyReviewTemplate, setUseDailyReviewTemplate] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moodRating, setMoodRating] = useState(4);
  const [energyRating, setEnergyRating] = useState(4);
  const [tagsInput, setTagsInput] = useState('');
  const [winsInput, setWinsInput] = useState('');
  const [gratitudeInput, setGratitudeInput] = useState('');

  // 8-question Daily Review Template fields
  const [qAccomplished, setQAccomplished] = useState('');
  const [qLearned, setQLearned] = useState('');
  const [qWorkout, setQWorkout] = useState('');
  const [qNutrition, setQNutrition] = useState('');
  const [qWentWell, setQWentWell] = useState('');
  const [qDistractions, setQDistractions] = useState('');
  const [qImproveTomorrow, setQImproveTomorrow] = useState('');
  const [qTopThreeTomorrow, setQTopThreeTomorrow] = useState('');

  // Collect all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    journalEntries.forEach((j) => j.tags?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [journalEntries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return journalEntries.filter((entry) => {
      if (selectedTag !== 'all' && !entry.tags?.includes(selectedTag)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const inTitle = entry.title.toLowerCase().includes(q);
        const inContent = entry.content.toLowerCase().includes(q);
        if (!inTitle && !inContent) return false;
      }
      return true;
    });
  }, [journalEntries, selectedTag, searchQuery]);

  const handleOpenNew = (isReview: boolean = false) => {
    setIsWriting(true);
    setEditingEntryId(null);
    setUseDailyReviewTemplate(isReview);
    setTitle(isReview ? `Evening Retrospective - ${formatDateDisplay(today, { short: true })}` : 'Daily Notes & Reflection');
    setContent('');
    setMoodRating(4);
    setEnergyRating(4);
    setTagsInput(isReview ? 'review, reflection' : 'notes');
    setWinsInput('');
    setGratitudeInput('');
    setQAccomplished('');
    setQLearned('');
    setQWorkout('');
    setQNutrition('');
    setQWentWell('');
    setQDistractions('');
    setQImproveTomorrow('');
    setQTopThreeTomorrow('');
  };

  const handleEdit = (entry: JournalEntry) => {
    setIsWriting(true);
    setEditingEntryId(entry.id);
    setUseDailyReviewTemplate(!!entry.isDailyReview);
    setTitle(entry.title);
    setContent(entry.content);
    setMoodRating(entry.moodRating || 4);
    setEnergyRating(entry.energyRating || 4);
    setTagsInput(entry.tags ? entry.tags.join(', ') : '');
    setWinsInput(entry.wins ? entry.wins.join(', ') : '');
    setGratitudeInput(entry.gratitude ? entry.gratitude.join(', ') : '');

    if (entry.dailyReview) {
      setQAccomplished(entry.dailyReview.accomplishments || '');
      setQLearned(entry.dailyReview.learnings || '');
      setQWorkout(entry.dailyReview.workoutDone || '');
      setQNutrition(entry.dailyReview.nutritionAdherence || '');
      setQWentWell(entry.dailyReview.whatWentWell || '');
      setQDistractions(entry.dailyReview.distractions || '');
      setQImproveTomorrow(entry.dailyReview.improvementsTomorrow || '');
      setQTopThreeTomorrow(entry.dailyReview.topThreeTomorrow || '');
    }
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    const wins = winsInput
      .split(',')
      .map((w) => w.trim())
      .filter(Boolean);
    const gratitude = gratitudeInput
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);

    const reviewQuestions: DailyReviewQuestions | undefined = useDailyReviewTemplate
      ? {
          accomplishments: qAccomplished,
          learnings: qLearned,
          workoutDone: qWorkout,
          nutritionAdherence: qNutrition,
          whatWentWell: qWentWell,
          distractions: qDistractions,
          improvementsTomorrow: qImproveTomorrow,
          topThreeTomorrow: qTopThreeTomorrow,
        }
      : undefined;

    if (editingEntryId) {
      await updateJournalEntry(editingEntryId, {
        title: title.trim(),
        content: content.trim(),
        moodRating,
        energyRating,
        tags,
        wins,
        gratitude,
        dailyReview: reviewQuestions,
        isDailyReview: useDailyReviewTemplate,
      });
    } else {
      await addJournalEntry({
        date: today,
        time,
        title: title.trim(),
        content: content.trim(),
        moodRating,
        energyRating,
        tags,
        wins,
        gratitude,
        dailyReview: reviewQuestions,
        isDailyReview: useDailyReviewTemplate,
      });
    }

    setIsWriting(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-neutral-900 border border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <span>Private Cognitive Clearing & Retrospectives</span>
            <span aria-hidden="true">·</span>
            <span>Distraction-Free</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-100">
            Daily Journal & 8-Question Retrospective
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Log wins, identify distractions, track mindset, and set clear intentions for tomorrow.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenNew(true)}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Sparkles size={13} className="text-amber-400" />
            <span>Evening Review Template</span>
          </button>

          <button
            onClick={() => handleOpenNew(false)}
            className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-950 hover:bg-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={13} />
            <span>Write Entry</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={13} className="absolute left-3 top-2.5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search reflections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-300 text-xs"
          >
            <option value="all">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Entry Cards List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-500">
            No journal entries match your criteria. Tap "Write Entry" to record your first thought.
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span className="font-mono">{entry.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>{entry.time}</span>
                    {entry.isDailyReview && (
                      <span className="text-[11px] text-amber-400 font-semibold ml-1">
                        · Daily Review
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-neutral-100 mt-1">{entry.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 bg-neutral-950 px-2.5 py-1 rounded border border-neutral-800">
                    <Smile size={13} className="text-emerald-400" />
                    <span>M:{entry.moodRating}/5</span>
                    <span className="text-neutral-600">·</span>
                    <Zap size={13} className="text-amber-400" />
                    <span>E:{entry.energyRating}/5</span>
                  </div>

                  <button
                    onClick={() => handleEdit(entry)}
                    className="p-1 text-neutral-500 hover:text-neutral-200"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => deleteJournalEntry(entry.id)}
                    className="p-1 text-neutral-500 hover:text-rose-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Free-form text */}
              {entry.content && (
                <p className="text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed">
                  {entry.content}
                </p>
              )}

              {/* Daily Review Q&A Accordion/Display if present */}
              {entry.dailyReview && (
                <div className="pt-3 border-t border-neutral-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-neutral-950/60 p-3 rounded-lg border border-neutral-800/80">
                  {entry.dailyReview.accomplishments && (
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Accomplished:</span>
                      <p className="text-neutral-200">{entry.dailyReview.accomplishments}</p>
                    </div>
                  )}
                  {entry.dailyReview.learnings && (
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Learned:</span>
                      <p className="text-neutral-200">{entry.dailyReview.learnings}</p>
                    </div>
                  )}
                  {entry.dailyReview.whatWentWell && (
                    <div>
                      <span className="text-neutral-500 block text-[11px]">What went well:</span>
                      <p className="text-neutral-200">{entry.dailyReview.whatWentWell}</p>
                    </div>
                  )}
                  {entry.dailyReview.distractions && (
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Distractions:</span>
                      <p className="text-neutral-200">{entry.dailyReview.distractions}</p>
                    </div>
                  )}
                  {entry.dailyReview.improvementsTomorrow && (
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Improve tomorrow:</span>
                      <p className="text-neutral-200">{entry.dailyReview.improvementsTomorrow}</p>
                    </div>
                  )}
                  {entry.dailyReview.topThreeTomorrow && (
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Tomorrow's Top 3:</span>
                      <p className="text-amber-400 font-medium">{entry.dailyReview.topThreeTomorrow}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tags & Wins footer */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px]">
                {entry.tags?.map((t) => (
                  <span key={t} className="text-neutral-400">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* WRITING MODAL */}
      {isWriting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="text-sm font-bold text-neutral-100">
                {editingEntryId ? 'Edit Entry' : useDailyReviewTemplate ? '8-Question Daily Review' : 'New Journal Entry'}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUseDailyReviewTemplate(!useDailyReviewTemplate)}
                  className={`text-xs px-2.5 py-1 rounded transition-colors ${
                    useDailyReviewTemplate ? 'bg-amber-950 text-amber-300' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {useDailyReviewTemplate ? 'Using Review Template' : '+ Toggle Review Template'}
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Mood Rating (1-5)</label>
                  <select
                    value={moodRating}
                    onChange={(e) => setMoodRating(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-200"
                  >
                    <option value={5}>5 - Energized / High</option>
                    <option value={4}>4 - Good / Solid</option>
                    <option value={3}>3 - Neutral</option>
                    <option value={2}>2 - Fatigued / Low</option>
                    <option value={1}>1 - Depleted</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Energy Rating (1-5)</label>
                  <select
                    value={energyRating}
                    onChange={(e) => setEnergyRating(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-200"
                  >
                    <option value={5}>5 - Peaking</option>
                    <option value={4}>4 - High</option>
                    <option value={3}>3 - Normal</option>
                    <option value={2}>2 - Sluggish</option>
                    <option value={1}>1 - Exhausted</option>
                  </select>
                </div>
              </div>

              {!useDailyReviewTemplate ? (
                <div>
                  <label className="block text-neutral-400 mb-1">Free-form Reflection</label>
                  <textarea
                    rows={6}
                    placeholder="Reflect on training, focus, nutrition, thoughts, and breakthroughs..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 focus:outline-hidden"
                  />
                </div>
              ) : (
                /* 8-QUESTION DAILY REVIEW FORM */
                <div className="space-y-3 bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">1. What did I accomplish today?</label>
                    <input
                      type="text"
                      placeholder="e.g. 5k zone 2 run, 2 LeetCode questions, budget ledger updated"
                      value={qAccomplished}
                      onChange={(e) => setQAccomplished(e.target.value)}
                      className="w-full px-2.5 py-1 bg-neutral-900 border border-neutral-700 rounded text-neutral-100"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">2. What did I learn?</label>
                    <input
                      type="text"
                      placeholder="e.g. BFS cycle detection pattern, importance of cadence in running"
                      value={qLearned}
                      onChange={(e) => setQLearned(e.target.value)}
                      className="w-full px-2.5 py-1 bg-neutral-900 border border-neutral-700 rounded text-neutral-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1">3. Did I complete my planned workout?</label>
                      <input
                        type="text"
                        placeholder="e.g. Yes, strict form on squats and lunges"
                        value={qWorkout}
                        onChange={(e) => setQWorkout(e.target.value)}
                        className="w-full px-2.5 py-1 bg-neutral-900 border border-neutral-700 rounded text-neutral-100"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1">4. Did I follow nutrition & recovery?</label>
                      <input
                        type="text"
                        placeholder="e.g. Hit 135g protein, 3.5L water"
                        value={qNutrition}
                        onChange={(e) => setQNutrition(e.target.value)}
                        className="w-full px-2.5 py-1 bg-neutral-900 border border-neutral-700 rounded text-neutral-100"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1">5. What went well?</label>
                      <input
                        type="text"
                        value={qWentWell}
                        onChange={(e) => setQWentWell(e.target.value)}
                        className="w-full px-2.5 py-1 bg-neutral-900 border border-neutral-700 rounded text-neutral-100"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1">6. What distracted me?</label>
                      <input
                        type="text"
                        placeholder="e.g. Social media check during afternoon block"
                        value={qDistractions}
                        onChange={(e) => setQDistractions(e.target.value)}
                        className="w-full px-2.5 py-1 bg-neutral-900 border border-neutral-700 rounded text-neutral-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">7. What should I improve tomorrow?</label>
                    <input
                      type="text"
                      placeholder="e.g. Start morning session 15 mins earlier, drink 1L before lunch"
                      value={qImproveTomorrow}
                      onChange={(e) => setQImproveTomorrow(e.target.value)}
                      className="w-full px-2.5 py-1 bg-neutral-900 border border-neutral-700 rounded text-neutral-100"
                    />
                  </div>
                  <div>
                    <label className="block text-amber-400 font-semibold mb-1">8. What are tomorrow’s top three priorities?</label>
                    <input
                      type="text"
                      placeholder="e.g. 1) Upper body workout 2) Tree DP study 3) Grocery restock"
                      value={qTopThreeTomorrow}
                      onChange={(e) => setQTopThreeTomorrow(e.target.value)}
                      className="w-full px-2.5 py-1 bg-neutral-900 border border-neutral-700 rounded text-amber-300 font-medium"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. mindset, training, dsa"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-200"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Gratitude (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Good weather for running"
                    value={gratitudeInput}
                    onChange={(e) => setGratitudeInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsWriting(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-100 text-neutral-950 rounded font-medium hover:bg-white"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
