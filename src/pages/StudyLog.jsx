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
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-app-border/50 pb-6">
                <h2 className="text-[56px] font-sans font-normal tracking-[-2.8px] leading-tight text-[#f0f0f0]">Study Log</h2>
                <button onClick={handleExportCSV} disabled={filteredAndSortedSessions.length === 0}
                    className="flex items-center gap-2 px-6 py-2.5 bg-transparent border border-app-border text-[#f0f0f0] rounded-full hover:bg-white/5 transition-colors font-sans tracking-[0.35px] disabled:opacity-50">
                    <Download size={18} /> Export CSV
                </button>
            </div>

            <div className="bg-transparent border border-app-border rounded-3xl p-8 space-y-8">

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-app-muted" size={18} />
                        <input type="text" placeholder="Search activity or notes..."
                            value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                            className="w-full bg-transparent border border-app-border text-[#f0f0f0] rounded-lg pl-10 pr-3 py-2 text-[14px] font-inter focus:outline-none focus:border-white/20 transition-all placeholder:text-app-muted" />
                    </div>

                    <div className="md:col-span-3">
                        <select value={subjectFilter} onChange={e => { setSubjectFilter(e.target.value); setCurrentPage(1) }}
                            className="w-full bg-transparent border border-app-border text-[#f0f0f0] rounded-lg px-3 py-2 text-[14px] font-inter focus:outline-none focus:border-white/20 h-[38px] appearance-none" style={{ backgroundColor: '#000000' }}>
                            <option value="All">All Subjects</option>
                            {settings.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="md:col-span-5 flex items-center gap-2">
                        <Filter className="text-app-muted hidden lg:block mr-1" size={18} />
                        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setCurrentPage(1) }}
                            className="flex-1 bg-transparent border border-app-border text-[#f0f0f0] rounded-lg px-3 py-2 text-[14px] font-inter focus:outline-none focus:border-white/20 max-w-[140px] h-[38px]" title="From Date" style={{ colorScheme: 'dark' }} />
                        <span className="text-app-muted text-sm px-1">to</span>
                        <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setCurrentPage(1) }}
                            className="flex-1 bg-transparent border border-app-border text-[#f0f0f0] rounded-lg px-3 py-2 text-[14px] font-inter focus:outline-none focus:border-white/20 max-w-[140px] h-[38px]" title="To Date" style={{ colorScheme: 'dark' }} />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-app-border">
                    <table className="w-full text-left text-[14px] font-inter whitespace-nowrap text-[#f0f0f0]">
                        <thead className="bg-[#0a0a0a] border-b border-app-border text-app-muted font-sans tracking-[0.35px]">
                            <tr>
                                <th className="px-4 py-4 font-normal cursor-pointer hover:text-white transition-colors flex items-center gap-1" onClick={toggleSort}>
                                    Date {sortOrder === 'desc' ? '↓' : '↑'}
                                </th>
                                <th className="px-4 py-4 font-normal">Subject</th>
                                <th className="px-4 py-4 font-normal">Activity</th>
                                <th className="px-4 py-4 font-normal">Duration</th>
                                <th className="px-4 py-4 font-normal">Type</th>
                                <th className="px-4 py-4 font-normal text-center">Distractions</th>
                                <th className="px-4 py-4 font-normal w-full">Notes</th>
                                <th className="px-4 py-4 font-normal"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-app-border/50">
                            {paginatedSessions.length > 0 ? paginatedSessions.map(session => (
                                <tr key={session.id} className="hover:bg-white/2 transition-colors group">
                                    <td className="px-4 py-3 tabular-nums font-mono text-[12px]">{session.date} <span className="opacity-60">{session.startTime}</span></td>
                                    <td className="px-4 py-3"><span className="px-2.5 py-1 bg-transparent border border-app-border rounded-[9999px] text-[12px] font-sans tracking-[0.35px]">{session.subject}</span></td>
                                    <td className="px-4 py-3 truncate max-w-[200px]" title={session.activity}>{session.activity || '-'}</td>
                                    <td className="px-4 py-3 font-mono text-[12px]"><span className="text-[#f0f0f0]">{session.duration}m</span></td>
                                    <td className="px-4 py-3 text-[12px] capitalize"><span className={session.type === 'pomodoro' ? 'text-[rgba(214,235,253,0.8)]' : 'text-app-muted'}>{session.type}</span></td>
                                    <td className="px-4 py-3 text-center">{session.distractions > 0 ? <span className="text-[#ff2047]">{session.distractions}</span> : <span className="text-app-muted">-</span>}</td>
                                    <td className="px-4 py-3 truncate max-w-[200px] text-[12px] text-app-muted" title={session.notes}>{session.notes || '-'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => { deleteSession(session.id); toast('Session deleted'); }} className="text-app-muted hover:text-[#ff2047] hover:bg-[#ff2047]/10 rounded-full transition-all p-2 opacity-0 group-hover:opacity-100">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={8}>
                                        <div className="flex flex-col items-center justify-center py-12 text-app-muted space-y-3">
                                            <AlertCircle size={40} className="opacity-50" />
                                            <p className="font-inter">No study sessions found matching your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between text-sm font-inter">
                        <span className="text-app-muted">
                            Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredAndSortedSessions.length)} of {filteredAndSortedSessions.length} entries
                        </span>
                        <div className="flex items-center gap-2">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}
                                className="p-1 px-3 border border-app-border rounded-lg hover:bg-white/5 disabled:opacity-50 flex items-center justify-center transition-colors text-[#f0f0f0]">
                                <ChevronLeft size={16} /> Prev
                            </button>
                            <span className="px-3 py-1 bg-transparent rounded-lg border border-app-border text-[#f0f0f0]">{currentPage} / {totalPages}</span>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}
                                className="p-1 px-3 border border-app-border rounded-lg hover:bg-white/5 disabled:opacity-50 flex items-center justify-center transition-colors text-[#f0f0f0]">
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
