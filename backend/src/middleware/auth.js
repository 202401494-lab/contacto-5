const jwt = require('jsonwebtoken');
const pool = require('../db');
const asyncHandler = require('./asyncHandler');

const verificarToken = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  let claims;
  try {
    claims = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
  if (!Number.isSafeInteger(claims.id) || claims.id <= 0)
    return res.status(401).json({ error: 'Token inválido o expirado' });

  const { rows } = await pool.query(
    `SELECT u.id, r.nombre AS rol
     FROM usuarios u JOIN roles r ON r.id = u.rol_id
     WHERE u.id = $1 AND u.activo = TRUE`,
    [claims.id]
  );
  if (!rows[0]) return res.status(401).json({ error: 'Usuario inactivo o inexistente' });

  req.user = rows[0];
  next();
});

function soloAdmin(req, res, next) {
  if (req.user.rol !== 'Administrador')
    return res.status(403).json({ error: 'Solo el Administrador puede hacer esto' });
  next();
}

module.exports = { verificarToken, soloAdmin };
