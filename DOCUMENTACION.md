# DOCUMENTACIÓN TÉCNICA Y DE USUARIO
## Plataforma Integral de Desarrollo para Hombres - Prototipo Web 01

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Documentación del Frontend](#documentación-del-frontend)
3. [Documentación del Backend](#documentación-del-backend)
4. [Guía de Usuario](#guía-de-usuario)
5. [Arquitectura y Flujos](#arquitectura-y-flujos)
6. [Instalación y Despliegue](#instalación-y-despliegue)

---

# RESUMEN EJECUTIVO

## 🎯 Visión General del Proyecto

**Prototipo Web 01** es una plataforma web integral diseñada para apoyar el desarrollo holístico de hombres en contextos cristianos, abordando aspectos espirituales, emocionales, financieros y comunitarios.

### Objetivos Principales
- Proporcionar acceso a recursos educativos y espirituales de calidad
- Facilitar mentorías y relaciones de acompañamiento
- Crear comunidades de apoyo y crecimiento mutuo
- Ofrecer herramientas de autoevaluación y seguimiento del progreso personal
- Conectar a hombres en diferentes sedes y contextos

### Público Objetivo
- Hombres adultos en comunidades cristianas
- Participantes en programas de desarrollo personal
- Mentores y facilitadores de grupos de crecimiento
- Administradores de la plataforma

---

# DOCUMENTACIÓN DEL FRONTEND

## 1. DESCRIPCIÓN TÉCNICA DEL FRONTEND

### 1.1 Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|----------|
| **React** | 18.3.1 | Framework de interfaz de usuario |
| **TypeScript** | 5.4.2 | Lenguaje tipado para JavaScript |
| **Vite** | 5.4.8 | Bundler y servidor de desarrollo |
| **React Router DOM** | 6.26.2 | Enrutamiento y navegación |
| **Tailwind CSS** | 3.4.13 | Framework de estilos CSS utilitario |
| **Axios** | 1.7.7 | Cliente HTTP para comunicación con backend |
| **PostCSS** | 8.4.47 | Procesador de CSS |
| **AutoPrefixer** | 10.4.20 | Compatibilidad de prefijos CSS |

### 1.2 Requisitos Técnicos

**Requisitos de Desarrollo:**
- Node.js 18.x o superior
- npm 9.x o superior
- Git

**Requisitos de Navegador:**
- Chrome/Edge: versiones actuales
- Firefox: versiones actuales
- Safari: versiones actuales
- Dispositivos móviles: iOS Safari 12+, Chrome Android

**Requisitos de Hardware:**
- Resolución mínima: 320px (móvil)
- RAM: 512MB (navegador)

### 1.3 Estructura de Directorios

```
frontend/
├── src/
│   ├── components/           # Componentes reutilizables
│   │   ├── Footer.tsx        # Pie de página
│   │   ├── Navbar.tsx        # Barra de navegación
│   │   ├── IntranetLayout.tsx # Layout para sección privada
│   │   ├── ProtectedRoute.tsx # Enrutador protegido por autenticación
│   │   ├── ScrollToTop.tsx   # Auto-scroll al cambiar ruta
│   │   └── ui/               # Componentes UI reutilizables
│   ├── pages/                # Páginas/vistas principales
│   │   ├── App.tsx           # Componente raíz y enrutamiento
│   │   ├── Landing.tsx       # Página de inicio pública
│   │   ├── Login.tsx         # Página de autenticación
│   │   ├── Register.tsx      # Página de registro
│   │   ├── Dashboard.tsx     # Panel de control personal
│   │   ├── Mentoria.tsx      # Módulo de mentoría
│   │   ├── Cursos.tsx        # Cursos disponibles
│   │   ├── Eventos.tsx       # Eventos y encuentros
│   │   ├── Comunidad.tsx     # Espacios de comunidad
│   │   ├── Recursos.tsx      # Biblioteca de recursos
│   │   ├── Oracion.tsx       # Espacio de oración
│   │   ├── MiProgreso.tsx    # Seguimiento de progreso
│   │   ├── Crecimiento.tsx   # Planes de crecimiento
│   │   ├── Profile.tsx       # Perfil de usuario
│   │   └── Administracion.tsx # Panel de administración
│   ├── context/              # Context API para estado global
│   │   └── AuthContext.tsx   # Contexto de autenticación
│   ├── hooks/                # Custom hooks
│   ├── services/             # Servicios API
│   ├── styles/               # Estilos globales
│   ├── data/                 # Datos estáticos y constantes
│   └── main.tsx              # Punto de entrada
├── public/                   # Archivos estáticos
├── vite.config.ts           # Configuración de Vite
├── tailwind.config.cjs      # Configuración de Tailwind
├── tsconfig.json            # Configuración de TypeScript
└── package.json             # Dependencias y scripts

```

### 1.4 Componentes Principales

#### **Navbar Component**
- **Responsabilidad:** Barra de navegación principal
- **Props:** Dinámicos basados en autenticación
- **Características:**
  - Links a secciones públicas
  - Links a dashboard para usuarios autenticados
  - Menú de usuario con opciones de perfil y logout
  - Responsive en móvil con menú hamburguesa

#### **IntranetLayout Component**
- **Responsabilidad:** Layout para la sección privada (dashboard)
- **Características:**
  - Sidebar con navegación
  - Menu lateral para módulos de usuario
  - Estructura de dos columnas
  - Responsive collapse del sidebar en móvil

#### **ProtectedRoute Component**
- **Responsabilidad:** Proteger rutas que requieren autenticación
- **Lógica:** 
  - Verifica estado de autenticación
  - Redirige a login si no está autenticado
  - Carga componente hijo si está autenticado

#### **AuthContext**
- **Responsabilidad:** Gestión de estado global de autenticación
- **Métodos principales:**
  - `login(email, password)` - Autenticación de usuario
  - `register(data)` - Registro de nuevo usuario
  - `logout()` - Cierre de sesión
  - `refreshToken()` - Renovación de token
- **Estado:**
  - `user` - Datos del usuario actual
  - `isAuthenticated` - Booleano de autenticación
  - `loading` - Estado de carga
  - `token` - JWT token actual

### 1.5 Páginas Principales y Sus Funciones

#### **Landing Page**
- **URL:** `/`
- **Visibilidad:** Pública
- **Descripción:** 
  - Página de bienvenida
  - Información sobre la plataforma
  - Calls-to-action para registro y login
  - Testimonios y beneficios

#### **Login**
- **URL:** `/login`
- **Visibilidad:** Pública
- **Funciones:**
  - Autenticación de usuario registrado
  - Validación de credenciales
  - Redirección a dashboard post-login

#### **Register**
- **URL:** `/register`
- **Visibilidad:** Pública
- **Funciones:**
  - Registro de nuevo usuario
  - Validación de email único
  - Requerimiento de contraseña fuerte
  - Captura de información de contexto (motivo del join)

#### **Dashboard**
- **URL:** `/dashboard`
- **Visibilidad:** Privada (autenticado)
- **Funciones:**
  - Panel de control personalizado
  - Resumen de actividad
  - Acceso rápido a módulos principales
  - Recomendaciones personalizadas

#### **Mentoria**
- **URL:** `/mentoria`
- **Visibilidad:** Privada
- **Funciones:**
  - Vista del mentor asignado
  - Historial de conversaciones
  - Solicitud de mentoría
  - Calendario de reuniones

#### **Cursos Hombría**
- **URL:** `/cursos-hombria`
- **Visibilidad:** Pública/Privada (contenido)
- **Funciones:**
  - Listado de cursos disponibles
  - Descripción detallada
  - Matriculación en cursos
  - Progreso de cursos

#### **Recursos**
- **URL:** `/recursos`
- **Visibilidad:** Privada
- **Funciones:**
  - Biblioteca de materiales
  - Búsqueda de recursos
  - Descarga de documentos
  - Categorización (escrituras, artículos, videos)

#### **Comunidad**
- **URL:** `/comunidad`
- **Visibilidad:** Privada
- **Funciones:**
  - Foro de discusión
  - Grupos de interés
  - Perfil de miembros
  - Conexiones entre usuarios

#### **Mi Progreso**
- **URL:** `/miprogreso`
- **Visibilidad:** Privada
- **Funciones:**
  - Seguimiento de objetivos personales
  - Gráficas de avance
  - Historial de logros
  - Métricas personalizadas

#### **Crecimiento**
- **URL:** `/crecimiento`
- **Visibilidad:** Privada
- **Funciones:**
  - Planes de crecimiento personalizados
  - Pasos según contexto (financiero, familiar, vicios, espiritual)
  - Recomendaciones de recursos
  - Seguimiento de objetivos

---

## 2. GUÍA DE USUARIO - FRONTEND

### 2.1 Primeros Pasos

#### **Registro de Nueva Cuenta**

**Paso 1: Acceder a la página de registro**
- En la página de inicio, haz clic en "Únete a la Red" o "Registrarse"
- O navega directamente a `/register`

**Paso 2: Completar el formulario**
```
Campos requeridos:
├── Email: correo electrónico válido único
├── Nombre completo: mínimo 2 caracteres
├── Contraseña: 
│   ├── Mínimo 10 caracteres
│   ├── Debe incluir número
│   ├── Debe incluir mayúscula
│   ├── Debe incluir minúscula
│   └── Debe incluir símbolo (!@#$%^&*._+-)
└── Motivo de unirse (opcional):
    ├── Económico
    ├── Familia
    ├── Vicios
    ├── Crecimiento personal
    └── Cambio de vida
```

**Paso 3: Validación de datos**
- El sistema verificará que el email no esté registrado
- La contraseña será validada según los criterios indicados
- Recibirás confirmación si todo está correcto

**Paso 4: Inicio de sesión automático**
- Serás redirigido automáticamente al dashboard
- Tu sesión se activará con el token JWT

#### **Inicio de Sesión**

**Acceso a la plataforma:**
1. Navega a `/login` o haz clic en "Acceder"
2. Ingresa tu email y contraseña
3. Haz clic en "Entrar"
4. Serás redirigido al dashboard

**Si olvidas tu contraseña:**
- Aún no disponible (en desarrollo)
- Contacta al administrador

### 2.2 Navegación y Estructura de la Interfaz

#### **Barra de Navegación (Navbar)**

**Sección Pública:**
- **Logo/Inicio** - Regresa a landing page
- **La Red** - Información sobre la comunidad
- **Enseñanzas** - Contenido educativo
- **Cursos Hombría** - Catálogo de cursos
- **Materiales** - Recursos descargables
- **Conferencias** - Eventos y charlas
- **Encuentros** - Actividades presenciales
- **Sedes** - Ubicaciones de la red
- **Acceder/Registrar** - Links de autenticación

**Sección Privada (Intranet):**
- Se reemplaza con barra lateral (sidebar)
- Menu de módulos principales
- Información del usuario
- Botón de logout

### 2.3 Flujos de Usuarios Principales

#### **Flujo 1: Descubrimiento → Registro → Primer Acceso**

```
Landing Page
    ↓
Lee información sobre la red
    ↓
Haz clic en "Únete"
    ↓
Completa formulario de registro
    ↓
El sistema crea tu cuenta
    ↓
Eres redirigido al Dashboard
    ↓
Se asigna plan de crecimiento según tu contexto
```

#### **Flujo 2: Acceso a Recursos Educativos**

```
Landing Page
    ↓
Navega a "Cursos Hombría" o "Enseñanzas"
    ↓
Visualiza lista de contenidos disponibles
    ↓
¿Está autenticado?
├─ No: Le pide login para acceder a contenido premium
└─ Sí: Abre el contenido y registra acceso
    ↓
Lee/Ve el contenido
    ↓
Puede descargar materiales relacionados
    ↓
Sistema registra progreso
```

#### **Flujo 3: Seguimiento de Progreso Personal**

```
Dashboard
    ↓
Haz clic en "Mi Progreso"
    ↓
Visualiza plan de crecimiento personalizado
    ↓
Marca tareas completadas
    ↓
Actualiza objetivos personales
    ↓
Sistema calcula porcentaje de avance
    ↓
Puedes ver gráficas de evolución temporal
```

#### **Flujo 4: Buscar Mentoria**

```
Dashboard
    ↓
Navega a "Mentoría"
    ↓
¿Tienes mentor asignado?
├─ Sí: 
│   ├─ Ver perfil del mentor
│   ├─ Historial de conversaciones
│   ├─ Programar reunión
│   └─ Enviar mensaje
└─ No:
    ├─ Solicitar mentoría
    ├─ Seleccionar área (opcional)
    └─ Esperar asignación
```

### 2.4 Descripción de Módulos

#### **A. Dashboard**

**¿Qué verás?**
- Saludo personalizado con tu nombre
- Resumen de progreso general (%)
- Objetivos activos
- Próximas actividades
- Recomendaciones personalizadas
- Acceso rápido a módulos

**Acciones disponibles:**
- Ir a "Mi Progreso" para detalles
- Acceder a cualquier módulo del sidebar
- Actualizar perfil

#### **B. Crecimiento Personalizado**

**¿Qué es?**
Plan customizado basado en tu contexto (motivo de unirse). 

**Categorías de planes:**

| Contexto | Pasos | Objetivo |
|----------|-------|----------|
| **Económico** | Diagnóstico financiero, presupuesto, ingresos, ahorro | Libertad y estabilidad financiera |
| **Familia** | Relaciones base, comunicación, liderazgo familiar | Relaciones familiares saludables |
| **Vicios** | Reconocimiento, desintoxicación, apoyo, reconstrucción | Libertad y sanidad emocional |
| **Crecimiento** | Autoconocimiento, desarrollo espiritual, liderazgo | Madurez integral |
| **Cambio de Vida** | Evaluación holística, plan integral, accountability | Transformación personal |

**¿Cómo usarlo?**
1. Entra a "Crecimiento"
2. Visualiza tu plan personalizado
3. Cada paso tiene:
   - Descripción de la tarea
   - Recursos recomendados
   - Timeline estimado
4. Marca pasos como completados
5. El sistema rastrea tu progreso

#### **C. Recursos**

**Tipos de recursos:**
- Artículos de blog
- Videos educativos
- Libros electrónicos
- Worksheets descargables
- Escrituras bíblicas comentadas

**Búsqueda:**
- Por categoría
- Por tema
- Por autor
- Ordenado por relevancia

#### **D. Comunidad**

**Características:**
- Foro de discusión categorizado
- Grupos de interés (ej: grupo de hombres de 30-40 años)
- Perfiles públicos de miembros
- Capacidad de conectar con otros

**Espacios principales:**
- Presentaciones (introduce tu historia)
- Preguntas y respuestas
- Compartir testimonios
- Búsqueda de mentores
- Grupos por edad/contexto

#### **E. Oraciones**

**Funcionalidades:**
- Compartir peticiones de oración
- Orar por otros usuarios
- Historial de oraciones
- Testimonios de respuestas
- Recordatorios de oración

#### **F. Mi Progreso**

**Métricas mostradas:**
- Porcentaje de plan completado
- Cursos finalizados
- Recursos consultados
- Días activo en plataforma
- Objetivos alcanzados

**Visualizaciones:**
- Gráfica de progreso mensual
- Timeline de logros
- Comparativa con objetivo inicial

#### **G. Perfil de Usuario**

**Información editable:**
- Nombre completo
- Email (no editable)
- Foto de perfil
- Biografía personal
- Área de interés principal
- Localidad/Sede

**Información de cuenta:**
- Fecha de registro
- Última conexión
- Estado de suscripción (futuro)
- Preferencias de notificaciones

### 2.5 Solución de Problemas

| Problema | Solución |
|----------|----------|
| No puedo registrarme | Verifica email válido único, contraseña fuerte (10+ caracteres, número, mayúscula, minúscula, símbolo) |
| Olvide mi contraseña | Contacta al administrador (función en desarrollo) |
| No puedo ver contenido | Asegúrate de estar autenticado. Algunos contenidos requieren autenticación |
| Dashboard no carga | Recarga la página (F5). Si persiste, limpia cookies y vuelve a login |
| Problema en móvil | Asegúrate de usar navegador moderno. Intenta viewport en landscape |

---

## 3. FLUJOS DE LA INTERFAZ DE USUARIO

### 3.1 Mapa de Navegación Completo

```
ROOT (/)
├── Public Pages
│   ├── Landing (/)
│   ├── La Red (/red)
│   ├── Enseñanzas (/ensenanzas)
│   ├── Cursos Hombría (/cursos-hombria)
│   ├── Materiales (/materiales)
│   ├── Conferencias (/conferencias)
│   ├── Encuentros (/encuentros)
│   ├── Sedes (/sedes)
│   ├── Login (/login)
│   └── Register (/register)
└── Protected Pages (requieren autenticación)
    ├── Dashboard (/dashboard)
    ├── Mentoria (/mentoria)
    ├── Oracion (/oracion)
    ├── Recursos (/recursos)
    ├── Comunidad (/comunidad)
    ├── Mi Progreso (/miprogreso)
    ├── Crecimiento (/crecimiento)
    ├── Profile (/profile)
    ├── Administración (/administracion)
    └── Mentor - Mentees (/mentor)
```

### 3.2 Flujos de Autenticación

```
FLUJO DE REGISTRO:
┌─────────────────────────────────┐
│   Usuario en Landing Page       │
└────────┬────────────────────────┘
         │ Clic en "Únete"
         ↓
┌─────────────────────────────────┐
│   Página de Registro            │
│   - Email                       │
│   - Nombre                      │
│   - Contraseña (validación)     │
│   - Motivo de unirse            │
└────────┬────────────────────────┘
         │ Submit form
         ↓
┌─────────────────────────────────┐
│   Backend: Validación de datos  │
│   - Email único?                │
│   - Contraseña fuerte?          │
│   - Datos completos?            │
└────────┬────────────────────────┘
         │
         ├─ Error: Mostrar validación
         │         (user reintentar)
         │
         └─ Éxito: Hash contraseña,
                  crear usuario,
                  asignar plan de crecimiento
                  ↓
         ┌─────────────────────────────────┐
         │ Generar tokens (JWT)            │
         │ - Access Token (15 min)         │
         │ - Refresh Token (7 días)        │
         └────────┬────────────────────────┘
                  │ Guardar tokens en localStorage
                  │ (Access) y localStorage (Refresh)
                  ↓
         ┌─────────────────────────────────┐
         │ Frontend: AuthContext actualiza │
         │ - user = datos del usuario      │
         │ - isAuthenticated = true        │
         │ - token guardado                │
         └────────┬────────────────────────┘
                  │ Redirige a /dashboard
                  ↓
         ┌─────────────────────────────────┐
         │ Dashboard cargado               │
         │ Usuario completó registro       │
         └─────────────────────────────────┘


FLUJO DE LOGIN:
┌─────────────────────────────────┐
│   Usuario en Landing            │
└────────┬────────────────────────┘
         │ Clic "Acceder"
         ↓
┌─────────────────────────────────┐
│   Página de Login               │
│   - Email                       │
│   - Contraseña                  │
└────────┬────────────────────────┘
         │ Submit form
         ↓
┌─────────────────────────────────┐
│   Backend: Verifica credenciales│
│   1. Email existe?              │
│   2. Hash coincide?             │
└────────┬────────────────────────┘
         │
         ├─ Error: Credenciales inválidas
         │         → Mostrar error al user
         │
         └─ Éxito: Generar tokens
                  → User redirigido a /dashboard
         

FLUJO DE REFRESH TOKEN:
┌─────────────────────────────────┐
│   Access Token caducado (15 min)│
└────────┬────────────────────────┘
         │ Frontend detecta expiración
         │ Intenta usar refresh token
         ↓
┌─────────────────────────────────┐
│   Backend: POST /auth/refresh   │
│   - Valida refresh token        │
│   - Existe en DB?               │
│   - No caducado? (7 días)       │
└────────┬────────────────────────┘
         │
         ├─ Error: Token inválido
         │         → Redirige a login
         │
         └─ Éxito: Emite nuevo access token
                  → Usuario sigue usando app
```

### 3.3 Casos de Uso Principales

#### **Caso de Uso 1: Nuevo Usuario - Onboarding Completo**

**Actor:** Nuevo usuario sin cuenta

**Precondiciones:**
- Usuario no registrado en la plataforma
- Navegador con acceso a internet

**Flujo Principal:**
1. Usuario accede a landing page
2. Lee sobre la plataforma
3. Haz clic en "Únete a la Red"
4. Ve formulario de registro
5. Ingresa email, nombre, contraseña (validada), motivo
6. Sistema valida datos únicos (email)
7. Sistema crea cuenta en BD
8. Sistema asigna plan de crecimiento según motivo
9. Sistema genera JWT tokens
10. Frontend redirige a dashboard
11. Usuario ve plan personalizado
12. Usuario completa su perfil

**Postcondiciones:**
- Usuario registrado y autenticado
- Plan de crecimiento asignado
- Puede acceder a todas las secciones privadas

#### **Caso de Uso 2: Usuario Existente - Acceso a Cursos**

**Actor:** Usuario autenticado

**Precondiciones:**
- Usuario registrado
- Usuario autenticado en la plataforma

**Flujo Principal:**
1. Usuario en dashboard
2. Navega a "Cursos Hombría"
3. Ve listado de cursos disponibles
4. Selecciona un curso de interés
5. Lee descripción, duración, requisitos
6. Hace clic en "Matricularse"
7. Sistema registra matriculación
8. Curso aparece en "Mis Cursos"
9. Usuario accede al primer módulo
10. Sistema registra tiempo de lectura/visualización
11. Usuario marca módulo como completado
12. Sistema actualiza progreso

**Postcondiciones:**
- Usuario matriculado en curso
- Progreso registrado en BD
- Mi Progreso se actualiza

#### **Caso de Uso 3: Solicitud de Mentoría**

**Actor:** Usuario sin mentor asignado

**Precondiciones:**
- Usuario autenticado
- Sin mentor actual

**Flujo Principal:**
1. Usuario en dashboard
2. Navega a "Mentoría"
3. Sistema detecta que no hay mentor
4. Muestra formulario "Solicitar Mentoría"
5. Usuario selecciona áreas de enfoque (opcional)
6. Proporciona descripción breve
7. Submit solicitud
8. Sistema registra solicitud en cola
9. Notifica a administradores
10. Admin asigna mentor disponible
11. Usuario recibe notificación de asignación
12. Puede ver perfil del mentor y agendar primera reunión

**Postcondiciones:**
- Solicitud registrada
- Mentor asignado (cuando esté disponible)
- Pueda comenzar relación de mentoría

#### **Caso de Uso 4: Seguimiento de Progreso**

**Actor:** Usuario autenticado

**Precondiciones:**
- Usuario ha completado al menos una tarea
- Plan de crecimiento asignado

**Flujo Principal:**
1. Usuario en dashboard
2. Navega a "Mi Progreso"
3. Sistema calcula métricas:
   - % Plan completado
   - Cursos finalizados
   - Recursos consultados
   - Días activo
4. Muestra gráfica de avance
5. Muestra timeline de logros
6. Usuario puede ver detalles de cada categoría
7. Puede comparar con progreso anterior (semana, mes, trimestre)
8. Puede establecer nuevos objetivos
9. Sistema guarda nuevos objetivos

**Postcondiciones:**
- Progreso visualizado claramente
- Motivación para continuar
- Objetivos actualizados

---

