const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });

  const { rows } = await pool.query(
    `SELECT u.id, u.nombre, u.password_hash, u.activo, r.nombre AS rol
     FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE u.email = $1`, [email]);
  const u = rows[0];
  if (!u || !u.activo || !(await bcrypt.compare(password, u.password_hash)))
    return res.status(401).json({ error: 'Credenciales incorrectas' });

  const token = jwt.sign({ id: u.id, rol: u.rol }, process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
  res.json({ token, usuario: { id: u.id, nombre: u.nombre, rol: u.rol } });
});

module.exports = router;
