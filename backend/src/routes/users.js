const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const asyncHandler = require('../middleware/asyncHandler');

async function rolValido(rolId) {
  if ((typeof rolId !== 'number' && !(typeof rolId === 'string' && /^\d+$/.test(rolId))) ||
      !Number.isSafeInteger(Number(rolId)) || Number(rolId) <= 0) return false;
  return (await pool.query('SELECT 1 FROM roles WHERE id = $1', [Number(rolId)])).rowCount > 0;
}

function emailValido(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function idValido(value) {
  return /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0;
}

function datosValidos({ nombre, email, password }) {
  if (nombre != null && (typeof nombre !== 'string' || !nombre.trim() || nombre.trim().length > 100))
    return 'El nombre no es válido';
  if (email != null && (!emailValido(email) || email.trim().length > 120))
    return 'El correo no es válido';
  if (password != null && (typeof password !== 'string' || !password))
    return 'La contraseña no es válida';
  return null;
}

router.get('/roles', asyncHandler(async (_req, res) => {
  res.json((await pool.query('SELECT id, nombre FROM roles ORDER BY id')).rows);
}));

router.get('/', asyncHandler(async (_req, res) => {
  res.json((await pool.query(
    `SELECT u.id, u.nombre, u.email, u.activo, u.rol_id, r.nombre AS rol
     FROM usuarios u JOIN roles r ON r.id = u.rol_id ORDER BY u.id`)).rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    ? req.body : {};
  const { nombre, email, password, rol_id } = body;
  const validationError = datosValidos(body);
  if (validationError || nombre == null || email == null || password == null)
    return res.status(400).json({ error: 'Nombre, correo válido y contraseña son obligatorios' });
  if (!(await rolValido(rol_id)))
    return res.status(400).json({ error: 'El rol es obligatorio y debe existir' });

  const hash = await bcrypt.hash(password, 10);
  try {
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol_id) VALUES ($1,$2,$3,$4)
       RETURNING id, nombre, email, rol_id, activo`,
      [nombre.trim(), email.trim(), hash, Number(rol_id)]);
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Ese correo ya existe' });
    throw error;
  }
}));

router.put('/:id', asyncHandler(async (req, res) => {
  if (!idValido(req.params.id)) return res.status(400).json({ error: 'ID de usuario inválido' });
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    ? req.body : {};
  const { nombre, email, password, rol_id, activo } = body;
  const validationError = datosValidos(body);
  if (validationError) return res.status(400).json({ error: validationError });
  if (activo != null && typeof activo !== 'boolean')
    return res.status(400).json({ error: 'El estado activo debe ser booleano' });
  if (nombre == null && email == null && password == null && rol_id == null && activo == null)
    return res.status(400).json({ error: 'Debe indicar al menos un campo para actualizar' });
  if (activo === false && Number(req.params.id) === req.user.id)
    return res.status(400).json({ error: 'No puedes darte de baja a ti mismo' });
  if (rol_id != null && !(await rolValido(rol_id)))
    return res.status(400).json({ error: 'El rol indicado no existe' });

  const hash = password ? await bcrypt.hash(password, 10) : null;
  try {
    const { rows } = await pool.query(
      `UPDATE usuarios SET nombre = COALESCE($2, nombre), email = COALESCE($3, email),
         password_hash = COALESCE($4, password_hash), rol_id = COALESCE($5, rol_id),
         activo = COALESCE($6, activo)
       WHERE id = $1 RETURNING id, nombre, email, rol_id, activo`,
      [req.params.id, nombre?.trim(), email?.trim(), hash, rol_id, activo]);
    if (!rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Ese correo ya existe' });
    throw error;
  }
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  if (!idValido(req.params.id)) return res.status(400).json({ error: 'ID de usuario inválido' });
  if (Number(req.params.id) === req.user.id)
    return res.status(400).json({ error: 'No puedes darte de baja a ti mismo' });
  const result = await pool.query(
    'UPDATE usuarios SET activo = FALSE WHERE id = $1', [req.params.id]);
  if (!result.rowCount) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.status(204).end();
}));

module.exports = router;
