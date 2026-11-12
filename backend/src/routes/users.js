const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');

// Todas estas rutas requieren verificarToken + soloAdmin (ver index.js)
router.get('/roles', async (_req, res) => {
  res.json((await pool.query('SELECT id, nombre FROM roles ORDER BY id')).rows);
});

router.get('/', async (_req, res) => {
  res.json((await pool.query(
    `SELECT u.id, u.nombre, u.email, u.activo, u.rol_id, r.nombre AS rol
     FROM usuarios u JOIN roles r ON r.id = u.rol_id ORDER BY u.id`)).rows);
});

async function rolValido(rol_id) {
  if (!rol_id) return false; // ningún usuario puede quedar sin rol
  return (await pool.query('SELECT 1 FROM roles WHERE id = $1', [rol_id])).rowCount > 0;
}

router.post('/', async (req, res) => {
  const { nombre, email, password, rol_id } = req.body;
  if (!nombre || !email || !password) return res.status(400).json({ error: 'Faltan datos' });
  if (!(await rolValido(rol_id))) return res.status(400).json({ error: 'El rol es obligatorio' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol_id) VALUES ($1,$2,$3,$4)
       RETURNING id, nombre, email, rol_id, activo`, [nombre, email, hash, rol_id]);
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Ese correo ya existe' });
    throw e;
  }
});

router.put('/:id', async (req, res) => {
  const { nombre, email, password, rol_id, activo } = req.body;
  if (!(await rolValido(rol_id))) return res.status(400).json({ error: 'El rol es obligatorio' });
  const hash = password ? await bcrypt.hash(password, 10) : null;
  const { rows } = await pool.query(
    `UPDATE usuarios SET nombre = COALESCE($2, nombre), email = COALESCE($3, email),
       password_hash = COALESCE($4, password_hash), rol_id = $5, activo = COALESCE($6, activo)
     WHERE id = $1 RETURNING id, nombre, email, rol_id, activo`,
    [req.params.id, nombre, email, hash, rol_id, activo]);
  if (!rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(rows[0]);
});

// "Dar de baja" = desactivar (no se borra, así se conserva el historial)
router.delete('/:id', async (req, res) => {
  if (Number(req.params.id) === req.user.id)
    return res.status(400).json({ error: 'No puedes darte de baja a ti mismo' });
  const r = await pool.query('UPDATE usuarios SET activo = FALSE WHERE id = $1', [req.params.id]);
  if (!r.rowCount) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.status(204).end();
});

module.exports = router;
