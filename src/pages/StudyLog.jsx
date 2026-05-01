import React, { useState, useMemo } from 'react';
import { useStudyData } from '../context/StudyDataContext';
import { getTodayDateString } from '../utils/helpers';
import { Search, Download, Trash2, Filter, AlertCircle, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function StudyLog() {
    const { sessions, deleteSession, settings } = useStudyData();
    const toast = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('All');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' or 'asc' for date

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 15;

    const filteredAndSortedSessions = useMemo(() => {
        let result = [...sessions];

        // Search filter
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            result = result.filter(s =>
                s.subject.toLowerCase().includes(q) ||
                (s.activity && s.activity.toLowerCase().includes(q)) ||
                (s.notes && s.notes.toLowerCase().includes(q))
            );
        }

        // Subject filter
        if (subjectFilter !== 'All') {
            result = result.filter(s => s.subject === subjectFilter);
        }

        // Date range filter
        if (dateFrom) {
            result = result.filter(s => new Date(s.date) >= new Date(dateFrom));
        }
        if (dateTo) {
            result = result.filter(s => new Date(s.date) <= new Date(dateTo));
        }

        // Sort by Date
        result.sort((a, b) => {
            const dateA = new Date(a.date + 'T' + (a.startTime || '00:00')).getTime();
            const dateB = new Date(b.date + 'T' + (b.startTime || '00:00')).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [sessions, searchTerm, subjectFilter, dateFrom, dateTo, sortOrder]);

    const totalPages = Math.ceil(filteredAndSortedSessions.length / rowsPerPage);
    const paginatedSessions = filteredAndSortedSessions.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const toggleSort = () => {
        setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
        setCurrentPage(1); // Reset to first page
    };

    const handleExportCSV = () => {
        if (filteredAndSortedSessions.length === 0) return;

        // Headers
        const headers = ['Date', 'Start Time', 'Subject', 'Activity', 'Duration (min)', 'Type', 'Distractions', 'Notes'];

        // Rows
        const rows = filteredAndSortedSessions.map(s => [
            s.date,
            s.startTime || '',
            `"${s.subject.replace(/"/g, '""')}"`,
            `"${(s.activity || '').replace(/"/g, '""')}"`,
            s.duration,
            s.type,
            s.distractions || 0,
            `"${(s.notes || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `studyos-log-${getTodayDateString()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast('CSV exported ✓');
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-3xl font-display font-bold text-app-text">Study Log</h2>
                <button onClick={handleExportCSV} disabled={filteredAndSortedSessions.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-app-surface border border-app-border text-app-text rounded-lg hover:border-app-primary transition-colors disabled:opacity-50">
                    <Download size={18} /> Export CSV
                </button>
            </div>

            <div className="bg-app-surface border border-app-border rounded-xl p-6 shadow-sm space-y-6">

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-app-muted" size={18} />
                        <input type="text" placeholder="Search activity or notes..."
                            value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                            className="w-full bg-app-bg border border-app-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-app-primary focus:ring-1 focus:ring-app-primary transition-all" />
                    </div>

                    <div className="md:col-span-3">
                        <select value={subjectFilter} onChange={e => { setSubjectFilter(e.target.value); setCurrentPage(1) }}
                            className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-app-primary h-[38px]">
                            <option value="All">All Subjects</option>
                            {settings.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="md:col-span-5 flex items-center gap-2">
                        <Filter className="text-app-muted hidden lg:block mr-1" size={18} />
                        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setCurrentPage(1) }}
                            className="flex-1 bg-app-bg border border-app-border rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-app-primary max-w-[140px] h-[38px]" title="From Date" />
                        <span className="text-app-muted text-sm px-1">to</span>
                        <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setCurrentPage(1) }}
                            className="flex-1 bg-app-bg border border-app-border rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-app-primary max-w-[140px] h-[38px]" title="To Date" />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-lg border border-app-border">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-app-bg/50 border-b border-app-border text-app-muted">
                            <tr>
                                <th className="px-4 py-3 font-medium cursor-pointer hover:text-app-primary transition-colors flex items-center gap-1" onClick={toggleSort}>
                                    Date {sortOrder === 'desc' ? '↓' : '↑'}
                                </th>
                                <th className="px-4 py-3 font-medium">Subject</th>
                                <th className="px-4 py-3 font-medium">Activity</th>
                                <th className="px-4 py-3 font-medium">Duration</th>
                                <th className="px-4 py-3 font-medium">Type</th>
                                <th className="px-4 py-3 font-medium text-center">Distractions</th>
                                <th className="px-4 py-3 font-medium w-full">Notes</th>
                                <th className="px-4 py-3 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-app-border">
                            {paginatedSessions.length > 0 ? paginatedSessions.map(session => (
                                <tr key={session.id} className="hover:bg-app-bg/30 transition-colors group">
                                    <td className="px-4 py-3 tabular-nums font-mono text-xs">{session.date} <span className="opacity-60">{session.startTime}</span></td>
                                    <td className="px-4 py-3"><span className="px-2 py-1 bg-app-surface border border-app-border rounded-full text-xs font-medium">{session.subject}</span></td>
                                    <td className="px-4 py-3 truncate max-w-[200px]" title={session.activity}>{session.activity || '-'}</td>
                                    <td className="px-4 py-3 font-mono text-xs"><span className="text-app-primary font-medium">{session.duration}m</span></td>
                                    <td className="px-4 py-3 text-xs capitalize"><span className={session.type === 'pomodoro' ? 'text-app-secondary' : 'text-app-muted'}>{session.type}</span></td>
                                    <td className="px-4 py-3 text-center">{session.distractions > 0 ? <span className="text-app-danger font-medium">{session.distractions}</span> : <span className="text-app-muted">-</span>}</td>
                                    <td className="px-4 py-3 truncate max-w-[200px] text-xs text-app-muted" title={session.notes}>{session.notes || '-'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => { deleteSession(session.id); toast('Session deleted'); }} className="text-app-muted hover:text-app-danger opacity-0 group-hover:opacity-100 transition-all p-1">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={8}>
                                        <div className="flex flex-col items-center justify-center py-12 text-app-muted space-y-3">
                                            <AlertCircle size={40} className="opacity-50" />
                                            <p>No study sessions found matching your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-app-muted">
                            Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredAndSortedSessions.length)} of {filteredAndSortedSessions.length} entries
                        </span>
                        <div className="flex items-center gap-2">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}
                                className="p-1 px-3 border border-app-border rounded hover:bg-app-bg disabled:opacity-50 flex items-center justify-center transition-colors">
                                <ChevronLeft size={16} /> Prev
                            </button>
                            <span className="px-3 py-1 font-medium bg-app-bg rounded border border-app-border">{currentPage} / {totalPages}</span>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}
                                className="p-1 px-3 border border-app-border rounded hover:bg-app-bg disabled:opacity-50 flex items-center justify-center transition-colors">
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
