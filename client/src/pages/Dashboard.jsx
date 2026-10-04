import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EsqueletoKPIs, EsqueletoLista, ErrorConReintento } from '../components/Estados';

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
      <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-5" role="status" aria-busy="true">
        <span className="sr-only">Cargando…</span>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-rosa/40 rounded-xl h-20 animate-pulse" />
          <div className="bg-rosa/40 rounded-xl h-20 animate-pulse" />
        </div>
        <EsqueletoKPIs />
        <EsqueletoLista filas={3} />
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

  const diasSemana = DIAS_CORTOS.map((nombre, i) => {
    const dia = new Date(semanaLunes);
    dia.setDate(semanaLunes.getDate() + i);
    return {
      nombre,
      dia,
      esHoy: new Date().toDateString() === dia.toDateString(),
      citas: citasSemana.filter((c) => {
        const fc = new Date(c.fecha);
        return fc.getDate() === dia.getDate() && fc.getMonth() === dia.getMonth();
      }),
    };
  });

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-5 safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <img src="/icon-192.png" alt="" width="32" height="32" className="w-8 h-8 shrink-0" />
            Dear Beauty
          </h1>
          <p className="text-sm text-gray-600 truncate">Hola, {manicurista?.nombre}</p>
        </div>
        <button
          type="button"
          onClick={cerrarSesion}
          className="shrink-0 min-h-11 px-3 text-sm text-rosa-ink font-medium rounded-lg transition-colors hover:bg-rosa/20 active:bg-rosa/30"
        >
          Salir
        </button>
      </div>

      {error && <ErrorConReintento mensaje={error} onReintentar={reintentar} />}

      {/* Acciones rápidas: lo que la manicurista hace entre servicios */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/escanear"
          className="min-h-14 flex items-center justify-center gap-2 bg-rosa-ink text-white rounded-xl text-center font-medium transition-colors hover:bg-rosa-ink/90 active:bg-rosa-ink/95 shadow-sm"
        >
          📷 Escanear QR
        </Link>
        <Link
          to="/registrar"
          className="min-h-14 flex items-center justify-center gap-2 bg-dorado-ink text-white rounded-xl text-center font-medium transition-colors hover:bg-dorado-ink/90 active:bg-dorado-ink/95 shadow-sm"
        >
          ➕ Nueva Clienta
        </Link>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-rosa-ink tabular-nums">{clientas.length}</p>
          <p className="text-xs text-gray-600 leading-tight">Clientas</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-dorado-ink tabular-nums">{visitasEstaSemana.length}</p>
          <p className="text-xs text-gray-600 leading-tight">Visitas semana</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-red-700 tabular-nums">{tarjetasPorVencer.length}</p>
          <p className="text-xs text-gray-600 leading-tight">Por vencer</p>
        </div>
      </div>

      {/* Agenda de la semana: carrusel con snap, no una grilla de 7 columnas
          imposible de leer en un teléfono angosto */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Esta semana</h2>
          <Link
            to="/calendario"
            className="min-h-11 flex items-center text-sm text-rosa-ink font-medium"
          >
            Ver calendario →
          </Link>
        </div>
        <div className="scroll-snap-x-mandatory -mx-4 px-4 flex gap-2 overflow-x-auto overscroll-x-contain">
          {diasSemana.map(({ nombre, dia, esHoy, citas }) => (
            <div
              key={nombre}
              className={`scroll-snap-inicio shrink-0 w-32 rounded-xl p-2 text-center border ${
                esHoy ? 'bg-rosa/50 border-rosa-ink/30' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <p className="text-xs font-medium text-gray-600">{nombre}</p>
              <p className={`text-lg font-bold tabular-nums ${esHoy ? 'text-rosa-ink' : 'text-gray-800'}`}>
                {dia.getDate()}
              </p>
              {citas.length > 0 ? (
                <ul className="mt-1 space-y-1">
                  {citas.slice(0, 2).map((c) => (
                    <li key={c.id} className="text-xs text-rosa-ink bg-white/70 rounded px-1 py-0.5 truncate">
                      {c.hora_inicio} {c.clienta?.nombre || c.titulo}
                    </li>
                  ))}
                  {citas.length > 2 && (
                    <li className="text-xs text-gray-600">+{citas.length - 2} más</li>
                  )}
                </ul>
              ) : (
                <p className="text-xs text-gray-500 mt-2">Sin citas</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Visitas recientes (máximo 5) */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Visitas recientes</h2>
          <Link to="/visitas" className="min-h-11 flex items-center text-sm text-rosa-ink font-medium">
            Ver todas →
          </Link>
        </div>
        {visitasRecientes.length === 0 ? (
          <p className="text-sm text-gray-600">No hay visitas aún</p>
        ) : (
          <ul className="space-y-2">
            {visitasRecientes.slice(0, 5).map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="font-medium text-gray-800 truncate">{v.tarjeta?.clienta?.nombre}</span>
                <span className="flex items-center gap-2 shrink-0">
                  {v.recompensa && (
                    <span
                      className="bg-dorado/20 px-1.5 py-0.5 rounded-full text-xs"
                      title={v.recompensa}
                      aria-label={`Recompensa: ${v.recompensa}`}
                    >
                      🎁
                    </span>
                  )}
                  <span className="text-rosa-ink font-semibold tabular-nums">{v.numero_visita}/10</span>
                  <span className="text-gray-600 tabular-nums">
                    {new Date(v.fecha).toLocaleDateString('es-CL')}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tarjetas por vencer (máximo 3) */}
      {tarjetasPorVencer.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">⏰ Por vencer</h2>
            <Link to="/clientas" className="min-h-11 flex items-center text-sm text-rosa-ink font-medium">
              Ver todas →
            </Link>
          </div>
          <ul className="space-y-2">
            {tarjetasPorVencer.slice(0, 3).map((c) => {
              const tarjeta = c.tarjetas[0];
              return (
                <li key={c.id}>
                  <Link
                    to={`/clienta/detalle/${c.id}`}
                    className="flex items-center justify-between gap-2 text-sm p-2 min-h-11 rounded-lg transition-colors hover:bg-rosa/20 active:bg-rosa/30"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 truncate">{c.nombre}</p>
                      <p className="text-xs text-gray-600">
                        Vence: {new Date(tarjeta.fecha_vencimiento).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                    <span className="text-rosa-ink font-semibold tabular-nums shrink-0">
                      {tarjeta.visitas_completadas}/10
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}