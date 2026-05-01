import React, { useState, useMemo } from 'react';
import { useStudyData } from '../context/StudyDataContext';
import { uuid, getTodayDateString } from '../utils/helpers';
import { Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Goals() {
    const { goals, addGoal, updateGoal, deleteGoal, settings } = useStudyData();
    const toast = useToast();

    const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'weekly' | 'monthly'
    const [showAddModal, setShowAddModal] = useState(false);

    // Stats calculations
    const todayStr = getTodayDateString();
    const today = new Date(todayStr);
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);

    const stats = useMemo(() => {
        // Week completion rate
        const weekGoals = goals.filter(g => new Date(g.createdAt) >= startOfWeek || new Date(g.dueDate) >= startOfWeek);
        const completedWeek = weekGoals.filter(g => g.completed).length;
        const weekCompletionRate = weekGoals.length > 0 ? Math.round((completedWeek / weekGoals.length) * 100) : 0;

        // Most productive subject (completed goals lifetime)
        const completedAll = goals.filter(g => g.completed);
        const subjectCounts = {};
        completedAll.forEach(g => {
            subjectCounts[g.subject] = (subjectCounts[g.subject] || 0) + 1;
        });
        const mostProductiveSubject = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        return { weekCompletionRate, mostProductiveSubject };
    }, [goals]);

    const filteredGoals = goals.filter(g => g.type === activeTab)
        .sort((a, b) => Number(a.completed) - Number(b.completed) || new Date(a.dueDate) - new Date(b.dueDate));

    const completedCount = filteredGoals.filter(g => g.completed).length;
    const totalCount = filteredGoals.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const [newGoal, setNewGoal] = useState({
        text: '',
        subject: settings.subjects[0] || '',
        type: activeTab,
        priority: 'medium',
        dueDate: todayStr,
    });

    const handleAddSubmit = (e) => {
        e.preventDefault();
        if (!newGoal.text.trim()) return;

        addGoal({
            id: uuid(),
            text: newGoal.text,
            subject: newGoal.subject,
            type: newGoal.type,
            priority: newGoal.priority,
            dueDate: newGoal.dueDate,
            createdAt: todayStr,
            completed: false
        });

        toast('Goal added ✓');
        setShowAddModal(false);
        setNewGoal({ ...newGoal, text: '', type: activeTab });
    };

    const getPriorityColor = (priority) => {
        if (priority === 'high') return 'bg-app-danger';
        if (priority === 'medium') return 'bg-yellow-500';
        return 'bg-app-secondary';
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in duration-300">

            <div className="flex flex-col md:flex-row gap-12">

                {/* Main Content */}
                <div className="flex-1 space-y-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-app-border/50 pb-6">
                        <h2 className="text-[56px] font-sans font-normal tracking-[-2.8px] leading-tight text-[#f0f0f0]">Goals</h2>
                        <button onClick={() => { setNewGoal({ ...newGoal, type: activeTab }); setShowAddModal(true); }} className="flex items-center gap-2 px-6 py-2.5 bg-transparent border border-app-border text-[#f0f0f0] rounded-full hover:bg-white/5 transition-colors font-sans tracking-[0.35px]">
                            <Plus size={18} /> Add Goal
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-transparent p-1 border border-app-border rounded-lg w-fit">
                        {['daily', 'weekly', 'monthly'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`px-8 py-2.5 rounded-md capitalize font-sans tracking-[0.35px] font-medium transition-colors ${activeTab === tab ? 'bg-white/10 text-white' : 'text-app-muted hover:text-[#f0f0f0] hover:bg-white/5'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-transparent border border-app-border rounded-3xl p-8">
                        <div className="flex justify-between items-end mb-4">
                            <span className="font-inter font-medium text-[#f0f0f0]">{completedCount} of {totalCount} goals completed</span>
                            <span className="text-[20px] font-mono font-bold text-app-muted">{progressPercent}%</span>
                        </div>
                        <div className="h-2 w-full bg-transparent rounded-full overflow-hidden border border-app-border">
                            <div
                                className="h-full bg-white transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Goal List */}
                    <div className="space-y-4">
                        {filteredGoals.length > 0 ? filteredGoals.map(goal => (
                            <div key={goal.id} className={`flex items-start sm:items-center gap-6 p-6 rounded-2xl border transition-all ${goal.completed ? 'bg-transparent border-app-border opacity-50 hover:opacity-100' : 'bg-transparent border-app-border hover:bg-white/2'}`}>

                                <input
                                    type="checkbox"
                                    checked={goal.completed}
                                    onChange={() => updateGoal(goal.id, { completed: !goal.completed })}
                                    className="mt-1 sm:mt-0 w-6 h-6 border border-app-border rounded-sm accent-[#f0f0f0] cursor-pointer shrink-0 appearance-none checked:bg-[#f0f0f0] transition-colors relative after:content-[''] after:absolute after:hidden checked:after:block after:left-2 after:top-1 after:w-1.5 after:h-3 after:border-solid after:border-black after:border-r-2 after:border-b-2 after:rotate-45"
                                />

                                <div className="flex-1 min-w-0">
                                    <p className={`text-[18px] font-inter ${goal.completed ? 'line-through text-app-muted' : 'text-[#f0f0f0]'}`}>
                                        {goal.text}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm font-sans tracking-[0.35px]">
                                        <span className="flex items-center gap-2 font-medium px-3 py-1 bg-transparent border border-app-border rounded-[9999px] text-app-muted">
                                            <span className={`w-2.5 h-2.5 rounded-full ${getPriorityColor(goal.priority)}`} />
                                            {goal.subject}
                                        </span>
                                        <span className={`flex items-center gap-1 ${goal.dueDate === todayStr && !goal.completed ? 'text-[#ff2047] font-medium' : 'text-app-muted'}`}>
                                            <Calendar size={14} />
                                            {goal.dueDate === todayStr ? 'Today' : new Date(goal.dueDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <button onClick={() => { deleteGoal(goal.id); toast('Goal deleted'); }} className="p-3 text-app-muted hover:text-[#ff2047] hover:bg-[#ff2047]/10 rounded-full transition-colors">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        )) : (
                            <div className="text-center py-16 bg-transparent border border-app-border border-dashed rounded-3xl">
                                <TargetIcon size={48} className="mx-auto text-app-muted mb-4 opacity-50" />
                                <p className="text-app-muted font-inter text-[16px]">No {activeTab} goals found.</p>
                                <button onClick={() => { setNewGoal({ ...newGoal, type: activeTab }); setShowAddModal(true); }} className="mt-4 text-[#f0f0f0] border border-app-border px-6 py-2 rounded-full text-sm font-sans tracking-[0.35px] hover:bg-white/5 transition-colors">
                                    Create one now
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Sidebar */}
                <div className="w-full md:w-72 shrink-0 space-y-8">
                    <div className="bg-transparent border border-app-border rounded-3xl p-6 space-y-6">
                        <h3 className="text-[24px] font-sans font-normal border-b border-app-border/50 pb-4 text-[#f0f0f0] tracking-[-1px]">Insights</h3>
                        <div>
                            <p className="text-[12px] uppercase tracking-[0.35px] font-sans text-app-muted mb-2">Completion (This Week)</p>
                            <div className="flex items-end gap-2">
                                <span className="text-[40px] font-display font-normal text-white leading-none tracking-[-0.96px]">{stats.weekCompletionRate}<span className="text-[20px] text-app-muted">%</span></span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[12px] uppercase tracking-[0.35px] font-sans text-app-muted mb-2">Most Productive Subject</p>
                            <span className="inline-block px-4 py-2 border border-app-border bg-white/2 text-[#f0f0f0] rounded-full text-[14px] font-sans tracking-[0.35px]">
                                {stats.mostProductiveSubject}
                            </span>
                        </div>
                    </div>

                    <div className="bg-transparent border border-[#ff2047]/30 rounded-3xl p-6 space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff2047]/10 rounded-full blur-3xl" />
                        <h3 className="text-[20px] font-sans tracking-tight text-[#ff2047] flex items-center gap-2 relative z-10">
                            Due Today
                        </h3>
                        <div className="space-y-3 relative z-10">
                            {goals.filter(g => g.dueDate === todayStr && !g.completed).length > 0 ? (
                                goals.filter(g => g.dueDate === todayStr && !g.completed).map(g => (
                                    <div key={g.id} className="text-[14px] p-3 bg-transparent border border-[#ff2047]/20 rounded-xl text-[#f0f0f0] font-inter">
                                        {g.text}
                                    </div>
                                ))
                            ) : (
                                <p className="text-[14px] font-inter text-app-muted">Nothing due today! Enjoy your free time.</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Add Goal Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
                    <form onSubmit={handleAddSubmit} className="bg-[#0a0a0a] border border-app-border rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-[32px] font-sans font-normal text-white tracking-[-1px]">Add New Goal</h3>

                        <div className="space-y-2">
                            <label className="text-[12px] font-sans uppercase tracking-[0.35px] text-app-muted mb-1 block">Description</label>
                            <input type="text" required autoFocus placeholder="What do you want to achieve?"
                                value={newGoal.text} onChange={e => setNewGoal({ ...newGoal, text: e.target.value })}
                                className="w-full bg-transparent border border-app-border rounded-lg px-4 py-3 text-[#f0f0f0] focus:outline-none focus:border-white/20 font-inter" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[12px] font-sans uppercase tracking-[0.35px] text-app-muted mb-1 block">Subject</label>
                                <select value={newGoal.subject} onChange={e => setNewGoal({ ...newGoal, subject: e.target.value })}
                                    className="w-full bg-transparent border border-app-border rounded-lg px-4 py-3 text-[14px] font-inter text-[#f0f0f0] focus:outline-none focus:border-white/20 appearance-none">
                                    {settings.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[12px] font-sans uppercase tracking-[0.35px] text-app-muted mb-1 block">Priority</label>
                                <select value={newGoal.priority} onChange={e => setNewGoal({ ...newGoal, priority: e.target.value })}
                                    className="w-full bg-transparent border border-app-border rounded-lg px-4 py-3 text-[14px] font-inter text-[#f0f0f0] focus:outline-none focus:border-white/20 appearance-none">
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[12px] font-sans uppercase tracking-[0.35px] text-app-muted mb-1 block">Type</label>
                                <select value={newGoal.type} onChange={e => setNewGoal({ ...newGoal, type: e.target.value })}
                                    className="w-full bg-transparent border border-app-border rounded-lg px-4 py-3 text-[14px] font-inter text-[#f0f0f0] focus:outline-none focus:border-white/20 capitalize appearance-none">
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[12px] font-sans uppercase tracking-[0.35px] text-app-muted mb-1 block">Due Date</label>
                                <input type="date" required value={newGoal.dueDate} onChange={e => setNewGoal({ ...newGoal, dueDate: e.target.value })}
                                    className="w-full bg-transparent border border-app-border rounded-lg px-4 py-3 text-[14px] font-inter text-[#f0f0f0] focus:outline-none focus:border-white/20" />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 border border-app-border rounded-full font-sans tracking-[0.35px] text-app-muted hover:bg-white/5 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={!newGoal.text.trim()}
                                className="flex-1 py-3 bg-white text-black border border-transparent rounded-full font-sans font-medium tracking-[0.35px] hover:bg-white/90 transition-colors disabled:opacity-50">
                                Create Goal
                            </button>
                        </div>
                    </form>
                </div>
            )}

        </div>
    );
}
