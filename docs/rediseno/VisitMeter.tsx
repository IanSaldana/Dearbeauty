const REWARD_VISITS = new Set([5, 7, 10]); // regalo sorpresa, 15% de descuento, servicio gratis

type Props = { count: number; total?: number };

export function VisitMeter({ count, total = 10 }: Props) {
  return (
    <div
      role="progressbar"
      aria-label="Visitas de la tarjeta"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={count}
      aria-valuetext={`${count} de ${total} visitas`}
      className="flex items-end gap-1"
    >
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const filled = n <= count;
        return (
          <span
            key={n}
            className={`flex-1 rounded-full ${REWARD_VISITS.has(n) ? "h-3" : "h-2"} ${
              filled ? "bg-orquidea-600" : "bg-orquidea-100"
            }`}
          />
        );
      })}
    </div>
  );
}
