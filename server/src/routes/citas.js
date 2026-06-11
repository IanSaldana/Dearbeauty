const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// GET /api/citas?mes=2026-06 o ?fecha=2026-06-15
router.get('/', async (req, res) => {
  try {
    const { mes, fecha } = req.query;
    let where = {};

    if (fecha) {
      // Citas de un día específico
      const inicio = new Date(fecha + 'T00:00:00.000Z');
      const fin = new Date(fecha + 'T23:59:59.999Z');
      where.fecha = { gte: inicio, lte: fin };
    } else if (mes) {
      // Citas del mes (formato: 2026-06)
      const [anio, mesNum] = mes.split('-').map(Number);
      const inicio = new Date(Date.UTC(anio, mesNum - 1, 1));
      const fin = new Date(Date.UTC(anio, mesNum, 0, 23, 59, 59, 999));
      where.fecha = { gte: inicio, lte: fin };
    }

    const citas = await prisma.cita.findMany({
      where,
      orderBy: [{ fecha: 'asc' }, { hora_inicio: 'asc' }],
      include: {
        clienta: { select: { id: true, nombre: true } },
      },
    });

    res.json(citas);
  } catch (error) {
    console.error('Error listando citas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/citas - Crear cita
router.post('/', async (req, res) => {
  try {
    const { clienta_id, titulo, fecha, hora_inicio, hora_fin, notas } = req.body;

    if (!titulo || !fecha || !hora_inicio) {
      return res.status(400).json({ error: 'Título, fecha y hora de inicio son requeridos' });
    }

    const cita = await prisma.cita.create({
      data: {
        clienta_id: clienta_id || null,
        titulo,
        fecha: new Date(fecha + 'T00:00:00.000Z'),
        hora_inicio,
        hora_fin: hora_fin || null,
        notas: notas || null,
      },
      include: {
        clienta: { select: { id: true, nombre: true } },
      },
    });

    res.status(201).json(cita);
  } catch (error) {
    console.error('Error creando cita:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/citas/:id - Editar cita
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const { clienta_id, titulo, fecha, hora_inicio, hora_fin, notas } = req.body;

    const citaExistente = await prisma.cita.findUnique({ where: { id } });
    if (!citaExistente) return res.status(404).json({ error: 'Cita no encontrada' });

    const data = {};
    if (titulo !== undefined) data.titulo = titulo;
    if (fecha !== undefined) data.fecha = new Date(fecha + 'T00:00:00.000Z');
    if (hora_inicio !== undefined) data.hora_inicio = hora_inicio;
    if (hora_fin !== undefined) data.hora_fin = hora_fin || null;
    if (notas !== undefined) data.notas = notas || null;
    if (clienta_id !== undefined) data.clienta_id = clienta_id || null;

    const cita = await prisma.cita.update({
      where: { id },
      data,
      include: {
        clienta: { select: { id: true, nombre: true } },
      },
    });

    res.json(cita);
  } catch (error) {
    console.error('Error editando cita:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/citas/:id - Eliminar cita
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const cita = await prisma.cita.findUnique({ where: { id } });
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });

    await prisma.cita.delete({ where: { id } });
    res.json({ message: 'Cita eliminada' });
  } catch (error) {
    console.error('Error eliminando cita:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
