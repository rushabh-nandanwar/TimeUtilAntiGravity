import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { StudyDataProvider } from './context/StudyDataContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Timer from './pages/Timer';
import Goals from './pages/Goals';
import Analytics from './pages/Analytics';
import StudyLog from './pages/StudyLog';
import Settings from './pages/Settings';

import { ToastProvider } from './context/ToastContext';
import { TimerProvider } from './context/TimerContext';

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    // Need to pre-connect for faster font loading but simpler to just use link
    const linkParams = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;500&family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap';
    const link = document.createElement('link');
    link.href = linkParams;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard setActivePage={setActivePage} />;
      case 'timer': return <Timer />;
      case 'goals': return <Goals />;
      case 'analytics': return <Analytics />;
      case 'log': return <StudyLog />;
      case 'settings': return <Settings />;
      default: return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <ThemeProvider>
      <StudyDataProvider>
        <ToastProvider>
          <TimerProvider>
            <Layout activePage={activePage} setActivePage={setActivePage}>
              {renderPage()}
            </Layout>
          </TimerProvider>
        </ToastProvider>
      </StudyDataProvider>
    </ThemeProvider>
  );
}

export default App;
