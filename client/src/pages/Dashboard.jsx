import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
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

  const tarjetasPorVencer = clientas.filter((c) => {
    const tarjeta = c.tarjetas?.[0];
    if (!tarjeta) return false;
    const vencimiento = new Date(tarjeta.fecha_vencimiento);
    const enUnMes = new Date();
    enUnMes.setMonth(enUnMes.getMonth() + 1);
    return vencimiento <= enUnMes;
  });

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Acciones rápidas */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/escanear"
          className="bg-rosa-dark text-white rounded-xl p-4 text-center font-medium hover:bg-rosa-dark/90 transition"
        >
          📷 Escanear QR
        </Link>
        <Link
          to="/registrar"
          className="bg-dorado text-white rounded-xl p-4 text-center font-medium hover:bg-dorado/90 transition"
        >
          ➕ Nueva Clienta
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-rosa-dark">{clientas.length}</p>
          <p className="text-xs text-gray-500">Clientas</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-dorado">{visitasRecientes.length}</p>
          <p className="text-xs text-gray-500">Visitas recientes</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-red-400">{tarjetasPorVencer.length}</p>
          <p className="text-xs text-gray-500">Por vencer</p>
        </div>
      </div>

      {/* Visitas recientes */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="font-semibold text-gray-800 mb-3">Visitas recientes</h2>
        {visitasRecientes.length === 0 ? (
          <p className="text-sm text-gray-400">No hay visitas aún</p>
        ) : (
          <ul className="space-y-2">
            {visitasRecientes.slice(0, 5).map((v) => (
              <li key={v.id} className="flex items-center justify-between text-sm">
                <span className="font-medium">{v.tarjeta?.clienta?.nombre}</span>
                <span className="text-gray-400">
                  Visita {v.numero_visita} · {new Date(v.fecha).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Lista de clientas */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="font-semibold text-gray-800 mb-3">Clientas</h2>
        {clientas.length === 0 ? (
          <p className="text-sm text-gray-400">No hay clientas registradas</p>
        ) : (
          <ul className="space-y-2">
            {clientas.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/clienta/detalle/${c.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-rosa/20 transition"
                >
                  <div>
                    <p className="font-medium text-gray-800">{c.nombre}</p>
                    <p className="text-xs text-gray-400">{c.telefono}</p>
                  </div>
                  <span className="text-sm text-rosa-dark font-medium">
                    {c.tarjetas?.[0]?.visitas_completadas || 0}/10
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
