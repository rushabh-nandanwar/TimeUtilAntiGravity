export const uuid = () => Math.random().toString(36).substring(2, 11);

export const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const calculateStreak = (streakData) => {
    if (!streakData) return { currentStreak: 0, longestStreak: 0, lastStudyDate: null, totalDaysStudied: 0 };

    const today = getTodayDateString();
    const lastStudyDate = streakData.lastStudyDate;

    if (!lastStudyDate) {
        return {
            currentStreak: 1,
            longestStreak: Math.max(1, streakData.longestStreak || 0),
            lastStudyDate: today,
            totalDaysStudied: (streakData.totalDaysStudied || 0) + 1
        };
    }

    if (lastStudyDate === today) {
        return streakData; // No change today
    }

    const lastDate = new Date(lastStudyDate);
    const currentDate = new Date(today);
    const diffTime = Math.abs(currentDate - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        // Increment streak
        const newStreak = (streakData.currentStreak || 0) + 1;
        return {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, streakData.longestStreak || 0),
            lastStudyDate: today,
            totalDaysStudied: (streakData.totalDaysStudied || 0) + 1
        };
    } else {
        // Gap > 1 day, reset streak
        return {
            currentStreak: 1,
            longestStreak: streakData.longestStreak || 0,
            lastStudyDate: today,
            totalDaysStudied: (streakData.totalDaysStudied || 0) + 1
        };
    }
};
