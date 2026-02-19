import { CalendarCheck2, Loader2, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { fetchAppointments, fetchInstructors, fetchStudents } from '../api';
import { useI18n } from '../i18n';
import { useToast } from '../components/ToastProvider';

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function DashboardPage({ onNavigate, user }) {
  const { t } = useI18n();
  const { pushToast } = useToast();
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const today = getTodayDateString();
        const [studentsRes, appointmentsRes, instructorsRes] = await Promise.all([
          fetchStudents(''),
          fetchAppointments(today),
          fetchInstructors(),
        ]);
        setStudents(studentsRes.data);
        setAppointments(appointmentsRes.data);
        setInstructors(instructorsRes.data);
      } catch {
        setStudents([]);
        setAppointments([]);
        setInstructors([]);
        pushToast({ type: 'error', message: t('dashboard.loadError') });
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [pushToast, t]);

  const studentMap = useMemo(() => {
    const map = new Map();
    students.forEach((student) => map.set(student.id, student));
    return map;
  }, [students]);

  const instructorMap = useMemo(() => {
    const map = new Map();
    instructors.forEach((instructor) => map.set(instructor.id, instructor));
    return map;
  }, [instructors]);

  const cards = [
    {
      label: t('dashboard.activeStudents'),
      value: String(students.length),
      icon: Users,
      onClick: () => onNavigate?.('students'),
      cta: t('dashboard.openStudents'),
    },
    {
      label: t('dashboard.sessionsToday'),
      value: String(appointments.length),
      icon: CalendarCheck2,
      onClick: () => onNavigate?.('schedule'),
      cta: t('dashboard.openSchedule'),
    },
  ];

  return (
    <section className="space-y-6 animate-fadeSlide">
      <header>
        <h1 className="text-2xl font-bold text-slateSoft dark:text-slate-100">{t('sidebar.dashboard')}</h1>
        <p className="mt-1 text-base font-medium text-sage">{t('dashboard.greeting', { name: user || '' })}</p>
        <p className="text-sm text-slate-600 dark:text-slate-300">{t('dashboard.subtitle')}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map(({ label, value, icon: Icon, onClick, cta }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className="rounded-2xl bg-white/80 p-5 text-left shadow-card backdrop-blur-sm transition hover:scale-[1.01] dark:bg-slate-900/85"
          >
            <div className="mb-4 inline-flex rounded-xl bg-sage/20 p-2 text-slateSoft dark:text-slate-100">
              <Icon size={18} />
            </div>
            <h2 className="text-sm text-slate-500 dark:text-slate-400">{label}</h2>
            <p className="mt-1 text-3xl font-bold text-slateSoft dark:text-slate-100">{value}</p>
            <p className="mt-2 text-xs font-medium text-sage">{cta}</p>
          </button>
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
                <th className="pb-3">{t('schedule.instructor')}</th>
                <th className="pb-3">{t('schedule.status')}</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 dark:text-slate-200">
              {appointments.map((item) => (
                <tr key={item.id} className="border-t border-slate-100 dark:border-slate-700">
                  <td className="py-3">
                    {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3">{studentMap.get(item.student_id)?.name || t('schedule.unknown')}</td>
                  <td className="py-3">{instructorMap.get(item.instructor_id)?.name || t('schedule.unknown')}</td>
                  <td className="py-3 capitalize">
                    {item.status === 'booked'
                      ? t('schedule.statusBooked')
                      : item.status === 'completed'
                        ? t('schedule.statusCompleted')
                        : t('schedule.statusCanceled')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading ? (
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 size={14} className="animate-spin" />
            {t('dashboard.loading')}
          </p>
        ) : null}
        {!loading && appointments.length === 0 ? <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{t('dashboard.noSessions')}</p> : null}
      </article>
    </section>
  );
}

export default DashboardPage;
