import React from 'react';
import { LayoutDashboard, Timer, Target, BarChart2, BookOpen, Settings, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useStudyData } from '../context/StudyDataContext';

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timer', label: 'Timer', icon: Timer },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'log', label: 'Study Log', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activePage, setActivePage }) {
    const { theme, toggleTheme } = useTheme();
    const { streak } = useStudyData();

    return (
        <aside className="w-64 bg-app-surface border-r border-app-border shrink-0 flex-col transition-colors duration-300 hidden md:flex">
            <div className="p-6">
                <h1 className="text-2xl font-display font-bold text-app-primary">StudyOS</h1>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActivePage(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${isActive
                                ? 'bg-app-primary/10 text-app-primary border-l-4 border-app-primary'
                                : 'text-app-muted hover:bg-app-primary/5 hover:text-app-text border-l-4 border-transparent'
                                }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-app-border space-y-4">
                <div className="flex items-center justify-between p-3 bg-app-bg rounded-lg border border-app-border">
                    <div className="flex flex-col">
                        <span className="text-xs text-app-muted font-medium uppercase tracking-wider">Current Streak</span>
                        <span className="font-bold text-lg">🔥 {streak.currentStreak} days</span>
                    </div>
                </div>

                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-app-border rounded-lg text-app-muted hover:text-app-text hover:bg-app-bg transition-colors"
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
            </div>
        </aside>
    );
}
