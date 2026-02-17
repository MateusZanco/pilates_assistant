import { Globe, Menu, Moon, Sun } from 'lucide-react';
import { useI18n } from '../i18n';

function TopHeader({ theme, onToggleTheme, onMenuClick }) {
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
        </div>
      </div>
    </header>
  );
}

export default TopHeader;
