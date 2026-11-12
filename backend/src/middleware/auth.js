const jwt = require('jsonwebtoken');

// Protege la ruta: exige un JWT válido en  Authorization: Bearer <token>
function verificarToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, rol }
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

function soloAdmin(req, res, next) {
  if (req.user.rol !== 'Administrador')
    return res.status(403).json({ error: 'Solo el Administrador puede hacer esto' });
  next();
}

module.exports = { verificarToken, soloAdmin };
