export default function TarjetaFidelidad({ visitas = 0, totalVisitas = 10 }) {
  const recompensas = {
    5: '🎁',
    7: '💰',
    10: '⭐',
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-rosa-dark/10">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Tarjeta de Fidelidad</h3>
        <p className="text-sm text-gray-500">{visitas} de {totalVisitas} visitas</p>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: totalVisitas }, (_, i) => {
          const numero = i + 1;
          const completada = numero <= visitas;
          const esRecompensa = recompensas[numero];

          return (
            <div
              key={numero}
              className={`
                relative w-12 h-12 mx-auto rounded-full flex items-center justify-center
                border-2 transition-all duration-300
                ${completada
                  ? 'bg-rosa-dark border-rosa-dark text-white scale-105'
                  : 'bg-white border-gray-200 text-gray-400'}
                ${esRecompensa && !completada ? 'border-dorado' : ''}
              `}
            >
              {completada ? (
                <span className="text-lg">✓</span>
              ) : esRecompensa ? (
                <span className="text-sm">{esRecompensa}</span>
              ) : (
                <span className="text-xs">{numero}</span>
              )}
              {esRecompensa && (
                <span className="absolute -bottom-5 text-[10px] text-dorado font-medium whitespace-nowrap">
                  {numero === 5 && 'Regalo'}
                  {numero === 7 && '15% dto'}
                  {numero === 10 && 'Gratis'}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-between text-xs text-gray-400">
        <span>Visita 5: Regalo</span>
        <span>Visita 7: 15% dto</span>
        <span>Visita 10: Gratis</span>
      </div>
    </div>
  );
}
