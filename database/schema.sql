-- Ejecutar una sola vez:  psql -U postgres -d contactos -f database/schema.sql
CREATE TABLE IF NOT EXISTS roles (
  id     SERIAL PRIMARY KEY,
  nombre VARCHAR(30) UNIQUE NOT NULL
);

INSERT INTO roles (nombre) VALUES ('Administrador'), ('Estándar')
ON CONFLICT (nombre) DO NOTHING;

CREATE TABLE IF NOT EXISTS usuarios (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  email         VARCHAR(120) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rol_id        INTEGER NOT NULL REFERENCES roles(id),
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contactos (
  id                SERIAL PRIMARY KEY,
  usuario_id        INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nombres           VARCHAR(100) NOT NULL,
  apellidos         VARCHAR(100) NOT NULL,
  celular           VARCHAR(30),
  telefono_fijo     VARCHAR(30),
  correo            VARCHAR(120),
  direccion_casa    TEXT,
  direccion_trabajo TEXT,
  genero            VARCHAR(15) CHECK (genero IN ('Masculino','Femenino','Otro')),
  fecha_nacimiento  DATE,
  relacion          VARCHAR(15) CHECK (relacion IN ('Familia','Amigo','Trabajo','Otro')),
  favorito          BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contactos_usuario ON contactos(usuario_id);
