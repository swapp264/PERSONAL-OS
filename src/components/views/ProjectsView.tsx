import React, { useState } from 'react';
import {
  FolderGit2,
  BookOpen,
  Plus,
  CheckCircle2,
  Circle,
  Tag,
  Trash2,
  Edit2,
  ExternalLink,
  Code,
  Bug,
  Lightbulb,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { Project, KnowledgeNote, ProjectPriority, ProjectStatus } from '../../types/index.ts';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    knowledgeNotes,
    addKnowledgeNote,
    deleteKnowledgeNote,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'projects' | 'knowledge'>('projects');

  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projName, setProjName] = useState('');
  const [projDescription, setProjDescription] = useState('');
  const [projPriority, setProjPriority] = useState<ProjectPriority>('medium');
  const [projStatus, setProjStatus] = useState<ProjectStatus>('active');
  const [projDeadline, setProjDeadline] = useState('2026-11-30');
  const [projLinks, setProjLinks] = useState('');

  // Note Modal State
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState<'concept' | 'bug_fix' | 'solution' | 'idea' | 'lesson'>('concept');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('');

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;

    const links = projLinks
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    await addProject({
      name: projName.trim(),
      description: projDescription.trim(),
      status: projStatus,
      priority: projPriority,
      deadline: projDeadline,
      milestones: [],
      resourceLinks: links,
    });

    setProjName('');
    setProjDescription('');
    setIsProjectModalOpen(false);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    const tags = noteTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    await addKnowledgeNote({
      title: noteTitle.trim(),
      category: noteCategory,
      content: noteContent.trim(),
      tags,
    });

    setNoteTitle('');
    setNoteContent('');
    setNoteTags('');
    setIsNoteModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-neutral-900 border border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <span>Engineering Builds & Knowledge Base</span>
            <span aria-hidden="true">·</span>
            <span>Local Vault</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-100">
            Projects & Knowledge Vault
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Track coding projects, record solved bugs, algorithmic patterns, and architecture lessons.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'projects' ? (
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-950 hover:bg-white flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={13} />
              <span>New Project</span>
            </button>
          ) : (
            <button
              onClick={() => setIsNoteModalOpen(true)}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-950 hover:bg-white flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={13} />
              <span>Record Knowledge Note</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
            activeTab === 'projects' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FolderGit2 size={13} />
          <span>Active Projects ({projects.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
            activeTab === 'knowledge' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <BookOpen size={13} />
          <span>Knowledge Vault ({knowledgeNotes.length})</span>
        </button>
      </div>

      {/* TAB 1: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <div key={proj.id} className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-[11px] font-mono text-neutral-400 uppercase">{proj.priority} Priority</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-amber-400 capitalize">{proj.status}</span>
                  <button onClick={() => deleteProject(proj.id)} className="text-neutral-500 hover:text-rose-400">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-neutral-100">{proj.name}</h3>
                <p className="text-xs text-neutral-400 mt-1">{proj.description}</p>
              </div>

              {proj.milestones.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
                  <span className="text-[11px] text-neutral-400 font-semibold">Milestones:</span>
                  {proj.milestones.map((m) => (
                    <div key={m.id} className="flex items-center gap-2 text-xs text-neutral-300">
                      {m.completed ? (
                        <CheckCircle2 size={13} className="text-emerald-400" />
                      ) : (
                        <Circle size={13} className="text-neutral-600" />
                      )}
                      <span className={m.completed ? 'line-through text-neutral-500' : ''}>{m.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {proj.resourceLinks.length > 0 && (
                <div className="pt-2 text-[11px] space-y-1">
                  <span className="text-neutral-500">Resources:</span>
                  {proj.resourceLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-cyan-400 hover:underline truncate"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: KNOWLEDGE VAULT NOTES */}
      {activeTab === 'knowledge' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {knowledgeNotes.length === 0 ? (
            <div className="col-span-2 p-12 text-center rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-500">
              No knowledge notes saved yet. Capture bugs fixed, architecture lessons, or concepts above.
            </div>
          ) : (
            knowledgeNotes.map((note) => (
              <div key={note.id} className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase">{note.category.replace('_', ' ')}</span>
                  <button onClick={() => deleteKnowledgeNote(note.id)} className="text-neutral-500 hover:text-rose-400">
                    <Trash2 size={13} />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-neutral-100">{note.title}</h3>
                <p className="text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed">{note.content}</p>

                <div className="flex flex-wrap gap-1.5 pt-2 text-[11px]">
                  {note.tags?.map((t) => (
                    <span key={t} className="text-neutral-500">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: NEW PROJECT */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-neutral-100 mb-3">Create Project</h3>

            <form onSubmit={handleSaveProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Cache in Go or College Compiler Lab"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Goals, architecture, and scope..."
                  value={projDescription}
                  onChange={(e) => setProjDescription(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Priority</label>
                  <select
                    value={projPriority}
                    onChange={(e) => setProjPriority(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-200"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Status</label>
                  <select
                    value={projStatus}
                    onChange={(e) => setProjStatus(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-200"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Resource Links (one per line)</label>
                <textarea
                  rows={2}
                  placeholder="https://github.com/..."
                  value={projLinks}
                  onChange={(e) => setProjLinks(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-100 text-neutral-950 rounded font-medium hover:bg-white"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KNOWLEDGE NOTE */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-neutral-100 mb-3">Record Knowledge Note</h3>

            <form onSubmit={handleSaveNote} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Note Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Memory Leak caused by dangling EventListener in React"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Category</label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-200"
                  >
                    <option value="concept">Concept Learned</option>
                    <option value="bug_fix">Bug Fixed & Diagnosis</option>
                    <option value="solution">Problem Solution</option>
                    <option value="idea">Architectural Idea</option>
                    <option value="lesson">Lesson From Mistake</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="react, memory, performance"
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Content / Code Snippet / Explanation</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Detailed breakdown of the concept, the bug root cause, or key code pattern..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-100 text-neutral-950 rounded font-medium hover:bg-white"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
