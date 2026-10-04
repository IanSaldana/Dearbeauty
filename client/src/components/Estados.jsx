/** Los skeletons respetan la carga real: si tarda, el usuario ve la forma. */

function Barra({ className = '' }) {
  return <div className={`bg-rosa/50 rounded animate-pulse ${className}`} />;
}

export function EsqueletoLista({ filas = 4 }) {
  return (
    <div className="space-y-2" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando…</span>
      {Array.from({ length: filas }, (_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-3">
          <Barra className="w-11 h-11 rounded-full shrink-0" />
          <div className="grow space-y-2">
            <Barra className="h-3.5 w-2/3" />
            <Barra className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EsqueletoTarjeta() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4" role="status" aria-busy="true">
      <span className="sr-only">Cargando…</span>
      <Barra className="h-5 w-1/2 mx-auto" />
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 10 }, (_, i) => (
          <Barra key={i} className="w-14 h-14 rounded-full mx-auto" />
        ))}
      </div>
      <Barra className="h-3 w-2/3 mx-auto" />
    </div>
  );
}

export function EsqueletoKPIs() {
  return (
    <div className="grid grid-cols-3 gap-3" role="status" aria-busy="true">
      <span className="sr-only">Cargando…</span>
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm p-3 space-y-2">
          <Barra className="h-6 w-1/2" />
          <Barra className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function Vacio({ titulo, detalle, accion }) {
  return (
    <div className="text-center py-10 px-4 space-y-2">
      <p className="text-base text-gray-700">{titulo}</p>
      {detalle && <p className="text-sm text-gray-500">{detalle}</p>}
      {accion}
    </div>
  );
}

export function ErrorConReintento({ mensaje = 'No pudimos cargar la información.', onReintentar }) {
  return (
    <div role="alert" className="bg-red-50 text-red-800 text-sm p-4 rounded-xl space-y-3 text-center">
      <p className="font-medium">{mensaje}</p>
      {onReintentar && (
        <button
          type="button"
          onClick={onReintentar}
          className="inline-flex items-center justify-center min-h-11 px-5 rounded-lg bg-white border border-red-200 text-red-800 font-medium transition-colors active:bg-red-100"
        >
          Intentar de nuevo
        </button>
      )}
    </div>
  );
}