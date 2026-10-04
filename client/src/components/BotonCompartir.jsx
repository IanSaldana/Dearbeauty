import { useEffect, useRef, useState } from 'react';

export default function BotonCompartir({ url }) {
  const [copiado, setCopiado] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const marcarCopiado = () => {
    setCopiado(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopiado(false), 2500);
  };

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      marcarCopiado();
    } catch {
      // Fallback para navegadores antiguos sin clipboard API
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      marcarCopiado();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dear Beauty - Mi Tarjeta de Fidelidad',
          text: '¡Mira mi tarjeta de fidelidad en Dear Beauty!',
          url,
        });
      } catch (err) {
        // El usuario canceló o falló: solo caemos al portapapeles si no fue cancel
        if (err.name !== 'AbortError') {
          copiarLink();
        }
      }
    } else {
      copiarLink();
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-live="polite"
      className="inline-flex items-center justify-center gap-1.5 min-h-11 px-4 py-2 bg-rosa/50 text-rosa-ink rounded-lg text-sm font-medium transition-colors hover:bg-rosa active:bg-rosa/70"
    >
      {copiado ? '✅ ¡Link copiado!' : '🔗 Compartir'}
    </button>
  );
}
