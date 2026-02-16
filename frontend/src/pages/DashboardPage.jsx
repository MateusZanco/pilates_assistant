import { Activity, CalendarCheck2, ClipboardList, Users } from 'lucide-react';

const cards = [
  { label: 'Active Students', value: '42', icon: Users },
  { label: 'Pending Assessments', value: '7', icon: ClipboardList },
  { label: 'Sessions Today', value: '14', icon: CalendarCheck2 },
  { label: 'Average Postural Score', value: '81', icon: Activity },
];

const schedule = [
  { time: '08:00', student: 'Marina Alves', focus: 'Core Control' },
  { time: '09:30', student: 'Rodrigo Silva', focus: 'Spine Mobility' },
  { time: '11:00', student: 'Beatriz Rocha', focus: 'Posture Alignment' },
  { time: '15:00', student: 'Clara Nunes', focus: 'Breath & Stability' },
];

function DashboardPage() {
  return (
    <section className="space-y-6 animate-fadeSlide">
      <header>
        <h1 className="text-2xl font-bold text-slateSoft">Dashboard</h1>
        <p className="text-sm text-slate-600">Overview of Pilates Vision & Progress operations.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <article key={label} className="rounded-2xl bg-white/80 p-5 shadow-card backdrop-blur-sm">
            <div className="mb-4 inline-flex rounded-xl bg-sage/20 p-2 text-slateSoft">
              <Icon size={18} />
            </div>
            <h2 className="text-sm text-slate-500">{label}</h2>
            <p className="mt-1 text-3xl font-bold text-slateSoft">{value}</p>
          </article>
        ))}
      </div>

      <article className="rounded-2xl bg-white/80 p-5 shadow-card backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-slateSoft">Today's Schedule</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3">Time</th>
                <th className="pb-3">Student</th>
                <th className="pb-3">Focus</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {schedule.map((item) => (
                <tr key={item.time + item.student} className="border-t border-slate-100">
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
