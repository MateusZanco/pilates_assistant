import { ActivitySquare, CalendarDays, ClipboardList, LayoutDashboard, Moon, Sun, UserRoundCog, UsersRound } from 'lucide-react';

const items = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'students', label: 'Student Management', icon: UsersRound },
  { key: 'instructors', label: 'Instructor Management', icon: UserRoundCog },
  { key: 'schedule', label: 'Schedule', icon: CalendarDays },
  { key: 'analysis', label: 'Postural Analysis', icon: ActivitySquare },
  { key: 'plans', label: 'Training Plans', icon: ClipboardList },
];

function Sidebar({ activePage, onNavigate, theme, onToggleTheme }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-72 flex-col border-r border-sage/20 bg-white/90 p-6 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/90">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Pilates Studio</p>
        <h1 className="text-lg font-bold text-slateSoft dark:text-slate-100">Vision & Progress</h1>
      </div>

      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                active
                  ? 'bg-sage text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={onToggleTheme}
        className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </button>
    </aside>
  );
}

export default Sidebar;
