import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QrCode, UserPlus, Clock, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EsqueletoKPIs, EsqueletoLista, ErrorConReintento } from '../components/Estados';
import AppHeader from '../components/AppHeader';
import ActionLink from '../components/ActionLink';
import StatsRow from '../components/StatsRow';
import WeekStrip from '../components/WeekStrip';
import RecentVisits from '../components/RecentVisits';

const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function getLunesDeSemana() {
  const hoy = new Date();
  const dia = hoy.getDay(); // 0=dom, 1=lun...
  const diff = dia === 0 ? -6 : 1 - dia;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + diff);
  lunes.setHours(0, 0, 0, 0);
  return lunes;
}

function toISODate(d) {
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export default function Dashboard() {
  const { manicurista, logout } = useAuth();
  const navigate = useNavigate();
  const [clientas, setClientas] = useState([]);
  const [visitasRecientes, setVisitasRecientes] = useState([]);
  const [citasSemana, setCitasSemana] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(() => {
    const lunes = getLunesDeSemana();
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    const mes1 = `${lunes.getFullYear()}-${String(lunes.getMonth() + 1).padStart(2, '0')}`;
    const mes2 = `${domingo.getFullYear()}-${String(domingo.getMonth() + 1).padStart(2, '0')}`;
    const citasPromises = [api.get(`/citas?mes=${mes1}`)];
    if (mes2 !== mes1) citasPromises.push(api.get(`/citas?mes=${mes2}`));

    Promise.all([api.get('/clientas'), api.get('/visitas/recientes'), ...citasPromises])
      .then((responses) => {
        setClientas(responses[0].data);
        setVisitasRecientes(responses[1].data);
        let todasCitas = responses[2].data;
        if (responses[3]) todasCitas = [...todasCitas, ...responses[3].data];
        const lunesTS = lunes.getTime();
        const domingoFin = new Date(domingo);
        domingoFin.setHours(23, 59, 59, 999);
        setCitasSemana(
          todasCitas.filter((c) => {
            const f = new Date(c.fecha).getTime();
            return f >= lunesTS && f <= domingoFin.getTime();
          })
        );
      })
      .catch(() => setError('No pudimos cargar el resumen.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(cargar, [cargar]);

  const reintentar = () => {
    setLoading(true);
    setError('');
    cargar();
  };

  const cerrarSesion = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-dvh pb-28" role="status" aria-busy="true">
        <span className="sr-only">Cargando…</span>
        <div className="mx-auto flex max-w-lg flex-col gap-4 px-5 pt-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="h-14 animate-pulse rounded-tile bg-primary-soft" />
            <div className="h-14 animate-pulse rounded-tile bg-primary-soft" />
          </div>
          <EsqueletoKPIs />
          <EsqueletoLista filas={3} />
        </div>
      </div>
    );
  }

  const inicioSemana = new Date();
  inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
  inicioSemana.setHours(0, 0, 0, 0);
  const semanaLunes = getLunesDeSemana();
  const visitasEstaSemana = visitasRecientes.filter((v) => new Date(v.fecha) >= inicioSemana);

  const tarjetasPorVencer = clientas.filter((c) => {
    const tarjeta = c.tarjetas?.[0];
    if (!tarjeta) return false;
    const vencimiento = new Date(tarjeta.fecha_vencimiento);
    const en30Dias = new Date();
    en30Dias.setDate(en30Dias.getDate() + 30);
    return vencimiento <= en30Dias && vencimiento >= new Date();
  });

  const week = DIAS_CORTOS.map((nombre, i) => {
    const dia = new Date(semanaLunes);
    dia.setDate(semanaLunes.getDate() + i);
    const citas = citasSemana.filter((c) => {
      const fc = new Date(c.fecha);
      return fc.getDate() === dia.getDate() && fc.getMonth() === dia.getMonth();
    });
    return {
      iso: toISODate(dia),
      weekday: nombre.toLowerCase(),
      day: dia.getDate(),
      appointments: citas.length,
      isToday: new Date().toDateString() === dia.toDateString(),
    };
  });

  const recentVisits = visitasRecientes.slice(0, 5).map((v) => ({
    id: v.id,
    clientName: v.tarjeta?.clienta?.nombre ?? 'Clienta',
    visitCount: v.numero_visita,
    date: v.fecha,
  }));

  return (
    <div className="min-h-dvh pb-28">
      <AppHeader userName={manicurista?.nombre ?? ''} onLogout={cerrarSesion} />

      <main className="mx-auto -mt-2 flex max-w-lg flex-col gap-4 px-5">
        {error && <ErrorConReintento mensaje={error} onReintentar={reintentar} />}

        {/* Acciones rápidas: lo que la manicurista hace entre servicios */}
        <div className="grid grid-cols-2 gap-3">
          <ActionLink to="/escanear" icon={QrCode} tone="primary">
            Escanear QR
          </ActionLink>
          <ActionLink to="/registrar" icon={UserPlus} tone="secondary">
            Nueva clienta
          </ActionLink>
        </div>

        <StatsRow
          clients={clientas.length}
          weekVisits={visitasEstaSemana.length}
          expiring={tarjetasPorVencer.length}
        />
        <WeekStrip days={week} />
        <RecentVisits visits={recentVisits} />

        {/* Tarjetas por vencer (máximo 3) */}
        {tarjetasPorVencer.length > 0 && (
          <section
            aria-labelledby="expiring-title"
            className="rounded-card border border-line bg-surface p-4"
          >
            <div className="mb-1 flex items-baseline justify-between">
              <h2 id="expiring-title" className="flex items-center gap-2 text-lg font-bold">
                <Clock aria-hidden="true" className="size-5 text-danger" />
                Por vencer
              </h2>
              <Link
                to="/clientas"
                className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary"
              >
                Ver todas
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
            <ul className="divide-y divide-line">
              {tarjetasPorVencer.slice(0, 3).map((c) => {
                const tarjeta = c.tarjetas[0];
                return (
                  <li key={c.id}>
                    <Link
                      to={`/clienta/detalle/${c.id}`}
                      className="flex min-h-11 items-center justify-between gap-2 rounded-lg py-2 text-sm transition-colors active:bg-primary-soft"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{c.nombre}</p>
                        <p className="text-xs text-tinta-suave">
                          Vence:{' '}
                          {new Date(tarjeta.fecha_vencimiento).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                      <span className="shrink-0 font-semibold tabular-nums text-primary">
                        {tarjeta.visitas_completadas}/10
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
