import React from 'react';
import { useStudyData } from '../context/StudyDataContext';
import { getTodayDateString } from '../utils/helpers';
import { Clock, Flame, CheckCircle, Target as TargetIcon, Play, AlertCircle } from 'lucide-react';

export default function Dashboard({ setActivePage }) {
    const { sessions, goals, streak, settings, updateGoal } = useStudyData();
    const today = getTodayDateString();

    // Calculate stats
    const todaysSessions = sessions.filter(s => s.date === today);
    const todaysMinutes = todaysSessions.reduce((acc, s) => acc + s.duration, 0);
    const todaysHours = (todaysMinutes / 60).toFixed(1);
    const targetHours = settings.dailyTargetHours;
    const progressPercent = Math.min(100, Math.round((todaysHours / targetHours) * 100));

    const todaysPomodoros = todaysSessions.filter(s => s.type === 'pomodoro').length;

    const todaysGoals = goals.filter(g => g.dueDate === today || g.createdAt === today); // Simplified
    const completedGoals = todaysGoals.filter(g => g.completed).length;
    const goalProgressPercent = todaysGoals.length > 0 ? Math.round((completedGoals / todaysGoals.length) * 100) : 0;

    const recentSessions = sessions.slice(0, 5); // Assumes already sorted chronologically DESC

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-300">
            <header className="mb-8">
                <h2 className="text-3xl font-display font-bold text-app-text">Welcome back, Scholar</h2>
                <p className="text-app-muted mt-2">Here's your progress for today, {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}.</p>
            </header>

            {/* Top 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<Clock className="text-app-primary" />}
                    title="Today's Hours"
                    value={`${todaysHours}h`}
                    subtext={`/ ${targetHours}h target`}
                    colorClass="border-app-primary"
                />
                <StatCard
                    icon={<Flame className="text-orange-500" />}
                    title="Current Streak"
                    value={`${streak.currentStreak} days`}
                    subtext={`Longest: ${streak.longestStreak}`}
                    colorClass="border-orange-500/50"
                />
                <StatCard
                    icon={<TargetIcon className="text-app-secondary" />}
                    title="Pomodoros Today"
                    value={todaysPomodoros}
                    subtext="Sessions completed"
                    colorClass="border-app-secondary"
                />
                <StatCard
                    icon={<CheckCircle className="text-app-danger" />}
                    title="Goals Completed"
                    value={`${completedGoals}/${todaysGoals.length}`}
                    subtext="For today"
                    colorClass="border-app-danger"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Progress Ring & Goals */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-app-surface border border-app-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            {/* Circular Progress */}
                            <div className="relative w-40 h-40 shrink-0">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-bg)" strokeWidth="8" />
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-primary)" strokeWidth="8"
                                        strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * goalProgressPercent) / 100}
                                        className="transition-all duration-1000 ease-out" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                                    <span className="text-3xl font-display font-bold text-app-primary">{goalProgressPercent}%</span>
                                    <span className="text-[10px] text-app-muted uppercase tracking-wider text-center mt-0.5 leading-tight">Goals<br />Completed</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-4 w-full">
                                <h3 className="text-xl font-display font-semibold border-b border-app-border pb-2">Today's Goals</h3>
                                {todaysGoals.length > 0 ? (
                                    <div className="space-y-2">
                                        {todaysGoals.map(goal => (
                                            <div key={goal.id} className="flex items-center gap-3 p-3 bg-app-bg rounded-lg border border-app-border hover:border-app-primary/50 transition-colors">
                                                <input type="checkbox" checked={goal.completed} onChange={() => updateGoal(goal.id, { completed: !goal.completed })}
                                                    className="w-5 h-5 accent-app-primary cursor-pointer" />
                                                <span className={`flex-1 font-medium ${goal.completed ? 'line-through text-app-muted' : 'text-app-text'}`}>
                                                    {goal.text}
                                                </span>
                                                <span className="text-xs px-2 py-1 bg-app-surface border border-app-border rounded-full text-app-muted">
                                                    {goal.subject}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-app-muted py-4">
                                        <AlertCircle size={18} />
                                        <p>No goals due today. Enjoy your day or add some using the Goals tab!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Quick-start Pomodoro */}
                    <section>
                        <button onClick={() => setActivePage('timer')} className="w-full relative overflow-hidden group bg-linear-to-r from-app-primary to-app-secondary p-px rounded-2xl block text-left transition-all hover:scale-x-[1.01] active:scale-[0.99] shadow-lg">
                            <div className="bg-app-surface/95 backdrop-blur-xl px-6 py-8 rounded-2xl relative z-10 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-display font-bold text-app-text group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r from-app-primary to-app-secondary transition-all">Start a Session</h3>
                                    <p className="text-app-muted mt-1">Jump right into focus mode</p>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-app-primary/10 flex items-center justify-center group-hover:bg-app-primary group-hover:text-white transition-all text-app-primary">
                                    <Play size={24} className="ml-1" />
                                </div>
                            </div>
                        </button>
                    </section>
                </div>

                {/* Right Column: Recent Sessions */}
                <div className="space-y-6">
                    <section className="bg-app-surface border border-app-border rounded-xl p-6 h-full shadow-sm">
                        <div className="flex items-center justify-between border-b border-app-border pb-4 mb-4">
                            <h3 className="text-xl font-display font-semibold">Recent Sessions</h3>
                            <button onClick={() => setActivePage('log')} className="text-sm text-app-primary hover:underline">View All</button>
                        </div>

                        {recentSessions.length > 0 ? (
                            <div className="space-y-4">
                                {recentSessions.map(session => (
                                    <div key={session.id} className="group relative pl-4 border-l-2 border-app-border hover:border-app-secondary transition-colors">
                                        <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-app-bg border border-app-border group-hover:border-app-secondary group-hover:bg-app-secondary transition-colors" />
                                        <p className="text-xs text-app-muted mb-1">{new Date(session.date).toLocaleDateString()} at {session.startTime}</p>
                                        <p className="font-medium text-app-text">{session.subject}</p>
                                        <p className="text-sm text-app-muted mt-0.5">{session.activity}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xs font-mono px-2 py-0.5 bg-app-primary/10 text-app-primary rounded border border-app-primary/20">{session.duration}m</span>
                                            <span className="text-xs opacity-60 capitalize">{session.type}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-app-muted text-sm py-4">No recent sessions found. Time to hit the books!</p>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, title, value, subtext, colorClass }) {
    return (
        <div className={`bg-app-surface border border-app-border border-l-[3px] ${colorClass} rounded-xl p-5 hover:scale-[1.02] hover:shadow-md transition-all flex flex-col justify-between group`}>
            <div className="flex justify-between items-start mb-4">
                <h4 className="text-sm font-medium text-app-muted">{title}</h4>
                <div className="p-2 bg-app-bg rounded-lg group-hover:bg-opacity-50 transition-colors">
                    {icon}
                </div>
            </div>
            <div>
                <div className="text-2xl font-display font-bold text-app-text">{value}</div>
                <div className="text-sm text-app-muted mt-1">{subtext}</div>
            </div>
        </div>
    );
}
