import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { WeekDay } from "./types";

export function WeekStrip({ days }: { days: WeekDay[] }) {
  const todayRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    todayRef.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, []);

  return (
    <section aria-labelledby="week-title" className="rounded-card border border-line bg-surface p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 id="week-title" className="text-lg font-bold">Esta semana</h2>
        <Link to="/calendario" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary">
          Ver calendario
        </Link>
      </div>

      <ol className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {days.map((d) => (
          <li
            key={d.iso}
            ref={d.isToday ? todayRef : undefined}
            aria-current={d.isToday ? "date" : undefined}
            className={`w-22 shrink-0 snap-center rounded-card border px-2 py-3 text-center ${
              d.isToday ? "border-orquidea-300 bg-primary-soft" : "border-line bg-canvas"
            }`}
          >
            <p className="text-sm font-semibold capitalize text-tinta-suave">{d.weekday}</p>
            <p className={`text-2xl font-bold tabular-nums ${d.isToday ? "text-primary" : ""}`}>{d.day}</p>
            <p className="text-xs text-tinta-suave">
              {d.appointments === 0 ? "Libre" : `${d.appointments} ${d.appointments === 1 ? "cita" : "citas"}`}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
