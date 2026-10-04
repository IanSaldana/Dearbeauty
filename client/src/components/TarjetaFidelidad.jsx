export default function TarjetaFidelidad({ visitas = 0, totalVisitas = 10 }) {
  const recompensas = {
    5: { label: 'REGALO', icon: '🎁' },
    7: { label: '15% OFF', icon: '💰' },
    10: { label: 'GRATIS', icon: '⭐' },
  };

  return (
    <div className="bg-rosa/60 rounded-2xl shadow-lg p-5 border border-rosa-dark/10">
      {/* Título */}
      <div className="text-center mb-1">
        <h3 className="text-2xl font-black text-rosa-ink tracking-wide uppercase">
          Tarjeta de Fidelidad
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          Obtén un <strong>servicio a elección GRATIS</strong> a tu 10ma visita
        </p>
      </div>

      {/* Círculos - 2 filas de 5 */}
      <div className="grid grid-cols-5 gap-3 mt-4">
        {Array.from({ length: totalVisitas }, (_, i) => {
          const numero = i + 1;
          const completada = numero <= visitas;
          const recompensa = recompensas[numero];
          const esPremio = completada && recompensa;

          const etiqueta = recompensa?.label
            ? `Visita ${numero} - ${recompensa.label}${completada ? ' logrado' : ''}`
            : `Visita ${numero}${completada ? ' completada' : ''}`;

          return (
            <div key={numero} className="flex flex-col items-center">
              <div
                role="img"
                aria-label={etiqueta}
                title={etiqueta}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  border-2 transition-colors duration-300 motion-reduce:transition-none
                  ${esPremio
                    ? 'bg-dorado border-dorado text-white'
                    : completada
                    ? 'bg-rosa-dark border-rosa-dark text-white'
                    : 'bg-white border-gray-800/70 text-gray-700'}
                `}
              >
                {esPremio ? (
                  <span className="text-lg" aria-hidden="true">{recompensa.icon}</span>
                ) : completada ? (
                  <span className="text-lg" aria-hidden="true">✓</span>
                ) : recompensa ? (
                  <span className="text-[9px] font-bold text-center leading-tight italic">
                    {recompensa.label}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pie */}
      <p className="text-center text-[9px] text-gray-500 mt-4 leading-snug">
        *Debes presentar esta tarjeta para obtener los regalos/descuentos.<br />
        Duración: 1 año desde tu primera cita.
      </p>
    </div>
  );
}
