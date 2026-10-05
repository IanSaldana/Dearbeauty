import { useEffect, useRef } from 'react';

const FOCALIZABLES =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({ titulo, onCerrar, children, pie }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const previo = document.activeElement;
    const panel = panelRef.current;
    const focoInicial = panel?.querySelector(FOCALIZABLES);
    focoInicial?.focus();

    const alPresionar = (e) => {
      if (e.key === 'Escape') {
        onCerrar();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;

      const focales = Array.from(panel.querySelectorAll(FOCALIZABLES)).filter(
        (el) => el.offsetParent !== null
      );
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
    const scrollPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', alPresionar);
      document.body.style.overflow = scrollPrevio;
      previo?.focus?.();
    };
  }, [onCerrar]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-tinta/40 px-0 sm:px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="bg-surface w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-lg flex flex-col max-h-[90dvh] safe-bottom"
      >
        {titulo && (
          <h2 className="text-lg font-semibold text-tinta px-4 pt-4 pb-3 border-b border-line shrink-0">
            {titulo}
          </h2>
        )}
        <div className="p-4 overflow-y-auto grow">{children}</div>
        {pie && <div className="p-4 border-t border-line shrink-0">{pie}</div>}
      </div>
    </div>
  );
}