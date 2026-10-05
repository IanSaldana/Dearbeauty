import { Link } from 'react-router-dom';
import VisitMeter from './VisitMeter';

const shortDate = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short' });

export default function RecentVisits({ visits }) {
  return (
    <section aria-labelledby="recent-title" className="rounded-card border border-line bg-surface p-4">
      <div className="mb-1 flex items-baseline justify-between">
        <h2 id="recent-title" className="text-lg font-bold">
          Visitas recientes
        </h2>
        <Link
          to="/visitas"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-primary"
        >
          Ver todas
        </Link>
      </div>

      {visits.length === 0 ? (
        <p className="py-6 text-center text-sm text-tinta-suave">
          Aún no hay visitas. Escanea el QR de una clienta para marcar la primera.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {visits.map((v) => (
            <li key={v.id} className="flex items-center gap-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{v.clientName}</p>
                <p className="text-sm text-tinta-suave">
                  <time dateTime={v.date}>{shortDate.format(new Date(v.date))}</time>
                  {' · '}
                  <span className="tabular-nums">{v.visitCount} de 10</span>
                </p>
              </div>
              <div className="w-28 shrink-0">
                <VisitMeter count={v.visitCount} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
