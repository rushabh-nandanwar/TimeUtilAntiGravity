import React, { useState } from 'react';
import { useStudyData } from '../context/StudyDataContext';
import { useTimer } from '../context/TimerContext';
import { getTodayDateString, uuid } from '../utils/helpers';
import { Play, Pause, Square, SkipForward, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Timer() {
    const { settings, addSession } = useStudyData();
    const toast = useToast();

    const {
        phase, timeLeft, isActive, completedPomodoros,
        subject, setSubject, activity, setActivity, distractions, setDistractions, notes, setNotes,
        showCompletion, setShowCompletion, completionQuote,
        toggleTimer, resetTimer, skipPhase
    } = useTimer();

    // Ring Calculation
    const getTotalTimeForPhase = () => {
        if (phase === 'work') return settings.pomodoroWork * 60;
        if (phase === 'shortBreak') return settings.pomodoroShortBreak * 60;
        return settings.pomodoroLongBreak * 60;
    };
    const totalPhaseTime = getTotalTimeForPhase();
    const ringProgress = totalPhaseTime > 0 ? (timeLeft / totalPhaseTime) * 100 : 0;

    // Format MM:SS
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const timeDisplay = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    const phaseColor = phase === 'work' ? 'var(--color-primary)' : 'var(--color-secondary)';
    const phaseLabel = phase === 'work' ? 'Focus Time' : phase === 'shortBreak' ? 'Short Break' : 'Long Break';

    // Manual Log Form State
    const [manualLog, setManualLog] = useState({
        subject: settings.subjects[0] || '',
        activity: '',
        date: getTodayDateString(),
        startTime: '12:00',
        duration: 30,
        notes: ''
    });
    const [showManualLog, setShowManualLog] = useState(false);

    const handleManualSubmit = (e) => {
        e.preventDefault();
        addSession({
            id: uuid(),
            subject: manualLog.subject,
            activity: manualLog.activity,
            duration: manualLog.duration,
            date: manualLog.date,
            startTime: manualLog.startTime,
            type: 'manual',
            notes: manualLog.notes,
            distractions: 0
        });
        toast('Manual session saved ✓');
        setShowManualLog(false);
        setManualLog({ ...manualLog, activity: '', duration: 30, notes: '' });
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto pb-20 animate-in fade-in duration-300 flex flex-col items-center">

            {/* Session Prep Inputs */}
            {phase === 'work' && !isActive && timeLeft === settings.pomodoroWork * 60 && !showCompletion && (
                <div className="w-full max-w-md bg-app-surface border border-app-border rounded-xl p-4 mb-8 flex flex-col gap-3">
                    <select
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        className="bg-app-bg border border-app-border rounded-lg px-3 py-2 focus:outline-none focus:border-app-primary text-sm"
                    >
                        {settings.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="What are you studying?"
                        value={activity}
                        onChange={e => setActivity(e.target.value)}
                        className="bg-app-bg border border-app-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-app-primary"
                    />
                </div>
            )}

            {/* Timer Display */}
            <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center my-8">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" fill="transparent" stroke="var(--color-surface)" strokeWidth="3" />
                    <circle cx="50" cy="50" r="46" fill="transparent" stroke={phaseColor} strokeWidth="3"
                        strokeDasharray="289" strokeDashoffset={289 - (289 * ringProgress) / 100}
                        className="transition-all duration-1000 ease-linear" strokeLinecap="round" />
                </svg>

                <div className="flex flex-col items-center justify-center z-10 text-center">
                    <span className="text-xl font-medium tracking-widest uppercase mb-2" style={{ color: phaseColor }}>
                        {phaseLabel}
                    </span>
                    <span className="text-6xl md:text-8xl font-mono font-bold text-app-text tabular-nums">
                        {timeDisplay}
                    </span>
                    <div className="mt-6 flex items-center justify-center gap-2">
                        {/* Pomodoro Count Dots */}
                        {Array.from({ length: settings.pomodorosUntilLong }).map((_, i) => {
                            const currentCycleCompleted = completedPomodoros % settings.pomodorosUntilLong;
                            const isFilled = i < currentCycleCompleted;
                            return (
                                <div key={i} className={`w-3 h-3 rounded-full transition-colors ${isFilled ? 'bg-app-primary' : 'bg-app-surface border border-app-border'}`} />
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={toggleTimer} className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-transform active:scale-95 shadow-lg ${isActive ? 'bg-app-danger hover:bg-app-danger/90' : 'bg-app-primary hover:bg-app-primary/90'}`}>
                    {isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                </button>
                <button onClick={resetTimer} className="w-12 h-12 rounded-full bg-app-surface border border-app-border flex items-center justify-center text-app-text hover:bg-app-bg transition-colors">
                    <Square size={20} />
                </button>
                <button onClick={skipPhase} className="w-12 h-12 rounded-full bg-app-surface border border-app-border flex items-center justify-center text-app-text hover:bg-app-bg transition-colors">
                    <SkipForward size={20} />
                </button>
            </div>

            {/* Active Session Tools */}
            {isActive && phase === 'work' && (
                <div className="w-full max-w-md bg-app-surface border border-app-border rounded-xl p-4 mb-8 space-y-4">
                    <div className="flex justify-between items-center bg-app-bg p-3 rounded-lg border border-app-border">
                        <div className="flex items-center gap-2 text-app-muted">
                            <AlertCircle size={18} />
                            <span className="text-sm font-medium">Distractions: {distractions}</span>
                        </div>
                        <button onClick={() => setDistractions(d => d + 1)} className="px-3 py-1 bg-app-danger/10 text-app-danger rounded text-sm hover:bg-app-danger/20 transition-colors">
                            +1 Distract
                        </button>
                    </div>
                    <textarea
                        placeholder="Session notes (optional)..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-app-primary resize-none h-20"
                    />
                </div>
            )}

            {/* Completion Card */}
            {showCompletion && !isActive && (
                <div className="w-full max-w-md bg-linear-to-br from-app-surface to-app-bg border border-app-primary/30 rounded-xl p-6 mb-8 text-center animate-in zoom-in-95 duration-300 shadow-xl shadow-app-primary/5">
                    <h3 className="text-2xl font-display font-bold text-app-primary mb-2">Great Work!</h3>
                    <p className="text-app-text mb-4">You studied {subject} for {settings.pomodoroWork} minutes.</p>
                    {distractions > 0 && <p className="text-sm text-app-muted mb-4">Distractions logged: {distractions}</p>}
                    <div className="bg-app-primary/10 p-4 rounded-lg border border-app-primary/20 italic text-app-text font-medium mb-6">
                        "{completionQuote}"
                    </div>
                    <button onClick={() => setShowCompletion(false)} className="px-6 py-2 bg-app-primary text-white rounded-lg hover:bg-app-primary/90 transition-colors">
                        Dismiss
                    </button>
                </div>
            )}

            {/* Manual Logging */}
            <div className="w-full max-w-md mt-auto pt-8 border-t border-app-border">
                <button onClick={() => setShowManualLog(!showManualLog)} className="w-full flex items-center justify-between text-app-text font-medium p-2 hover:bg-app-surface rounded-lg transition-colors">
                    <span>Log Manual Session</span>
                    {showManualLog ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {showManualLog && (
                    <form onSubmit={handleManualSubmit} className="mt-4 bg-app-surface border border-app-border rounded-xl p-5 space-y-4 animate-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1">
                                <label className="text-xs text-app-muted font-medium">Subject</label>
                                <select value={manualLog.subject} onChange={e => setManualLog({ ...manualLog, subject: e.target.value })} className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-app-primary">
                                    {settings.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-xs text-app-muted font-medium">Activity</label>
                                <input type="text" required value={manualLog.activity} onChange={e => setManualLog({ ...manualLog, activity: e.target.value })} className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-app-primary" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-app-muted font-medium">Date</label>
                                <input type="date" required value={manualLog.date} onChange={e => setManualLog({ ...manualLog, date: e.target.value })} className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-app-primary" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-app-muted font-medium">Start Time</label>
                                <input type="time" required value={manualLog.startTime} onChange={e => setManualLog({ ...manualLog, startTime: e.target.value })} className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-app-primary" />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-xs text-app-muted font-medium">Duration (minutes)</label>
                                <input type="number" min="1" required value={manualLog.duration} onChange={e => setManualLog({ ...manualLog, duration: Number(e.target.value) })} className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-app-primary" />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-xs text-app-muted font-medium">Notes</label>
                                <textarea value={manualLog.notes} onChange={e => setManualLog({ ...manualLog, notes: e.target.value })} className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-app-primary resize-none h-16" />
                            </div>
                        </div>
                        <button type="submit" className="w-full py-2.5 bg-app-primary text-white rounded-lg font-medium hover:bg-app-primary/90 transition-colors">
                            Save Session
                        </button>
                    </form>
                )}
            </div>

        </div>
    );
}
