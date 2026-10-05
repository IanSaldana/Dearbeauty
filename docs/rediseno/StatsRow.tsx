import type { HomeStats } from "./types";

export function StatsRow({ clients, weekVisits, expiring }: HomeStats) {
  const items = [
    { label: "Clientas", value: clients, alert: false },
    { label: "Visitas esta semana", value: weekVisits, alert: false },
    { label: "Tarjetas por vencer", value: expiring, alert: expiring > 0 },
  ];

  return (
    <dl className="grid grid-cols-3 gap-3">
      {items.map(({ label, value, alert }) => (
        <div
          key={label}
          className={`flex flex-col-reverse justify-end rounded-card border bg-surface p-3 ${
            alert ? "border-danger/40" : "border-line"
          }`}
        >
          <dt className="text-xs leading-snug text-tinta-suave">{label}</dt>
          <dd className={`text-3xl font-bold tabular-nums ${alert ? "text-danger" : "text-primary"}`}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
