import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Visitas() {
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/visitas/recientes')
      .then((res) => setVisitas(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando...</div>;
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Registro de Visitas</h1>

      {visitas.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No hay visitas registradas</p>
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
                  <span className="text-xs text-gray-400">
                    {new Date(v.fecha).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    Visita {v.numero_visita} de 10
                  </span>
                  {v.recompensa && (
                    <span className="text-[10px] bg-dorado/20 text-dorado px-2 py-0.5 rounded-full font-medium">
                      🎁 Recompensa
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
