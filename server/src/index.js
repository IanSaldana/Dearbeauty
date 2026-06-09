require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./lib/prisma');

const authRoutes = require('./routes/auth');
const clientasRoutes = require('./routes/clientas');
const visitasRoutes = require('./routes/visitas');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clientas', clientasRoutes);
app.use('/api/visitas', visitasRoutes);

// Ruta pública - vista de la clienta (sin auth)
app.get('/api/public/clienta/:qrCode', async (req, res) => {
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
      return res.status(404).json({ error: 'Tarjeta no encontrada' });
    }

    // No exponer datos sensibles
    res.json({
      nombre: clienta.nombre,
      qr_code: clienta.qr_code,
      tarjetas: clienta.tarjetas,
    });
  } catch (error) {
    console.error('Error en vista pública:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = { app, prisma };
