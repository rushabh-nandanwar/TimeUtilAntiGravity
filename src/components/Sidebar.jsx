import React from 'react';
import { LayoutDashboard, Timer, Target, BarChart2, BookOpen, Settings, Moon, Sun } from 'lucide-react';

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

    const { streak } = useStudyData();

    return (
        <aside className="w-64 bg-transparent border-r border-app-border shrink-0 flex-col transition-colors duration-300 hidden md:flex">
            <div className="p-6">
                <h1 className="text-[24px] font-sans font-normal tracking-[-1px] text-[#f0f0f0]">StudyOS</h1>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActivePage(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${isActive
                                ? 'bg-[#f0f0f0]/10 text-white'
                                : 'text-app-muted hover:bg-white/5 hover:text-[#f0f0f0]'
                                }`}
                        >
                            <Icon size={18} />
                            <span className="text-[14px] font-sans font-medium tracking-[0.35px]">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-6 space-y-4">
                <div className="flex flex-col p-4 bg-transparent rounded-xl border border-app-border">
                    <span className="text-[12px] text-app-muted font-inter uppercase tracking-[0.35px] mb-1">Current Streak</span>
                    <span className="font-display text-[24px] tracking-tight text-[#f0f0f0] leading-none">🔥 {streak.currentStreak} <span className="text-[14px] text-app-muted font-sans font-normal tracking-normal">days</span></span>
                </div>
            </div>
        </aside>
    );
}
