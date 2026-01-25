# DIAGRAMAS TÉCNICOS Y VISUALIZACIÓN
## Plataforma Integral de Desarrollo para Hombres - Prototipo Web 01

---

## 📐 DIAGRAMAS DE SISTEMA

### 1. Diagrama de Componentes General

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE WEB (NAVEGADOR)                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              APLICACIÓN REACT                         │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ Pages (Componentes de Página)                 │  │  │
│  │  │ ├─ Landing, Login, Register                   │  │  │
│  │  │ ├─ Dashboard, Crecimiento, Recursos           │  │  │
│  │  │ ├─ Comunidad, Mentoría, Mi Progreso          │  │  │
│  │  │ ├─ Oración, Perfil, Administración           │  │  │
│  │  │ └─ 20+ páginas más                           │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ Components (Componentes Reutilizables)       │  │  │
│  │  │ ├─ Navbar, Footer, Sidebar                   │  │  │
│  │  │ ├─ ProtectedRoute, AuthGuard                 │  │  │
│  │  │ ├─ Cards, Modals, Forms                      │  │  │
│  │  │ └─ UI utilities                              │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ Context (Estado Global)                       │  │  │
│  │  │ └─ AuthContext (user, isAuth, token, logout) │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ Services (Comunicación HTTP)                  │  │  │
│  │  │ └─ axios con interceptores para tokens        │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ Router (Navegación)                          │  │  │
│  │  │ └─ React Router v6                           │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTP/HTTPS
                       │ JSON
                       │ req: {auth, data}
                       │ res: {data, error}
                       ↓
┌──────────────────────────────────────────────────────────────┐
│                    SERVIDOR (Node.js)                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Middleware Stack (Express)                          │  │
│  │  ├─ cors() → Permite requests desde Frontend        │  │
│  │  ├─ helmet() → Headers de seguridad                │  │
│  │  ├─ express.json() → Parsear JSON bodies           │  │
│  │  └─ rateLimit() → 100 req/min por IP               │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ↓                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Router Handler (Express Routes)                     │  │
│  │  ├─ /auth (register, login, refresh)               │  │
│  │  ├─ /api/dashboard (personalizado)                 │  │
│  │  ├─ /api/growth (planes)                           │  │
│  │  ├─ /api/mentoria (acompañamiento)                 │  │
│  │  ├─ /api/progress (seguimiento)                    │  │
│  │  ├─ /api/resources (biblioteca)                    │  │
│  │  ├─ /api/community (comunidad)                     │  │
│  │  └─ /api/admin (administración)                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Middleware de Validación                            │  │
│  │  ├─ requireAuth (verificar token)                   │  │
│  │  ├─ requireRole (verificar permisos)                │  │
│  │  └─ validateBody (Zod schemas)                      │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ↓                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Service Layer (Lógica de Negocio)                  │  │
│  │  ├─ UserService (create, verify, update)           │  │
│  │  ├─ TokenService (signTokens, verifyToken)         │  │
│  │  ├─ GrowthService (buildPlan, updateProgress)      │  │
│  │  ├─ MentorService (assignMentor, matchUsers)       │  │
│  │  └─ CommunityService (posts, comments, trending)   │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ↓                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Data Access Layer (Modelos)                         │  │
│  │  ├─ User.ts (CRUD operations)                       │  │
│  │  ├─ RefreshToken.ts (token management)              │  │
│  │  ├─ Growth.ts (planes personalizados)               │  │
│  │  ├─ Mentorship.ts (relaciones mentor-mentee)        │  │
│  │  └─ Progress.ts (tracking de actividades)           │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                           │ SQL
                           │ INSERT/SELECT/UPDATE
                           ↓
┌──────────────────────────────────────────────────────────────┐
│              BASE DE DATOS (SQLite)                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Tablas:                                                     │
│  ├─ users (id, email, password_hash, roles, ...)           │
│  ├─ refresh_tokens (token, user_id, expires_at)            │
│  ├─ user_progress (user_id, step_id, completed_at)         │
│  ├─ growth_plan_templates (reason, steps, resources)        │
│  ├─ mentorship (mentor_id, mentee_id, status)              │
│  ├─ prayer_requests (title, description, likes)            │
│  ├─ community_posts (user_id, content, likes, comments)    │
│  ├─ enrollments (user_id, course_id, progress)             │
│  └─ courses (title, description, content, resources)       │
│                                                               │
│  Índices:                                                    │
│  ├─ users(email)                                            │
│  ├─ user_progress(user_id)                                  │
│  ├─ mentorship(mentor_id, mentee_id)                       │
│  └─ community_posts(user_id, created_at)                   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔐 Diagrama de Flujo de Autenticación

```
┌────────────────────────────────────────────────────────────────────────────┐
│                     PROCESO DE AUTENTICACIÓN COMPLETO                       │
└────────────────────────────────────────────────────────────────────────────┘

ESCENARIO 1: REGISTRO NUEVO
─────────────────────────────

Usuario → Landing → "Únete" → /register
                    ↓
            [Formulario React]
            ├─ Email input
            ├─ Name input
            ├─ Password input (validaciones cliente)
            └─ Reason select
                    ↓
            Cliente valida (Zod)
            ├─ Email formato válido
            ├─ Name 2+ caracteres
            ├─ Password 10+ chars, 1 número, 1 mayúscula, 1 minúscula, 1 símbolo
            └─ Reason enum válido
                    ↓
            ✓ OK → POST /auth/register
                    │
                    │ Body: {email, name, password, reason}
                    │ Headers: Content-Type: application/json
                    ↓
        [Servidor - Express Handler]
        1. Zod validate body
           ├─ Valid? → Continúa
           └─ Invalid? → 400 {error, issues}
        2. UserStore.create(email, name, password, phone?, reason?)
           ├─ SELECT * FROM users WHERE email = ?
           ├─ Email existe? → 409 EMAIL_EXISTS
           └─ No existe:
              ├─ Hash password (bcrypt, 10 rounds)
              ├─ Generate UUID para id
              ├─ INSERT en users table
              ├─ buildGrowthSteps(reason)
              │  └─ SELECT plantillas FROM growth_plan_templates
              ├─ INSERT growth_plan rows para usuario
              └─ Retorna User object
        3. signTokens(user)
           ├─ Access token (exp: 15min)
           │  ├─ Payload: {sub, email, roles, type: 'access', iat, exp}
           │  └─ Sign con JWT_SECRET
           └─ Refresh token (exp: 7days)
              ├─ Generate UUID único
              ├─ Payload: {sub, type: 'refresh', iat, exp}
              ├─ Sign con JWT_SECRET
              ├─ INSERT en refresh_tokens table
              └─ Retorna token string
        4. Return 201
           {
             "user": {id, email, name, roles},
             "accessToken": "eyJhbGc...",
             "refreshToken": "eyJhbGc..."
           }
                    ↓
        [Cliente - React]
        localStorage.setItem('token', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        AuthContext.setUser(user)
        AuthContext.setIsAuthenticated(true)
        navigate('/dashboard')
                    ↓
        Dashboard carga automáticamente ✓


ESCENARIO 2: LOGIN EXISTENTE
───────────────────────────────

Usuario en /login
        ↓
    [Form React]
    ├─ Email input
    └─ Password input
        ↓
    Valida (básico)
        ↓
    POST /auth/login {email, password}
        ↓
    [Servidor]
    1. Zod validate
    2. UserStore.verify(email, password)
       ├─ SELECT * FROM users WHERE email = ?
       ├─ User no existe? → 401 INVALID_CREDENTIALS
       ├─ bcrypt.compare(password, user.passwordHash)
       ├─ No coincide? → 401 INVALID_CREDENTIALS
       └─ Coincide? → Retorna user object
    3. signTokens(user)
    4. DELETE old refresh_tokens
    5. INSERT new refresh_token
    6. Return 200 con tokens
        ↓
    [Cliente]
    localStorage.setItem('token', ...)
    navigate('/dashboard')
        ↓
    ✓ Autenticado


ESCENARIO 3: TOKEN EXPIRA
─────────────────────────────

Mientras usa app:
        ↓
    axios.get('/api/dashboard')
    Header: Authorization: Bearer <accessToken>
        ↓
    [Middleware verificaToken]
    jwt.verify(token, JWT_SECRET)
        │
        ├─ Valid? → Continúa a handler
        │
        └─ TokenExpiredError → 401
                    ↓
    [Cliente Interceptor]
    1. Detecta 401
    2. localStorage.getItem('refreshToken')
    3. POST /auth/refresh {refreshToken}
        ↓
    [Servidor]
    1. jwt.verify(refreshToken, JWT_SECRET)
    2. SELECT FROM refresh_tokens WHERE token = ?
    3. Valida no esté expirado
    4. SELECT user FROM users WHERE id = ?
    5. signTokens(user) → Nuevo accessToken
    6. DELETE old refresh_token
    7. INSERT new refresh_token
    8. Return {accessToken: "nuevo..."}
        ↓
    [Cliente]
    localStorage.setItem('token', newAccessToken)
    Reintentar petición original
        ↓
    ✓ Continúa sesión


ESCENARIO 4: REFRESH TOKEN EXPIRADO
───────────────────────────────────────

Luego de 7 días sin actividad:
        ↓
    accessToken expira
    Intenta refresh
    POST /auth/refresh {refreshToken}
        ↓
    [Servidor]
    1. jwt.verify(refreshToken)
       TokenExpiredError ← ¡Expiró!
    2. Return 401 INVALID_REFRESH
        ↓
    [Cliente]
    1. Detecta error de refresh
    2. localStorage.clear()
    3. AuthContext.logout()
    4. navigate('/login')
    5. Mensaje: "Tu sesión expiró, inicia sesión"
        ↓
    Usuario debe volver a login
```

---

## 📊 Diagrama de Flujo de Datos - Usuario Nuevo

```
┌─────────────────────────────────────────────────────────────┐
│        FLUJO COMPLETO: USUARIO NUEVO → DASHBOARD            │
└─────────────────────────────────────────────────────────────┘

PASO 1: REGISTRO
    [Frontend: /register page]
    Entrada: email, name, password, reason
    ↓
    Validación cliente:
    ├─ Email regex válido?
    ├─ Password fuerte?
    └─ Name long enough?
    ↓
    POST /auth/register
    ↓
    [Backend]
    ├─ Zod parse + validate
    ├─ Hash password (bcrypt)
    ├─ Create user en BD
    ├─ Build growth plan según reason
    ├─ Sign tokens
    └─ Return user + tokens
    ↓
    [Frontend]
    ├─ localStorage.setItem('token', ...)
    ├─ AuthContext.user = response.user
    └─ navigate('/dashboard')

PASO 2: DASHBOARD INITIAL LOAD
    [Frontend: Dashboard.tsx]
    GET /api/dashboard
    Header: Authorization: Bearer <token>
    ↓
    [Middleware]
    ├─ jwt.verify(token)
    └─ Valida no esté expirado
    ↓
    [Backend Handler]
    1. req.user = decoded token payload
    2. SELECT * FROM users WHERE id = ?
    3. SELECT plan FROM user_progress
       WHERE user_id = ? ORDER BY created_at
    4. SELECT COUNT(*) FROM ... (stats)
    5. Return {
         user: {...},
         progressPercentage: 0,
         nextSteps: [],
         recentActivity: [],
         stats: {...}
       }
    ↓
    [Frontend]
    ├─ Renderiza nombre del usuario
    ├─ Muestra 0% de progreso
    ├─ Muestra primeros pasos
    ├─ Botones de acción
    └─ Acceso a módulos

PASO 3: EXPLORAR PLAN DE CRECIMIENTO
    Usuario click "Crecimiento"
    navigate('/crecimiento')
    ↓
    [Frontend: Crecimiento.tsx]
    GET /api/growth/plan/:userId
    ↓
    [Backend]
    1. SELECT * FROM user_progress
       WHERE user_id = ?
       AND growth_step_id IS NOT NULL
    2. SELECT * FROM growth_plan_templates
       WHERE reason = user.reason
    3. Calculate percentage (pasos completados / total)
    4. Return {
         steps: [{...}, ...],
         completedSteps: 0,
         percentage: 0,
         nextStep: {...}
       }
    ↓
    [Frontend]
    ├─ Renderiza lista de pasos
    ├─ Marcar visual de completados
    ├─ Mostrar descripción de cada paso
    ├─ Links a recursos
    └─ Botón "Marcar completado"

PASO 4: COMPLETAR PRIMER PASO
    Usuario hace actividad
    ↓
    [Frontend]
    Usuario click "Marcar completado"
    PATCH /api/growth/step/:stepId
    Body: {completed_at: new Date().toISOString()}
    ↓
    [Backend]
    1. Verify user owns step
    2. UPDATE user_progress
       SET completed_at = ?
       WHERE id = ?
    3. SELECT COUNT(*) FROM user_progress
       WHERE user_id = ? AND completed_at IS NOT NULL
    4. Calculate new percentage
    5. Return {
         step: {...updated...},
         newPercentage: 5,
         unlockedResources: [...],
         nextStep: {...}
       }
    ↓
    [Frontend]
    ├─ Actualiza visual (step tachado)
    ├─ Muestra nuevo porcentaje (5%)
    ├─ Desbloquea recursos nuevos
    ├─ Celebración/animación
    └─ Motiva a continuar

PASO 5: ACCEDER A RECURSOS
    Usuario explora recursos recomendados
    ↓
    GET /api/resources?category=growth&limit=10
    ↓
    [Backend]
    1. SELECT * FROM resources
       WHERE category LIKE ? 
       AND (public = true OR owner = user.id)
       LIMIT ?
    2. Return [{id, title, type, link, ...}, ...]
    ↓
    [Frontend]
    ├─ Renderiza cards de recursos
    ├─ Cada recurso tiene botón descarga/open
    └─ Registra lectura cuando se accede

PASO 6: SOLICITAR MENTORÍA (opcional)
    Usuario click "Solicitar Mentor"
    navigate('/mentoria')
    ↓
    [Frontend: Check status]
    GET /api/mentoria/:userId
    ↓
    [Backend]
    SELECT * FROM mentorship WHERE mentee_id = ?
    → No existe → Muestra "Solicitar"
    ↓
    Usuario envía solicitud
    POST /api/mentoria/request
    Body: {area: "finanzas", description: "..."}
    ↓
    [Backend]
    1. INSERT INTO mentorship_requests
       (user_id, area, description, status)
    2. Notifica admins (futuro: email)
    3. Return {requestId, status: 'pending'}
    ↓
    [Admin process - background]
    Admin → /admin/mentorships
    → Asigna mentor disponible
    POST /api/admin/mentors/assign
    {menteeId, mentorId}
    ↓
    [Backend]
    1. Verifica disponibilidad mentor
    2. INSERT INTO mentorship
    3. Actualiza notification table
    4. Return success
    ↓
    [Frontend - User notification]
    Recibe notificación de mentor asignado
    GET /api/mentoria/:userId
    → Muestra perfil mentor
    → Botón "Agendar reunión"

PASO 7: PROGRESO VISIBLE
    Usuario vuelve a /dashboard
    ↓
    GET /api/dashboard
    ↓
    Verifica:
    ├─ progressPercentage: 5% (actualizado)
    ├─ completedSteps: 1
    ├─ nextStep: Paso 2
    ├─ mentorStatus: "assigned"
    └─ resourcesUnlocked: 3
    ↓
    [Frontend]
    Renderiza dashboard actualizado
    ├─ Muestra progreso creciente
    ├─ Próximos pasos automáticos
    ├─ Mentor asignado visible
    ├─ Motivación reforzada
    └─ Conexión con comunidad
```

---

## 🎯 Matriz de Autorización (RBAC)

```
┌──────────────────────────────────────────────────────────────┐
│        CONTROL DE ACCESO POR ROL (RBAC)                      │
├──────────────────────────────────────────────────────────────┤

ROLES:
├─ user     (default, todos los nuevos usuarios)
├─ mentor   (puede acompañar a otros usuarios)
└─ admin    (control total del sistema)

MATRIZ DE PERMISOS:
─────────────────────────────────────────────────────────────

RECURSO              │ user │ mentor │ admin
─────────────────────┼──────┼────────┼──────
/dashboard           │  ✓   │   ✓    │   ✓
/crecimiento         │  ✓   │   ✓    │   ✓
/recursos            │  ✓   │   ✓    │   ✓
/comunidad           │  ✓   │   ✓    │   ✓
/mentoria            │  ✓   │   ✓    │   ✓
/profile             │  ✓   │   ✓    │   ✓
/administracion      │  ✗   │   ✗    │   ✓
/mentor/:id          │  ✗   │   ✓    │   ✓

API ENDPOINTS:
─────────────────────────────────────────────────────────────

POST /auth/register         │  ✓   │   ✓    │   ✓   (todos)
POST /auth/login            │  ✓   │   ✓    │   ✓   (todos)
GET  /api/dashboard         │  ✓   │   ✓    │   ✓   (autenticado)
PATCH /api/growth/:stepId   │  ✓   │   ✓    │   ✓   (own step)
POST /api/mentoria/request  │  ✓   │   ✓    │   ✓   (sin mentor)
GET  /api/mentor/mentees    │  ✗   │   ✓    │   ✓   (propios)
GET  /api/admin/users       │  ✗   │   ✗    │   ✓   (admin only)
PATCH /api/admin/users/:id  │  ✗   │   ✗    │   ✓   (admin only)
POST /api/admin/mentors/... │  ✗   │   ✗    │   ✓   (admin only)
GET  /api/admin/stats       │  ✗   │   ✗    │   ✓   (admin only)

EJEMPLO DE MIDDLEWARE:
─────────────────────────────────────────────────────────────

router.post('/admin/users', 
  requireAuth,              // ← Debe estar autenticado
  requireRole('admin'),     // ← Debe ser admin
  validateBody(userSchema), // ← Validar datos
  handler                   // ← Ejecutar lógica
)

Código:
```typescript
const requireRole = (role: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({error: 'UNAUTHORIZED'});
    if (!req.user.roles.includes(role)) {
      return res.status(403).json({error: 'FORBIDDEN'});
    }
    next();
  };
};
```
```

---

## 📈 Diagrama de Escalabilidad

```
┌────────────────────────────────────────────────────────┐
│          ROADMAP DE ESCALABILIDAD                       │
└────────────────────────────────────────────────────────┘

FASE 1: PROTOTIPO (ACTUAL) ✅
═════════════════════════════════════

┌─────────────────────────────────────────────────┐
│  Frontend (Vite)                                │
│  ├─ Single server                              │
│  └─ No caching                                 │
└─────────────┬───────────────────────────────────┘
              │ HTTP
              ↓
┌─────────────────────────────────────────────────┐
│  Backend (Express)                              │
│  ├─ Single Node.js process                     │
│  ├─ SQLite local file                          │
│  └─ No queue system                            │
└─────────────┬───────────────────────────────────┘
              │ SQL
              ↓
┌─────────────────────────────────────────────────┐
│  Data (SQLite)                                  │
│  └─ Single file database                       │
└─────────────────────────────────────────────────┘

Límites: ~100 usuarios concurrentes
         ~1000 usuarios totales
         ~1000 req/min


FASE 2: BETA (PRÓXIMA)
═════════════════════════════════════

┌──────────────────────────────────────────────────┐
│  Frontend (Vite + CDN)                           │
│  ├─ Multi region servers                        │
│  ├─ CloudFlare cache                            │
│  └─ Gzip compression                            │
└──────────────┬────────────────────────────────────┘
               │ HTTP/HTTPS
               ↓
┌──────────────────────────────────────────────────┐
│  Load Balancer (Nginx)                           │
│  └─ Distribuir tráfico                          │
└──────────────┬────────────────────────────────────┘
               │
      ┌────────┼────────┐
      ↓        ↓        ↓
┌──────────┬──────────┬──────────┐
│Backend 1 │Backend 2 │Backend 3 │  (Express cluster)
│ :4001    │ :4002    │ :4003    │
└──────────┴────┬─────┴──────────┘
                │ SQL
                ↓
    ┌───────────────────────┐
    │ PostgreSQL (AWS RDS)  │
    ├─ Master-Slave        │
    ├─ Automated backup    │
    └─ Point-in-time restore
    
Additional:
├─ Redis (caching layer)
├─ Bull (job queue)
├─ SES (email service)
└─ S3 (file storage)

Límites: ~10,000 usuarios concurrentes
         ~50,000 usuarios totales
         ~50,000 req/min


FASE 3: PRODUCCIÓN (FUTURO)
═════════════════════════════════════

                  ┌─────────────────────┐
                  │  Global CDN         │
                  │  Edge locations     │
                  └────────────┬────────┘
                               │
                    ┌──────────┼──────────┐
                    ↓          ↓          ↓
            ┌───────────┐ ┌───────────┐ ┌──────────┐
            │  AWS US   │ │  AWS EU   │ │ AWS Asia │
            │  Region   │ │  Region   │ │ Region   │
            └─────┬─────┘ └─────┬─────┘ └────┬─────┘
                  │             │            │
                  ├─ LB + Autoscale Groups
                  ├─ Express clusters (4+ nodes cada región)
                  │
            ┌─────┴──────────────────┴──────────────┐
            │   PostgreSQL Multi-Region             │
            ├─ Master (primary region)              │
            ├─ Read replicas (otros regions)        │
            └─ Cross-region failover
            
            ┌─────────────────────────────────────┐
            │  Supporting Services                │
            ├─ Redis Cluster (caching)            │
            ├─ RabbitMQ / Kafka (messaging)       │
            ├─ Elasticsearch (search)              │
            ├─ CloudFront / Cloudflare (CDN)      │
            ├─ Lambda (serverless tasks)          │
            ├─ SNS/SES (notifications)            │
            ├─ S3 (storage)                       │
            ├─ CloudWatch (monitoring)            │
            ├─ DataDog / New Relic (APM)          │
            └─ WAF (DDoS protection)

Límites: >100,000 usuarios concurrentes
         >1,000,000 usuarios totales
         >500,000 req/min
         Global availability
         99.99% uptime SLA
```

---

## 🔄 Ciclo de Vida de una Petición

```
TIEMPO TOTAL ESTIMADO: 100-500ms

1. CLIENTE ENVÍA PETICIÓN [~10ms]
   ├─ User click → event handler
   ├─ React actualiza estado
   ├─ axios interceptor prepara request
   └─ Añade authorization header
      Authorization: Bearer eyJhbGc...

2. NETWORK TRANSIT [~30-50ms]
   └─ HTTPS handshake (si session nueva)
      TLS 1.3 encryption

3. SERVIDOR RECIBE [~5ms]
   ├─ Express parse body (JSON)
   ├─ Middleware stack
   │  ├─ CORS check (2ms)
   │  ├─ Helmet headers (1ms)
   │  ├─ Rate limit check (5ms)
   │  └─ Body size validate (1ms)
   └─ Router match URL pattern

4. AUTENTICACIÓN [~20-30ms]
   ├─ JWT token extract
   ├─ jwt.verify(token) - cryptographic
   ├─ Decode payload
   └─ Check expiration

5. AUTORIZACIÓN [~5-10ms]
   ├─ Verify user roles
   └─ Check resource permissions

6. VALIDACIÓN [~5-10ms]
   ├─ Zod.parse(body)
   └─ Validate según schema

7. LÓGICA DE NEGOCIO [~50-200ms]
   ├─ QuerySQL user info (20-50ms)
   ├─ Procesar datos (20-100ms)
   ├─ QuerySQL actualizaciones (20-50ms)
   └─ Genera respuesta

8. SERIALIZACIÓN [~5ms]
   └─ JSON.stringify()

9. RESPUESTA [~5-10ms]
   ├─ HTTP headers
   ├─ Body JSON
   └─ Status 200/400/500

10. NETWORK TRANSIT [~30-50ms]
    └─ Transmisión de respuesta

11. CLIENTE RECIBE [~10ms]
    ├─ Response interceptor
    ├─ Parse JSON
    └─ Actualizar estado React

12. RENDER [~20-100ms]
    ├─ Component re-render
    ├─ Virtual DOM diff
    ├─ Actual DOM update
    └─ Browser paint

TIMELINE VISUAL:
═════════════════

[1]→[2]→[3]→[4]→[5]→[6]→[7]→[8]→[9]→[10]→[11]→[12]
 10  40   5  25   8   7  125  5   8   40  10  60

Total: ~100-350ms (normal)
       ~500ms (con latencia de red)
       ~1000ms+ (con query lenta en BD)
```

---

**Fin de Diagramas Técnicos**

Estos diagramas complementan la documentación técnica y proporcionan visualización clara de:
- ✅ Arquitectura del sistema
- ✅ Flujos de autenticación
- ✅ Control de acceso
- ✅ Ciclos de vida de datos
- ✅ Roadmap de escalabilidad
