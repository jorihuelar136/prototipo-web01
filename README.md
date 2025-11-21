# Prototipo Web 01

Plataforma prototipo para red de desarrollo integral de hombres cristianos. Incluye landing pública y futura intranet (cursos, eventos, comunidad, recursos).

## Estructura inicial
```
prototipo-web01/
  backend/
    src/
      index.ts
    package.json
    tsconfig.json
    .eslintrc.cjs
    .env.example
  frontend/ (pendiente)
```

## Próximos pasos
- Backend: rutas de autenticación (registro, login, refresh), modelos in‑memory, validación con Zod.
- Frontend: scaffolding React + Vite + Tailwind.
- AuthContext y páginas protegidas.
- Estilos responsive y branding.

## Scripts backend
Instalar dependencias:
```
npm install
```
Desarrollo:
```
npm run dev
```
Compilar:
```
npm run build
```
Iniciar compilado:
```
npm start
```

Copiar `.env.example` a `.env` y ajustar secretos antes de ejecutar.
