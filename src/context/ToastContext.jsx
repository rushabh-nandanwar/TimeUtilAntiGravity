import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={addToast}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className="animate-in slide-in-from-right-8 fade-in duration-300 px-6 py-4 bg-[#0a0a0a] border border-app-border rounded-2xl flex items-center gap-3 min-w-[200px]"
                    >
                        <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-app-secondary' : 'bg-app-danger'}`} />
                        <span className="text-sm font-medium">{toast.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);
