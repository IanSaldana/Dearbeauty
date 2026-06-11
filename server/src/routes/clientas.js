const express = require('express');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { calcularProximoEvento } = require('../lib/eventos');
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

    const proximo_evento = calcularProximoEvento(clienta);
    res.json({ ...clienta, proximo_evento });
  } catch (error) {
    console.error('Error obteniendo clienta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/clientas - Registrar nueva clienta
router.post('/', async (req, res) => {
  try {
    const { nombre, telefono, email, fecha_nacimiento } = req.body;

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
        fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
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

// PUT /api/clientas/:id - Editar clienta
router.put('/:id', async (req, res) => {
  try {
    const { nombre, telefono, email, fecha_nacimiento } = req.body;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const clientaExistente = await prisma.clienta.findUnique({ where: { id } });
    if (!clientaExistente) {
      return res.status(404).json({ error: 'Clienta no encontrada' });
    }

    const data = {};
    if (nombre !== undefined) data.nombre = nombre;
    if (telefono !== undefined) data.telefono = telefono;
    if (email !== undefined) data.email = email || null;
    if (fecha_nacimiento !== undefined) {
      data.fecha_nacimiento = fecha_nacimiento ? new Date(fecha_nacimiento) : null;
    }

    const clienta = await prisma.clienta.update({
      where: { id },
      data,
      include: {
        tarjetas: {
          include: { visitas: { orderBy: { numero_visita: 'asc' } } },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    res.json(clienta);
  } catch (error) {
    console.error('Error editando clienta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/clientas/:id - Eliminar clienta y datos asociados
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const clienta = await prisma.clienta.findUnique({
      where: { id },
      include: { tarjetas: { select: { id: true } } },
    });

    if (!clienta) {
      return res.status(404).json({ error: 'Clienta no encontrada' });
    }

    // Eliminar visitas de todas las tarjetas
    const tarjetaIds = clienta.tarjetas.map((t) => t.id);
    if (tarjetaIds.length > 0) {
      await prisma.visita.deleteMany({ where: { tarjeta_id: { in: tarjetaIds } } });
    }

    // Eliminar tarjetas
    await prisma.tarjeta.deleteMany({ where: { clienta_id: id } });

    // Eliminar clienta
    await prisma.clienta.delete({ where: { id } });

    res.json({ message: 'Clienta eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando clienta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
