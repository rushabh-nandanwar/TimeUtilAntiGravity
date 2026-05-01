import { createContext, useContext, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { calculateStreak } from "../utils/helpers";

import { hydrateSampleData } from "../utils/sampleData";

if (!localStorage.getItem("studyos_hydrated")) {
    hydrateSampleData();
}

const StudyDataContext = createContext();

const defaultSettings = {
    pomodoroWork: 25,
    pomodoroShortBreak: 5,
    pomodoroLongBreak: 15,
    pomodorosUntilLong: 4,
    dailyTargetHours: 6,
    subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "History", "English", "Computer Science"],
    soundEnabled: true
};

export const StudyDataProvider = ({ children }) => {
    const [sessions, setSessions] = useLocalStorage("studyos_sessions", []);
    const [goals, setGoals] = useLocalStorage("studyos_goals", []);
    const [settings, setSettings] = useLocalStorage("studyos_settings", defaultSettings);
    const [streak, setStreak] = useLocalStorage("studyos_streak", {
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: null,
        totalDaysStudied: 0
    });

    const updateStreakOnSession = () => {
        setStreak(prev => calculateStreak(prev));
    };

    const addSession = (session) => {
        setSessions(prev => [session, ...prev]);
        updateStreakOnSession();
    };

    const deleteSession = (id) => {
        setSessions(prev => prev.filter(s => s.id !== id));
    };

    const addGoal = (goal) => {
        setGoals(prev => [goal, ...prev]);
    };

    const updateGoal = (id, updates) => {
        setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    };

    const deleteGoal = (id) => {
        setGoals(prev => prev.filter(g => g.id !== id));
    };

    const clearAllData = () => {
        setSessions([]);
        setGoals([]);
        setSettings(defaultSettings);
        setStreak({
            currentStreak: 0,
            longestStreak: 0,
            lastStudyDate: null,
            totalDaysStudied: 0
        });
    };

    return (
        <StudyDataContext.Provider value={{
            sessions, addSession, deleteSession, setSessions,
            goals, addGoal, updateGoal, deleteGoal, setGoals,
            settings, setSettings,
            streak, updateStreakOnSession, setStreak, clearAllData
        }}>
            {children}
        </StudyDataContext.Provider>
    );
};

export const useStudyData = () => useContext(StudyDataContext);
