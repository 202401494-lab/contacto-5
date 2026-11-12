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
   cp .env.example .env      # editar DATABASE_URL y JWT_SECRET
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

## Reglas del equipo
- Todo el trabajo va en la rama `dev` (ver `docs/FLUJO_GIT.md`).
- Nunca subir `.env` (ya está en `.gitignore`).

## Equipo N° 5
Alejandro Nicólas Gómez
Valeria Antoinette Panameño
Michelle Abigail Guardado
