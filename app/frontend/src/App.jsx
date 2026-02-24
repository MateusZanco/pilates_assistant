import { useEffect, useMemo, useRef, useState } from 'react';

import Sidebar from './components/Sidebar';
import LoginScreen from './components/LoginScreen';
import TopHeader from './components/TopHeader';
import { ToastProvider } from './components/ToastProvider';
import { I18nProvider, useI18n } from './i18n';
import DashboardPage from './pages/DashboardPage';
import InstructorManagementPage from './pages/InstructorManagementPage';
import PosturalAnalysisPage from './pages/PosturalAnalysisPage';
import SchedulePage from './pages/SchedulePage';
import StudentManagementPage from './pages/StudentManagementPage';
import TrainingPlansPage from './pages/TrainingPlansPage';

function AuthLoadingScreen() {
  const { t } = useI18n();

  return (
    <section className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-gray-900 transition-colors duration-500 dark:bg-slate-900 dark:text-white">
      <div className="w-full max-w-md rounded-3xl border border-sage/30 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.14)] transition-colors duration-500 dark:bg-slate-950/85 dark:shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-sage/30 border-t-sage" />
        <h2 className="mt-5 text-xl font-semibold text-gray-900 dark:text-slate-100">{t('auth.preparing')}</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">{t('auth.loadingDashboard')}</p>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-800">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-sage" />
        </div>
      </div>
    </section>
  );
}

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState(() => localStorage.getItem('pilates-user'));
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const authTimeoutRef = useRef(null);
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

  const handleLogin = (username) => {
    localStorage.setItem('pilates-user', username);
    setIsAuthenticating(true);
    authTimeoutRef.current = window.setTimeout(() => {
      setUser(username);
      setIsAuthenticating(false);
    }, 1700);
  };

  const handleLogout = () => {
    if (authTimeoutRef.current) {
      window.clearTimeout(authTimeoutRef.current);
      authTimeoutRef.current = null;
    }
    localStorage.clear();
    setIsAuthenticating(false);
    setUser(null);
  };

  useEffect(() => {
    return () => {
      if (authTimeoutRef.current) {
        window.clearTimeout(authTimeoutRef.current);
      }
    };
  }, []);

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
        return <DashboardPage onNavigate={handleNavigate} user={user} />;
    }
  }, [activePage, handleNavigate, user]);

  return (
    <I18nProvider>
      <ToastProvider>
        {!user && !isAuthenticating ? (
          <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ffffff,_#f0f3ec_55%,_#e9ede3_100%)] text-slate-800 transition-colors dark:bg-[radial-gradient(circle_at_top_left,_#111827,_#0f172a_55%,_#020617_100%)] dark:text-slate-100">
            <LoginScreen onLogin={handleLogin} theme={theme} onToggleTheme={toggleTheme} />
          </div>
        ) : isAuthenticating ? (
          <AuthLoadingScreen />
        ) : (
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
              <TopHeader
                theme={theme}
                onToggleTheme={toggleTheme}
                onMenuClick={() => setMobileSidebarOpen(true)}
                onLogout={handleLogout}
                user={user}
              />
              <main className="p-4 md:p-8">{page}</main>
            </div>
          </div>
        )}
      </ToastProvider>
    </I18nProvider>
  );
}

export default App;
