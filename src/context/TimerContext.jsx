import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useStudyData } from './StudyDataContext';
import { useToast } from './ToastContext';
import { uuid, getTodayDateString } from '../utils/helpers';
import rainAudioFile from '../assets/Rain(chosic.com).mp3';

const MOTIVATIONAL_QUOTES = [
    "Small steps every day lead to massive results.",
    "You don't have to be great to start, but you have to start to be great.",
    "The expert in anything was once a beginner.",
    "Focus on progress, not perfection.",
    "Every session counts. Every minute matters.",
    "Discipline is choosing between what you want now and what you want most.",
    "Your future self is watching you right now.",
    "Study hard in silence. Let success make the noise.",
    "Consistency beats intensity every single time.",
    "One more Pomodoro. That's all.",
    "Don't stop when you're tired. Stop when you're done.",
    "Doubt kills more dreams than failure ever will.",
    "Make today your masterpiece.",
    "It always seems impossible until it's done.",
    "Action is the foundational key to all success.",
    "Success is the sum of small efforts, repeated day in and day out.",
    "Do something today that your future self will thank you for.",
    "The secret of getting ahead is getting started.",
    "A year from now you may wish you had started today.",
    "There is no substitute for hard work."
];

const TimerContext = createContext();

export function TimerProvider({ children }) {
    const { settings, addSession } = useStudyData();
    const toast = useToast();

    const [phase, setPhase] = useState('work'); // 'work' | 'shortBreak' | 'longBreak'
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [completedPomodoros, setCompletedPomodoros] = useState(0);

    const [subject, setSubject] = useState(settings?.subjects?.[0] || '');
    const [activity, setActivity] = useState('');
    const [distractions, setDistractions] = useState(0);
    const [notes, setNotes] = useState('');

    const [showCompletion, setShowCompletion] = useState(false);
    const [completionQuote, setCompletionQuote] = useState('');

    const intervalRef = useRef(null);
    const audioRef = useRef(null);

    // Initialize rain audio
    useEffect(() => {
        audioRef.current = new Audio(rainAudioFile);
        audioRef.current.loop = true;
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    // Handle rain audio playback
    useEffect(() => {
        if (!audioRef.current) return;
        // Play during shortBreak or longBreak if active and sound is enabled
        if (isActive && (phase === 'shortBreak' || phase === 'longBreak') && settings.soundEnabled) {
            audioRef.current.play().catch(e => console.warn('Audio play prevented', e));
        } else {
            audioRef.current.pause();
        }
    }, [isActive, phase, settings.soundEnabled]);

    // Initialize time correctly on first mount or settings change when not active
    useEffect(() => {
        if (!isActive) {
            if (phase === 'work') setTimeLeft(settings.pomodoroWork * 60);
            else if (phase === 'shortBreak') setTimeLeft(settings.pomodoroShortBreak * 60);
            else if (phase === 'longBreak') setTimeLeft(settings.pomodoroLongBreak * 60);
        }
    }, [settings.pomodoroWork, settings.pomodoroShortBreak, settings.pomodoroLongBreak, phase, isActive]);

    useEffect(() => {
        if (!subject && settings.subjects.length > 0) {
            setSubject(settings.subjects[0]);
        }
    }, [settings.subjects, subject]);

    const playChime = () => {
        if (!settings.soundEnabled) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 1);
        } catch (e) {
            console.warn("Audio not supported or blocked");
        }
    };

    const handleTimerComplete = () => {
        setIsActive(false);
        playChime();

        if (settings.soundEnabled && Notification.permission === "granted") {
            new Notification(`Phase Complete: ${phase === 'work' ? 'Time for a break!' : 'Back to work!'}`);
        }

        if (phase === 'work') {
            const newCompleted = completedPomodoros + 1;
            setCompletedPomodoros(newCompleted);

            // Auto-save session
            const now = new Date();
            const startTimeStr = new Date(now.getTime() - settings.pomodoroWork * 60000)
                .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

            addSession({
                id: uuid(),
                subject: subject || 'General',
                activity: activity || 'Pomodoro Session',
                duration: settings.pomodoroWork,
                date: getTodayDateString(),
                startTime: startTimeStr,
                type: 'pomodoro',
                notes,
                distractions
            });

            toast('Pomodoro session automatically saved!', 'success');

            setCompletionQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
            setShowCompletion(true);

            if (newCompleted % settings.pomodorosUntilLong === 0) {
                setPhase('longBreak');
                setTimeLeft(settings.pomodoroLongBreak * 60);
            } else {
                setPhase('shortBreak');
                setTimeLeft(settings.pomodoroShortBreak * 60);
            }
        } else {
            setPhase('work');
            setTimeLeft(settings.pomodoroWork * 60);
            setDistractions(0);
            setNotes('');
        }
    };

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        handleTimerComplete();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isActive, phase, completedPomodoros, subject, activity, notes, distractions, settings]);

    const toggleTimer = () => {
        if (!isActive && Notification.permission === "default") {
            Notification.requestPermission();
        }
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        if (phase === 'work') setTimeLeft(settings.pomodoroWork * 60);
        else if (phase === 'shortBreak') setTimeLeft(settings.pomodoroShortBreak * 60);
        else if (phase === 'longBreak') setTimeLeft(settings.pomodoroLongBreak * 60);
    };

    const skipPhase = () => {
        setIsActive(false);
        if (phase === 'work') {
            if ((completedPomodoros + 1) % settings.pomodorosUntilLong === 0) {
                setPhase('longBreak');
                setTimeLeft(settings.pomodoroLongBreak * 60);
            } else {
                setPhase('shortBreak');
                setTimeLeft(settings.pomodoroShortBreak * 60);
            }
        } else {
            setPhase('work');
            setTimeLeft(settings.pomodoroWork * 60);
        }
    };

    const timerState = {
        phase, timeLeft, isActive, completedPomodoros,
        subject, setSubject, activity, setActivity, distractions, setDistractions, notes, setNotes,
        showCompletion, setShowCompletion, completionQuote,
        toggleTimer, resetTimer, skipPhase
    };

    return (
        <TimerContext.Provider value={timerState}>
            {children}
        </TimerContext.Provider>
    );
}

export const useTimer = () => useContext(TimerContext);
