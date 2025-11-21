import bcrypt from 'bcryptjs';
import db from '../db.js';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  roles: string[];
  createdAt: string;
  phone?: string|null;
  reason?: string|null;
  mentorId?: string|null;
}

const insertStmt = db.prepare(`INSERT INTO users (id,email,name,password_hash,roles,created_at,phone,reason,mentor_id) VALUES (@id,@email,@name,@password_hash,@roles,@created_at,@phone,@reason,@mentor_id)`);
const countUsersStmt = db.prepare(`SELECT COUNT(*) as c FROM users`);
const getByEmailStmt = db.prepare(`SELECT * FROM users WHERE email = ?`);
const getByIdStmt = db.prepare(`SELECT * FROM users WHERE id = ?`);
const listStmt = db.prepare(`SELECT * FROM users ORDER BY created_at DESC`);

function rowToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    roles: row.roles.split(',').filter(Boolean),
    createdAt: row.created_at,
    phone: row.phone || null,
    reason: row.reason || null,
    mentorId: row.mentor_id || null
  };
}

// Construye pasos de crecimiento según el motivo (reason) seleccionado.
// Motivos esperados:
// - economico
// - familia
// - vicio
// - crecimiento (desarrollo personal/espiritual)
// - cambio (cambiar la persona que eres)
interface GrowthStepDef { category: string; title: string; description: string; resources: string[] }
function buildGrowthSteps(reason: string): GrowthStepDef[] {
  // Primero intentar cargar plantillas desde la tabla growth_plan_templates
  try {
    const rows = db.prepare(`SELECT step_order, category, title, description, recommended_resources FROM growth_plan_templates WHERE reason = ? ORDER BY step_order ASC`).all(reason) as Array<{step_order:number;category:string;title:string;description:string;recommended_resources:string|null}>;
    if (rows.length) {
      return rows.map(r => ({
        category: r.category,
        title: r.title,
        description: r.description,
        resources: (r.recommended_resources||'').split(',').filter(Boolean)
      }));
    }
  } catch {}
  switch (reason) {
    case 'economico':
      return [
        { category: 'Diagnóstico', title: 'Evaluación de situación financiera', description: 'Analiza ingresos, gastos y deudas para obtener claridad inicial.', resources: ['recurso:presupuesto-base','articulo:finanzas-biblicas'] },
        { category: 'Fundamentos', title: 'Principios de mayordomía', description: 'Revisa enseñanza sobre administración responsable y generosidad.', resources: ['video:mayordomia','pdf:principios-diezmo'] },
        { category: 'Práctica', title: 'Crear presupuesto mensual', description: 'Elabora presupuesto y define metas de ahorro realistas.', resources: ['template:presupuesto','tool:calculadora-deudas'] },
        { category: 'Optimización', title: 'Reducir gastos no esenciales', description: 'Identifica y elimina compromisos que no alinean con tus valores.', resources: ['lista:gastos-comunes','articulo:frugalidad-intencional'] },
        { category: 'Proyección', title: 'Plan de ahorro e inversión básica', description: 'Establece fondo de emergencia y pasos de inversión prudente.', resources: ['pdf:guia-fondo-emergencia','video:intro-inversion'] }
      ];
    case 'familia':
      return [
        { category: 'Diagnóstico', title: 'Autoevaluación relacional', description: 'Reflexiona sobre comunicación, tiempo de calidad y conflictos.', resources: ['form:autoevaluacion-familia','articulo:escucha-activa'] },
        { category: 'Comunicación', title: 'Prácticas de escucha activa', description: 'Implementa técnicas de validación y empatía en conversaciones clave.', resources: ['video:tecnicas-escucha','pdf:guia-dialogo'] },
        { category: 'Unidad', title: 'Rutina semanal familiar', description: 'Define momentos protegidos: devocional, comida especial, recreación.', resources: ['template:agenda-familiar','articulo:rituales-familia'] },
        { category: 'Resolución', title: 'Procesar conflictos sanamente', description: 'Adopta marco bíblico para confrontación y reconciliación.', resources: ['video:conflicto-biblico','pdf:pasos-perdon'] },
        { category: 'Fortalecimiento', title: 'Proyecto familiar conjunto', description: 'Inicia actividad con metas compartidas (servicio, ahorro, viaje).', resources: ['lista:ideas-proyecto','articulo:servicio-familiar'] }
      ];
    case 'vicio':
      return [
        { category: 'Reconocimiento', title: 'Identificar detonantes', description: 'Lista emociones, contextos y hábitos que preceden la conducta.', resources: ['form:detonantes','articulo:mapa-habitos'] },
        { category: 'Sustitución', title: 'Diseñar rutinas alternativas', description: 'Crea hábitos reemplazo saludables y con propósito.', resources: ['video:habitos-saludables','pdf:plan-sustitucion'] },
        { category: 'Apoyo', title: 'Red de responsabilidad', description: 'Establece mentor y compañero de rendición de cuentas.', resources: ['articulo:responsabilidad','template:acuerdo-responsabilidad'] },
        { category: 'Renovación', title: 'Procesar raíz espiritual', description: 'Integra oración, estudio y confesión en ciclo de sanidad.', resources: ['guia:oracion-libertad','video:identidad-en-Cristo'] },
        { category: 'Seguimiento', title: 'Monitoreo de avances 90 días', description: 'Métricas simples y revisión quincenal con mentor.', resources: ['form:seguimiento-habitos','pdf:bitacora-90-dias'] }
      ];
    case 'crecimiento':
      return [
        { category: 'Fundación', title: 'Establecer disciplinas espirituales', description: 'Define horarios consistentes para oración y lectura.', resources: ['plan:lectura-biblia','video:oracion-discipulos'] },
        { category: 'Identidad', title: 'Afirmar propósito y dones', description: 'Explora talentos y áreas de servicio alineadas a tu llamado.', resources: ['form:inventario-dones','articulo:proposito'] },
        { category: 'Expansión', title: 'Plan de formación continua', description: 'Selecciona cursos trimestrales de desarrollo personal.', resources: ['lista:cursos-base','pdf:plan-trimestral'] },
        { category: 'Servicio', title: 'Involucrarte en una iniciativa', description: 'Aplica dones en proyecto comunitario concreto.', resources: ['articulo:voluntariado','lista:proyectos'] },
        { category: 'Multiplicación', title: 'Mentorear a otro', description: 'Comparte aprendizajes y establece ciclo de retroalimentación.', resources: ['guia:mentoria-basica','video:lider-servicial'] }
      ];
    case 'cambio':
      return [
        { category: 'Autoconciencia', title: 'Reflexión guiada identidad actual', description: 'Escribe fortalezas, debilidades y patrones poco saludables.', resources: ['form:reflexion-identidad','articulo:patrones-cambio'] },
        { category: 'Visión', title: 'Definir identidad deseada', description: 'Formula declaración transformadora y objetivos específicos.', resources: ['template:vision-personal','pdf:objetivos-smart'] },
        { category: 'Hábitos', title: 'Micro-hábitos alineados', description: 'Introduce acciones diarias pequeñas sostenibles.', resources: ['video:microhabitos','lista:ideas-habitos'] },
        { category: 'Refuerzo', title: 'Mecanismos de evaluación semanal', description: 'Plan de revisión corta y ajuste progresivo.', resources: ['form:revision-semanal','pdf:registro-progreso'] },
        { category: 'Consolidación', title: 'Celebrar hitos y ajustar rumbo', description: 'Revisión mensual y ajustes para permanencia del cambio.', resources: ['guia:celebracion-hitos','articulo:perseverancia'] }
      ];
    default:
      return [];
  }
}

export const UserStore = {
  async create(email: string, name: string, password: string, phone?: string, reason?: string): Promise<User> {
    // Normalizar email para evitar problemas de mayúsculas/minúsculas en login
    email = email.trim().toLowerCase();
    const existing = getByEmailStmt.get(email);
    if (existing) throw new Error('EMAIL_EXISTS');
    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    const createdAt = new Date().toISOString();
    // Bootstrap: primer usuario o correo coincide con ADMIN_BOOTSTRAP_EMAIL -> admin
    let rolesArr = ['user'];
    try {
      const total = countUsersStmt.get() as { c: number };
      const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.toLowerCase();
      if (total.c === 0 || (adminEmail && adminEmail === email.toLowerCase())) {
        rolesArr = ['admin','user'];
      }
    } catch {}
    const roles = rolesArr.join(',');
    // Asignación automática de mentor: primer usuario con rol mentor
    let mentorId: string|null = null;
    try {
      const mentorRow = db.prepare(`SELECT id,roles FROM users WHERE roles LIKE '%mentor%' ORDER BY created_at ASC LIMIT 1`).get() as {id:string;roles:string}|undefined;
      if (mentorRow) mentorId = mentorRow.id;
    } catch {}
    insertStmt.run({ id, email, name, password_hash: passwordHash, roles, created_at: createdAt, phone: phone ?? null, reason: reason ?? null, mentor_id: mentorId });
    try {
      db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), id, 'user_created', id, createdAt);
    } catch {}
    // Generar plan de crecimiento basado en reason
    try {
      if (reason) {
        const steps = buildGrowthSteps(reason);
        const ins = db.prepare(`INSERT INTO growth_plan_steps (id,user_id,step_order,category,title,description,recommended_resources,created_at) VALUES (?,?,?,?,?,?,?,?)`);
        const tx = db.transaction((arr: any[]) => {
          arr.forEach((s, idx) => ins.run(crypto.randomUUID(), id, idx + 1, s.category, s.title, s.description, s.resources.join(','), createdAt));
        });
        tx(steps);
        db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), id, 'user_growth_plan_generated', id, createdAt);
      }
    } catch {}
    return { id, email, name, passwordHash, roles: rolesArr, createdAt, phone: phone ?? null, reason: reason ?? null, mentorId };
  },
  async verify(email: string, password: string): Promise<User | null> {
    // Normalizar antes de buscar
    email = email.trim().toLowerCase();
    const row = getByEmailStmt.get(email) as any;
    if (!row) return null;
    const ok = await bcrypt.compare(password, row.password_hash);
    return ok ? rowToUser(row) : null;
  },
  async getById(id: string): Promise<User | undefined> {
    const row = getByIdStmt.get(id);
    return row ? rowToUser(row) : undefined;
  },
  async list(): Promise<User[]> {
    return listStmt.all().map(rowToUser);
  }
};
