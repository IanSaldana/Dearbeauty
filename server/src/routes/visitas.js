const express = require('express');
const prisma = require('../lib/prisma');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Rate limiting para marcar visitas (max 10 por minuto)
const visitaLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Demasiadas solicitudes. Intenta de nuevo en un momento.' },
});

// Determinar recompensa según número de visita
function getRecompensa(numeroVisita) {
  switch (numeroVisita) {
    case 5:
      return 'REGALO - Producto o servicio sorpresa';
    case 7:
      return '15% de descuento en el servicio';
    case 10:
      return 'Servicio a elección GRATIS';
    default:
      return null;
  }
}

// POST /api/visitas/marcar - Marcar visita de una clienta
router.post('/marcar', authMiddleware, visitaLimiter, async (req, res) => {
  try {
    const { qrCode, notas } = req.body;

    if (!qrCode) {
      return res.status(400).json({ error: 'Código QR requerido' });
    }

    // Buscar clienta por QR
    const clienta = await prisma.clienta.findUnique({
      where: { qr_code: qrCode },
      include: {
        tarjetas: {
          where: { activa: true },
          include: { visitas: true },
        },
      },
    });

    if (!clienta) {
      return res.status(404).json({ error: 'Clienta no encontrada' });
    }

    let tarjeta = clienta.tarjetas[0];

    // Si no tiene tarjeta activa, crear una nueva
    if (!tarjeta) {
      const fechaVencimiento = new Date();
      fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);

      tarjeta = await prisma.tarjeta.create({
        data: {
          clienta_id: clienta.id,
          fecha_vencimiento: fechaVencimiento,
        },
        include: { visitas: true },
      });
    }

    // Verificar si la tarjeta está vencida
    if (new Date() > new Date(tarjeta.fecha_vencimiento)) {
      // Desactivar tarjeta vencida y crear nueva
      await prisma.tarjeta.update({
        where: { id: tarjeta.id },
        data: { activa: false },
      });

      const fechaVencimiento = new Date();
      fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);

      tarjeta = await prisma.tarjeta.create({
        data: {
          clienta_id: clienta.id,
          fecha_vencimiento: fechaVencimiento,
        },
        include: { visitas: true },
      });
    }

    const numeroVisita = tarjeta.visitas_completadas + 1;
    const recompensa = getRecompensa(numeroVisita);

    // Crear la visita
    const visita = await prisma.visita.create({
      data: {
        tarjeta_id: tarjeta.id,
        numero_visita: numeroVisita,
        recompensa,
        notas: notas || null,
      },
    });

    // Actualizar tarjeta
    const tarjetaActualizada = await prisma.tarjeta.update({
      where: { id: tarjeta.id },
      data: { visitas_completadas: numeroVisita },
    });

    // Si completó las 10 visitas, cerrar tarjeta y abrir nueva
    let nuevaTarjeta = null;
    if (numeroVisita === 10) {
      await prisma.tarjeta.update({
        where: { id: tarjeta.id },
        data: { activa: false },
      });

      const fechaVencimiento = new Date();
      fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);

      nuevaTarjeta = await prisma.tarjeta.create({
        data: {
          clienta_id: clienta.id,
          fecha_vencimiento: fechaVencimiento,
        },
      });
    }

    res.json({
      visita,
      tarjeta: tarjetaActualizada,
      nuevaTarjeta,
      recompensa,
      clienta: { id: clienta.id, nombre: clienta.nombre },
      mensaje: recompensa
        ? `¡Visita ${numeroVisita} registrada! 🎉 ${recompensa}`
        : `Visita ${numeroVisita} de 10 registrada correctamente`,
    });
  } catch (error) {
    console.error('Error marcando visita:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/visitas/recientes - Últimas visitas registradas
router.get('/recientes', authMiddleware, async (req, res) => {
  try {
    const visitas = await prisma.visita.findMany({
      take: 20,
      orderBy: { fecha: 'desc' },
      include: {
        tarjeta: {
          include: {
            clienta: { select: { id: true, nombre: true } },
          },
        },
      },
    });
    res.json(visitas);
  } catch (error) {
    console.error('Error obteniendo visitas recientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
