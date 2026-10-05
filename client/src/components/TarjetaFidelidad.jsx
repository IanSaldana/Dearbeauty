import { Gift, BadgePercent, Star, Check } from 'lucide-react';

const recompensas = {
  5: { label: 'REGALO', icon: Gift },
  7: { label: '15% OFF', icon: BadgePercent },
  10: { label: 'GRATIS', icon: Star },
};

export default function TarjetaFidelidad({ visitas = 0, totalVisitas = 10, animar = false }) {
  const selloPremio = Math.min(
    totalVisitas,
    recompensas[Object.keys(recompensas).find((n) => Number(n) > visitas)] || totalVisitas
  );

  return (
    <div className="bg-primary-soft rounded-2xl shadow-lg p-5 border border-line">
      <div className="text-center mb-1">
        <h3 className="text-2xl font-black text-primary tracking-wide uppercase">
          Tarjeta de Fidelidad
        </h3>
        <p className="text-sm text-tinta-suave mt-1">
          Obtén un <strong>servicio a elección GRATIS</strong> a tu 10ma visita
        </p>
      </div>

      <p className="text-center text-sm text-primary font-medium mt-3">
        {visitas} de {totalVisitas} visitas
        {visitas < totalVisitas && (
          <span className="text-tinta-suave font-normal">
            {' · te falta la '}
            <span className="font-semibold">{selloPremio}</span>
          </span>
        )}
      </p>

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
                    ? 'bg-durazno-100 border-durazno-200'
                    : completada
                    ? 'bg-primary border-primary text-white'
                    : 'bg-surface border-line text-tinta-suave'}
                  ${animar && completada ? 'animar-sello' : ''}
                `}
              >
                {esPremio ? (
                  <recompensa.icon aria-hidden="true" className="size-6 text-primary" />
                ) : completada ? (
                  <Check aria-hidden="true" className="size-6" />
                ) : recompensa ? (
                  <span className="text-xs font-bold text-center leading-tight italic text-tinta-suave">
                    {recompensa.label}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-tinta-suave mt-4 leading-snug">
        *Debes presentar esta tarjeta para obtener los regalos/descuentos.<br />
        Duración: 1 año desde tu primera cita.
      </p>
    </div>
  );
}