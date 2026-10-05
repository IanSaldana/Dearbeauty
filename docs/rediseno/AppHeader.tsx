import { LogOut } from "lucide-react";
import logo from "../assets/logo.png";

type Props = { userName: string; onLogout: () => void };

export function AppHeader({ userName, onLogout }: Props) {
  return (
    <header className="bg-acuarela flex items-center gap-3 px-5 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <img src={logo} alt="" width={52} height={52} className="size-13 rounded-full" />
      <div className="min-w-0 flex-1">
        <p className="text-lg font-bold leading-tight">Dear Beauty</p>
        <p className="font-script truncate text-2xl leading-tight text-primary">Hola, {userName}</p>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-primary active:bg-white/60"
      >
        <LogOut aria-hidden="true" className="size-4" />
        Salir
      </button>
    </header>
  );
}
