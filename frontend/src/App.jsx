import { useEffect, useMemo, useState } from 'react';

import Sidebar from './components/Sidebar';
import { ToastProvider } from './components/ToastProvider';
import DashboardPage from './pages/DashboardPage';
import InstructorManagementPage from './pages/InstructorManagementPage';
import PosturalAnalysisPage from './pages/PosturalAnalysisPage';
import SchedulePage from './pages/SchedulePage';
import StudentManagementPage from './pages/StudentManagementPage';
import TrainingPlansPage from './pages/TrainingPlansPage';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('pilates-theme');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('pilates-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const page = useMemo(() => {
    switch (activePage) {
      case 'students':
        return <StudentManagementPage />;
      case 'instructors':
        return <InstructorManagementPage />;
      case 'schedule':
        return <SchedulePage />;
      case 'analysis':
        return <PosturalAnalysisPage />;
      case 'plans':
        return <TrainingPlansPage />;
      default:
        return <DashboardPage />;
    }
  }, [activePage]);

  return (
    <ToastProvider>
      <div className="min-h-screen text-slate-800 transition-colors dark:text-slate-100">
        <Sidebar activePage={activePage} onNavigate={setActivePage} theme={theme} onToggleTheme={toggleTheme} />
        <main className="ml-0 p-4 md:ml-72 md:p-8">{page}</main>
      </div>
    </ToastProvider>
  );
}

export default App;
