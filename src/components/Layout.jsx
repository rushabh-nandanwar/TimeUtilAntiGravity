import React from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children, activePage, setActivePage }) {
    return (
        <div className="flex h-screen overflow-hidden bg-app-bg text-app-text font-sans">
            <Sidebar activePage={activePage} setActivePage={setActivePage} />
            <main className="flex-1 overflow-y-auto">
                {/* We add page transition effects via a wrapper or directly in the pages, 
            but for a simple approach we can apply a fade-in animation here */}
                <div key={activePage} className="animate-in fade-in duration-300">
                    {children}
                </div>
            </main>
        </div>
    );
}
