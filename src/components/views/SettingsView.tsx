import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Sun,
  Moon,
  Shield,
  Database,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const SettingsView: React.FC = () => {
  const {
    userSettings,
    updateUserSettings,
    theme,
    toggleTheme,
    exportAllDataJSON,
    importDataJSON,
    resetAllData,
  } = useApp();

  const [userName, setUserName] = useState(userSettings?.userName || 'Athlete & Engineer');
  const [currencySymbol, setCurrencySymbol] = useState(userSettings?.currencySymbol || '₹');
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserSettings({
      userName: userName.trim(),
      currencySymbol: currencySymbol.trim(),
    });
    alert('User preferences saved!');
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const jsonString = await exportAllDataJSON();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personal_os_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = await importDataJSON(content);
        setImportStatus(res);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmReset = async () => {
    await resetAllData();
    setShowResetConfirm(false);
    alert('Database successfully reset and re-seeded with initial templates.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800">
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
          <span>System Preferences & Local Storage</span>
          <span aria-hidden="true">·</span>
          <span>Offline-Ready</span>
        </div>
        <h2 className="text-xl font-bold text-neutral-100">
          Settings & Data Management
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Your data lives exclusively on this device inside IndexedDB. Export regular JSON backups for safety.
        </p>
      </div>

      {/* User Preferences Form */}
      <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-bold text-neutral-100">User Profile & Currency</h3>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 mb-1">Display Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Default Currency Symbol</label>
              <select
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full px-2.5 py-2 bg-neutral-950 border border-neutral-700 rounded text-neutral-200"
              >
                <option value="₹">₹ - Indian Rupee (INR)</option>
                <option value="$">$ - US Dollar (USD)</option>
                <option value="€">€ - Euro (EUR)</option>
                <option value="£">£ - British Pound (GBP)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
            <div className="flex items-center gap-2 text-neutral-300">
              <span>Theme:</span>
              <button
                type="button"
                onClick={toggleTheme}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded flex items-center gap-1.5 text-neutral-200 transition-colors"
              >
                {theme === 'dark' ? <Moon size={13} /> : <Sun size={13} />}
                <span className="capitalize">{theme} Mode</span>
              </button>
            </div>

            <button
              type="submit"
              className="px-4 py-1.5 bg-neutral-100 text-neutral-950 rounded font-medium hover:bg-white"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>

      {/* Data Backup, Export & Import */}
      <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
          <Database size={16} className="text-emerald-400" />
          <h3 className="text-sm font-bold text-neutral-100">JSON Backup & Migration</h3>
        </div>

        <p className="text-xs text-neutral-400">
          Export your entire Personal OS dataset into a portable, standard JSON file. You can import this file at any time or on another browser.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportData}
            disabled={isExporting}
            className="px-4 py-2 bg-neutral-100 text-neutral-950 rounded-md font-medium hover:bg-white text-xs flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            <Download size={14} />
            <span>{isExporting ? 'Exporting...' : 'Export Complete Backup (JSON)'}</span>
          </button>

          <label className="px-4 py-2 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white rounded-md font-medium text-xs flex items-center gap-2 cursor-pointer transition-colors border border-neutral-700">
            <Upload size={14} />
            <span>Import JSON Backup</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
        </div>

        {importStatus && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
              importStatus.success
                ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                : 'bg-rose-950/60 border-rose-800/80 text-rose-300'
            }`}
          >
            {importStatus.success ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
            <span>{importStatus.message}</span>
          </div>
        )}
      </div>

      {/* Local-First Architecture Guarantee */}
      <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
          <Shield size={16} className="text-cyan-400" />
          <h3 className="text-sm font-bold text-neutral-100">Privacy & Architecture Guarantee</h3>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          PERSONAL OS is 100% private and client-side authoritative. No banking credentials are ever asked or synchronized. All workout reps, sprint split calculations, food entries, and journal reflections are persisted inside your browser's IndexedDB engine.
        </p>
      </div>

      {/* Destructive Zone: Reset All Data */}
      <div className="p-5 rounded-xl bg-rose-950/20 border border-rose-900/60 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">Reset Database</h4>
            <p className="text-xs text-rose-400/80 mt-0.5">
              Permanently clear all user records and reload fresh starter templates.
            </p>
          </div>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-3.5 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 rounded text-xs font-medium transition-colors"
          >
            Reset Database
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="relative w-full max-w-sm rounded-xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle size={16} />
              <span>Confirm Database Reset</span>
            </div>
            <p className="text-neutral-300">
              Are you sure you want to reset the database? All custom tasks, workout history, expenses, and notes will be cleared and replaced with default hybrid templates.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-3.5 py-1.5 bg-rose-600 text-white rounded font-medium hover:bg-rose-500"
              >
                Yes, Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
