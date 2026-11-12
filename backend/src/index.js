require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { verificarToken, soloAdmin } = require('./middleware/auth');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));                                   // pública
app.use('/api/contactos', verificarToken, require('./routes/contacts'));          // protegida
app.use('/api/usuarios', verificarToken, soloAdmin, require('./routes/users'));   // solo admin

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(process.env.PORT || 4000, () =>
  console.log(`API en http://localhost:${process.env.PORT || 4000}`));
