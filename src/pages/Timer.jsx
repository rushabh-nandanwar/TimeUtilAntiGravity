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
                <div className="w-full max-w-md bg-transparent border border-app-border rounded-xl p-6 mb-8 flex flex-col gap-4">
                    <select
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        className="bg-transparent border border-app-border rounded-lg px-4 py-3 focus:outline-none focus:border-white/20 text-sm font-sans tracking-[0.35px] text-[#f0f0f0] appearance-none"
                    >
                        {settings.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="What are you studying?"
                        value={activity}
                        onChange={e => setActivity(e.target.value)}
                        className="bg-transparent border border-app-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white/20 font-inter text-[#f0f0f0] placeholder:text-app-muted"
                    />
                </div>
            )}

            {/* Timer Display */}
            <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center my-8">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" fill="transparent" stroke="rgba(214, 235, 253, 0.05)" strokeWidth="1" />
                    <circle cx="50" cy="50" r="46" fill="transparent" stroke={phaseColor} strokeWidth="3"
                        strokeDasharray="289" strokeDashoffset={289 - (289 * ringProgress) / 100}
                        className="transition-all duration-1000 ease-linear" strokeLinecap="round" />
                </svg>

                <div className="flex flex-col items-center justify-center z-10 text-center">
                    <span className="text-[14px] font-sans tracking-[0.35px] uppercase mb-4" style={{ color: phaseColor }}>
                        {phaseLabel}
                    </span>
                    <span className="text-[76px] md:text-[96px] font-display font-normal text-[#f0f0f0] tabular-nums tracking-[-0.96px] leading-none">
                        {timeDisplay}
                    </span>
                    <div className="mt-8 flex items-center justify-center gap-3">
                        {/* Pomodoro Count Dots */}
                        {Array.from({ length: settings.pomodorosUntilLong }).map((_, i) => {
                            const currentCycleCompleted = completedPomodoros % settings.pomodorosUntilLong;
                            const isFilled = i < currentCycleCompleted;
                            return (
                                <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors border border-app-border ${isFilled ? 'bg-[#f0f0f0]' : 'bg-transparent'}`} />
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6 mb-12 mt-4">
                <button onClick={toggleTimer} className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all active:scale-95 border border-app-border ${isActive ? 'bg-[#ff2047]/20 hover:bg-[#ff2047]/30 text-[#ff2047]' : 'bg-transparent hover:bg-white/5'}`}>
                    {isActive ? <Pause size={28} /> : <Play size={28} className="ml-1 text-[#f0f0f0]" />}
                </button>
                <button onClick={resetTimer} className="w-12 h-12 rounded-full bg-transparent border border-app-border flex items-center justify-center text-[#f0f0f0] hover:bg-white/5 transition-colors">
                    <Square size={20} />
                </button>
                <button onClick={skipPhase} className="w-12 h-12 rounded-full bg-transparent border border-app-border flex items-center justify-center text-[#f0f0f0] hover:bg-white/5 transition-colors">
                    <SkipForward size={20} />
                </button>
            </div>

            {/* Active Session Tools */}
            {isActive && phase === 'work' && (
                <div className="w-full max-w-md bg-transparent border border-app-border rounded-xl p-6 mb-8 space-y-4">
                    <div className="flex justify-between items-center bg-transparent p-3 rounded-lg border border-app-border">
                        <div className="flex items-center gap-2 text-app-muted">
                            <AlertCircle size={18} />
                            <span className="text-[14px] font-sans font-medium tracking-[0.35px]">Distractions: {distractions}</span>
                        </div>
                        <button onClick={() => setDistractions(d => d + 1)} className="px-3 py-1 bg-[#ff2047]/10 text-[#ff2047] rounded border border-[#ff2047]/20 text-sm hover:bg-[#ff2047]/20 transition-colors">
                            +1 Distract
                        </button>
                    </div>
                    <textarea
                        placeholder="Session notes (optional)..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        className="w-full bg-transparent text-[#f0f0f0] border border-app-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white/20 resize-none h-24 placeholder:text-app-muted"
                    />
                </div>
            )}

            {/* Completion Card */}
            {showCompletion && !isActive && (
                <div className="w-full max-w-md bg-transparent border border-app-border rounded-xl p-8 mb-8 text-center animate-in zoom-in-95 duration-300">
                    <h3 className="text-[40px] font-display font-normal text-[#f0f0f0] mb-2 tracking-[-0.96px]">Great Work!</h3>
                    <p className="text-[16px] text-app-muted font-inter mb-6">You studied <span className="text-[#f0f0f0]">{subject}</span> for {settings.pomodoroWork} minutes.</p>
                    {distractions > 0 && <p className="text-[14px] text-app-muted font-mono mb-4 border border-app-border rounded py-2">Distractions logged: {distractions}</p>}
                    <div className="bg-transparent p-6 rounded-lg border border-app-border italic text-[#f0f0f0] font-sans font-normal tracking-[0.35px] mb-8">
                        "{completionQuote}"
                    </div>
                    <button onClick={() => setShowCompletion(false)} className="px-8 py-3 bg-transparent border border-app-border text-[#f0f0f0] rounded-full hover:bg-white/5 transition-colors font-sans tracking-[0.35px]">
                        Dismiss
                    </button>
                </div>
            )}

            {/* Manual Logging */}
            <div className="w-full max-w-md mt-auto pt-8 border-t border-app-border/50">
                <button onClick={() => setShowManualLog(!showManualLog)} className="w-full flex items-center justify-between text-[#f0f0f0] font-sans tracking-[0.35px] p-4 hover:bg-white/5 border border-transparent hover:border-app-border rounded-xl transition-all">
                    <span>Log Manual Session</span>
                    {showManualLog ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {showManualLog && (
                    <form onSubmit={handleManualSubmit} className="mt-4 bg-transparent border border-app-border rounded-xl p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1.5">
                                <label className="text-[12px] text-app-muted font-sans uppercase tracking-[0.35px]">Subject</label>
                                <select value={manualLog.subject} onChange={e => setManualLog({ ...manualLog, subject: e.target.value })} className="w-full bg-transparent text-[#f0f0f0] border border-app-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/20 appearance-none">
                                    {settings.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <label className="text-[12px] text-app-muted font-sans uppercase tracking-[0.35px]">Activity</label>
                                <input type="text" required value={manualLog.activity} onChange={e => setManualLog({ ...manualLog, activity: e.target.value })} className="w-full bg-transparent text-[#f0f0f0] border border-app-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/20" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] text-app-muted font-sans uppercase tracking-[0.35px]">Date</label>
                                <input type="date" required value={manualLog.date} onChange={e => setManualLog({ ...manualLog, date: e.target.value })} className="w-full bg-transparent text-[#f0f0f0] border border-app-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/20" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] text-app-muted font-sans uppercase tracking-[0.35px]">Start Time</label>
                                <input type="time" required value={manualLog.startTime} onChange={e => setManualLog({ ...manualLog, startTime: e.target.value })} className="w-full bg-transparent text-[#f0f0f0] border border-app-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/20" />
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <label className="text-[12px] text-app-muted font-sans uppercase tracking-[0.35px]">Duration (mins)</label>
                                <input type="number" min="1" required value={manualLog.duration} onChange={e => setManualLog({ ...manualLog, duration: Number(e.target.value) })} className="w-full bg-transparent text-[#f0f0f0] border border-app-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/20" />
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <label className="text-[12px] text-app-muted font-sans uppercase tracking-[0.35px]">Notes</label>
                                <textarea value={manualLog.notes} onChange={e => setManualLog({ ...manualLog, notes: e.target.value })} className="w-full bg-transparent text-[#f0f0f0] border border-app-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/20 resize-none h-20" />
                            </div>
                        </div>
                        <button type="submit" className="w-full py-3 bg-transparent border border-app-border text-[#f0f0f0] hover:bg-white/5 rounded-full font-sans tracking-[0.35px] transition-colors">
                            Save Session
                        </button>
                    </form>
                )}
            </div>

        </div>
    );
}
