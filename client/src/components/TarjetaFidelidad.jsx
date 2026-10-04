const recompensas = {
  5: { label: 'REGALO', icono: '🎁' },
  7: { label: '15% OFF', icono: '💰' },
  10: { label: 'GRATIS', icono: '⭐' },
};

export default function TarjetaFidelidad({ visitas = 0, totalVisitas = 10, animar = false }) {
  const selloPremio = Math.min(
    totalVisitas,
    recompensas[Object.keys(recompensas).find((n) => Number(n) > visitas)] || totalVisitas
  );

  return (
    <div className="bg-rosa/60 rounded-2xl shadow-lg p-5 border border-rosa-dark/10">
      {/* Título */}
      <div className="text-center mb-1">
        <h3 className="text-2xl font-black text-rosa-ink tracking-wide uppercase">
          Tarjeta de Fidelidad
        </h3>
        <p className="text-sm text-gray-700 mt-1">
          Obtén un <strong>servicio a elección GRATIS</strong> a tu 10ma visita
        </p>
      </div>

      {/* Sello de progreso: el número que la clienta busca de un vistazo */}
      <p className="text-center text-sm text-rosa-ink font-medium mt-3">
        {visitas} de {totalVisitas} visitas
        {visitas < totalVisitas && (
          <span className="text-gray-700 font-normal">
            {' · te falta la '}
            <span className="font-semibold">{selloPremio}</span>
          </span>
        )}
      </p>

      {/* Círculos - 2 filas de 5 */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 mt-4">
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
                className={`
                  w-14 h-14 rounded-full flex items-center justify-center
                  border-2 transition-colors duration-300 motion-reduce:transition-none
                  ${esPremio
                    ? 'bg-dorado border-dorado-ink/40'
                    : completada
                    ? 'bg-rosa-ink border-rosa-ink text-white'
                    : 'bg-white border-gray-700 text-gray-700'}
                  ${animar && completada ? 'animar-sello' : ''}
                `}
              >
                {esPremio ? (
                  <span className="text-2xl leading-none" aria-hidden="true">{recompensa.icono}</span>
                ) : completada ? (
                  <span className="text-2xl leading-none" aria-hidden="true">✓</span>
                ) : recompensa ? (
                  <span className="text-xs font-bold text-center leading-tight italic text-gray-700">
                    {recompensa.label}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pie */}
      <p className="text-center text-xs text-gray-600 mt-4 leading-snug">
        *Debes presentar esta tarjeta para obtener los regalos/descuentos.<br />
        Duración: 1 año desde tu primera cita.
      </p>
    </div>
  );
}