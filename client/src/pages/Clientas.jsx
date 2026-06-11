import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Clientas() {
  const [clientas, setClientas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/clientas')
      .then((res) => setClientas(res.data))
      .finally(() => setLoading(false));
  }, []);

  const clientasFiltradas = clientas.filter((c) => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (
      c.nombre.toLowerCase().includes(q) ||
      c.telefono.includes(q)
    );
  });

  const clientasOrdenadas = [...clientasFiltradas].sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando...</div>;
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Clientas</h1>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar por nombre o teléfono..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full px-4 py-2 rounded-xl border border-rosa-dark/30 focus:outline-none focus:ring-2 focus:ring-rosa-dark/50 bg-white"
      />

      {/* Lista */}
      {clientasOrdenadas.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          {busqueda ? 'Sin resultados' : 'No hay clientas registradas'}
        </p>
      ) : (
        <ul className="space-y-2">
          {clientasOrdenadas.map((c) => {
            const visitas = c.tarjetas?.[0]?.visitas_completadas || 0;
            const progreso = (visitas / 10) * 100;
            return (
              <li key={c.id}>
                <Link
                  to={`/clienta/detalle/${c.id}`}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm hover:bg-rosa/20 transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{c.nombre}</p>
                    <p className="text-xs text-gray-400">{c.telefono}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rosa-dark rounded-full transition-all"
                        style={{ width: `${progreso}%` }}
                      />
                    </div>
                    <span className="text-xs text-rosa-dark font-semibold whitespace-nowrap">
                      {visitas}/10
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
