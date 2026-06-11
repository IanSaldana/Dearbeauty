import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const FILTROS = [
  { key: '', label: 'Todas' },
  { key: 'hoy', label: 'Hoy' },
  { key: 'semana', label: 'Esta semana' },
  { key: 'mes', label: 'Este mes' },
];

export default function Visitas() {
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limite: '50' });
    if (periodo) params.set('periodo', periodo);

    api.get(`/visitas/recientes?${params}`)
      .then((res) => setVisitas(res.data))
      .finally(() => setLoading(false));
  }, [periodo]);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Registro de Visitas</h1>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTROS.map((f) => (
          <button
            key={f.key}
            onClick={() => setPeriodo(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              periodo === f.key
                ? 'bg-rosa-dark text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-rosa-dark/50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center h-32">Cargando...</div>
      ) : visitas.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          No hay visitas {periodo ? 'en este periodo' : 'registradas'}
        </p>
      ) : (
        <ul className="space-y-2">
          {visitas.map((v) => (
            <li key={v.id}>
              <Link
                to={`/clienta/detalle/${v.tarjeta?.clienta?.id}`}
                className="block p-3 bg-white rounded-xl shadow-sm hover:bg-rosa/20 transition"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-800">
                    {v.tarjeta?.clienta?.nombre || 'Clienta'}
                  </p>
                  <span className="text-[10px] text-gray-400">
                    {new Date(v.fecha).toLocaleDateString()} · {new Date(v.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    Visita {v.numero_visita} de 10
                  </span>
                  {v.recompensa && (
                    <span className="text-[10px] bg-dorado/20 text-dorado px-2 py-0.5 rounded-full font-medium">
                      🎁 {v.recompensa.split(' - ')[0]}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
