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
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-16 pb-20 animate-in fade-in duration-300">
            <header className="mb-12 mt-4 space-y-4">
                <h2 className="text-[76px] md:text-[96px] leading-[1] tracking-[-0.96px] font-display font-normal text-[#f0f0f0]">Welcome back,<br />Scholar</h2>
                <p className="text-xl font-sans tracking-tight text-app-muted mt-4">Here's your progress for today, {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}.</p>
            </header>

            {/* Top 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<Clock className="text-blue-500" />}
                    title="Today's Hours"
                    value={`${todaysHours}h`}
                    subtext={`/ ${targetHours}h target`}
                />
                <StatCard
                    icon={<Flame className="text-orange-500" />}
                    title="Current Streak"
                    value={`${streak.currentStreak} days`}
                    subtext={`Longest: ${streak.longestStreak}`}
                />
                <StatCard
                    icon={<TargetIcon className="text-app-secondary" />}
                    title="Pomodoros Today"
                    value={todaysPomodoros}
                    subtext="Sessions completed"
                />
                <StatCard
                    icon={<CheckCircle className="text-app-danger" />}
                    title="Goals Completed"
                    value={`${completedGoals}/${todaysGoals.length}`}
                    subtext="For today"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                {/* Left Column: Progress Ring & Goals */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-transparent border border-app-border rounded-[24px] p-8 transition-all relative overflow-hidden">
                        <div className="flex flex-col md:flex-row items-center gap-12">
                            {/* Circular Progress */}
                            <div className="relative w-48 h-48 shrink-0">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(214, 235, 253, 0.05)" strokeWidth="6" />
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#0075ff" strokeWidth="6"
                                        strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * goalProgressPercent) / 100}
                                        className="transition-all duration-1000 ease-out" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pt-1 mt-2">
                                    <span className="text-5xl font-display font-normal text-white">{goalProgressPercent}<span className="text-2xl text-app-muted">%</span></span>
                                    <span className="text-[12px] text-app-muted font-sans uppercase tracking-[0.35px] text-center mt-2 leading-tight">Goals<br />Completed</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-6 w-full">
                                <h3 className="text-[32px] md:text-[40px] font-sans tracking-[-1px] font-normal pb-2">Today's Goals</h3>
                                {todaysGoals.length > 0 ? (
                                    <div className="space-y-3">
                                        {todaysGoals.map(goal => (
                                            <div key={goal.id} className="flex items-center gap-4 p-4 bg-transparent rounded-xl border border-app-border hover:bg-white/[0.02] transition-colors">
                                                <input type="checkbox" checked={goal.completed} onChange={() => updateGoal(goal.id, { completed: !goal.completed })}
                                                    className="w-5 h-5 cursor-pointer appearance-none border border-app-border rounded-sm checked:bg-[#f0f0f0] transition-colors relative after:content-[''] after:absolute after:hidden checked:after:block after:left-1.5 after:top-0.5 after:w-1.5 after:h-2.5 after:border-solid after:border-black after:border-r-2 after:border-b-2 after:rotate-45" />
                                                <span className={`text-[16px] flex-1 font-inter ${goal.completed ? 'line-through text-app-muted' : 'text-[#f0f0f0]'}`}>
                                                    {goal.text}
                                                </span>
                                                <span className="text-[12px] px-3 py-1 bg-transparent border border-app-border rounded-[9999px] text-app-muted font-mono tracking-tight">
                                                    {goal.subject}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 text-app-muted py-6 border border-app-border/50 rounded-xl px-4 bg-white/[0.01]">
                                        <AlertCircle size={20} className="text-[#a1a4a5]" />
                                        <p className="text-[16px] font-inter">No goals due today. Enjoy your day or add some using the Goals tab!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Quick-start Pomodoro */}
                    <section>
                        <button onClick={() => setActivePage('timer')} className="w-full relative overflow-hidden group bg-transparent border border-app-border rounded-[9999px] p-2 block text-left transition-all hover:bg-white/[0.05] active:scale-[0.99]">
                            <div className="px-8 py-4 rounded-[9999px] relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-full border border-app-border flex items-center justify-center transition-all text-[#f0f0f0] bg-white/[0.03]">
                                        <Play size={20} className="ml-1" fill="currentColor" />
                                    </div>
                                    <div>
                                        <h3 className="text-[20px] font-sans font-normal text-[#f0f0f0] tracking-tight">Start a Session</h3>
                                    </div>
                                </div>
                                <div className="text-app-muted font-inter text-sm hidden sm:block">Jump right into focus mode</div>
                            </div>
                        </button>
                    </section>
                </div>

                {/* Right Column: Recent Sessions */}
                <div className="space-y-6">
                    <section className="bg-transparent border border-app-border rounded-[24px] p-8 h-full flex flex-col">
                        <div className="flex items-center justify-between border-b border-app-border/50 pb-6 mb-6">
                            <h3 className="text-[24px] font-sans font-normal tracking-tight">Recent Sessions</h3>
                            <button onClick={() => setActivePage('log')} className="text-sm font-inter text-app-muted hover:text-[#f0f0f0] transition-colors">View All</button>
                        </div>

                        {recentSessions.length > 0 ? (
                            <div className="space-y-6 flex-1">
                                {recentSessions.map(session => (
                                    <div key={session.id} className="group relative pl-5 border-l border-app-border hover:border-[#f0f0f0]/30 transition-colors py-1">
                                        <div className="absolute left-[-4.5px] top-2 w-[8px] h-[8px] rounded-full bg-[#000000] border-[1.5px] border-app-border group-hover:border-[#f0f0f0] transition-colors" />
                                        <p className="text-[12px] font-inter text-app-muted mb-1.5">{new Date(session.date).toLocaleDateString()} at {session.startTime}</p>
                                        <p className="text-[16px] font-sans font-normal text-[#f0f0f0] tracking-tight">{session.subject}</p>
                                        <p className="text-[14px] font-inter text-app-muted mt-1 ">{session.activity}</p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <span className="text-[12px] font-mono px-2 py-0.5 bg-transparent text-app-muted rounded-[4px] border border-app-border">{session.duration}m</span>
                                            <span className="text-[12px] text-app-muted capitalize font-inter">{session.type}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-app-muted font-inter text-[14px] py-4 flex-1">No recent sessions found. Time to hit the books!</p>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, title, value, subtext }) {
    return (
        <div className="bg-transparent border border-app-border rounded-2xl p-6 transition-all flex flex-col justify-between group hover:bg-white/[0.02]">
            <div className="flex justify-between items-start mb-6">
                <h4 className="text-[14px] font-inter font-normal text-app-muted tracking-[0.35px] uppercase">{title}</h4>
            </div>
            <div>
                <div className="text-[40px] md:text-[48px] font-display font-normal text-white leading-none tracking-[-0.96px]">{value}</div>
                <div className="text-[14px] font-inter text-app-muted mt-2">{subtext}</div>
            </div>
        </div>
    );
}
