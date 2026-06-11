// Calcular próximo evento relevante para una clienta
function calcularProximoEvento(clienta) {
  const ahora = new Date();
  const eventos = [];

  // 1. Cumpleaños (hoy o dentro de 7 días)
  if (clienta.fecha_nacimiento) {
    const nacimiento = new Date(clienta.fecha_nacimiento);
    // Usar UTC para evitar desfase de zona horaria
    const cumpleEsteAnio = new Date(Date.UTC(ahora.getFullYear(), nacimiento.getUTCMonth(), nacimiento.getUTCDate()));
    const hoyUTC = new Date(Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()));
    if (cumpleEsteAnio < hoyUTC) {
      cumpleEsteAnio.setUTCFullYear(cumpleEsteAnio.getUTCFullYear() + 1);
    }
    const diasParaCumple = Math.ceil((cumpleEsteAnio - hoyUTC) / (1000 * 60 * 60 * 24));
    if (diasParaCumple <= 7) {
      const fechaStr = cumpleEsteAnio.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', timeZone: 'UTC' });
      eventos.push({
        tipo: 'cumpleanos',
        mensaje: diasParaCumple === 0
          ? `🎂 ¡Feliz cumpleaños, ${clienta.nombre}!`
          : `🎂 ¡Cumpleaños el ${fechaStr}! — ¡Feliz día ${clienta.nombre}!`,
        fecha: cumpleEsteAnio.toISOString(),
        prioridad: 1,
      });
    }
  }

  // 2. Próxima visita con recompensa
  const tarjetaActiva = clienta.tarjetas?.find((t) => t.activa);
  if (tarjetaActiva) {
    const visitasActuales = tarjetaActiva.visitas_completadas;
    const proximaVisita = visitasActuales + 1;

    if (proximaVisita === 5) {
      eventos.push({
        tipo: 'recompensa',
        mensaje: '🎁 ¡Tu próxima visita tienes REGALO!',
        fecha: null,
        prioridad: 2,
      });
    } else if (proximaVisita === 7) {
      eventos.push({
        tipo: 'recompensa',
        mensaje: '💰 ¡En tu próxima visita tienes 15% OFF!',
        fecha: null,
        prioridad: 2,
      });
    } else if (proximaVisita === 10) {
      eventos.push({
        tipo: 'recompensa',
        mensaje: '⭐ ¡Tu próxima visita es GRATIS!',
        fecha: null,
        prioridad: 2,
      });
    }

    // 3. Tarjeta por vencer (dentro de 30 días)
    const vencimiento = new Date(tarjetaActiva.fecha_vencimiento);
    const diasParaVencer = Math.ceil((vencimiento - ahora) / (1000 * 60 * 60 * 24));
    if (diasParaVencer > 0 && diasParaVencer <= 30) {
      const fechaStr = vencimiento.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' });
      eventos.push({
        tipo: 'vencimiento',
        mensaje: `⏰ Tu tarjeta vence el ${fechaStr}. ¡No pierdas tus visitas!`,
        fecha: vencimiento.toISOString(),
        prioridad: 3,
      });
    }
  }

  // Devolver el de mayor prioridad (menor número)
  if (eventos.length === 0) return null;
  eventos.sort((a, b) => a.prioridad - b.prioridad);
  const { prioridad, ...evento } = eventos[0];
  return evento;
}

module.exports = { calcularProximoEvento };
