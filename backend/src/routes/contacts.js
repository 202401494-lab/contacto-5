const router = require('express').Router();
const pool = require('../db');

// PRIVACIDAD: todas las consultas filtran por req.user.id (viene del JWT), nunca del body.
const CAMPOS = ['nombres','apellidos','celular','telefono_fijo','correo','direccion_casa',
  'direccion_trabajo','genero','fecha_nacimiento','relacion'];
const GENEROS = ['Masculino','Femenino','Otro'];
const RELACIONES = ['Familia','Amigo','Trabajo','Otro'];

function validar(b) {
  if (!b.nombres?.trim() || !b.apellidos?.trim()) return 'Nombres y apellidos son obligatorios';
  if (b.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.correo)) return 'Correo inválido';
  if (b.genero && !GENEROS.includes(b.genero)) return 'Género inválido';
  if (b.relacion && !RELACIONES.includes(b.relacion)) return 'Relación inválida';
  if (b.fecha_nacimiento && isNaN(Date.parse(b.fecha_nacimiento))) return 'Fecha inválida';
  return null;
}
const limpio = (b) => CAMPOS.map((c) => (b[c] === '' ? null : b[c] ?? null));

router.get('/', async (req, res) => {
  const { q, favoritos } = req.query;
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
});

router.get('/:id', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM contactos WHERE id = $1 AND usuario_id = $2', [req.params.id, req.user.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Contacto no encontrado' });
  res.json(rows[0]);
});

router.post('/', async (req, res) => {
  const err = validar(req.body);
  if (err) return res.status(400).json({ error: err });
  const { rows } = await pool.query(
    `INSERT INTO contactos (usuario_id, ${CAMPOS.join(',')})
     VALUES ($1, ${CAMPOS.map((_, i) => '$' + (i + 2)).join(',')}) RETURNING *`,
    [req.user.id, ...limpio(req.body)]);
  res.status(201).json(rows[0]);
});

router.put('/:id', async (req, res) => {
  const err = validar(req.body);
  if (err) return res.status(400).json({ error: err });
  const sets = CAMPOS.map((c, i) => `${c} = $${i + 3}`).join(', ');
  const { rows } = await pool.query(
    `UPDATE contactos SET ${sets} WHERE id = $1 AND usuario_id = $2 RETURNING *`,
    [req.params.id, req.user.id, ...limpio(req.body)]);
  if (!rows[0]) return res.status(404).json({ error: 'Contacto no encontrado' });
  res.json(rows[0]);
});

router.patch('/:id/favorito', async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE contactos SET favorito = NOT favorito WHERE id = $1 AND usuario_id = $2 RETURNING *`,
    [req.params.id, req.user.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Contacto no encontrado' });
  res.json(rows[0]);
});

router.delete('/:id', async (req, res) => {
  const r = await pool.query('DELETE FROM contactos WHERE id = $1 AND usuario_id = $2',
    [req.params.id, req.user.id]);
  if (!r.rowCount) return res.status(404).json({ error: 'Contacto no encontrado' });
  res.status(204).end();
});

module.exports = router;
