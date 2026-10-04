import { useEffect, useRef } from 'react';

/**
 * En iOS el teclado virtual tapa el botón de guardado y los popovers.
 * Cuando el navegador encoge el viewport por el teclado, sube el elemento
 * enfocado para que quede por encima de él.
 */
export default function useTecladoVirtual() {
  const baseRef = useRef(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const alCambiar = () => {
      const ocultoPorTeclado = window.innerHeight - viewport.height - viewport.offsetTop;
      document.documentElement.style.setProperty(
        '--teclado-inset',
        `${Math.max(0, Math.round(ocultoPorTeclado))}px`
      );

      const activo = document.activeElement;
      if (ocultoPorTeclado <= 40 || !(activo instanceof HTMLElement)) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activo.tagName)) {
        activo.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    };

    viewport.addEventListener('resize', alCambiar);
    viewport.addEventListener('scroll', alCambiar);
    alCambiar();

    return () => {
      viewport.removeEventListener('resize', alCambiar);
      viewport.removeEventListener('scroll', alCambiar);
      document.documentElement.style.removeProperty('--teclado-inset');
    };
  }, []);

  return baseRef;
}