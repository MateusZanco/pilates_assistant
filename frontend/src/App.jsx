import { useEffect, useMemo, useState } from 'react';

import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import { ToastProvider } from './components/ToastProvider';
import { I18nProvider } from './i18n';
import DashboardPage from './pages/DashboardPage';
import InstructorManagementPage from './pages/InstructorManagementPage';
import PosturalAnalysisPage from './pages/PosturalAnalysisPage';
import SchedulePage from './pages/SchedulePage';
import StudentManagementPage from './pages/StudentManagementPage';
import TrainingPlansPage from './pages/TrainingPlansPage';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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

  const handleNavigate = (nextPage) => {
    setActivePage(nextPage);
    setMobileSidebarOpen(false);
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
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  }, [activePage, handleNavigate]);

  return (
    <I18nProvider>
      <ToastProvider>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ffffff,_#f0f3ec_55%,_#e9ede3_100%)] text-slate-800 transition-colors dark:bg-[radial-gradient(circle_at_top_left,_#111827,_#0f172a_55%,_#020617_100%)] dark:text-slate-100">
          <Sidebar
            activePage={activePage}
            onNavigate={handleNavigate}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
            mobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />
          <div className={`transition-all ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-72'}`}>
            <TopHeader theme={theme} onToggleTheme={toggleTheme} onMenuClick={() => setMobileSidebarOpen(true)} />
            <main className="p-4 md:p-8">{page}</main>
          </div>
        </div>
      </ToastProvider>
    </I18nProvider>
  );
}

export default App;
