import { Globe, Menu, Moon, Sun } from 'lucide-react';
import { useI18n } from '../i18n';

function TopHeader({ theme, onToggleTheme, onMenuClick, onLogout, user }) {
  const { language, changeLanguage, t } = useI18n();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/90">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 md:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <div className="ml-auto flex items-center gap-2">
          <p className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:block">
            {t('dashboard.greeting', { name: user || '' })}
          </p>

          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800">
            <Globe size={14} className="text-slate-500 dark:text-slate-300" />
            <button
              type="button"
              onClick={() => changeLanguage('en')}
              className={`rounded px-2 py-1 text-xs font-semibold transition ${
                language === 'en' ? 'bg-sage text-white' : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              EN
            </button>
            <span className="text-slate-400">|</span>
            <button
              type="button"
              onClick={() => changeLanguage('pt')}
              className={`rounded px-2 py-1 text-xs font-semibold transition ${
                language === 'pt' ? 'bg-sage text-white' : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              PT
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            <span className="hidden sm:inline">{theme === 'dark' ? t('sidebar.lightMode') : t('sidebar.darkMode')}</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-900/80 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-900/40"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopHeader;
