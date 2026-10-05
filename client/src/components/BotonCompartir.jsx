import { useEffect, useRef, useState } from 'react';
import { Share2, Check } from 'lucide-react';

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
      className="inline-flex items-center justify-center gap-1.5 min-h-11 px-4 py-2 bg-primary-soft text-primary rounded-lg text-sm font-medium transition-colors hover:bg-primary-soft active:bg-primary-soft"
    >
      {copiado ? (
        <>
          <Check aria-hidden="true" className="size-4" />
          ¡Link copiado!
        </>
      ) : (
        <>
          <Share2 aria-hidden="true" className="size-4" />
          Compartir
        </>
      )}
    </button>
  );
}