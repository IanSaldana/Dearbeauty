const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const router = express.Router();

// POST /api/auth/register - Registrar manicurista (solo para setup inicial)
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const existing = await prisma.manicurista.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const manicurista = await prisma.manicurista.create({
      data: { nombre, email, password_hash: passwordHash },
    });

    const token = jwt.sign(
      { id: manicurista.id, email: manicurista.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      manicurista: { id: manicurista.id, nombre: manicurista.nombre, email: manicurista.email },
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const manicurista = await prisma.manicurista.findUnique({ where: { email } });
    if (!manicurista) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, manicurista.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: manicurista.id, email: manicurista.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      manicurista: { id: manicurista.id, nombre: manicurista.nombre, email: manicurista.email },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/auth/me - Verificar token
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const manicurista = await prisma.manicurista.findUnique({
      where: { id: decoded.id },
      select: { id: true, nombre: true, email: true },
    });

    if (!manicurista) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    res.json({ manicurista });
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router;
