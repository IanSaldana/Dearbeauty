import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { manicurista, logout } = useAuth();
  const [clientas, setClientas] = useState([]);
  const [visitasRecientes, setVisitasRecientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/clientas'),
      api.get('/visitas/recientes'),
    ])
      .then(([clientasRes, visitasRes]) => {
        setClientas(clientasRes.data);
        setVisitasRecientes(visitasRes.data);
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
          <h1 className="text-lg font-bold text-gray-800">💅 Dear Beauty</h1>
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
