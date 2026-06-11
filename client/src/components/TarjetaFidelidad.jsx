export default function TarjetaFidelidad({ visitas = 0, totalVisitas = 10 }) {
  const recompensas = {
    5: 'REGALO',
    7: '15% OFF',
    10: 'gratis',
  };

  return (
    <div className="bg-rosa/60 rounded-2xl shadow-lg p-5 border border-rosa-dark/10">
      {/* Título */}
      <div className="text-center mb-1">
        <h3 className="text-2xl font-black text-rosa-dark/30 tracking-wide uppercase">
          Tarjeta de Fidelidad
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          Obtiene un <strong>servicio a elección GRATIS</strong> a tu 10ma visita
        </p>
      </div>

      {/* Círculos - 2 filas de 5 */}
      <div className="grid grid-cols-5 gap-3 mt-4">
        {Array.from({ length: totalVisitas }, (_, i) => {
          const numero = i + 1;
          const completada = numero <= visitas;
          const recompensa = recompensas[numero];

          return (
            <div key={numero} className="flex flex-col items-center">
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  border-2 transition-all duration-300
                  ${completada
                    ? 'bg-rosa-dark border-rosa-dark text-white'
                    : 'bg-white border-gray-800/70 text-gray-700'}
                `}
              >
                {completada ? (
                  <span className="text-lg">✓</span>
                ) : recompensa ? (
                  <span className="text-[9px] font-bold text-center leading-tight italic">
                    {recompensa}
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
