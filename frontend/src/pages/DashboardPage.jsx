import { Activity, CalendarCheck2, ClipboardList, Users } from 'lucide-react';
import { useI18n } from '../i18n';

function DashboardPage() {
  const { t } = useI18n();
  const cards = [
    { label: t('dashboard.activeStudents'), value: '42', icon: Users },
    { label: t('dashboard.pendingAssessments'), value: '7', icon: ClipboardList },
    { label: t('dashboard.sessionsToday'), value: '14', icon: CalendarCheck2 },
    { label: t('dashboard.avgScore'), value: '81', icon: Activity },
  ];
  const schedule = [
    { time: '08:00', student: 'Marina Alves', focus: t('dashboard.focusCore') },
    { time: '09:30', student: 'Rodrigo Silva', focus: t('dashboard.focusSpine') },
    { time: '11:00', student: 'Beatriz Rocha', focus: t('dashboard.focusPosture') },
    { time: '15:00', student: 'Clara Nunes', focus: t('dashboard.focusBreath') },
  ];

  return (
    <section className="space-y-6 animate-fadeSlide">
      <header>
        <h1 className="text-2xl font-bold text-slateSoft dark:text-slate-100">{t('sidebar.dashboard')}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">{t('dashboard.subtitle')}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <article key={label} className="rounded-2xl bg-white/80 p-5 shadow-card backdrop-blur-sm dark:bg-slate-900/85">
            <div className="mb-4 inline-flex rounded-xl bg-sage/20 p-2 text-slateSoft dark:text-slate-100">
              <Icon size={18} />
            </div>
            <h2 className="text-sm text-slate-500 dark:text-slate-400">{label}</h2>
            <p className="mt-1 text-3xl font-bold text-slateSoft dark:text-slate-100">{value}</p>
          </article>
        ))}
      </div>

      <article className="rounded-2xl bg-white/80 p-5 shadow-card backdrop-blur-sm dark:bg-slate-900/85">
        <h2 className="text-lg font-semibold text-slateSoft dark:text-slate-100">{t('dashboard.todaySchedule')}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-slate-500 dark:text-slate-400">
              <tr>
                <th className="pb-3">{t('dashboard.time')}</th>
                <th className="pb-3">{t('dashboard.student')}</th>
                <th className="pb-3">{t('dashboard.focus')}</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 dark:text-slate-200">
              {schedule.map((item) => (
                <tr key={item.time + item.student} className="border-t border-slate-100 dark:border-slate-700">
                  <td className="py-3">{item.time}</td>
                  <td className="py-3">{item.student}</td>
                  <td className="py-3">{item.focus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

export default DashboardPage;
