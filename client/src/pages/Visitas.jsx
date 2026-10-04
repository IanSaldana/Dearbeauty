import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { EsqueletoLista, Vacio, ErrorConReintento } from '../components/Estados';

const FILTROS = [
  { key: '', label: 'Todas' },
  { key: 'hoy', label: 'Hoy' },
  { key: 'semana', label: 'Esta semana' },
  { key: 'mes', label: 'Este mes' },
];

const LIMITE = '50';

export default function Visitas() {
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [periodo, setPeriodo] = useState('');

  const cargar = useCallback(() => {
    const params = new URLSearchParams({ limite: LIMITE });
    if (periodo) params.set('periodo', periodo);

    api
      .get(`/visitas/recientes?${params}`)
      .then((res) => setVisitas(res.data))
      .catch(() => setError('No pudimos cargar el registro de visitas.'))
      .finally(() => setLoading(false));
  }, [periodo]);

  useEffect(cargar, [cargar]);

  const cambiarFiltro = (key) => {
    setLoading(true);
    setError('');
    setPeriodo(key);
  };

  const reintentar = () => {
    setLoading(true);
    setError('');
    cargar();
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-4 safe-top safe-bottom">
      <h1 className="text-xl font-bold text-gray-800">Registro de Visitas</h1>

      {/* Filtros: carrusel con snap, el pulgar no tiene precisión de mouse */}
      <div
        role="group"
        aria-label="Filtrar visitas por periodo"
        className="scroll-snap-x-mandatory flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 overscroll-x-contain"
      >
        {FILTROS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => cambiarFiltro(f.key)}
            aria-pressed={periodo === f.key}
            className={`scroll-snap-inicio min-h-11 shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              periodo === f.key
                ? 'bg-rosa-ink text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:border-rosa-ink/50 active:bg-rosa/20'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <EsqueletoLista filas={5} />
      ) : error ? (
        <ErrorConReintento mensaje={error} onReintentar={reintentar} />
      ) : visitas.length === 0 ? (
        <Vacio
          titulo={`No hay visitas ${periodo ? 'en este periodo' : 'registradas'}`}
          detalle="Cuando escanees el QR de una clienta, sus visitas aparecerán aquí."
        />
      ) : (
        <>
          <ul className="space-y-2">
            {visitas.map((v) => (
              <li key={v.id}>
                <Link
                  to={`/clienta/detalle/${v.tarjeta?.clienta?.id}`}
                  className="block min-h-11 p-3 bg-white rounded-xl shadow-sm transition-colors hover:bg-rosa/20 active:bg-rosa/30"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-gray-800 truncate">
                      {v.tarjeta?.clienta?.nombre || 'Clienta'}
                    </p>
                    <span className="text-xs text-gray-600 whitespace-nowrap tabular-nums">
                      {new Date(v.fecha).toLocaleDateString('es-CL')} ·{' '}
                      {new Date(v.fecha).toLocaleTimeString('es-CL', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="text-sm text-gray-600">Visita {v.numero_visita} de 10</span>
                    {v.recompensa && (
                      <span className="text-xs bg-dorado/20 text-dorado-ink px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                        🎁 {v.recompensa.split(' - ')[0]}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {visitas.length >= Number(LIMITE) && (
            <p className="text-center text-xs text-gray-600">
              Mostrando las {LIMITE} visitas más recientes
            </p>
          )}
        </>
      )}
    </div>
  );
}