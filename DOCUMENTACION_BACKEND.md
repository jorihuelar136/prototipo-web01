---

# DOCUMENTACIÓN DEL BACKEND

## 1. DESCRIPCIÓN TÉCNICA DEL BACKEND

### 1.1 Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|----------|
| **Node.js** | 18.x+ | Runtime de JavaScript en servidor |
| **Express.js** | 4.19.2 | Framework web HTTP |
| **TypeScript** | 5.4.2 | Lenguaje tipado |
| **SQLite** | (better-sqlite3 9.6.0) | Base de datos relacional |
| **bcryptjs** | 2.4.3 | Hashing seguro de contraseñas |
| **JWT** | jsonwebtoken 9.0.2 | Autenticación con tokens |
| **Zod** | 3.23.8 | Validación de schemas |
| **Cors** | 2.8.5 | Control de origen cruzado |
| **Helmet** | 7.0.0 | Seguridad HTTP headers |
| **Express Rate Limit** | 7.4.0 | Control de límite de peticiones |
| **tsx** | 4.7.0 | Ejecución de TypeScript en desarrollo |
| **Vitest** | 1.6.1 | Framework de testing |

### 1.2 Requisitos Técnicos

**Requisitos de Desarrollo:**
- Node.js 18.x o superior
- npm 9.x o superior
- SQLite 3.x (incluido en better-sqlite3)
- Postman o herramienta similar para testing de APIs (opcional)

**Requisitos de Infraestructura:**
- Puerto 4000 (configurable via .env)
- RAM: Mínimo 512MB
- Disco: Mínimo 100MB (incluye DB)
- CPU: 1 núcleo (desarrollo)

**Requisitos de Seguridad:**
- Variable JWT_SECRET en .env (mínimo 32 caracteres)
- Variable de puerto configurada
- CORS configurado solo para dominios permitidos
- Rate limiting activado

### 1.3 Arquitectura General

```
┌─────────────────────────────────────────────────────┐
│              Express Application                    │
├─────────────────────────────────────────────────────┤
│  Middleware Stack                                   │
│  ├── express.json()      (Body parser)             │
│  ├── cors()              (Cross-origin)            │
│  ├── helmet()            (Security headers)        │
│  └── rateLimit()         (Rate limiting)           │
├─────────────────────────────────────────────────────┤
│  Routes                                             │
│  ├── /health             (Health check)            │
│  ├── /auth               (Authentication)          │
│  ├── /api                (Content)                  │
│  ├── /api/dashboard      (Dashboard data)          │
│  ├── /api/growth         (Growth plans)            │
│  ├── /api/mentoria       (Mentoring)               │
│  ├── /api/prayer         (Prayer requests)         │
│  ├── /api/progress       (User progress)           │
│  ├── /api/admin          (Admin operations)        │
│  ├── /api/shorts         (Short content)           │
│  ├── /api/mentor         (Mentor operations)       │
│  └── /api/instagram      (Social integration)      │
├─────────────────────────────────────────────────────┤
│  Services Layer                                     │
│  ├── Token Service       (JWT generation/verify)   │
│  ├── User Service        (User operations)         │
│  └── Database Service    (SQLite queries)          │
├─────────────────────────────────────────────────────┤
│  Data Layer                                         │
│  └── SQLite Database     (better-sqlite3)          │
└─────────────────────────────────────────────────────┘
```

### 1.4 Estructura de Directorios

```
backend/
├── src/
│   ├── index.ts                  # Punto de entrada, configuración Express
│   ├── db.ts                     # Conexión y configuración de SQLite
│   ├── types.d.ts                # Definiciones de tipos TypeScript
│   ├── routes/                   # Rutas y endpoints
│   │   ├── auth.ts               # Autenticación (register, login, refresh)
│   │   ├── content.ts            # Contenido educativo
│   │   ├── dashboard.ts          # Datos del dashboard
│   │   ├── growth.ts             # Planes de crecimiento
│   │   ├── mentoria.ts           # Gestión de mentoría
│   │   ├── mentor.ts             # Funciones de mentor
│   │   ├── prayer.ts             # Peticiones de oración
│   │   ├── progress.ts           # Progreso del usuario
│   │   ├── admin.ts              # Operaciones administrativas
│   │   ├── shorts.ts             # Contenido breve/videos
│   │   └── instagram.ts          # Integración con Instagram
│   ├── services/                 # Lógica de negocio
│   │   └── token.ts              # Generación y verificación de JWT
│   ├── models/                   # Modelos de datos
│   │   └── UserStore.ts          # Operaciones de usuario
│   ├── middleware/               # Middleware de Express
│   │   └── auth.ts               # Middleware de autenticación
│   ├── data/                     # Datos estáticos
│   │   └── bible_topics.json     # Tópicos bíblicos predefinidos
│   └── scripts/                  # Scripts de utilidad
│       ├── test-email-flow.js    # Testing de flujo de email
│       └── validator-test.js     # Testing de validadores
├── dist/                         # Compilación TypeScript (generado)
├── node_modules/                # Dependencias npm
├── package.json                 # Configuración de dependencias
├── tsconfig.json               # Configuración de TypeScript
├── .eslintrc.cjs               # Configuración de ESLint
├── .env.example                # Plantilla de variables de entorno
└── .gitignore                  # Archivos a ignorar en git
```

### 1.5 Modelos de Datos (Esquema de BD)

#### **Tabla: users**
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  roles TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL,
  phone TEXT,
  reason TEXT,
  mentor_id TEXT,
  updated_at TEXT,
  last_login TEXT
);
```

**Campos:**
- `id`: UUID único del usuario
- `email`: Email único para login
- `name`: Nombre completo
- `password_hash`: Contraseña hasheada con bcrypt
- `roles`: Roles separados por coma ('user', 'mentor', 'admin')
- `created_at`: Timestamp de creación
- `phone`: Teléfono (opcional)
- `reason`: Motivo de unirse (economico, familia, vicio, crecimiento, cambio)
- `mentor_id`: UUID del mentor asignado (si aplica)
- `updated_at`: Última actualización
- `last_login`: Última vez que accedió

#### **Tabla: refresh_tokens**
```sql
CREATE TABLE refresh_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Propósito:** Almacenar tokens de refresco para mantener sesiones activas

#### **Tabla: growth_plan_templates**
```sql
CREATE TABLE growth_plan_templates (
  id TEXT PRIMARY KEY,
  reason TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommended_resources TEXT,
  created_at TEXT
);
```

**Propósito:** Plantillas de planes de crecimiento por contexto

#### **Tabla: user_progress**
```sql
CREATE TABLE user_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  growth_step_id TEXT,
  completed_at TEXT,
  resource_id TEXT,
  viewed_at TEXT,
  created_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Propósito:** Registrar avance del usuario en su plan

#### **Tabla: mentorship**
```sql
CREATE TABLE mentorship (
  id TEXT PRIMARY KEY,
  mentor_id TEXT NOT NULL,
  mentee_id TEXT NOT NULL,
  assigned_at TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  notes TEXT,
  FOREIGN KEY (mentor_id) REFERENCES users(id),
  FOREIGN KEY (mentee_id) REFERENCES users(id)
);
```

**Propósito:** Registrar relaciones de mentoría

### 1.6 Rutas y Endpoints de API

#### **Autenticación (/auth)**

| Método | Endpoint | Descripción | Autenticación | Respuesta |
|--------|----------|-------------|---------------|-----------|
| POST | `/auth/register` | Registrar nuevo usuario | No | User + tokens |
| POST | `/auth/login` | Autenticarse | No | User + tokens |
| POST | `/auth/refresh` | Renovar access token | No (Refresh token) | Nuevo token |
| GET | `/auth/check-email` | Verificar email disponible | No | {available: bool} |
| GET | `/auth/debug-users` | Listar usuarios (DEBUG) | Sí | Array de users |
| POST | `/auth/promote-admin` | Promover usuario a admin | Sí | User actualizado |
| POST | `/auth/logout` | Cerrar sesión | Sí | {status: ok} |

#### **Dashboard (/api/dashboard)**

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/dashboard` | Datos personalizados del dashboard | Sí |
| GET | `/api/dashboard/summary` | Resumen de actividad | Sí |
| GET | `/api/dashboard/recommendations` | Recomendaciones personalizadas | Sí |

#### **Crecimiento (/api/growth)**

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/growth/plan/:userId` | Obtener plan de crecimiento | Sí |
| POST | `/api/growth/plan` | Crear/actualizar plan | Sí |
| PATCH | `/api/growth/step/:stepId` | Marcar paso como completado | Sí |
| GET | `/api/growth/templates` | Plantillas disponibles | No |

#### **Mentoría (/api/mentoria)**

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/mentoria/mentor/:userId` | Obtener info del mentor | Sí |
| POST | `/api/mentoria/request` | Solicitar mentoría | Sí |
| GET | `/api/mentoria/request/:userId` | Estado de solicitud | Sí |
| POST | `/api/mentoria/session` | Agendar sesión de mentoría | Sí |

#### **Progreso (/api/progress)**

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/progress/:userId` | Progreso del usuario | Sí |
| POST | `/api/progress/activity` | Registrar actividad | Sí |
| GET | `/api/progress/timeline/:userId` | Timeline de logros | Sí |

#### **Administración (/api/admin)**

| Método | Endpoint | Descripción | Autenticación | Rol Requerido |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/admin/users` | Listar todos los usuarios | Sí | admin |
| PATCH | `/api/admin/users/:userId` | Actualizar usuario | Sí | admin |
| DELETE | `/api/admin/users/:userId` | Eliminar usuario | Sí | admin |
| POST | `/api/admin/mentors/assign` | Asignar mentor | Sí | admin |
| GET | `/api/admin/stats` | Estadísticas generales | Sí | admin |

#### **Oración (/api/prayer)**

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/api/prayer/request` | Crear petición de oración | Sí |
| GET | `/api/prayer/feed` | Feed de peticiones | Sí |
| POST | `/api/prayer/:id/intercede` | Orar por petición | Sí |

#### **Contenido (/api)**

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/courses` | Listar cursos | No |
| GET | `/api/resources` | Listar recursos | No |
| POST | `/api/courses/:id/enroll` | Matricularse en curso | Sí |

### 1.7 Seguridad y Autenticación

#### **Sistema JWT (JSON Web Tokens)**

**Estructura de Tokens:**

1. **Access Token**
   - Duración: 15 minutos
   - Uso: Autorizar peticiones a API
   - Contenido:
     ```json
     {
       "sub": "user-uuid",
       "email": "user@example.com",
       "roles": ["user"],
       "type": "access",
       "iat": 1234567890,
       "exp": 1234569090
     }
     ```

2. **Refresh Token**
   - Duración: 7 días
   - Uso: Generar nuevo access token
   - Almacenado: BD (refresh_tokens table)
   - Contenido:
     ```json
     {
       "sub": "user-uuid",
       "type": "refresh",
       "iat": 1234567890,
       "exp": 1234569090
     }
     ```

#### **Proceso de Autenticación**

```
Cliente                           Servidor
  │                                 │
  ├─── POST /auth/register ────────>│ Validar datos con Zod
  │                                 │ Hash contraseña (bcrypt)
  │                                 │ Crear usuario en BD
  │<─ {user, accessToken, 
  │       refreshToken} ────────────┤
  │
  │ Guardar:
  │ - accessToken en localStorage
  │ - refreshToken en localStorage
  │
  ├─ Petición normal con header ──>│ Middleware verifyToken
  │ Authorization: Bearer <token>   │ Decodificar JWT
  │                                 │ Validar firma
  │                                 │ Verificar expiración
  │<─ Respuesta autorizada ────────┤
  │
  │ Si token expira:
  ├─ POST /auth/refresh ──────────>│ Validar refreshToken
  │ {refreshToken}                  │ Verificar en BD
  │                                 │ Emitir nuevo accessToken
  │<─ {accessToken} ──────────────┤
```

#### **Control de Acceso (Roles)**

**Roles disponibles:**
- `user`: Usuario regular (default)
- `mentor`: Puede mentorear a otros usuarios
- `admin`: Acceso administrativo completo

**Ejemplo de middleware:**
```typescript
// Solo admins pueden acceder
router.post('/admin/..', requireAuth, requireRole('admin'), (req, res) => {
  // ...
});
```

#### **Medidas de Seguridad Implementadas**

1. **Contraseñas:**
   - Hasheadas con bcrypt (10 salt rounds)
   - Nunca se almacenan en texto plano
   - Validación de fortaleza en registro

2. **Rate Limiting:**
   - 100 requests por minuto por IP
   - Protege contra fuerza bruta

3. **CORS:**
   - Configurado para orígenes específicos
   - Credenciales permitidas

4. **Headers de Seguridad:**
   - Helmet.js activo
   - Previene XSS, Clickjacking, etc.

5. **Validación de Entrada:**
   - Zod schemas para todos los inputs
   - Validación del lado del servidor

### 1.8 Servicios Clave

#### **Token Service (token.ts)**

**Funciones:**
- `signTokens(user)`: Genera access y refresh tokens
  - Parámetro: User object
  - Retorna: {accessToken, refreshToken}

- `verifyToken(token)`: Verifica y decodifica token
  - Parámetro: JWT string
  - Retorna: Payload decodificado o error

- `generateRefreshToken()`: Crea token de refresco único
  - Retorna: UUID del refresh token

#### **User Store (UserStore.ts)**

**Métodos estáticos:**
- `create(email, name, password, phone?, reason?)`: Registra nuevo usuario
  - Retorna: User object
  - Lanza: EMAIL_EXISTS si email duplicado

- `verify(email, password)`: Autentica usuario
  - Retorna: User object si válido, null si no

- `getById(userId)`: Obtiene usuario por ID
  - Retorna: User object o undefined

- `list()`: Obtiene todos los usuarios
  - Retorna: Array de Users

- `updateRoles(userId, roles)`: Actualiza roles del usuario
  - Retorna: User actualizado

### 1.9 Validación de Datos

**Schemas Zod implementados:**

```typescript
// Registro
registerSchema = {
  email: string().email(),
  name: string().min(2),
  password: string()
    .min(10)
    .regex(/[0-9]/, 'Debe incluir número')
    .regex(/[A-ZÁÉÍÓÚÑ]/, 'Debe incluir mayúscula')
    .regex(/[a-záéíóúñ]/, 'Debe incluir minúscula')
    .regex(/[!@#$%^&*._+-]/, 'Debe incluir símbolo'),
  phone: string().optional(),
  reason: enum(['economico','familia','vicio','crecimiento','cambio']).optional()
}

// Login
loginSchema = {
  email: string().email(),
  password: string().min(6)
}
```

---

## 2. GUÍA TÉCNICA DEL BACKEND

### 2.1 Instalación y Configuración

#### **Paso 1: Clonar y navegar**
```bash
git clone <repo-url>
cd prototipo-web01/backend
```

#### **Paso 2: Instalar dependencias**
```bash
npm install
```

#### **Paso 3: Configurar variables de entorno**
```bash
cp .env.example .env
```

**Editar `.env`:**
```env
# Server config
PORT=4000
NODE_ENV=development

# Database
DATABASE_PATH=./data/app.db

# JWT Security
JWT_SECRET=tu-clave-secreta-muy-larga-minimo-32-caracteres-aleatorios-1A2B3C4D5E6F

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Email (futuro)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-apps

# Admin bootstrap
ADMIN_BOOTSTRAP_EMAIL=admin@plataforma.local
```

#### **Paso 4: Inicializar base de datos**
```bash
npm run init-db  # (si existe script)
```

O inicializará automáticamente al primer inicio.

### 2.2 Scripts de Desarrollo

```bash
# Desarrollo con auto-reload
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar compilado
npm start

# Linting
npm run lint

# Testing
npm run test
```

### 2.3 Testing de Endpoints

#### **Usando cURL:**

```bash
# Health check
curl http://localhost:4000/health

# Registrar usuario
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "name": "Juan Pérez",
    "password": "Password123!",
    "phone": "+34600000000",
    "reason": "economico"
  }'

# Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "Password123!"
  }'

# Petición autenticada (reemplaza TOKEN)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:4000/api/dashboard
```

#### **Usando Postman:**

1. Importar colección (si existe)
2. Configurar environment con:
   - `baseUrl`: http://localhost:4000
   - `token`: Obtenido de login
3. Tests incluidos para validar respuestas

### 2.4 Estructura de Respuestas API

#### **Respuesta Exitosa (200-201)**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Nombre",
    "roles": ["user"]
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### **Error de Validación (400)**
```json
{
  "error": "INVALID_DATA",
  "issues": [
    {
      "code": "invalid_string",
      "expected": "email",
      "path": ["email"],
      "message": "Invalid email"
    }
  ]
}
```

#### **Error de Autorización (401)**
```json
{
  "error": "INVALID_CREDENTIALS"
}
```

#### **Error de Servidor (500)**
```json
{
  "error": "SERVER_ERROR"
}
```

### 2.5 Flujos de Datos Principales

#### **Flujo 1: Registro y Primer Login**

```
Frontend                          Backend
  │
  ├─ POST /auth/register ──────>
  │  {email, name, pwd, reason}
  │
  │                               ├─ Zod validate
  │                               ├─ Hash password
  │                               ├─ Create user en BD
  │                               ├─ Build growth plan
  │                               ├─ signTokens()
  │                               ├─ Save refresh token en BD
  │                               │
  │<────── {user, tokens} ────────┤
  │
  │ localStorage.setItem('token', accessToken)
  │ localStorage.setItem('refresh', refreshToken)
  │ AuthContext.user = user
  │
  ├─ GET /api/dashboard ────────>
  │ Header: Authorization: Bearer <token>
  │
  │                               ├─ verify token middleware
  │                               ├─ Query user progress
  │                               ├─ Query growth plan
  │                               │
  │<────── {data} ───────────────┤
```

#### **Flujo 2: Actualizar Progreso**

```
Frontend                          Backend
  │
  ├─ POST /api/growth/step/:id ─>
  │ {completed_at: timestamp}
  │ Header: Authorization: Bearer <token>
  │
  │                               ├─ verify token middleware
  │                               ├─ Check user owns step
  │                               ├─ Update en BD
  │                               ├─ Recalculate plan %
  │                               ├─ Check unlocked resources
  │                               │
  │<────── {step, progress} ─────┤
  │
  │ Actualizar UI con nuevo %
```

#### **Flujo 3: Solicitar Mentoría**

```
Frontend                          Backend
  │
  ├─ POST /api/mentoria/request ─>
  │ {area, description}
  │
  │                               ├─ Create request record
  │                               ├─ Queue for assignment
  │                               ├─ Notify admins
  │                               │
  │<────── {requestId, status} ──┤
  │
  │ Show "Solicitud enviada"
  │
  │ [Background Admin Process]
  │                               ├─ Find available mentor
  │                               ├─ Update mentorship table
  │                               ├─ Send notifications
  │                               │
  │<─ Notificación (WebSocket?) ─┤
  │
  │ Show "Mentor asignado"
```

---

## 3. OPERACIONES Y MANTENIMIENTO

### 3.1 Monitoreo

**Health Check:**
```bash
curl http://localhost:4000/health
# Response: {"status": "ok", "timestamp": "2024-01-25T..."}
```

**Logs del servidor:**
```bash
# En desarrollo, busca en consola
# En producción, redirige a archivo:
npm run dev > server.log 2>&1 &
```

### 3.2 Backup de Base de Datos

```bash
# SQLite es archivo, hacer backup es simple:
cp data/app.db data/app.db.backup.$(date +%Y%m%d)

# Restaurar:
cp data/app.db.backup.20240125 data/app.db
```

### 3.3 Escalabilidad Futura

**Consideraciones:**
1. SQLite está bien para prototipo/MVP
2. Para producción escalar a PostgreSQL o MySQL
3. Añadir caché (Redis) para datos frecuentes
4. WebSockets para notificaciones en tiempo real
5. Queue system (Bull, RabbitMQ) para tareas async

---

