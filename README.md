# Contactos – Programación Orientada a la Nube 0

Sistema web de gestión de contactos con roles (Administrador / Estándar) y autenticación JWT.
**Stack:** Node.js + Express · Next.js · PostgreSQL.

## Estructura
```
backend/    API REST (Express)
frontend/   Aplicación Next.js
database/   schema.sql (tablas y roles)
docs/       Flujo de trabajo en Git
```

## Puesta en marcha (cada integrante, en su computadora)
1. Clonar y cambiarse a `dev`:
   `git clone <url-del-repo> && cd contacto-N && git checkout dev`
2. Crear la base de datos local y las tablas:
   ```
   createdb -U postgres contactos
   psql -U postgres -d contactos -f database/schema.sql
   ```
3. Backend:
   ```
   cd backend
   cp .env.example .env      # editar DATABASE_URL, JWT_SECRET y ADMIN_PASSWORD
   npm install
   npm run seed              # crea el usuario Administrador inicial
   npm run dev               # http://localhost:4000
   ```
4. Frontend (en otra terminal):
   ```
   cd frontend
   cp .env.local.example .env.local
   npm install
   npm run dev               # http://localhost:3000
   ```

## API del backend

Todas las rutas usan el prefijo `/api`. Solo `POST /api/auth/login` es pública; el resto requiere
`Authorization: Bearer <token>`. Los endpoints `/api/usuarios` y `/api/usuarios/roles` requieren
el rol Administrador.

- `POST /api/auth/login`: iniciar sesión con `email` y `password`.
- `/api/contactos`: `GET` lista y permite buscar con `?q=` o filtrar con `?favoritos=true`;
  `POST` crea; `GET /:id`, `PUT /:id` y `DELETE /:id` consultan, modifican y eliminan.
- `PATCH /api/contactos/:id/favorito`: alterna el estado de favorito.
- `/api/usuarios`: `GET` lista; `POST` crea un usuario; `PUT /:id` actualiza sus datos, rol o
  estado; `DELETE /:id` lo da de baja sin borrar sus contactos.
- `GET /api/usuarios/roles`: consulta los roles disponibles para asignación.

La API toma la identidad del usuario autenticado, no de los datos enviados por el cliente, y filtra
los contactos por propietario. Configure `DATABASE_URL`, un `JWT_SECRET` propio y `FRONTEND_URL`
en `backend/.env` antes de iniciar.

## Reglas del equipo
- Todo el trabajo va en la rama `dev` (ver `docs/FLUJO_GIT.md`).
- Nunca subir `.env` (ya está en `.gitignore`).

## Equipo N° 5
Alejandro Nicólas Gómez
Valeria Antoinette Panameño
Michelle Abigail Guardado
