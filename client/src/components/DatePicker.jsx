import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const FOCALIZABLES =
  'button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isoDe(y, mes, dia) {
  return `${y}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

function parseISODate(value) {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

function formatDisplay(value) {
  const d = parseISODate(value);
  if (!d) return '';
  return `${d.getUTCDate()} de ${MESES[d.getUTCMonth()].toLowerCase()} ${d.getUTCFullYear()}`;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = 'Selecciona una fecha',
  disableFuture = false,
  ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const [vista, setVista] = useState('cal');
  const [vistaMes, setVistaMes] = useState(() => {
    const base = parseISODate(value) || new Date();
    return { anio: base.getUTCFullYear(), mes: base.getUTCMonth() };
  });
  const panelRef = useRef(null);
  const gatilloRef = useRef(null);

  const hoy = new Date();
  const hoyISO = isoDe(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  const cerrar = () => {
    setOpen(false);
    setVista('cal');
  };

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    panel?.querySelector(FOCALIZABLES)?.focus();

    const alPresionar = (e) => {
      if (e.key === 'Escape') {
        cerrar();
        gatilloRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const focales = Array.from(panel.querySelectorAll(FOCALIZABLES));
      if (focales.length === 0) return;
      const primero = focales[0];
      const ultimo = focales[focales.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener('keydown', alPresionar);
    return () => document.removeEventListener('keydown', alPresionar);
  }, [open]);

  const celdaPrimerDia = useMemo(() => {
    const primero = new Date(Date.UTC(vistaMes.anio, vistaMes.mes, 1));
    return (primero.getUTCDay() + 6) % 7;
  }, [vistaMes]);

  const diasEnMes = new Date(Date.UTC(vistaMes.anio, vistaMes.mes + 1, 0)).getUTCDate();

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
    return (
      Date.UTC(vistaMes.anio, vistaMes.mes, dia) >
      Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
    );
  };

  const seleccionar = (dia) => {
    onChange(isoDe(vistaMes.anio, vistaMes.mes, dia));
    cerrar();
    gatilloRef.current?.focus();
  };

  const irAHoy = () => {
    setVistaMes({ anio: hoy.getFullYear(), mes: hoy.getMonth() });
  };

  const anioBaseRango = Math.floor(vistaMes.anio / 10) * 10;
  const aniosRango = Array.from({ length: 12 }, (_, i) => anioBaseRango + i);

  const cambiarDecada = (dir) => {
    setVistaMes((prev) => ({ ...prev, anio: prev.anio + dir * 10 }));
  };

  const elegirAnio = (anio) => setVistaMes((prev) => ({ ...prev, anio }));
  const elegirMes = (mes) => {
    setVistaMes((prev) => ({ ...prev, mes }));
    setVista('cal');
  };

  const navBtn = 'w-11 h-11 flex items-center justify-center rounded-lg text-tinta transition-colors hover:bg-primary-soft active:bg-primary-soft';
  const celdaBase = 'min-h-11 text-sm rounded-lg transition-colors';
  const vinculo = 'min-h-11 px-2 text-xs font-medium text-primary underline-offset-2 hover:underline';

  return (
    <div className="relative">
      <button
        ref={gatilloRef}
        type="button"
        onClick={() => {
          const base = parseISODate(value) || new Date();
          setVistaMes({ anio: base.getUTCFullYear(), mes: base.getUTCMonth() });
          setVista('cal');
          setOpen((o) => !o);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`
          w-full min-h-11 px-4 py-2.5 rounded-lg text-left flex items-center justify-between gap-2
          border transition-colors
          focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40
          ${value ? 'text-tinta border-line bg-surface' : 'text-tinta-suave border-line bg-surface'}
        `}
      >
        <span className="truncate">{value ? formatDisplay(value) : placeholder}</span>
        <Calendar aria-hidden="true" className="size-5 text-primary shrink-0" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 flex items-end sm:items-center sm:justify-center bg-tinta/40"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) cerrar();
          }}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel || 'Selector de fecha'}
            className="bg-surface w-full sm:max-w-xs rounded-t-2xl sm:rounded-2xl shadow-lg border border-line p-3 max-h-[85dvh] overflow-y-auto safe-bottom"
          >
            {vista === 'selector' ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <button
                    type="button"
                    onClick={() => cambiarDecada(-1)}
                    aria-label="Década anterior"
                    className={navBtn}
                  >
                    <ChevronLeft aria-hidden="true" className="size-5" />
                  </button>
                  <div className="text-center">
                    <p className="text-sm font-bold text-tinta">
                      {anioBaseRango} — {anioBaseRango + 11}
                    </p>
                    <button type="button" onClick={() => setVista('cal')} className={vinculo}>
                      Volver al calendario
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => cambiarDecada(1)}
                    aria-label="Década siguiente"
                    className={navBtn}
                  >
                    <ChevronRight aria-hidden="true" className="size-5" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {aniosRango.map((anio) => (
                    <button
                      key={anio}
                      type="button"
                      onClick={() => elegirAnio(anio)}
                      aria-pressed={anio === vistaMes.anio}
                      className={`${celdaBase} ${
                        anio === vistaMes.anio
                          ? 'bg-primary text-white font-semibold shadow-sm'
                          : 'text-tinta hover:bg-primary-soft active:bg-primary-soft'
                      }`}
                    >
                      {anio}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {MESES.map((nombreMes, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => elegirMes(idx)}
                      aria-pressed={idx === vistaMes.mes}
                      className={`${celdaBase} text-xs ${
                        idx === vistaMes.mes
                          ? 'bg-primary text-white font-semibold shadow-sm'
                          : 'text-tinta hover:bg-primary-soft active:bg-primary-soft'
                      }`}
                    >
                      {nombreMes.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <button
                    type="button"
                    onClick={() => cambiarMes(-1)}
                    aria-label="Mes anterior"
                    className={navBtn}
                  >
                    <ChevronLeft aria-hidden="true" className="size-5" />
                  </button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setVista('selector')}
                      aria-label="Elegir año y mes"
                      className="min-h-11 text-sm font-bold text-tinta transition-colors hover:text-primary"
                    >
                      {MESES[vistaMes.mes]} {vistaMes.anio}
                    </button>
                    <button type="button" onClick={irAHoy} className={`${vinculo} -mt-1`}>
                      Ir a hoy
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => cambiarMes(1)}
                    aria-label="Mes siguiente"
                    className={navBtn}
                  >
                    <ChevronRight aria-hidden="true" className="size-5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-1">
                  {DIAS_SEMANA.map((d) => (
                    <div key={d} className="text-center text-xs font-semibold text-tinta-suave py-1">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: celdaPrimerDia }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: diasEnMes }).map((_, i) => {
                    const dia = i + 1;
                    const iso = isoDe(vistaMes.anio, vistaMes.mes, dia);
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
                        className={`${celdaBase} ${
                          futuro
                            ? 'text-tinta-suave cursor-not-allowed'
                            : seleccionado
                            ? 'bg-primary text-white font-semibold shadow-sm'
                            : esHoy
                            ? 'bg-primary-soft text-primary font-semibold'
                            : 'text-tinta hover:bg-primary-soft active:bg-primary-soft'
                        }`}
                      >
                        {dia}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}