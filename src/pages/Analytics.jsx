import React, { useState, useMemo } from 'react';
import { useStudyData } from '../context/StudyDataContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { useTheme } from '../context/ThemeContext';

export default function Analytics() {
    const { sessions, settings } = useStudyData();
    const { theme } = useTheme();
    const [timeRange, setTimeRange] = useState('This Week'); // 'This Week' | 'This Month' | 'All Time'

    const filteredSessions = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const limitDate = new Date(today);

        if (timeRange === 'This Week') {
            limitDate.setDate(limitDate.getDate() - 7);
        } else if (timeRange === 'This Month') {
            limitDate.setMonth(limitDate.getMonth() - 1);
        } else {
            limitDate.setFullYear(2000); // effectively all time
        }

        return sessions.filter(s => new Date(s.date) >= limitDate);
    }, [sessions, timeRange]);

    // Chart Colors based on theme
    const colors = {
        primary: theme === 'dark' ? '#7c5cfc' : '#6c4ef2',
        secondary: theme === 'dark' ? '#00d4aa' : '#00b894',
        text: theme === 'dark' ? '#f0f0ff' : '#1a1a2e',
        muted: theme === 'dark' ? '#8888aa' : '#666688',
        grid: theme === 'dark' ? '#2a2a3a' : '#e0e0f0',
        tooltipBg: theme === 'dark' ? '#1a1a24' : '#ffffff',
        tooltipBorder: theme === 'dark' ? '#2a2a3a' : '#e0e0f0',
        heatmapColors: theme === 'dark' ?
            ['#1a1a24', '#3d2b7a', '#5f41bf', '#7c5cfc', '#aa8fff'] :
            ['#e0e0f0', '#b9a8ff', '#8e79ff', '#6c4ef2', '#492bd6']
    };

    const getHeatmapColor = (minutes) => {
        if (minutes === 0) return colors.heatmapColors[0];
        if (minutes <= 60) return colors.heatmapColors[1];
        if (minutes <= 120) return colors.heatmapColors[2];
        if (minutes <= 180) return colors.heatmapColors[3];
        return colors.heatmapColors[4];
    };

    // Section 1: Study Hours Overview Data
    const hoursData = useMemo(() => {
        const dataMap = {};
        filteredSessions.forEach(s => {
            dataMap[s.date] = (dataMap[s.date] || 0) + s.duration;
        });
        return Object.entries(dataMap)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
            .map(([date, mins]) => ({
                date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                hours: Number((mins / 60).toFixed(1)),
                target: settings.dailyTargetHours
            }));
    }, [filteredSessions, settings.dailyTargetHours]);

    // Section 2: Subject Breakdown Data
    const subjectData = useMemo(() => {
        const dataMap = {};
        filteredSessions.forEach(s => {
            dataMap[s.subject] = (dataMap[s.subject] || 0) + s.duration;
        });
        return Object.entries(dataMap).map(([name, value]) => ({ name, value }));
    }, [filteredSessions]);

    const PIE_COLORS = [colors.primary, colors.secondary, '#ff6b6b', '#fca311', '#4ea8de', '#9d4edd', '#ff99c8'];

    // Section 3: Heatmap Data
    const heatmapData = useMemo(() => {
        const data = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Fill 12 weeks = 84 days
        for (let i = 83; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const minsObj = sessions.filter(s => s.date === dateStr).reduce((acc, s) => acc + s.duration, 0);
            data.push({
                date: dateStr,
                minutes: minsObj
            });
        }
        return data;
    }, [sessions]);

    // Section 4: Pomodoro Stats
    const pomodoroStats = useMemo(() => {
        const pomodoros = sessions.filter(s => s.type === 'pomodoro');
        const total = pomodoros.length;

        // Group by date to find best day
        const byDate = {};
        pomodoros.forEach(s => { byDate[s.date] = (byDate[s.date] || 0) + 1; });
        const bestDayVal = Object.values(byDate).sort((a, b) => b - a)[0] || 0;

        const countDates = Object.keys(byDate).length || 1;
        const avgPerDay = (total / countDates).toFixed(1);

        const totalDistract = pomodoros.reduce((a, s) => a + (s.distractions || 0), 0);
        const avgDistract = total > 0 ? (totalDistract / total).toFixed(1) : 0;

        return { total, avgPerDay, bestDayVal, avgDistract };
    }, [sessions]);

    // Section 5: Best Study Hour
    const bestHourData = useMemo(() => {
        const hoursMap = Array(24).fill(0);
        filteredSessions.forEach(s => {
            if (s.startTime) {
                const hour = parseInt(s.startTime.split(':')[0], 10);
                if (!isNaN(hour)) {
                    hoursMap[hour] += s.duration;
                }
            }
        });
        return hoursMap.map((val, idx) => ({ hour: `${idx}:00`, minutes: val }));
    }, [filteredSessions]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-app-surface border border-app-border p-3 rounded-lg shadow-xl shrink-0">
                    <p className="font-medium text-app-text mb-1">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm font-medium" style={{ color: entry.color || entry.fill }}>
                            {entry.name}: {entry.value} {entry.name === 'hours' || entry.name === 'target' ? 'hrs' : 'min'}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-300">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-3xl font-display font-bold text-app-text">Analytics</h2>
                <div className="flex bg-app-surface p-1 rounded-lg border border-app-border w-fit text-sm">
                    {['This Week', 'This Month', 'All Time'].map(range => (
                        <button key={range} onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-md font-medium transition-colors ${timeRange === range ? 'bg-app-bg text-app-primary shadow-sm' : 'text-app-muted hover:text-app-text'}`}>
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Study Hours Overview (Line/Area Chart) */}
                <div className="lg:col-span-2 bg-app-surface border border-app-border rounded-xl p-6 shadow-sm">
                    <h3 className="font-display font-semibold mb-6 flex items-center justify-between">
                        Study Hours Overview
                        <span className="text-xs font-normal text-app-muted bg-app-bg px-2 py-1 rounded border border-app-border">Target: {settings.dailyTargetHours}h/day</span>
                    </h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={hoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                                <XAxis dataKey="date" stroke={colors.muted} fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke={colors.muted} fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="hours" name="Actual" stroke={colors.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                                <Area type="step" dataKey="target" name="Target" stroke={colors.grid} strokeWidth={2} strokeDasharray="5 5" fillOpacity={0} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Subject Breakdown (Pie Chart) */}
                <div className="bg-app-surface border border-app-border rounded-xl p-6 shadow-sm">
                    <h3 className="font-display font-semibold mb-6">Subject Breakdown</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={subjectData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                    {subjectData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value} min`, 'Duration']} contentStyle={{ backgroundColor: colors.tooltipBg, borderColor: colors.tooltipBorder, borderRadius: '8px', color: colors.text }} itemStyle={{ color: colors.text }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: colors.muted }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Heatmap */}
                <div className="lg:col-span-3 bg-app-surface border border-app-border rounded-xl p-6 shadow-sm overflow-x-auto">
                    <h3 className="font-display font-semibold mb-6">Activity Heatmap (Last 12 Weeks)</h3>
                    <div className="min-w-[600px]">
                        <div className="grid grid-rows-7 grid-flow-col gap-1.5 w-max">
                            {heatmapData.map((day, i) => (
                                <div
                                    key={i}
                                    className="w-4 h-4 rounded-sm transition-transform hover:scale-125 hover:z-10 relative group"
                                    style={{ backgroundColor: getHeatmapColor(day.minutes) }}
                                >
                                    {/* Custom Tooltip on hover */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-app-text text-app-bg text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-20">
                                        {new Date(day.date).toLocaleDateString()} : {day.minutes} mins
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 mt-4 text-xs text-app-muted justify-end">
                            <span>Less</span>
                            {colors.heatmapColors.map(c => <div key={c} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />)}
                            <span>More</span>
                        </div>
                    </div>
                </div>

                {/* Best Study Hour */}
                <div className="lg:col-span-2 bg-app-surface border border-app-border rounded-xl p-6 shadow-sm">
                    <h3 className="font-display font-semibold mb-6">Best Study Hour</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={bestHourData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                                <XAxis dataKey="hour" stroke={colors.muted} fontSize={10} tickLine={false} axisLine={false} interval={2} />
                                <YAxis stroke={colors.muted} fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: colors.grid, opacity: 0.2 }} />
                                <Bar dataKey="minutes" name="Total min" fill={colors.secondary} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pomodoro Stats */}
                <div className="bg-app-surface border border-app-border rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                    <h3 className="font-display font-semibold">Pomodoro Stats (All Time)</h3>
                    <div className="grid grid-cols-2 gap-4 flex-1">
                        <div className="bg-app-bg border border-app-border rounded-lg p-4 flex flex-col justify-center">
                            <p className="text-xs text-app-muted uppercase font-medium">Total Sessions</p>
                            <p className="text-2xl font-bold font-mono text-app-text mt-1">{pomodoroStats.total}</p>
                        </div>
                        <div className="bg-app-bg border border-app-border rounded-lg p-4 flex flex-col justify-center">
                            <p className="text-xs text-app-muted uppercase font-medium">Avg per Day</p>
                            <p className="text-2xl font-bold font-mono text-app-text mt-1">{pomodoroStats.avgPerDay}</p>
                        </div>
                        <div className="bg-app-bg border border-app-border rounded-lg p-4 flex flex-col justify-center">
                            <p className="text-xs text-app-muted uppercase font-medium">Best Day</p>
                            <p className="text-2xl font-bold font-mono text-app-text mt-1">{pomodoroStats.bestDayVal}</p>
                        </div>
                        <div className="bg-app-bg border border-app-border rounded-lg p-4 flex flex-col justify-center">
                            <p className="text-xs tracking-tight text-app-muted uppercase font-medium">Avg Distractions</p>
                            <p className="text-2xl font-bold font-mono text-app-text mt-1">{pomodoroStats.avgDistract}</p>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
