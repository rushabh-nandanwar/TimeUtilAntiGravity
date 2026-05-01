import React, { useState } from 'react';
import { useStudyData } from '../context/StudyDataContext';
import { useTheme } from '../context/ThemeContext';
import { Download, Trash2, Plus, Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Settings() {
    const { settings, setSettings, clearAllData, sessions, goals, streak } = useStudyData();
    const { theme, toggleTheme } = useTheme();
    const toast = useToast();

    const [newSubject, setNewSubject] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        // Don't toast on every slider tick, just update state
    };

    const handleFocusOut = () => {
        toast('Settings saved ✓');
    };

    const handleAddSubject = (e) => {
        e.preventDefault();
        if (newSubject.trim() && !settings.subjects.includes(newSubject.trim())) {
            handleSettingChange('subjects', [...settings.subjects, newSubject.trim()]);
            setNewSubject('');
            toast('Subject added ✓');
        }
    };

    const handleDeleteSubject = (subject) => {
        handleSettingChange('subjects', settings.subjects.filter(s => s !== subject));
        toast('Subject removed');
    };

    const handleExportData = () => {
        const data = {
            sessions,
            goals,
            settings,
            streak,
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `studyos-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast('Data exported ✓');
    };

    const handleClearData = () => {
        if (deleteConfirm === 'DELETE') {
            clearAllData();
            setShowDeleteModal(false);
            setDeleteConfirm('');
            toast('All data cleared', 'danger');
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-300">
            <h2 className="text-3xl font-display font-bold text-app-text">Settings</h2>

            {/* Timer Settings */}
            <section className="bg-app-surface border border-app-border rounded-xl p-6 space-y-6 shadow-sm transition-all hover:shadow-md hover:border-app-primary/30">
                <h3 className="text-xl font-display font-semibold border-b border-app-border pb-4">Timer Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium">
                            <span>Work Duration</span>
                            <span className="text-app-primary">{settings.pomodoroWork} min</span>
                        </label>
                        <input type="range" min="5" max="60" step="5"
                            value={settings.pomodoroWork}
                            onChange={(e) => handleSettingChange('pomodoroWork', Number(e.target.value))}
                            onMouseUp={handleFocusOut}
                            onTouchEnd={handleFocusOut}
                            className="w-full accent-app-primary cursor-pointer" />
                    </div>
                    <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium">
                            <span>Short Break</span>
                            <span className="text-app-secondary">{settings.pomodoroShortBreak} min</span>
                        </label>
                        <input type="range" min="1" max="15" step="1"
                            value={settings.pomodoroShortBreak}
                            onChange={(e) => handleSettingChange('pomodoroShortBreak', Number(e.target.value))}
                            onMouseUp={handleFocusOut}
                            onTouchEnd={handleFocusOut}
                            className="w-full accent-app-secondary cursor-pointer" />
                    </div>
                    <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium">
                            <span>Long Break</span>
                            <span className="text-app-primary">{settings.pomodoroLongBreak} min</span>
                        </label>
                        <input type="range" min="10" max="30" step="5"
                            value={settings.pomodoroLongBreak}
                            onChange={(e) => handleSettingChange('pomodoroLongBreak', Number(e.target.value))}
                            onMouseUp={handleFocusOut}
                            onTouchEnd={handleFocusOut}
                            className="w-full accent-app-primary cursor-pointer" />
                    </div>
                    <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium">
                            <span>Pomodoros until Long Break</span>
                            <span className="text-app-secondary">{settings.pomodorosUntilLong}</span>
                        </label>
                        <input type="range" min="2" max="8" step="1"
                            value={settings.pomodorosUntilLong}
                            onChange={(e) => handleSettingChange('pomodorosUntilLong', Number(e.target.value))}
                            onMouseUp={handleFocusOut}
                            onTouchEnd={handleFocusOut}
                            className="w-full accent-app-secondary cursor-pointer" />
                    </div>
                </div>
            </section>

            {/* Study Settings */}
            <section className="bg-app-surface border border-app-border rounded-xl p-6 space-y-6 shadow-sm transition-all hover:shadow-md hover:border-app-primary/30">
                <h3 className="text-xl font-display font-semibold border-b border-app-border pb-4">Study Settings</h3>

                <div className="space-y-3">
                    <label className="flex justify-between text-sm font-medium max-w-md">
                        <span>Daily Target Hours</span>
                        <span className="text-app-primary">{settings.dailyTargetHours} hours</span>
                    </label>
                    <input type="range" min="1" max="16" step="0.5"
                        value={settings.dailyTargetHours}
                        onChange={(e) => handleSettingChange('dailyTargetHours', Number(e.target.value))}
                        onMouseUp={handleFocusOut}
                        onTouchEnd={handleFocusOut}
                        className="w-full accent-app-primary max-w-md cursor-pointer" />
                </div>

                <div className="space-y-4 pt-4">
                    <label className="text-sm font-medium block">Manage Subjects</label>
                    <div className="flex flex-wrap gap-2">
                        {settings.subjects.map(subject => (
                            <span key={subject} className="px-3 py-1.5 bg-app-bg border border-app-border rounded-full text-sm flex items-center gap-2">
                                {subject}
                                <button onClick={() => handleDeleteSubject(subject)} className="text-app-muted hover:text-app-danger transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                    <form onSubmit={handleAddSubject} className="flex gap-2 max-w-sm pt-2">
                        <input
                            type="text"
                            value={newSubject}
                            onChange={(e) => setNewSubject(e.target.value)}
                            placeholder="New subject..."
                            className="flex-1 bg-app-bg border border-app-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-app-primary focus:ring-1 focus:ring-app-primary transition-all"
                        />
                        <button type="submit" disabled={!newSubject.trim()}
                            className="p-2 bg-app-primary text-white rounded-lg disabled:opacity-50 hover:bg-app-primary/90 active:scale-97 transition-all">
                            <Plus size={20} />
                        </button>
                    </form>
                </div>
            </section>

            {/* Preferences */}
            <section className="bg-app-surface border border-app-border rounded-xl p-6 space-y-6 shadow-sm transition-all hover:shadow-md hover:border-app-primary/30">
                <h3 className="text-xl font-display font-semibold border-b border-app-border pb-4">Preferences</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => { toggleTheme(); toast('Theme saved ✓'); }} className="flex items-center justify-between p-4 border border-app-border rounded-lg hover:border-app-primary focus:ring-1 focus:ring-app-primary transition-all active:scale-97 group">
                        <div className="flex items-center gap-3">
                            {theme === 'dark' ? <Moon size={20} className="text-app-primary group-hover:scale-110 transition-transform" /> : <Sun size={20} className="text-app-primary group-hover:scale-110 transition-transform" />}
                            <span className="font-medium">Theme</span>
                        </div>
                        <span className="text-app-muted capitalize">{theme}</span>
                    </button>

                    <button onClick={() => { handleSettingChange('soundEnabled', !settings.soundEnabled); handleFocusOut(); }}
                        className="flex items-center justify-between p-4 border border-app-border rounded-lg hover:border-app-primary focus:ring-1 focus:ring-app-primary transition-all active:scale-97 group">
                        <div className="flex items-center gap-3">
                            {settings.soundEnabled ? <Volume2 size={20} className="text-app-secondary group-hover:scale-110 transition-transform" /> : <VolumeX size={20} className="text-app-muted group-hover:scale-110 transition-transform" />}
                            <span className="font-medium">Timer Sounds</span>
                        </div>
                        <span className="text-app-muted">{settings.soundEnabled ? 'On' : 'Off'}</span>
                    </button>
                </div>
            </section>

            {/* Data Management */}
            <section className="bg-app-surface border border-app-danger/30 rounded-xl p-6 space-y-5 shadow-sm">
                <div className="space-y-1">
                    <h3 className="text-xl font-display font-semibold text-app-danger">Danger Zone</h3>
                    <p className="text-sm text-app-muted">Manage your local storage data.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button onClick={handleExportData} className="flex-1 flex items-center justify-center gap-2 py-3 border border-app-border rounded-lg text-app-text hover:bg-app-bg hover:border-app-primary transition-all active:scale-97 font-medium">
                        <Download size={18} />
                        Export All Data
                    </button>
                    <button onClick={() => setShowDeleteModal(true)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-app-danger/10 text-app-danger rounded-lg hover:bg-app-danger/20 transition-all active:scale-97 font-medium border border-app-danger/20">
                        <Trash2 size={18} />
                        Clear All Data
                    </button>
                </div>
            </section>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-app-surface border border-app-border rounded-xl p-6 max-w-md w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-display font-bold text-app-danger flex items-center gap-2">
                            <Trash2 size={24} /> Delete All Data
                        </h3>
                        <p className="text-app-muted text-sm">
                            This action cannot be undone. All your sessions, goals, and settings will be permanently erased.
                        </p>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type "DELETE" to confirm</label>
                            <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
                                className="w-full bg-app-bg border border-app-border rounded-lg px-4 py-3 focus:outline-none focus:border-app-danger focus:ring-1 focus:ring-app-danger text-center tracking-widest text-lg font-mono transition-all" />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }} className="flex-1 py-3 border border-app-border rounded-lg font-medium hover:bg-app-bg transition-colors active:scale-97">
                                Cancel
                            </button>
                            <button disabled={deleteConfirm !== 'DELETE'} onClick={handleClearData}
                                className="flex-1 py-3 bg-app-danger text-white rounded-lg font-medium disabled:opacity-50 transition-all active:scale-97">
                                Delete Everything
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
