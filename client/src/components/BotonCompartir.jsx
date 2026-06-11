import { useState } from 'react';

export default function BotonCompartir({ url }) {
  const [copiado, setCopiado] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dear Beauty - Mi Tarjeta de Fidelidad',
          text: '¡Mira mi tarjeta de fidelidad en Dear Beauty!',
          url,
        });
      } catch (err) {
        // User cancelled or error — fallback to copy
        if (err.name !== 'AbortError') {
          copiarLink();
        }
      }
    } else {
      copiarLink();
    }
  };

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 px-4 py-2 bg-rosa-dark/10 text-rosa-dark rounded-lg text-sm font-medium hover:bg-rosa-dark/20 transition"
    >
      {copiado ? '✅ ¡Link copiado!' : '🔗 Compartir'}
    </button>
  );
}
