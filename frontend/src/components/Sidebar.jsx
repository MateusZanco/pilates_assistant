import { ActivitySquare, CalendarDays, ChevronLeft, ChevronRight, ClipboardList, LayoutDashboard, UserRoundCog, UsersRound, X } from 'lucide-react';
import { useI18n } from '../i18n';

const items = [
  { key: 'dashboard', labelKey: 'sidebar.dashboard', icon: LayoutDashboard },
  { key: 'students', labelKey: 'sidebar.students', icon: UsersRound },
  { key: 'instructors', labelKey: 'sidebar.instructors', icon: UserRoundCog },
  { key: 'schedule', labelKey: 'sidebar.schedule', icon: CalendarDays },
  { key: 'analysis', labelKey: 'sidebar.analysis', icon: ActivitySquare },
  { key: 'plans', labelKey: 'sidebar.plans', icon: ClipboardList },
];

function Sidebar({ activePage, onNavigate, collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { t } = useI18n();

  return (
    <>
      {mobileOpen ? <div className="fixed inset-0 z-30 bg-slate-900/45 md:hidden" onClick={onCloseMobile} /> : null}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sage/20 bg-white/90 p-4 backdrop-blur-sm transition-all dark:border-slate-700 dark:bg-slate-900/90 ${
          collapsed ? 'w-20' : 'w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
      <div className={`mb-6 flex items-start ${collapsed ? 'justify-center' : 'justify-between'} gap-2`}>
        <div className={collapsed ? 'hidden' : 'block'}>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{t('sidebar.studio')}</p>
          <h1 className="text-lg font-bold text-slateSoft dark:text-slate-100">{t('sidebar.vision')}</h1>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:inline-flex"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>
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
              <span className={collapsed ? 'hidden' : 'inline'}>{t(item.labelKey)}</span>
            </button>
          );
        })}
      </nav>
    </aside>
    </>
  );
}

export default Sidebar;
