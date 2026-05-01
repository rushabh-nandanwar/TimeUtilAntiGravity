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
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-300">

            <div className="flex flex-col md:flex-row gap-8">

                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-app-border pb-4">
                        <h2 className="text-3xl font-display font-bold text-app-text">Goals</h2>
                        <button onClick={() => { setNewGoal({ ...newGoal, type: activeTab }); setShowAddModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-app-primary text-white rounded-lg hover:bg-app-primary/90 transition-colors">
                            <Plus size={18} /> Add Goal
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-app-surface p-1 rounded-lg border border-app-border w-fit text-sm">
                        {['daily', 'weekly', 'monthly'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-md capitalize font-medium transition-colors ${activeTab === tab ? 'bg-app-bg text-app-primary shadow-sm' : 'text-app-muted hover:text-app-text'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-app-surface border border-app-border rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between items-end mb-2">
                            <span className="font-medium text-app-text">{completedCount} of {totalCount} goals completed</span>
                            <span className="text-sm font-bold text-app-primary">{progressPercent}%</span>
                        </div>
                        <div className="h-3 w-full bg-app-bg rounded-full overflow-hidden border border-app-border">
                            <div
                                className="h-full bg-linear-to-r from-app-secondary to-app-primary transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Goal List */}
                    <div className="space-y-3">
                        {filteredGoals.length > 0 ? filteredGoals.map(goal => (
                            <div key={goal.id} className={`flex items-start sm:items-center gap-4 p-4 rounded-xl border transition-all ${goal.completed ? 'bg-app-bg border-app-border opacity-60' : 'bg-app-surface border-app-border hover:border-app-primary/50 shadow-sm'}`}>

                                <input
                                    type="checkbox"
                                    checked={goal.completed}
                                    onChange={() => updateGoal(goal.id, { completed: !goal.completed })}
                                    className="mt-1 sm:mt-0 w-6 h-6 rounded-full border-2 border-app-border accent-app-primary cursor-pointer shrink-0"
                                />

                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium truncate ${goal.completed ? 'line-through text-app-muted' : 'text-app-text'}`}>
                                        {goal.text}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 text-xs">
                                        <span className="flex items-center gap-1.5 font-medium px-2 py-0.5 bg-app-bg border border-app-border rounded-full text-app-muted">
                                            <span className={`w-2 h-2 rounded-full ${getPriorityColor(goal.priority)}`} />
                                            {goal.subject}
                                        </span>
                                        <span className={`flex items-center gap-1 ${goal.dueDate === todayStr && !goal.completed ? 'text-app-danger font-medium' : 'text-app-muted'}`}>
                                            <Calendar size={12} />
                                            {goal.dueDate === todayStr ? 'Today' : new Date(goal.dueDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <button onClick={() => { deleteGoal(goal.id); toast('Goal deleted'); }} className="p-2 text-app-muted hover:text-app-danger hover:bg-app-danger/10 rounded-lg transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        )) : (
                            <div className="text-center py-12 bg-app-surface border border-app-border border-dashed rounded-xl">
                                <TargetIcon size={40} className="mx-auto text-app-muted mb-4 opacity-50" />
                                <p className="text-app-muted">No {activeTab} goals found.</p>
                                <button onClick={() => { setNewGoal({ ...newGoal, type: activeTab }); setShowAddModal(true); }} className="mt-2 text-app-primary text-sm font-medium hover:underline">
                                    Create one now
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Sidebar */}
                <div className="w-full md:w-64 shrink-0 space-y-6">
                    <div className="bg-app-surface border border-app-border rounded-xl p-5 shadow-sm space-y-4">
                        <h3 className="font-display font-semibold border-b border-app-border pb-2">Insights</h3>
                        <div>
                            <p className="text-sm text-app-muted mb-1">Completion (This Week)</p>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold text-app-primary">{stats.weekCompletionRate}%</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-app-muted mb-1">Most Productive Subject</p>
                            <span className="inline-block px-3 py-1 bg-app-primary/10 text-app-primary rounded-lg text-sm font-medium">
                                {stats.mostProductiveSubject}
                            </span>
                        </div>
                    </div>

                    <div className="bg-app-surface border border-app-danger/20 rounded-xl p-5 shadow-sm space-y-3">
                        <h3 className="font-display font-semibold text-app-danger flex items-center gap-2">
                            Due Today
                        </h3>
                        <div className="space-y-2">
                            {goals.filter(g => g.dueDate === todayStr && !g.completed).length > 0 ? (
                                goals.filter(g => g.dueDate === todayStr && !g.completed).map(g => (
                                    <div key={g.id} className="text-sm p-2 bg-app-danger/5 border border-app-danger/10 rounded-lg text-app-text truncate">
                                        {g.text}
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-app-muted">Nothing due today! Enjoy your free time.</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Add Goal Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
                    <form onSubmit={handleAddSubmit} className="bg-app-surface border border-app-border rounded-xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-display font-bold text-app-text">Add New Goal</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-app-muted">Description</label>
                            <input type="text" required autoFocus placeholder="What do you want to achieve?"
                                value={newGoal.text} onChange={e => setNewGoal({ ...newGoal, text: e.target.value })}
                                className="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2 focus:outline-none focus:border-app-primary" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-app-muted">Subject</label>
                                <select value={newGoal.subject} onChange={e => setNewGoal({ ...newGoal, subject: e.target.value })}
                                    className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-app-primary">
                                    {settings.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-app-muted">Priority</label>
                                <select value={newGoal.priority} onChange={e => setNewGoal({ ...newGoal, priority: e.target.value })}
                                    className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-app-primary">
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-app-muted">Type</label>
                                <select value={newGoal.type} onChange={e => setNewGoal({ ...newGoal, type: e.target.value })}
                                    className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-app-primary capitalize">
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-app-muted">Due Date</label>
                                <input type="date" required value={newGoal.dueDate} onChange={e => setNewGoal({ ...newGoal, dueDate: e.target.value })}
                                    className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-app-primary" />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 border border-app-border rounded-lg font-medium hover:bg-app-bg transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={!newGoal.text.trim()}
                                className="flex-1 py-2.5 bg-app-primary text-white rounded-lg font-medium hover:bg-app-primary/90 transition-colors disabled:opacity-50">
                                Create Goal
                            </button>
                        </div>
                    </form>
                </div>
            )}

        </div>
    );
}
