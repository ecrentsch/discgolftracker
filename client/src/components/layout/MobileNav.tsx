import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const tabs = [
  { to: '/dashboard', label: 'Home', icon: (active: boolean) => (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )},
  { to: '/log-round', label: 'Log', icon: (active: boolean) => (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )},
  { to: '/my-bag', label: 'Bag', icon: (active: boolean) => (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25h-4.5A2.25 2.25 0 007.5 6v2.25m9 0H7.5m9 0h.75A2.25 2.25 0 0119.5 10.5v7.5A2.25 2.25 0 0117.25 20.25H6.75A2.25 2.25 0 014.5 18V10.5A2.25 2.25 0 016.75 8.25H7.5" />
    </svg>
  )},
  { to: '/courses', label: 'Courses', icon: (active: boolean) => (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  )},
];

export function MobileNav() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 safe-area-pb">
      <div className="flex">
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors
              ${isActive ? 'text-forest-700' : 'text-stone-400'}`
            }
          >
            {({ isActive }) => (
              <>
                {tab.icon(isActive)}
                {tab.label}
              </>
            )}
          </NavLink>
        ))}
        <NavLink
          to={`/profile/${user?.username}`}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors
            ${isActive ? 'text-forest-700' : 'text-stone-400'}`
          }
        >
          {({ isActive }) => (
            <>
              <svg className="w-6 h-6" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Profile
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
