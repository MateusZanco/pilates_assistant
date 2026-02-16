import { ActivitySquare, ClipboardList, LayoutDashboard, UsersRound } from 'lucide-react';

const items = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'students', label: 'Student Management', icon: UsersRound },
  { key: 'analysis', label: 'Postural Analysis', icon: ActivitySquare },
  { key: 'plans', label: 'Training Plans', icon: ClipboardList },
];

function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 w-72 border-r border-sage/20 bg-white/90 p-6 backdrop-blur-sm">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pilates Studio</p>
        <h1 className="text-lg font-bold text-slateSoft">Vision & Progress</h1>
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
                active ? 'bg-sage text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
