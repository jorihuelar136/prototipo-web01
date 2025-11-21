# Backend API – Prototipo Web 01

Servidor Express + TypeScript con autenticación JWT, persistencia SQLite y endpoints protegidos para cursos, eventos y shorts (YouTube).

## 1. Requisitos
- Node.js 18+ (recomendado LTS)
- npm 9+ (incluido con Node)
- Windows PowerShell / bash

## 2. Instalación
```pwsh
cd d:/projects/cix/prototipo-web01/backend
npm install
```
Esto crea automáticamente la base de datos SQLite en `data/app.db` al primer arranque.

## 3. Variables de Entorno (`.env`)
Crea un archivo `.env` en `backend/`:
```env
PORT=4000
JWT_SECRET=tu-secreto-super-seguro
JWT_EXPIRES=15m          # Duración del access token
JWT_REFRESH_EXPIRES=7d   # Duración del refresh token
```
Si faltan, se usarán valores por defecto: `PORT=4000`, `JWT_SECRET=dev-secret`.

## 4. Scripts NPM
| Script | Uso |
|--------|-----|
| `npm run dev` | Desarrollo con recarga (tsx watch) |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Ejecuta el build en producción |
| `npm run lint` | Linter ESLint |

### Ejecución en desarrollo
```pwsh
npm run dev
```
Salida esperada:
```
API listening on port 4000
```

### Compilar y ejecutar producción
```pwsh
npm run build
npm start
```

## 5. Persistencia (SQLite)
Archivo: `data/app.db`.
Tablas:
- `users(id, email UNIQUE, name, password_hash, roles, created_at)`
- `refresh_tokens(token, user_id FK, created_at)`
Modo WAL activado para mejor concurrencia.

## 6. Autenticación y Tokens
Flujo:
1. Registro/Login -> devuelve `accessToken` (JWT corto) y `refreshToken`.
2. Guardas el `accessToken` en memoria (por ejemplo en contexto frontend).
3. Para endpoints protegidos envías `Authorization: Bearer <accessToken>`.
4. Cuando expira el access token usas `/auth/refresh` con el `refreshToken`.

Rotación de refresh tokens:
- Al hacer login o register se eliminan tokens previos del usuario.
- Al usar `/auth/refresh` se invalida el token anterior y se genera uno nuevo.
- Si intentas usar un refresh eliminado recibirás `REFRESH_NOT_FOUND`.

## 7. Endpoints
Base URL (desarrollo): `http://localhost:4000`

### Salud
`GET /health`
Respuesta:
```json
{ "status": "ok", "timestamp": "2025-10-20T10:00:00.000Z" }
```

### Registro
`POST /auth/register`
Body:
```json
{ "email": "user@test.com", "name": "Usuario", "password": "secreto123", "phone": "+51999999999", "reason": "crecimiento" }
```
Respuesta 201:
```json
{
  "user": { "id": "uuid", "email": "user@test.com", "name": "Usuario", "roles": ["user"], "phone": "+51999999999", "reason": "crecimiento", "mentorId": "uuid-mentor" },
  "accessToken": "...",
  "refreshToken": "..."
}
```
Errores:
- 409 `EMAIL_EXISTS`
- 400 `INVALID_DATA`

### Login
`POST /auth/login`
Body:
```json
{ "email": "user@test.com", "password": "secreto123" }
```
Respuesta 200 igual formato que registro.
Errores: 401 `INVALID_CREDENTIALS`.

### Refresh
`POST /auth/refresh`
Body:
```json
{ "refreshToken": "token" }
```
Respuesta 200: nuevo par de tokens.
Errores: 400 `MISSING_REFRESH`, 401 `INVALID_REFRESH` o `REFRESH_NOT_FOUND`.

### Cursos (protegido)
`GET /api/courses`
Headers: `Authorization: Bearer <accessToken>`
Respuesta:
```json
{ "courses": [ {"id": "c1", "title": "Fundamentos de la Fe", "level": "básico"} ] }
```
Errores: 401 `UNAUTHORIZED` / `INVALID_TOKEN`.

### Eventos (protegido)
`GET /api/events`
Igual a cursos.

### Shorts (público)
`GET /api/shorts`
Devuelve lista de shorts YouTube.
Headers de caching:
- `ETag: W/"..."`
- `Cache-Control: public, max-age=300, must-revalidate`
Si el cliente envía `If-None-Match` con el ETag y no cambió: respuesta `304` sin cuerpo.

## 8. Ejemplos con curl
```pwsh
# Registro
curl -X POST http://localhost:4000/auth/register -H 'Content-Type: application/json' -d '{"email":"user@test.com","name":"User","password":"secreto123"}'

# Login
curl -X POST http://localhost:4000/auth/login -H 'Content-Type: application/json' -d '{"email":"user@test.com","password":"secreto123"}'

# Usar access token (reemplaza XXX)
curl http://localhost:4000/api/courses -H 'Authorization: Bearer XXX'

# Refresh (reemplaza RRR)
curl -X POST http://localhost:4000/auth/refresh -H 'Content-Type: application/json' -d '{"refreshToken":"RRR"}'

# Shorts
curl http://localhost:4000/api/shorts -H 'If-None-Match: W/"etag-previo"'
```

## 9. Estructura de Carpetas
```
backend/
  src/
    index.ts            # Arranque servidor
    db.ts               # Conexión y migraciones SQLite
    models/UserStore.ts # CRUD usuarios
    services/token.ts   # Firmado y verificación JWT + persistencia refresh
    middleware/auth.ts  # requireAuth
    routes/auth.ts      # Registro/login/refresh
    routes/content.ts   # Cursos y eventos (protegidos)
    routes/shorts.ts    # Listado de shorts YouTube (caching)
  data/app.db           # Base de datos SQLite (generado)
  package.json
  README.md
```

## 10. Errores y Códigos Comunes
| Código | Significado |
|--------|-------------|
| 400 INVALID_DATA | Zod validación falló |
| 401 INVALID_CREDENTIALS | Email o contraseña incorrectos |
| 401 UNAUTHORIZED | Falta header Authorization |
| 401 INVALID_TOKEN | JWT inválido o expirado |
| 401 INVALID_REFRESH | Refresh no válido (firma/tipo) |
| 401 REFRESH_NOT_FOUND | Refresh token no registrado en BD |
| 404 USER_NOT_FOUND | Usuario no existe al refrescar |
| 409 EMAIL_EXISTS | Email ya registrado |
| 500 SERVER_ERROR | Error interno inesperado |

## 11. Roadmap Backend (Próximo)
- Roles avanzados (admin, mentor) en tabla separada o claims.
- Auditoría de sesiones y revocación manual.
- Rate limiting por clave de API y por IP con almacenamiento en Redis.
- Tests (unit e integración) con Vitest/Jest.
- Observabilidad (p.ej. pino + OpenTelemetry export).
- Migración a Postgres cuando crezca la demanda.
- Endpoint para regenerar plan de crecimiento si cambian plantillas.
- Reordenamiento drag & drop de plantillas y validación de huecos en el orden.

## 12. Seguridad Básica
- Rotación de refresh tokens evita reutilización.
- Rate limit básico: 100 req/min.
- Helmet agrega cabeceras de seguridad.
- Usar `JWT_SECRET` robusto (32+ caracteres) en producción.

## 13. Troubleshooting
| Problema | Causa | Solución |
|----------|-------|----------|
| 401 INVALID_TOKEN | Token expirado | Llamar `/auth/refresh` con refresh válido |
| 409 EMAIL_EXISTS | Registro duplicado | Usar otro email o login |
| SQLITE busy | Accesos simultáneos | Verificar no hay locks, modo WAL activo |
| No crea app.db | Ruta proceso | Ejecutar desde carpeta backend; revisar permisos |

## 14. Licencias / Imágenes
Las imágenes Unsplash son placeholders; revisar licencias antes de producción. Shorts IDs deben ser de tu canal.

---
Para dudas adicionales: revisa el código en `src/` o solicita ejemplos concretos.

---

## 15. Plan de Crecimiento (Growth Plan)

Feature que personaliza pasos iniciales de desarrollo según el motivo ("reason") elegido por el usuario al registrarse.

### Campos nuevos en usuarios
Se agregaron columnas a la tabla `users`:
- `phone` (TEXT) – teléfono/contacto opcional.
- `reason` (TEXT) – motivo de registro: uno de `economico | familia | vicio | crecimiento | cambio`.
- `mentor_id` (TEXT) – asignación automática al primer usuario con rol `mentor` (si existe) durante el registro.

### Tabla `growth_plan_steps`
Cada fila representa un paso en el plan del usuario:
```
id TEXT PK
user_id TEXT FK users(id)
step_order INTEGER (1..n)
category TEXT (agrupación temática)
title TEXT
description TEXT
recommended_resources TEXT (lista separada por comas)
completed_at TEXT (nullable)
created_at TEXT
```

Los recursos se almacenan como texto CSV y se exponen como array en las respuestas (`resources: string[]`).

### Generación del plan
Al registrar un usuario, si `reason` está presente:
1. Se consultan plantillas predefinidas en `growth_plan_templates` filtrando por `reason`.
2. Si existen plantillas se usan para crear los pasos (ordenados por `step_order`).
3. Si no hay plantillas, se usa un conjunto por defecto codificado (fallback) en `UserStore.buildGrowthSteps`.
4. Se registra actividad `user_growth_plan_generated` en `user_activity`.

Usuarios sin `reason` simplemente no reciben pasos iniciales (array vacío en el dashboard).

### Endpoints relacionados

#### Obtener plan del usuario
`GET /api/dashboard`
Incluye un campo adicional:
```jsonc
{
  "growthPlan": [
    {
      "id": "uuid-step",
      "order": 1,
      "category": "Fundación",
      "title": "Establecer disciplinas espirituales",
      "description": "Define horarios consistentes para oración y lectura.",
      "resources": ["plan:lectura-biblia","video:oracion-discipulos"],
      "completedAt": null
    }
  ]
}
```

#### Completar un paso
`POST /api/dashboard/complete-step/:id`
Respuesta:
```json
{ "id": "uuid-step", "completedAt": "2025-10-20T10:00:00.000Z" }
```
Errores:
| Código | Significado |
|--------|-------------|
| 404 STEP_NOT_FOUND | No existe el paso |
| 403 FORBIDDEN | Paso no pertenece al usuario autenticado |
| 409 ALREADY_COMPLETED | Ya marcado como completado |

Al completar se registra actividad `growth_step_completed`.

### Tabla `growth_plan_templates` (mantenimiento admin)
Permite que un administrador defina o ajuste los pasos por cada motivo sin tocar código.
```
id TEXT PK
reason TEXT (economico|familia|vicio|crecimiento|cambio)
step_order INTEGER (1..20 recomendado)
category TEXT
title TEXT
description TEXT
recommended_resources TEXT (CSV)
created_at TEXT
```

### Endpoints de plantillas (requieren rol admin)

`GET /api/admin/growth-templates` – Lista todas ordenadas por `reason, step_order`.

`POST /api/admin/growth-templates`
Body:
```json
{
  "reason": "crecimiento",
  "step_order": 1,
  "category": "Fundación",
  "title": "Establecer disciplinas espirituales",
  "description": "Define horarios consistentes...",
  "recommended_resources": ["plan:lectura-biblia","video:oracion-discipulos"]
}
```
Respuesta 201: `{ "id": "uuid" }`

`PUT /api/admin/growth-templates/:id` – Actualiza campos (parcial). Body parcial acepta cualquiera de los anteriores.

`DELETE /api/admin/growth-templates/:id` – Elimina la plantilla.

### Regenerar plan de crecimiento (admin)
Permite reconstruir los pasos de un usuario usando las plantillas actuales.

`POST /api/admin/users/:id/regenerate-growth-plan`
Body opcional:
```json
{ "force": true }
```
Campos:
- `force` (boolean, opcional): si `true` elimina también pasos ya completados; si se omite sólo reemplaza los incompletos.
- `reason` (string, opcional): si se envía se usa ese motivo en lugar del que tiene el usuario para generar el nuevo set.

Respuestas:
- 200 Éxito: devuelve nuevo arreglo `steps`.
- 400 `NO_REASON` si el usuario no tiene reason y no se envía uno.
- 404 `USER_NOT_FOUND` si el usuario no existe.
- 409 `NO_TEMPLATES` si no hay plantillas para el motivo elegido.

Ejemplo respuesta:
```json
{
  "userId": "uuid-user",
  "reason": "crecimiento",
  "steps": [
    { "id": "uuid-step", "order": 1, "category": "Fundación", "title": "Establecer disciplinas espirituales", "description": "Define horarios consistentes...", "resources": ["plan:lectura-biblia"], "completedAt": null }
  ]
}
```

Se registra actividad `admin_growth_plan_regenerated`.

### Obtener plan (nuevo endpoint dedicado)
`GET /api/growth/plan` (autenticado)
Devuelve:
```json
{ "reason": "crecimiento", "steps": [ { "id": "uuid", "order": 1, "category": "Fundación", "title": "Establecer disciplinas espirituales", "description": "Define horarios...", "resources": ["plan:lectura-biblia"], "completedAt": null } ] }
```
Si el usuario no tiene `reason` o pasos: `steps` será `[]` y `reason` puede ser `null`.

Nota: El dashboard ya no incluye el campo `growthPlan`; el plan se consume únicamente desde `/api/growth/plan` y la página dedicada de crecimiento.

### Consideraciones
- Cambios en plantillas NO afectan planes ya generados (no hay retroactividad por diseño). Para aplicar cambios a usuarios existentes se planifica un endpoint de "regeneración" (ver roadmap).
- `step_order` debe ser secuencial para buena experiencia; la API no impide huecos pero el UI puede validarlo.
- `recommended_resources` se maneja como array en la API y como CSV internamente.
- La asignación de `mentor_id` ocurre sólo al crear el usuario (primer mentor existente). No se recalcula después.

### Nuevos tipos de actividad (`user_activity.kind`)
- `user_growth_plan_generated`
- `growth_step_completed`
- `admin_user_updated`, `admin_password_reset`, `admin_user_deleted` (para panel administrativo)

### Ejemplo flujo completo
1. Usuario se registra con reason "crecimiento".
2. API genera 5 pasos (plantillas > fallback) y registra actividad de generación.
3. Usuario ve timeline en frontend y completa primer paso llamando `POST /api/dashboard/complete-step/:id`.
4. Actividad de completado aparece en notificaciones.

### Roadmap específico Growth
- Endpoint `POST /api/growth/regenerate` (admin o mentor) para reconstruir el plan de un usuario si se actualizan plantillas.
- Métricas de progreso agregadas a Dashboard (porcentaje completado).
- Recomendación dinámica de recursos según hábitos del usuario.

