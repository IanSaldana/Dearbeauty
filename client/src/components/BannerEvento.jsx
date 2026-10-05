const bgColors = {
  cumpleanos: 'bg-durazno-50 border-durazno-100',
  recompensa: 'bg-primary-soft border-primary-soft',
  vencimiento: 'bg-danger/10 border-danger/20',
};

const textColors = {
  cumpleanos: 'text-primary',
  recompensa: 'text-primary',
  vencimiento: 'text-danger',
};

export default function BannerEvento({ evento }) {
  if (!evento) return null;

  return (
    <div className={`rounded-xl border p-4 text-center ${bgColors[evento.tipo] || 'bg-line border-line'}`}>
      <p className={`text-sm font-semibold ${textColors[evento.tipo] || 'text-tinta'}`}>
        {evento.mensaje}
      </p>
    </div>
  );
}