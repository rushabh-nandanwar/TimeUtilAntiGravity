import { uuid, getTodayDateString } from './helpers';

export const hydrateSampleData = () => {
    const today = new Date();
    const todayStr = getTodayDateString();
    const subjects = ["Mathematics", "Physics", "Chemistry", "Computer Science", "English"];

    const sampleSessions = [];

    // Generate 7 days of sessions
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        // 2-4 sessions per day
        const sessionsToday = Math.floor(Math.random() * 3) + 2;
        for (let j = 0; j < sessionsToday; j++) {
            sampleSessions.push({
                id: uuid(),
                subject: subjects[Math.floor(Math.random() * subjects.length)],
                activity: `Review Chapter ${Math.floor(Math.random() * 5) + 1}`,
                duration: [25, 50, 45, 60][Math.floor(Math.random() * 4)],
                date: dateStr,
                startTime: `${Math.floor(Math.random() * (22 - 9) + 9).toString().padStart(2, '0')}:00`,
                type: Math.random() > 0.3 ? 'pomodoro' : 'manual',
                notes: 'Sample notes',
                distractions: Math.floor(Math.random() * 3)
            });
        }
    }

    // Generate some sample goals spanning different dates
    const sampleGoals = [
        {
            id: uuid(),
            text: "Finish Calculus Assignment",
            subject: "Mathematics",
            type: "daily",
            priority: "high",
            completed: false,
            createdAt: todayStr,
            dueDate: todayStr
        },
        {
            id: uuid(),
            text: "Read Physics Chapter 4",
            subject: "Physics",
            type: "daily",
            priority: "medium",
            completed: true,
            createdAt: todayStr,
            dueDate: todayStr
        },
        {
            id: uuid(),
            text: "Write essay draft",
            subject: "English",
            type: "weekly",
            priority: "high",
            completed: false,
            createdAt: todayStr,
            dueDate: new Date(today.getTime() + 86400000 * 3).toISOString().split('T')[0]
        },
        {
            id: uuid(),
            text: "Build React side project",
            subject: "Computer Science",
            type: "monthly",
            priority: "medium",
            completed: false,
            createdAt: todayStr,
            dueDate: new Date(today.getTime() + 86400000 * 15).toISOString().split('T')[0]
        }
    ];

    const sampleStreak = {
        currentStreak: 7,
        longestStreak: 12,
        lastStudyDate: todayStr,
        totalDaysStudied: 24
    };

    localStorage.setItem('studyos_sessions', JSON.stringify(sampleSessions.reverse()));
    localStorage.setItem('studyos_goals', JSON.stringify(sampleGoals));
    localStorage.setItem('studyos_streak', JSON.stringify(sampleStreak));
    localStorage.setItem('studyos_hydrated', 'true');
};
