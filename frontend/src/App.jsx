import { useMemo, useState } from 'react';

import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import PosturalAnalysisPage from './pages/PosturalAnalysisPage';
import StudentManagementPage from './pages/StudentManagementPage';
import TrainingPlansPage from './pages/TrainingPlansPage';

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const page = useMemo(() => {
    switch (activePage) {
      case 'students':
        return <StudentManagementPage />;
      case 'analysis':
        return <PosturalAnalysisPage />;
      case 'plans':
        return <TrainingPlansPage />;
      default:
        return <DashboardPage />;
    }
  }, [activePage]);

  return (
    <div className="min-h-screen text-slate-800">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="ml-0 p-4 md:ml-72 md:p-8">{page}</main>
    </div>
  );
}

export default App;
