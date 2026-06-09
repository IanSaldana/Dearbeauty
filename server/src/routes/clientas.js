const express = require('express');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/clientas - Listar todas las clientas
router.get('/', async (req, res) => {
  try {
    const clientas = await prisma.clienta.findMany({
      include: {
        tarjetas: {
          where: { activa: true },
          select: { id: true, visitas_completadas: true, fecha_vencimiento: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
    res.json(clientas);
  } catch (error) {
    console.error('Error listando clientas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/clientas/buscar?q=texto - Buscar clienta por nombre o teléfono
router.get('/buscar', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Ingresa al menos 2 caracteres' });
    }

    const clientas = await prisma.clienta.findMany({
      where: {
        OR: [
          { nombre: { contains: q.trim(), mode: 'insensitive' } },
          { telefono: { contains: q.trim() } },
        ],
      },
      include: {
        tarjetas: {
          where: { activa: true },
          include: { visitas: { orderBy: { numero_visita: 'asc' } } },
        },
      },
      take: 10,
    });

    res.json(clientas);
  } catch (error) {
    console.error('Error buscando clienta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/clientas/qr/:qrCode - Buscar clienta por QR
router.get('/qr/:qrCode', async (req, res) => {
  try {
    const clienta = await prisma.clienta.findUnique({
      where: { qr_code: req.params.qrCode },
      include: {
        tarjetas: {
          where: { activa: true },
          include: { visitas: { orderBy: { numero_visita: 'asc' } } },
        },
      },
    });

    if (!clienta) {
      return res.status(404).json({ error: 'Clienta no encontrada' });
    }

    res.json(clienta);
  } catch (error) {
    console.error('Error buscando por QR:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/clientas/:id - Detalle de una clienta
router.get('/:id', async (req, res) => {
  try {
    const clienta = await prisma.clienta.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        tarjetas: {
          include: { visitas: { orderBy: { numero_visita: 'asc' } } },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!clienta) {
      return res.status(404).json({ error: 'Clienta no encontrada' });
    }

    res.json(clienta);
  } catch (error) {
    console.error('Error obteniendo clienta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/clientas - Registrar nueva clienta
router.post('/', async (req, res) => {
  try {
    const { nombre, telefono, email } = req.body;

    if (!nombre || !telefono) {
      return res.status(400).json({ error: 'Nombre y teléfono son requeridos' });
    }

    const fechaVencimiento = new Date();
    fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);

    const clienta = await prisma.clienta.create({
      data: {
        nombre,
        telefono,
        email: email || null,
        tarjetas: {
          create: {
            fecha_vencimiento: fechaVencimiento,
          },
        },
      },
      include: { tarjetas: true },
    });

    res.status(201).json(clienta);
  } catch (error) {
    console.error('Error registrando clienta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
