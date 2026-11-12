require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const { verificarToken, soloAdmin } = require('./middleware/auth');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api', verificarToken);
app.use('/api/contactos', require('./routes/contacts'));
app.use('/api/usuarios', soloAdmin, require('./routes/users'));

app.use('/api', (_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed')
    return res.status(400).json({ error: 'El cuerpo JSON no es válido' });
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

async function iniciar() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL es obligatorio');
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET es obligatorio');

  await pool.query('SELECT 1');
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`API en http://localhost:${port}`));
}

iniciar().catch((err) => {
  console.error('No se pudo iniciar la API:', err.message);
  process.exit(1);
});
