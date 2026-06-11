const bgColors = {
  cumpleanos: 'bg-amber-50 border-amber-200',
  recompensa: 'bg-pink-50 border-pink-200',
  vencimiento: 'bg-orange-50 border-orange-200',
};

const textColors = {
  cumpleanos: 'text-amber-800',
  recompensa: 'text-pink-800',
  vencimiento: 'text-orange-800',
};

export default function BannerEvento({ evento }) {
  if (!evento) return null;

  return (
    <div className={`rounded-xl border p-4 text-center ${bgColors[evento.tipo] || 'bg-gray-50 border-gray-200'}`}>
      <p className={`text-sm font-semibold ${textColors[evento.tipo] || 'text-gray-700'}`}>
        {evento.mensaje}
      </p>
    </div>
  );
}
