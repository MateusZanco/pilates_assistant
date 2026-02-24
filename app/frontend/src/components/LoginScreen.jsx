import { Globe, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../i18n';

function LoginScreen({ onLogin, theme, onToggleTheme }) {
  const [username, setUsername] = useState('');
  const { language, changeLanguage, t } = useI18n();

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      return;
    }
    onLogin(trimmed);
  };

  const greeting = username.trim() ? t('login.greeting', { name: username.trim() }) : t('login.greetingEmpty');

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4 text-gray-900 transition-colors duration-500 dark:bg-slate-900 dark:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(178,172,136,0.2),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(178,172,136,0.14),transparent_45%)] dark:bg-[radial-gradient(circle_at_15%_20%,rgba(178,172,136,0.32),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(178,172,136,0.16),transparent_45%)]" />

      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-sage/30 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.16)] transition-colors duration-500 dark:bg-slate-950/85 dark:shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2 md:right-6 md:top-6">
          <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white/90 px-2 py-1 transition-colors dark:border-slate-700 dark:bg-slate-900/90">
            <Globe size={14} className="text-gray-500 dark:text-slate-300" />
            <button
              type="button"
              onClick={() => changeLanguage('en')}
              className={`rounded px-2 py-1 text-xs font-semibold transition ${
                language === 'en' ? 'bg-sage text-white' : 'text-gray-700 dark:text-slate-200'
              }`}
            >
              EN
            </button>
            <span className="text-gray-400 dark:text-slate-500">|</span>
            <button
              type="button"
              onClick={() => changeLanguage('pt')}
              className={`rounded px-2 py-1 text-xs font-semibold transition ${
                language === 'pt' ? 'bg-sage text-white' : 'text-gray-700 dark:text-slate-200'
              }`}
            >
              PT
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            <span className="hidden sm:inline">{theme === 'dark' ? t('sidebar.lightMode') : t('sidebar.darkMode')}</span>
          </button>
        </div>

        <div className="grid min-h-[560px] md:min-h-[520px] md:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col justify-between border-b border-sage/20 bg-[linear-gradient(135deg,#f8fafc_0%,#f1f5f9_45%,#e2e8f0_100%)] p-8 transition-colors duration-500 dark:bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_45%,#0b1220_100%)] md:border-b-0 md:border-r">
            <div className="pt-10 md:pt-0">
              <h1 className="mt-3 text-4xl font-bold text-gray-900 dark:text-slate-100">Vision & Progress Pilates Studio</h1>
              <p className="mt-4 max-w-md text-sm text-gray-600 dark:text-slate-300">{t('login.subtitle')}</p>
            </div>
            <div className="rounded-2xl border border-sage/35 bg-white/80 p-5 transition-colors duration-500 dark:border-sage/25 dark:bg-slate-900/60">
              <p className="text-xs uppercase tracking-[0.18em] text-sage">{t('login.secureAccess')}</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">{t('login.secureAccessDesc')}</p>
            </div>
          </div>

          <div className="flex items-center justify-center bg-white/80 p-8 transition-colors duration-500 dark:bg-slate-900/70">
            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-slate-400">{t('login.welcome')}</p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{greeting}</h2>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">{t('login.username')}</label>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition duration-300 focus:border-sage dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
                  placeholder={t('login.usernamePlaceholder')}
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-sage px-4 py-2 text-sm font-semibold text-slate-950 transition duration-300 hover:brightness-110 disabled:opacity-60 dark:shadow-[0_0_18px_rgba(178,172,136,0.35)]"
                disabled={!username.trim()}
              >
                {t('login.enter')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LoginScreen;
