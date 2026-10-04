import { useEffect, useMemo, useRef, useState } from 'react';

const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseISODate(value) {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatDisplay(value) {
  const d = parseISODate(value);
  if (!d) return '';
  return d.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function DatePicker({
  value,
  onChange,
  placeholder = 'Selecciona una fecha',
  disableFuture = false,
  ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const [vista, setVista] = useState('cal'); // 'cal' (días) | 'selector' (año/mes)
  const [vistaMes, setVistaMes] = useState(() => {
    const base = parseISODate(value) || new Date();
    return { anio: base.getFullYear(), mes: base.getMonth() };
  });
  const containerRef = useRef(null);

  const hoy = new Date();
  const hoyISO = toISODate(hoy);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setVista('cal');
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setVista('cal');
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const celdaPrimerDia = useMemo(() => {
    const primero = new Date(vistaMes.anio, vistaMes.mes, 1);
    return (primero.getDay() + 6) % 7;
  }, [vistaMes]);

  const diasEnMes = new Date(vistaMes.anio, vistaMes.mes + 1, 0).getDate();

  const cambiarMes = (dir) => {
    setVistaMes((prev) => {
      let m = prev.mes + dir;
      let a = prev.anio;
      if (m < 0) { m = 11; a--; }
      if (m > 11) { m = 0; a++; }
      return { anio: a, mes: m };
    });
  };

  const esFuturo = (dia) => {
    if (!disableFuture) return false;
    const fecha = new Date(vistaMes.anio, vistaMes.mes, dia);
    return fecha > hoy;
  };

  const seleccionar = (dia) => {
    onChange(toISODate(new Date(vistaMes.anio, vistaMes.mes, dia)));
    setOpen(false);
  };

  const irAHoy = () => {
    const d = new Date();
    setVistaMes({ anio: d.getFullYear(), mes: d.getMonth() });
  };

  // Bloque de años visible en el selector (12 años alineados por década)
  const anioBaseRango = Math.floor(vistaMes.anio / 10) * 10;
  const aniosRango = Array.from({ length: 12 }, (_, i) => anioBaseRango + i);

  const cambiarDecada = (dir) => {
    setVistaMes((prev) => ({ ...prev, anio: prev.anio + dir * 10 }));
  };

  const elegirAnio = (anio) => {
    setVistaMes((prev) => ({ ...prev, anio }));
  };

  const elegirMes = (mes) => {
    setVistaMes((prev) => ({ ...prev, mes }));
    setVista('cal');
  };

  const abrirSelector = () => setVista('selector');

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          const base = parseISODate(value) || new Date();
          setVistaMes({ anio: base.getFullYear(), mes: base.getMonth() });
          setVista('cal');
          setOpen((o) => !o);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-invalid={false}
        className={`
          w-full px-4 py-2.5 rounded-lg text-left flex items-center justify-between gap-2
          border border-gray-200 bg-white transition
          focus:outline-none focus:ring-2 focus:ring-rosa-ink/40 focus:border-rosa-ink/40
          ${value ? 'text-gray-800' : 'text-gray-400'}
        `}
      >
        <span className="truncate">{value ? formatDisplay(value) : placeholder}</span>
        <span className="text-rosa-ink shrink-0" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={ariaLabel || 'Selector de fecha'}
          className="absolute left-0 right-0 z-30 mt-2 bg-white rounded-2xl shadow-xl border border-rosa-dark/20 p-3 w-full max-w-xs"
        >
          {/* Selector de año y mes */}
          {vista === 'selector' ? (
            <div>
              {/* Cabecera con navegación por décadas */}
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => cambiarDecada(-1)}
                  aria-label="Década anterior"
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-rosa/40 hover:text-rosa-ink transition"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-800">
                    {anioBaseRango} — {anioBaseRango + 11}
                  </p>
                  <button
                    type="button"
                    onClick={() => setVista('cal')}
                    className="text-[10px] font-medium text-rosa-ink underline-offset-2 hover:underline mt-0.5"
                  >
                    ← Volver al calendario
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => cambiarDecada(1)}
                  aria-label="Década siguiente"
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-rosa/40 hover:text-rosa-ink transition"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                </button>
              </div>

              {/* Años */}
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {aniosRango.map((anio) => {
                  const esAnioActivo = anio === vistaMes.anio;
                  return (
                    <button
                      key={anio}
                      type="button"
                      onClick={() => elegirAnio(anio)}
                      aria-pressed={esAnioActivo}
                      className={`h-9 text-sm rounded-lg transition-colors ${
                        esAnioActivo
                          ? 'bg-rosa-ink text-white font-semibold shadow-sm'
                          : 'text-gray-700 hover:bg-rosa/40'
                      }`}
                    >
                      {anio}
                    </button>
                  );
                })}
              </div>

              {/* Meses */}
              <div className="grid grid-cols-4 gap-1.5">
                {MESES.map((nombreMes, idx) => {
                  const esMesActivo = idx === vistaMes.mes;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => elegirMes(idx)}
                      className={`h-9 text-xs rounded-lg transition-colors ${
                        esMesActivo
                          ? 'bg-rosa-ink text-white font-semibold shadow-sm'
                          : 'text-gray-700 hover:bg-rosa/40'
                      }`}
                    >
                      {nombreMes.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
          <>
          {/* Cabecera de mes */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => cambiarMes(-1)}
              aria-label="Mes anterior"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-rosa/40 hover:text-rosa-ink transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={abrirSelector}
                aria-label="Elegir año y mes"
                className="text-sm font-bold text-gray-800 hover:text-rosa-ink transition"
              >
                {MESES[vistaMes.mes]} {vistaMes.anio}
              </button>
              <br />
              <button
                type="button"
                onClick={irAHoy}
                className="text-[10px] font-medium text-rosa-ink underline-offset-2 hover:underline mt-0.5"
              >
                Ir a hoy
              </button>
            </div>
            <button
              type="button"
              onClick={() => cambiarMes(1)}
              aria-label="Mes siguiente"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-rosa/40 hover:text-rosa-ink transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DIAS_SEMANA.map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-gray-500 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: celdaPrimerDia }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: diasEnMes }).map((_, i) => {
              const dia = i + 1;
              const iso = toISODate(new Date(vistaMes.anio, vistaMes.mes, dia));
              const seleccionado = iso === value;
              const esHoy = iso === hoyISO;
              const futuro = esFuturo(dia);
              return (
                <button
                  key={dia}
                  type="button"
                  disabled={futuro}
                  onClick={() => seleccionar(dia)}
                  aria-label={`${dia} de ${MESES[vistaMes.mes]}`}
                  aria-pressed={seleccionado}
                  className={`
                    h-9 text-sm rounded-lg transition-colors
                    ${futuro
                      ? 'text-gray-300 cursor-not-allowed'
                      : seleccionado
                      ? 'bg-rosa-ink text-white font-semibold shadow-sm'
                      : esHoy
                      ? 'bg-rosa/60 text-rosa-ink font-semibold'
                      : 'text-gray-700 hover:bg-rosa/40'}
                  `}
                >
                  {dia}
                </button>
              );
            })}
          </div>
          </>
          )}
        </div>
      )}
    </div>
  );
}
