import React, { useState } from 'react';
import { useStudyData } from '../context/StudyDataContext';
import { Download, Trash2, Plus, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Settings() {
    const { settings, setSettings, clearAllData, sessions, goals, streak } = useStudyData();
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
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-300">
            <h2 className="text-[56px] font-sans font-normal tracking-[-2.8px] leading-tight text-[#f0f0f0] border-b border-app-border/50 pb-6">Settings</h2>

            {/* Timer Settings */}
            <section className="bg-transparent border border-app-border rounded-3xl p-8 space-y-8">
                <h3 className="text-[24px] font-sans tracking-[-1px] text-[#f0f0f0] border-b border-app-border/50 pb-4">Timer Settings</h3>
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
            <section className="bg-transparent border border-app-border rounded-3xl p-8 space-y-8">
                <h3 className="text-[24px] font-sans tracking-[-1px] text-[#f0f0f0] border-b border-app-border/50 pb-4">Study Settings</h3>

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
                    <label className="text-[14px] font-inter text-app-muted block">Manage Subjects</label>
                    <div className="flex flex-wrap gap-3">
                        {settings.subjects.map(subject => (
                            <span key={subject} className="px-4 py-2 bg-transparent border border-app-border rounded-full text-[14px] font-sans tracking-[0.35px] text-[#f0f0f0] flex items-center gap-3">
                                {subject}
                                <button onClick={() => handleDeleteSubject(subject)} className="text-app-muted hover:text-[#ff2047] transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </span>
                        ))}
                    </div>
                    <form onSubmit={handleAddSubject} className="flex gap-3 max-w-sm pt-4">
                        <input
                            type="text"
                            value={newSubject}
                            onChange={(e) => setNewSubject(e.target.value)}
                            placeholder="New subject..."
                            className="flex-1 bg-transparent border border-app-border text-[#f0f0f0] rounded-lg px-4 py-3 text-[14px] font-inter focus:outline-none focus:border-white/20 transition-all placeholder:text-app-muted"
                        />
                        <button type="submit" disabled={!newSubject.trim()}
                            className="px-6 py-3 bg-transparent border border-app-border text-[#f0f0f0] font-sans tracking-[0.35px] rounded-lg disabled:opacity-50 hover:bg-white/5 active:scale-95 transition-all">
                            Add
                        </button>
                    </form>
                </div>
            </section>

            {/* Preferences */}
            <section className="bg-transparent border border-app-border rounded-3xl p-8 space-y-8">
                <h3 className="text-[24px] font-sans tracking-[-1px] text-[#f0f0f0] border-b border-app-border/50 pb-4">Preferences</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => { handleSettingChange('soundEnabled', !settings.soundEnabled); handleFocusOut(); }}
                        className="flex items-center justify-between p-6 border border-app-border rounded-2xl hover:bg-white/5 transition-all active:scale-95 group">
                        <div className="flex items-center gap-4 text-[#f0f0f0]">
                            {settings.soundEnabled ? <Volume2 size={22} className="text-[#f0f0f0] group-hover:scale-110 transition-transform" /> : <VolumeX size={22} className="text-app-muted group-hover:scale-110 transition-transform" />}
                            <span className="font-inter">Timer Sounds</span>
                        </div>
                        <span className="text-app-muted font-sans tracking-[0.35px]">{settings.soundEnabled ? 'On' : 'Off'}</span>
                    </button>
                </div>
            </section>

            {/* Data Management */}
            <section className="bg-transparent border border-[#ff2047]/30 rounded-3xl p-8 space-y-6">
                <div className="space-y-2">
                    <h3 className="text-[24px] font-sans tracking-[-1px] text-[#ff2047]">Danger Zone</h3>
                    <p className="text-[14px] font-inter text-app-muted">Manage your local storage data.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button onClick={handleExportData} className="flex-1 flex items-center justify-center gap-3 py-4 border border-app-border rounded-xl text-[#f0f0f0] hover:bg-white/5 transition-all active:scale-95 font-sans tracking-[0.35px]">
                        <Download size={20} />
                        Export All Data
                    </button>
                    <button onClick={() => setShowDeleteModal(true)} className="flex-1 flex items-center justify-center gap-3 py-4 border border-[#ff2047]/20 bg-[#ff2047]/10 text-[#ff2047] rounded-xl hover:bg-[#ff2047]/20 transition-all active:scale-95 font-sans tracking-[0.35px]">
                        <Trash2 size={20} />
                        Clear All Data
                    </button>
                </div>
            </section>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0a0a0a] border border-[#ff2047]/30 rounded-3xl p-8 max-w-md w-full space-y-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-[32px] font-sans tracking-[-1px] text-[#ff2047] flex items-center gap-3">
                            <Trash2 size={28} /> Delete All Data
                        </h3>
                        <p className="text-app-muted text-[14px] font-inter">
                            This action cannot be undone. All your sessions, goals, and settings will be permanently erased.
                        </p>
                        <div className="space-y-3">
                            <label className="text-[12px] uppercase tracking-[0.35px] font-sans text-app-muted">Type "DELETE" to confirm</label>
                            <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
                                className="w-full bg-transparent border border-[#ff2047]/30 rounded-lg px-4 py-3 focus:outline-none focus:border-[#ff2047] text-center tracking-[4px] text-[20px] font-mono text-[#f0f0f0] transition-all placeholder:text-[#ff2047]/20" placeholder="DELETE" />
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }} className="flex-1 py-3 border border-app-border rounded-full font-sans tracking-[0.35px] text-[#f0f0f0] hover:bg-white/5 transition-colors active:scale-95">
                                Cancel
                            </button>
                            <button disabled={deleteConfirm !== 'DELETE'} onClick={handleClearData}
                                className="flex-1 py-3 bg-[#ff2047] text-white rounded-full font-sans tracking-[0.35px] disabled:opacity-50 transition-all active:scale-95 border border-transparent">
                                Proceed
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
