import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', roles: ['admin', 'doctor', 'receptionist'] },
  { to: '/patients', label: 'Patients', roles: ['admin', 'doctor', 'receptionist'] },
  { to: '/appointments', label: 'Appointments', roles: ['admin', 'doctor', 'receptionist'] },
  { to: '/visits', label: 'Visits & EMR', roles: ['admin', 'doctor'] },
  { to: '/billing', label: 'Billing', roles: ['admin', 'receptionist'] },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const visibleItems = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-56 bg-slate-900 text-slate-200 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-slate-800">
          <p className="text-sm font-semibold text-white tracking-wide">HMS</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {user?.first_name} {user?.last_name}
          </p>
          <span className="inline-block mt-1 text-[10px] uppercase tracking-wide bg-emerald-700/30 text-emerald-400 px-1.5 py-0.5 rounded">
            {user?.role}
          </span>
        </div>
        <nav className="flex-1 py-3">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `block px-5 py-2.5 text-sm ${
                  isActive
                    ? 'bg-slate-800 text-white border-l-2 border-emerald-500'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border-l-2 border-transparent'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="px-5 py-3 text-sm text-slate-400 hover:text-white border-t border-slate-800 text-left"
        >
          Log out
        </button>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
