import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', icon: '🏠', label: 'Inicio' },
  { to: '/clientas', icon: '👩', label: 'Clientas' },
  { to: '/visitas', icon: '📋', label: 'Visitas' },
  { to: '/calendario', icon: '📅', label: 'Calendario' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-rosa-dark/20 z-50 safe-bottom">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-rosa-dark font-semibold'
                  : 'text-gray-400 hover:text-rosa-dark/70'
              }`
            }
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span className="text-[10px] mt-1">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
