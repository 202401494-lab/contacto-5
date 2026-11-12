require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

(async () => {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim();
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD)
    throw new Error('ADMIN_EMAIL y ADMIN_PASSWORD son obligatorios');

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const rol = await pool.query("SELECT id FROM roles WHERE nombre = 'Administrador'");
  if (!rol.rows[0]) throw new Error('No existe el rol Administrador; ejecuta database/schema.sql');
  await pool.query(
    `INSERT INTO usuarios (nombre, email, password_hash, rol_id)
     VALUES ('Administrador', $1, $2, $3) ON CONFLICT (email) DO NOTHING`,
    [ADMIN_EMAIL, hash, rol.rows[0].id]
  );
  console.log('Administrador listo:', ADMIN_EMAIL);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
