import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { EsqueletoLista, Vacio, ErrorConReintento } from '../components/Estados';

const POR_PAGINA = 25;

export default function Clientas() {
  const [clientas, setClientas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(() => {
    api
      .get('/clientas')
      .then((res) => setClientas(res.data))
      .catch(() => setError('No pudimos cargar las clientas.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(cargar, [cargar]);

  /* Al cambiar el filtro la lista se acorta: volver a la página 1 desde el
     handler evita el setState en efecto. */
  const buscar = (valor) => {
    setBusqueda(valor);
    setPagina(1);
  };

  const reintentar = () => {
    setLoading(true);
    setError('');
    cargar();
  };

  /* El filtrado ocurre sobre un inputmemoizado: sin debounce cada tecla
     reordenaba el array completo. */
  const clientasOrdenadas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const filtradas = q
      ? clientas.filter(
          (c) => c.nombre.toLowerCase().includes(q) || (c.telefono || '').includes(q)
        )
      : clientas;
    return [...filtradas].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [clientas, busqueda]);

  const visibles = clientasOrdenadas.slice(0, pagina * POR_PAGINA);
  const hayMas = visibles.length < clientasOrdenadas.length;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-4 safe-top safe-bottom">
      <h1 className="text-xl font-bold text-gray-800">Clientas</h1>

      {/* Buscador */}
      <input
        type="search"
        placeholder="Buscar por nombre o teléfono..."
        aria-label="Buscar clienta por nombre o teléfono"
        value={busqueda}
        onChange={(e) => buscar(e.target.value)}
        enterKeyHint="search"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
        className="w-full min-h-11 px-4 py-2 rounded-xl border border-rosa-dark/30 bg-white focus:outline-none focus:ring-2 focus:ring-rosa-ink/50"
      />

      {loading ? (
        <EsqueletoLista filas={6} />
      ) : error ? (
        <ErrorConReintento mensaje={error} onReintentar={reintentar} />
      ) : clientasOrdenadas.length === 0 ? (
        <Vacio
          titulo={busqueda ? 'Sin resultados' : 'No hay clientas registradas'}
          detalle={
            busqueda
              ? `Ninguna clienta coincide con "${busqueda.trim()}".`
              : 'Registra la primera para empezar a acumular visitas.'
          }
        />
      ) : (
        <>
          <ul className="space-y-2">
            {visibles.map((c) => {
              const visitas = c.tarjetas?.[0]?.visitas_completadas || 0;
              const progreso = (visitas / 10) * 100;
              return (
                <li key={c.id}>
                  <Link
                    to={`/clienta/detalle/${c.id}`}
                    className="flex items-center gap-3 min-h-11 p-3 bg-white rounded-xl shadow-sm transition-colors hover:bg-rosa/20 active:bg-rosa/30"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{c.nombre}</p>
                      <p className="text-sm text-gray-600">{c.telefono}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rosa-ink rounded-full transition-all motion-reduce:transition-none"
                          style={{ width: `${progreso}%` }}
                        />
                      </div>
                      <span className="text-sm text-rosa-ink font-semibold whitespace-nowrap tabular-nums">
                        {visitas}/10
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="text-center text-xs text-gray-600 tabular-nums" aria-live="polite">
            Mostrando {visibles.length} de {clientasOrdenadas.length}
          </p>

          {hayMas && (
            <button
              type="button"
              onClick={() => setPagina((p) => p + 1)}
              className="w-full min-h-11 bg-white border border-rosa-dark/30 text-rosa-ink font-medium rounded-xl transition-colors hover:bg-rosa/20 active:bg-rosa/30"
            >
              Ver más clientas
            </button>
          )}
        </>
      )}
    </div>
  );
}