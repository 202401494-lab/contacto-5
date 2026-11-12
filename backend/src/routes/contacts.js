const router = require('express').Router();
const pool = require('../db');
const asyncHandler = require('../middleware/asyncHandler');

const CAMPOS = ['nombres', 'apellidos', 'celular', 'telefono_fijo', 'correo',
  'direccion_casa', 'direccion_trabajo', 'genero', 'fecha_nacimiento', 'relacion'];
const GENEROS = ['Masculino', 'Femenino', 'Otro'];
const RELACIONES = ['Familia', 'Amigo', 'Trabajo', 'Otro'];

function fechaValida(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const MAX_LARGO = {
  nombres: 100,
  apellidos: 100,
  celular: 30,
  telefono_fijo: 30,
  correo: 120,
  genero: 15,
  relacion: 15
};

function validar(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    return 'El cuerpo de la solicitud no es válido';
  if (typeof body.nombres !== 'string' || typeof body.apellidos !== 'string' ||
      !body.nombres.trim() || !body.apellidos.trim())
    return 'Nombres y apellidos son obligatorios';
  for (const campo of CAMPOS) {
    if (body[campo] != null && typeof body[campo] !== 'string')
      return `El campo ${campo} debe ser texto`;
    if (MAX_LARGO[campo] && body[campo]?.length > MAX_LARGO[campo])
      return `El campo ${campo} supera el máximo de ${MAX_LARGO[campo]} caracteres`;
  }
  if (body.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.correo))
    return 'Correo inválido';
  if (body.genero && !GENEROS.includes(body.genero)) return 'Género inválido';
  if (body.relacion && !RELACIONES.includes(body.relacion)) return 'Relación inválida';
  if (body.fecha_nacimiento && !fechaValida(body.fecha_nacimiento)) return 'Fecha inválida';
  return null;
}

function idValido(value) {
  return /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0;
}

const limpio = (body) => CAMPOS.map((campo) =>
  body[campo] === '' ? null : body[campo] ?? null);

router.get('/', asyncHandler(async (req, res) => {
  const { q, favoritos } = req.query;
  if (q != null && typeof q !== 'string')
    return res.status(400).json({ error: 'El parámetro q debe ser texto' });
  if (favoritos != null && favoritos !== 'true' && favoritos !== 'false')
    return res.status(400).json({ error: 'El parámetro favoritos debe ser true o false' });

  const params = [req.user.id];
  let sql = 'SELECT * FROM contactos WHERE usuario_id = $1';
  if (q) {
    params.push(`%${q}%`);
    sql += ` AND (nombres ILIKE $2 OR apellidos ILIKE $2 OR correo ILIKE $2
              OR celular ILIKE $2 OR telefono_fijo ILIKE $2)`;
  }
  if (favoritos === 'true') sql += ' AND favorito = TRUE';
  sql += ' ORDER BY favorito DESC, nombres, apellidos';
  res.json((await pool.query(sql, params)).rows);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  if (!idValido(req.params.id)) return res.status(400).json({ error: 'ID de contacto inválido' });
  const { rows } = await pool.query(
    'SELECT * FROM contactos WHERE id = $1 AND usuario_id = $2', [req.params.id, req.user.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Contacto no encontrado' });
  res.json(rows[0]);
}));

router.post('/', asyncHandler(async (req, res) => {
  const error = validar(req.body);
  if (error) return res.status(400).json({ error });
  const { rows } = await pool.query(
    `INSERT INTO contactos (usuario_id, ${CAMPOS.join(',')})
     VALUES ($1, ${CAMPOS.map((_, index) => '$' + (index + 2)).join(',')}) RETURNING *`,
    [req.user.id, ...limpio(req.body)]);
  res.status(201).json(rows[0]);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  if (!idValido(req.params.id)) return res.status(400).json({ error: 'ID de contacto inválido' });
  const error = validar(req.body);
  if (error) return res.status(400).json({ error });
  const sets = CAMPOS.map((campo, index) => `${campo} = $${index + 3}`).join(', ');
  const { rows } = await pool.query(
    `UPDATE contactos SET ${sets} WHERE id = $1 AND usuario_id = $2 RETURNING *`,
    [req.params.id, req.user.id, ...limpio(req.body)]);
  if (!rows[0]) return res.status(404).json({ error: 'Contacto no encontrado' });
  res.json(rows[0]);
}));

router.patch('/:id/favorito', asyncHandler(async (req, res) => {
  if (!idValido(req.params.id)) return res.status(400).json({ error: 'ID de contacto inválido' });
  const { rows } = await pool.query(
    'UPDATE contactos SET favorito = NOT favorito WHERE id = $1 AND usuario_id = $2 RETURNING *',
    [req.params.id, req.user.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Contacto no encontrado' });
  res.json(rows[0]);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  if (!idValido(req.params.id)) return res.status(400).json({ error: 'ID de contacto inválido' });
  const result = await pool.query(
    'DELETE FROM contactos WHERE id = $1 AND usuario_id = $2', [req.params.id, req.user.id]);
  if (!result.rowCount) return res.status(404).json({ error: 'Contacto no encontrado' });
  res.status(204).end();
}));

module.exports = router;
