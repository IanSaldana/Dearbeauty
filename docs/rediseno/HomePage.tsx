import { QrCode, UserPlus } from "lucide-react";
import { ActionLink } from "../../components/ui/ActionLink";
import { AppHeader } from "../../components/AppHeader";
import { BottomNav } from "../../components/BottomNav";
import { RecentVisits } from "./RecentVisits";
import { StatsRow } from "./StatsRow";
import { WeekStrip } from "./WeekStrip";
import type { HomeStats, RecentVisit, WeekDay } from "./types";

type Props = {
  userName: string;
  stats: HomeStats;
  week: WeekDay[];
  recentVisits: RecentVisit[];
  onLogout: () => void;
};

// Componente de presentación: recibe los datos por props.
// La carga de datos vive en la ruta o en un hook (p. ej. TanStack Query), no aquí.
export function HomePage({ userName, stats, week, recentVisits, onLogout }: Props) {
  return (
    <div className="min-h-dvh pb-28">
      <AppHeader userName={userName} onLogout={onLogout} />

      <main className="mx-auto -mt-2 flex max-w-xl flex-col gap-4 px-5">
        <div className="grid grid-cols-2 gap-3">
          <ActionLink to="/escanear" icon={QrCode} tone="primary">Escanear QR</ActionLink>
          <ActionLink to="/clientas/nueva" icon={UserPlus} tone="secondary">Nueva clienta</ActionLink>
        </div>

        <StatsRow {...stats} />
        <WeekStrip days={week} />
        <RecentVisits visits={recentVisits} />
      </main>

      <BottomNav />
    </div>
  );
}
