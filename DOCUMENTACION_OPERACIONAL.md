---

# 4. GUÍA DE USUARIO - BACKEND

Este documento está dirigido a administradores y desarrolladores que usan el backend.

## 4.1 Operaciones Administrativas

### Gestión de Usuarios

#### **Listar todos los usuarios**

**Endpoint:**
```
GET /api/admin/users
Authorization: Bearer <admin-token>
```

**Respuesta:**
```json
[
  {
    "id": "uuid-1",
    "email": "user@example.com",
    "name": "Juan Pérez",
    "roles": ["user"],
    "createdAt": "2024-01-15T10:30:00Z",
    "phone": "+34600000000",
    "reason": "economico",
    "mentorId": "uuid-mentor-1"
  },
  ...
]
```

#### **Actualizar usuario**

**Endpoint:**
```
PATCH /api/admin/users/:userId
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Nuevo Nombre",
  "phone": "+34611111111",
  "roles": ["user", "mentor"]
}
```

#### **Promocionar usuario a admin**

**Endpoint:**
```
POST /auth/promote-admin
Authorization: Bearer <current-admin-token>
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "uuid-del-usuario"
}
```

**Nota:** Solo un admin puede promover a otro admin. Si no hay admin aún, cualquier usuario registrado puede auto-promoverse (bootstrap).

#### **Eliminar usuario (irreversible)**

**Endpoint:**
```
DELETE /api/admin/users/:userId
Authorization: Bearer <admin-token>
```

**Advertencia:** Esta operación es irreversible y elimina todo asociado al usuario.

### Gestión de Mentorías

#### **Asignar mentor a un usuario**

**Endpoint:**
```
POST /api/admin/mentors/assign
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Body:**
```json
{
  "menteeId": "uuid-del-estudiante",
  "mentorId": "uuid-del-mentor"
}
```

**Respuesta:**
```json
{
  "mentorshipId": "uuid",
  "status": "active",
  "menteeId": "uuid",
  "mentorId": "uuid",
  "assignedAt": "2024-01-25T14:30:00Z"
}
```

#### **Listar mentorías activas**

**Endpoint:**
```
GET /api/admin/mentorships
Authorization: Bearer <admin-token>
```

### Estadísticas y Reportes

#### **Obtener estadísticas generales**

**Endpoint:**
```
GET /api/admin/stats
Authorization: Bearer <admin-token>
```

**Respuesta:**
```json
{
  "totalUsers": 150,
  "activeUsers30Days": 87,
  "registeredToday": 5,
  "totalMentorships": 45,
  "averageProgressPercentage": 35.5,
  "enrolledCourses": 230,
  "completedCourses": 45,
  "prayerRequests": 120,
  "communityPosts": 340
}
```

### 4.2 Modelos de Peticiones Comunes

#### **Crear petición de oración**

**Endpoint:**
```
POST /api/prayer/request
Authorization: Bearer <user-token>
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Oración por sanidad",
  "description": "Mi hermano necesita oración para su recuperación...",
  "isPublic": true,
  "category": "salud"
}
```

#### **Registrar matriculación en curso**

**Endpoint:**
```
POST /api/courses/:courseId/enroll
Authorization: Bearer <user-token>
```

**Respuesta:**
```json
{
  "enrollmentId": "uuid",
  "courseId": "course-uuid",
  "userId": "user-uuid",
  "enrolledAt": "2024-01-25T14:30:00Z",
  "status": "active"
}
```

---

# ARQUITECTURA Y FLUJOS DEL SISTEMA

## 5. ARQUITECTURA DE LA APLICACIÓN

### 5.1 Diagrama General de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENTE (Navegador)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Frontend React App                                        │ │
│  │  ├── Components (React)                                    │ │
│  │  ├── AuthContext (Estado Global)                           │ │
│  │  ├── React Router (Navegación)                             │ │
│  │  └── Axios (Cliente HTTP)                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              │ JSON
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   SERVIDOR (Node.js + Express)                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Middleware Stack                                          │ │
│  │  ├── CORS (Cross-Origin Resource Sharing)                 │ │
│  │  ├── Helmet (Seguridad HTTP)                              │ │
│  │  ├── Rate Limiting (Anti-abuse)                           │ │
│  │  └── Body Parser (JSON)                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  API Routes                                                │ │
│  │  ├── /auth (register, login, refresh, check-email)        │ │
│  │  ├── /api/dashboard (user dashboard data)                 │ │
│  │  ├── /api/growth (growth plans)                           │ │
│  │  ├── /api/mentoria (mentoring)                            │ │
│  │  ├── /api/prayer (prayer requests)                        │ │
│  │  ├── /api/progress (user progress)                        │ │
│  │  ├── /api/courses (courses & enrollment)                  │ │
│  │  └── /api/admin (admin operations)                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Services Layer                                            │ │
│  │  ├── Token Service (JWT generation/verification)          │ │
│  │  ├── User Service (User operations)                        │ │
│  │  ├── Growth Service (Growth plan logic)                    │ │
│  │  └── Mail Service (Email notifications - futuro)          │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Data Models                                               │ │
│  │  ├── User (authentication & profile)                       │ │
│  │  ├── RefreshToken (session management)                     │ │
│  │  ├── Mentorship (mentor-mentee relationships)              │ │
│  │  ├── UserProgress (growth tracking)                        │ │
│  │  └── GrowthPlanTemplate (customizable plans)               │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ SQL
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   PERSISTENCIA (SQLite)                          │
│  ├── users                                                       │
│  ├── refresh_tokens                                              │
│  ├── user_progress                                               │
│  ├── growth_plan_templates                                       │
│  ├── mentorship                                                  │
│  ├── prayer_requests                                             │
│  ├── courses                                                     │
│  ├── enrollments                                                 │
│  └── community_posts                                             │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Flujo de Datos Completo - Ejemplo Registro

```
USER ACTION: Hace clic en "Registrar"

┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND                                                        │
│ 1. Usuario completa formulario                                 │
│    ├── email: usuario@example.com                             │
│    ├── name: Juan Pérez                                       │
│    ├── password: MiPassword123!                               │
│    └── reason: economico                                      │
│                                                                │
│ 2. onClick -> login() en AuthContext                           │
│                                                                │
│ 3. axios.post('/auth/register', {                             │
│      email, name, password, reason                            │
│    })                                                          │
│                                                                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP POST
                            │ Content-Type: application/json
                            │
        ┌───────────────────▼─────────────────┐
        │ BACKEND - Route Handler              │
        │ POST /auth/register                 │
        │                                     │
        │ 1. Recibe body con datos           │
        │                                     │
        │ 2. Zod validate:                    │
        │    - email válido?                 │
        │    - name >= 2 chars?              │
        │    - password strong?              │
        │      * 10+ chars                   │
        │      * número                      │
        │      * mayúscula                   │
        │      * minúscula                   │
        │      * símbolo                     │
        │                                     │
        │ 3. Si error: retorna 400            │
        │    {error: "INVALID_DATA", ...}    │
        │                                     │
        │ 4. Si OK: llamar UserStore.create()│
        │                                     │
        └───────────────────┬─────────────────┘
                            │
        ┌───────────────────▼─────────────────┐
        │ SERVICE - UserStore.create()         │
        │                                     │
        │ 1. Check si email ya existe:       │
        │    SELECT * FROM users             │
        │    WHERE email = ?                 │
        │                                     │
        │ 2. Si existe: lanza ERROR          │
        │    EMAIL_EXISTS                    │
        │    → Backend retorna 409           │
        │                                     │
        │ 3. Si no existe:                   │
        │    - Hash password con bcrypt      │
        │      saltRounds: 10                │
        │    - Generar UUID para id          │
        │    - Crear objeto User             │
        │    - INSERT en tabla users         │
        │                                     │
        │ 4. buildGrowthSteps() para reason  │
        │    SELECT templates FROM           │
        │    growth_plan_templates           │
        │    WHERE reason = 'economico'      │
        │    ORDER BY step_order             │
        │                                     │
        │ 5. INSERT growth_plan rows         │
        │                                     │
        │ 6. COMMIT transacción              │
        │                                     │
        │ 7. Retorna User object             │
        │                                     │
        └───────────────────┬─────────────────┘
                            │
        ┌───────────────────▼─────────────────┐
        │ SERVICE - signTokens(user)          │
        │                                     │
        │ 1. Generar Access Token:           │
        │    - Payload:                      │
        │      {sub: userId,                 │
        │       email: email,                │
        │       roles: ['user'],             │
        │       type: 'access',              │
        │       iat: now,                    │
        │       exp: now + 15min}            │
        │    - Sign con JWT_SECRET           │
        │    - Retorna token (string)        │
        │                                     │
        │ 2. Generar Refresh Token:          │
        │    - Generar UUID único            │
        │    - Payload:                      │
        │      {sub: userId,                │
        │       type: 'refresh',            │
        │       iat: now,                   │
        │       exp: now + 7days}           │
        │    - Sign con JWT_SECRET           │
        │    - INSERT en tabla               │
        │      refresh_tokens(               │
        │        token, user_id, expires_at │
        │      )                             │
        │    - Retorna token (string)        │
        │                                     │
        │ 3. Retorna {accessToken,           │
        │            refreshToken}           │
        │                                     │
        └───────────────────┬─────────────────┘
                            │
        ┌───────────────────▼─────────────────┐
        │ BACKEND - Return Response            │
        │ Status: 201 Created                 │
        │ Body:                               │
        │ {                                   │
        │   "user": {                         │
        │     "id": "abc-123...",            │
        │     "email": "usuario@...",       │
        │     "name": "Juan Pérez",          │
        │     "roles": ["user"],             │
        │     "phone": null,                 │
        │     "reason": "economico",         │
        │     "mentorId": null               │
        │   },                                │
        │   "accessToken": "eyJhbGc...",     │
        │   "refreshToken": "eyJhbGc..."     │
        │ }                                   │
        │                                     │
        └───────────────────┬─────────────────┘
                            │
                            │ HTTP Response (JSON)
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│ FRONTEND                                                         │
│ 1. Recibe respuesta exitosa (201)                               │
│                                                                  │
│ 2. localStorage.setItem('token', accessToken)                   │
│    localStorage.setItem('refreshToken', refreshToken)           │
│                                                                  │
│ 3. AuthContext.setUser(user)                                    │
│    AuthContext.setIsAuthenticated(true)                         │
│    AuthContext.setToken(accessToken)                            │
│                                                                  │
│ 4. navigate('/dashboard')                                       │
│                                                                  │
│ 5. Dashboard se renderiza:                                      │
│    useEffect(() => {                                            │
│      axios.get('/api/dashboard',                               │
│        headers: {                                               │
│          'Authorization': `Bearer ${token}`                    │
│        }                                                        │
│      )                                                          │
│    }, [])                                                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 5.3 Flujos de Autenticación en Detalle

#### **Flujo: Token Expira**

```
┌─────────────────────────────────────────────────────┐
│ User hace petición normal                          │
│ axios.get('/api/dashboard',                        │
│   headers: {                                       │
│     'Authorization': 'Bearer <accessToken>'        │
│   }                                                │
│ )                                                  │
└──────────────────────┬────────────────────────────┘
                       │
        ┌──────────────▼──────────────┐
        │ Backend Middleware           │
        │ verifyToken(accessToken)    │
        │                             │
        │ jwt.verify(token, secret)   │
        │                             │
        │ TokenExpiredError            │
        │ ↓                            │
        │ Retorna 401 - Token expired │
        └──────────────┬──────────────┘
                       │
        ┌──────────────▼──────────────────────┐
        │ Frontend (Axios Interceptor)        │
        │ 1. Detecta 401                     │
        │ 2. Obtiene refreshToken del        │
        │    localStorage                    │
        │ 3. POST /auth/refresh              │
        │    {refreshToken}                  │
        │                                    │
        └──────────────┬──────────────────────┘
                       │
        ┌──────────────▼──────────────────────┐
        │ Backend: /auth/refresh              │
        │ 1. Decodifica refreshToken         │
        │ 2. Verifica no esté expirado       │
        │ 3. SELECT FROM refresh_tokens      │
        │    WHERE token = ?                 │
        │ 4. Existe y no expirado? OK        │
        │ 5. SELECT user FROM users          │
        │    WHERE id = (payload.sub)        │
        │ 6. signTokens(user)                │
        │    Genera nuevo accessToken        │
        │ 7. DELETE old refreshToken         │
        │ 8. INSERT new refreshToken         │
        │                                    │
        └──────────────┬──────────────────────┘
                       │
        ┌──────────────▼──────────────────────┐
        │ Retorna: {accessToken: "nuevo..."} │
        └──────────────┬──────────────────────┘
                       │
        ┌──────────────▼──────────────────────┐
        │ Frontend                            │
        │ 1. localStorage.setItem('token',    │
        │     newAccessToken)                │
        │ 2. Reintentar petición original    │
        │    GET /api/dashboard              │
        │    Authorization: Bearer <nuevo>   │
        │                                    │
        └──────────────┬──────────────────────┘
                       │
        ┌──────────────▼──────────────────────┐
        │ Backend                             │
        │ Token es válido (nuevo)            │
        │ Procesa petición normalmente       │
        │ Retorna datos del dashboard        │
        │                                    │
        └──────────────────────────────────────┘
```

#### **Flujo: Refresh Token Expirado (logout forzado)**

```
┌─────────────────────────────────────────────┐
│ Access Token expira                         │
│ Frontend intenta refresh                    │
│ POST /auth/refresh                          │
│ {refreshToken} ← está almacenado pero...    │
│                  ¡expiró hace tiempo!       │
└──────────────────────┬──────────────────────┘
                       │
        ┌──────────────▼────────────────┐
        │ Backend: /auth/refresh        │
        │ 1. jwt.verify(refreshToken)   │
        │    TokenExpiredError           │
        │ 2. Retorna 401                │
        │    {error: INVALID_REFRESH}   │
        │                               │
        └──────────────┬────────────────┘
                       │
        ┌──────────────▼────────────────┐
        │ Frontend                      │
        │ 1. Detecta refresh error      │
        │ 2. clearStorage (tokens)      │
        │ 3. AuthContext.logout()       │
        │ 4. navigate('/login')         │
        │ 5. "Tu sesión expiró"         │
        │                               │
        └───────────────────────────────┘
```

---

## 6. CASOS DE USO COMPLETOS DEL SISTEMA

### 6.1 Caso de Uso: Usuario Nuevo - Registro a Dashboard

```
ACTOR: Usuario nuevo sin cuenta
PRECONDICIÓN: Acceso a sitio público

SECUENCIA:
1. Usuario entra a landing page (/)
2. Lee información sobre la red
3. Haz clic en "Únete a la Red"
4. Navega a /register
5. Ve formulario:
   - Email: usuario@example.com
   - Nombre: Juan Pérez
   - Contraseña: MiPassword123!
   - Motivo: economico
6. Validaciones cliente-side en tiempo real
7. Click "Registrarse"
8. Frontend: axios.post('/auth/register', {...})
9. Backend: 
   - Valida datos (Zod)
   - Hash de contraseña
   - INSERT en tabla users
   - Build growth plan para "economico"
   - signTokens()
   - Retorna 201 con tokens
10. Frontend:
    - Almacena tokens
    - Actualiza AuthContext
    - navigate('/dashboard')
11. Dashboard carga:
    - GET /api/dashboard (con token)
    - Muestra: nombre, plan personalizado
    - Botones para empezar
12. Usuario ve:
    - Resumen de progreso (0%)
    - Próximos pasos según plan
    - Acceso a módulos

RESULTADO: Usuario registrado, autenticado, con plan personalizado
```

### 6.2 Caso de Uso: Seguimiento de Progreso en Crecimiento

```
ACTOR: Usuario autenticado
PRECONDICIÓN: Usuario con plan de crecimiento asignado

SECUENCIA:
1. Usuario en dashboard
2. Click "Crecimiento"
3. Frontend GET /api/growth/plan/:userId
4. Backend: 
   - Obtiene plan de BD
   - Calcula % completado
   - Retorna pasos y estado
5. Frontend muestra:
   - Plan visual con pasos
   - Estado de cada paso (pendiente/completado)
   - Recursos relacionados
   - Timeline estimado
6. Usuario ve primer paso: "Diagnóstico financiero"
7. Click "Marcar como completado"
8. Frontend PATCH /api/growth/step/:stepId
   {completed_at: "2024-01-25T14:30:00Z"}
9. Backend:
   - Verifica propiedad del paso
   - UPDATE user_progress
   - Recalcula % completado
   - Verifica unlock de recursos
   - Calcula next steps
10. Frontend:
    - Actualiza UI
    - Muestra nuevo %
    - Desbloquea recursos
    - Muestra logro
11. Usuario ve progreso aumentar (5% → 10%)

RESULTADO: Progreso registrado, usuario motivado, recursos desbloqueados
```

### 6.3 Caso de Uso: Solicitud de Mentoría

```
ACTOR: Usuario sin mentor
PRECONDICIÓN: Usuario autenticado, sin mentor actual

SECUENCIA:
1. Usuario en dashboard
2. Click "Mentoría"
3. Backend GET /api/mentoria/:userId
   - Query mentorship table
   - No hay record
4. Frontend muestra: "No tienes mentor asignado"
5. Click "Solicitar Mentoría"
6. Formulario:
   - Área de enfoque (opcional): Finanzas
   - Descripción: "Necesito ayuda con deudas"
7. Submit
8. Frontend POST /api/mentoria/request
   {area: "finanzas", description: "..."}
9. Backend:
   - INSERT en mentorship_requests
   - Marca como "pending"
   - Envía notificación a admins (futuro: email)
   - Retorna requestId
10. Frontend:
    - Muestra "Solicitud enviada"
    - Status: "En espera de asignación"
11. [BACKGROUND - Admin process]
12. Admin ve solicitud en panel /api/admin/mentorships
13. Admin elige mentor disponible
14. Backend POST /api/admin/mentors/assign
    {menteeId, mentorId}
15. Backend:
    - UPDATE mentorship table
    - Cambia status a "active"
    - Notifica al usuario y mentor
16. Frontend (User):
    - Recibe notificación
    - GET /api/mentoria/:userId
    - Muestra perfil del mentor
    - Botón "Agendar reunión"
17. Usuario puede iniciar conversación

RESULTADO: Mentoría activa, relación establecida
```

---

## 7. INSTALACIÓN Y DESPLIEGUE

### 7.1 Desarrollo Local

#### **Requisitos**
- Node.js 18+
- npm 9+
- Git

#### **Instalación Paso a Paso**

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd prototipo-web01

# 2. Backend
cd backend
npm install
cp .env.example .env
# Editar .env con valores locales

# 3. Frontend (nueva terminal)
cd frontend
npm install
cp .env.example .env

# 4. Iniciar backend (terminal 1)
cd backend
npm run dev
# Salida: API listening on port 4000

# 5. Iniciar frontend (terminal 2)
cd frontend
npm run dev
# Salida: VITE v5.4.8 ready in XXX ms
#         ➜ Local: http://localhost:5173
```

#### **Testing Manual**

```bash
# Health check
curl http://localhost:4000/health

# Registrar usuario
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "TestPassword123!",
    "reason": "crecimiento"
  }'

# Abrir http://localhost:5173 en navegador
# Acceder con credenciales registradas
```

### 7.2 Despliegue a Producción (Referencia)

#### **Consideraciones Importantes**

1. **Base de datos:**
   - SQLite para prototipo OK
   - PostgreSQL recomendado para producción
   - Backup automático diario

2. **Seguridad:**
   - JWT_SECRET: mínimo 64 caracteres aleatorios
   - HTTPS obligatorio
   - Rate limiting más estricto
   - CORS solo dominios permitidos
   - Helmet configurado correctamente

3. **Variables de Entorno (Producción)**

```env
# Server
NODE_ENV=production
PORT=4000

# Database
DATABASE_PATH=/var/lib/app/app.db

# Security
JWT_SECRET=<generar-con-crypto-random-64chars>
JWT_EXPIRES_IN=15m
REFRESH_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=https://plataforma.example.com,https://api.example.com

# Email
SMTP_HOST=smtp.SendGrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<sendgrid-api-key>

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/app/server.log
```

4. **Build y Deploy**

```bash
# Compilar TypeScript
npm run build

# Iniciar servidor
NODE_ENV=production npm start

# O usar PM2 para manage process:
pm2 start dist/index.js --name "prototipo-api"
pm2 save
```

---

## 8. TROUBLESHOOTING

### Problema: "CORS error"

**Síntoma:** Frontend no puede comunicarse con backend

**Solución:**
1. Verifica CORS está habilitado en index.ts
2. Comprueba que ALLOWED_ORIGINS incluye localhost
3. Reinicia servidor backend

### Problema: "Token inválido/expirado"

**Síntoma:** Usuario autenticado pero peticiones fallan

**Solución:**
1. Limpia localStorage en navegador (DevTools > Application)
2. Reinicia sesión
3. Verifica JWT_SECRET en .env es consistente

### Problema: "Base de datos bloqueada"

**Síntoma:** Error "database is locked"

**Solución:**
1. SQLite tiene limitaciones de concurrencia
2. Asegúrate solo un proceso accede a BD
3. Para producción, migra a PostgreSQL

### Problema: "Contraseña no válida al registrar"

**Síntoma:** Formulario rechaza contraseña

**Solución:**
La contraseña debe tener:
- Mínimo 10 caracteres
- Al menos un número (0-9)
- Al menos una mayúscula (A-Z, Á-Ú, Ñ)
- Al menos una minúscula (a-z, á-ú, ñ)
- Al menos un símbolo (!@#$%^&*._+-)

Ejemplo válido: `MiPassword123!`

---

