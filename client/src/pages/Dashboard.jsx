import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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
  const [clientas, setClientas] = useState([]);
  const [visitasRecientes, setVisitasRecientes] = useState([]);
  const [citasSemana, setCitasSemana] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const lunes = getLunesDeSemana();
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    // Usar mes del lunes para cargar citas (puede cruzar meses, cargar ambos)
    const mes1 = `${lunes.getFullYear()}-${String(lunes.getMonth() + 1).padStart(2, '0')}`;
    const mes2 = `${domingo.getFullYear()}-${String(domingo.getMonth() + 1).padStart(2, '0')}`;
    const citasPromises = [api.get(`/citas?mes=${mes1}`)];
    if (mes2 !== mes1) citasPromises.push(api.get(`/citas?mes=${mes2}`));

    Promise.all([
      api.get('/clientas'),
      api.get('/visitas/recientes'),
      ...citasPromises,
    ])
      .then((responses) => {
        setClientas(responses[0].data);
        setVisitasRecientes(responses[1].data);
        // Merge citas de ambos meses si aplica
        let todasCitas = responses[2].data;
        if (responses[3]) todasCitas = [...todasCitas, ...responses[3].data];
        // Filtrar solo la semana actual
        const lunesTS = lunes.getTime();
        const domingoFin = new Date(domingo);
        domingoFin.setHours(23, 59, 59, 999);
        const citasFiltradas = todasCitas.filter((c) => {
          const f = new Date(c.fecha).getTime();
          return f >= lunesTS && f <= domingoFin.getTime();
        });
        setCitasSemana(citasFiltradas);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando...</div>;
  }

  // Visitas de esta semana
  const inicioSemana = new Date();
  inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
  inicioSemana.setHours(0, 0, 0, 0);
  const visitasEstaSemana = visitasRecientes.filter(
    (v) => new Date(v.fecha) >= inicioSemana
  );

  // Tarjetas por vencer (próximos 30 días)
  const tarjetasPorVencer = clientas.filter((c) => {
    const tarjeta = c.tarjetas?.[0];
    if (!tarjeta) return false;
    const vencimiento = new Date(tarjeta.fecha_vencimiento);
    const en30Dias = new Date();
    en30Dias.setDate(en30Dias.getDate() + 30);
    return vencimiento <= en30Dias && vencimiento >= new Date();
  });

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <img src="/icon-192.png" alt="" className="w-8 h-8" />
            Dear Beauty
          </h1>
          <p className="text-xs text-gray-400">Hola, {manicurista?.nombre}</p>
        </div>
        <button
          onClick={() => { logout(); window.location.href = '/login'; }}
          className="text-xs text-gray-400 hover:text-rosa-dark"
        >
          Salir
        </button>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/escanear"
          className="bg-rosa-dark text-white rounded-xl p-4 text-center font-medium hover:bg-rosa-dark/90 transition shadow-sm"
        >
          📷 Escanear QR
        </Link>
        <Link
          to="/registrar"
          className="bg-dorado text-white rounded-xl p-4 text-center font-medium hover:bg-dorado/90 transition shadow-sm"
        >
          ➕ Nueva Clienta
        </Link>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-rosa-dark">{clientas.length}</p>
          <p className="text-[10px] text-gray-500">Clientas activas</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-dorado">{visitasEstaSemana.length}</p>
          <p className="text-[10px] text-gray-500">Visitas esta semana</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-red-400">{tarjetasPorVencer.length}</p>
          <p className="text-[10px] text-gray-500">Por vencer</p>
        </div>
      </div>

      {/* Resumen semanal de citas */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">📅 Esta semana</h2>
          <Link to="/calendario" className="text-xs text-rosa-dark font-medium">
            Ver calendario →
          </Link>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {DIAS_CORTOS.map((nombre, i) => {
            const lunes = getLunesDeSemana();
            const dia = new Date(lunes);
            dia.setDate(lunes.getDate() + i);
            const diaNum = dia.getDate();
            const esHoy = new Date().toDateString() === dia.toDateString();
            // Citas de este día
            const citasDia = citasSemana.filter((c) => {
              const fc = new Date(c.fecha);
              return fc.getUTCDate() === dia.getDate() && fc.getUTCMonth() === dia.getMonth();
            });
            return (
              <div key={i} className={`text-center rounded-lg p-1.5 ${esHoy ? 'bg-rosa/40' : ''}`}>
                <p className="text-[10px] text-gray-400 font-medium">{nombre}</p>
                <p className={`text-sm font-bold ${esHoy ? 'text-rosa-dark' : 'text-gray-700'}`}>{diaNum}</p>
                {citasDia.length > 0 ? (
                  <div className="mt-1 space-y-0.5">
                    {citasDia.slice(0, 2).map((c) => (
                      <p key={c.id} className="text-[9px] text-rosa-dark truncate leading-tight">
                        {c.hora_inicio} {c.clienta?.nombre || c.titulo}
                      </p>
                    ))}
                    {citasDia.length > 2 && (
                      <p className="text-[9px] text-gray-400">+{citasDia.length - 2} más</p>
                    )}
                  </div>
                ) : (
                  <p className="text-[9px] text-gray-300 mt-1">—</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Visitas recientes (máximo 5) */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Visitas recientes</h2>
          <Link to="/visitas" className="text-xs text-rosa-dark font-medium">
            Ver todas →
          </Link>
        </div>
        {visitasRecientes.length === 0 ? (
          <p className="text-sm text-gray-400">No hay visitas aún</p>
        ) : (
          <ul className="space-y-2">
            {visitasRecientes.slice(0, 5).map((v) => (
              <li key={v.id} className="flex items-center justify-between text-sm">
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-700 truncate block">
                    {v.tarjeta?.clienta?.nombre}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400">
                    {v.numero_visita}/10
                  </span>
                  {v.recompensa && (
                    <span className="text-[10px] bg-dorado/20 text-dorado px-1.5 py-0.5 rounded-full">
                      🎁
                    </span>
                  )}
                  <span className="text-[10px] text-gray-300">
                    {new Date(v.fecha).toLocaleDateString()}
                  </span>
                </div>
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
            <Link to="/clientas" className="text-xs text-rosa-dark font-medium">
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
                    className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-rosa/20 transition"
                  >
                    <div>
                      <p className="font-medium text-gray-700">{c.nombre}</p>
                      <p className="text-[10px] text-gray-400">
                        Vence: {new Date(tarjeta.fecha_vencimiento).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs text-rosa-dark font-semibold">
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
