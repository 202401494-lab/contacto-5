# Flujo de Git del equipo

La guía exige que **todo quede publicado en la rama `dev`**.

## Primera vez (compañeros)
```
git clone <url-del-repo>
cd contacto-N
git checkout dev
```

## Día a día
```
git checkout dev
git pull origin dev          # SIEMPRE antes de empezar a trabajar
# ... trabajar ...
git add .
git commit -m "feat: descripción corta de lo que hiciste"
git pull origin dev          # por si alguien subió algo mientras trabajabas
git push origin dev
```

## Cómo evitar conflictos
- Repartirse áreas distintas (p. ej. 1: backend/auth y roles, 2: backend/contactos + BD, 3: frontend).
- Commits pequeños y frecuentes; hacer `pull` antes de cada `push`.
- Si hay conflicto: abrir el archivo, dejar la versión correcta, quitar las marcas `<<<<<<<`, luego
  `git add .` → `git commit` → `git push origin dev`.

## Mensajes de commit sugeridos
`feat:` funcionalidad nueva · `fix:` corrección · `style:` diseño/CSS · `docs:` documentación
