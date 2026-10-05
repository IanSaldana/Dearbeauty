import { NavLink } from "react-router-dom";
import { CalendarDays, ClipboardList, House, Users, type LucideIcon } from "lucide-react";

const items: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/", label: "Inicio", icon: House },
  { to: "/clientas", label: "Clientas", icon: Users },
  { to: "/visitas", label: "Visitas", icon: ClipboardList },
  { to: "/calendario", label: "Calendario", icon: CalendarDays },
];

export function BottomNav() {
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto flex max-w-xl">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === "/"}
              className="group flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium text-tinta-suave aria-[current=page]:font-bold aria-[current=page]:text-primary"
            >
              <span className="grid h-8 w-14 place-items-center rounded-full transition-colors group-aria-[current=page]:bg-primary-soft">
                <Icon aria-hidden="true" className="size-5" strokeWidth={2} />
              </span>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
