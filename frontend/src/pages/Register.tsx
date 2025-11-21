import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface RegisterForm { name:string; email:string; password:string; phone:string; reason:string }
export default function Register() {
  const [form, setForm] = useState<RegisterForm>({ name: '', email: '', password: '', phone: '', reason: '' });
  const [error, setError] = useState<string | null>(null);
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validaciones campo a campo
  const nameSanitized = form.name.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]/g,'');
  const nameError = nameSanitized.trim().length === 0 ? 'Requerido' : (nameSanitized.trim().length < 2 ? 'Mínimo 2 caracteres' : null);
  const emailError = form.email.length === 0 ? 'Requerido' : (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) ? 'Formato inválido' : null);
  // Fuerza contraseña
  const pwd = form.password;
  const pwdRules = {
    length: pwd.length >= 10,
    number: /[0-9]/.test(pwd),
    upper: /[A-ZÁÉÍÓÚÑ]/.test(pwd),
    lower: /[a-záéíóúñ]/.test(pwd),
    symbol: /[!@#$%^&*._+-]/.test(pwd)
  } as const;
  const passedCount = Object.values(pwdRules).filter(Boolean).length;
  const passwordError = pwd.length === 0 ? 'Requerida' : (passedCount < 5 ? 'Contraseña débil (faltan criterios)' : null);
  const phoneSanitized = form.phone.replace(/[^0-9+]/g,'');
  const phoneError = phoneSanitized && phoneSanitized.replace(/\D/g,'').length < 7 ? 'Muy corto' : null;
  const reasonError = form.reason === '' ? 'Seleccionar motivo' : null;
  // Email disponibilidad (debounce)
  const [emailAvailable, setEmailAvailable] = useState<boolean|null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const emailRef = useRef(form.email);
  useEffect(() => {
    emailRef.current = form.email;
    if (emailError) { setEmailAvailable(null); return; }
    const handle = setTimeout(async () => {
      const current = emailRef.current;
      if (!current || emailError) return;
      setCheckingEmail(true);
      try {
        const resp = await fetch(`/auth/check-email?email=${encodeURIComponent(current)}`);
        if (!resp.ok) { setEmailAvailable(null); }
        else {
          const j = await resp.json();
          if (emailRef.current === current) setEmailAvailable(j.available);
        }
      } catch { setEmailAvailable(null); } finally { setCheckingEmail(false); }
    }, 500);
    return () => clearTimeout(handle);
  }, [form.email, emailError]);

  const isValid = !nameError && !emailError && emailAvailable === true && !passwordError && !phoneError && !reasonError;
  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h2 className="text-2xl font-semibold mb-6">Crear cuenta</h2>
      <form className="space-y-4" onSubmit={async e => {
        e.preventDefault();
        setError(null);
        try {
          await register(form.name, form.email, form.password, form.phone, form.reason);
          navigate('/dashboard');
        } catch (err: any) {
          setError('Error registrando, tal vez email existente');
        }
      }}>
        <div>
          <input value={nameSanitized} onChange={e => {
            const cleaned = e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]/g,'');
            setForm(f => ({ ...f, name: cleaned }));
          }} onBlur={()=>setTouched(t=>({...t,name:true}))} placeholder="Nombre" className={`w-full border rounded px-3 py-2 ${touched.name && nameError ? 'border-red-500' : ''}`} />
          {touched.name && nameError && <p className="text-[10px] text-red-600 mt-1">{nameError}</p>}
        </div>
        <div>
          <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value.trim() }))} onBlur={()=>setTouched(t=>({...t,email:true}))} type="email" placeholder="Email" className={`w-full border rounded px-3 py-2 ${touched.email && (emailError || (emailAvailable===false)) ? 'border-red-500' : (emailAvailable===true && touched.email ? 'border-green-500' : '')}`} />
          {touched.email && emailError && <p className="text-[10px] text-red-600 mt-1">{emailError}</p>}
          {touched.email && !emailError && checkingEmail && <p className="text-[10px] text-gray-500 mt-1">Verificando...</p>}
          {touched.email && emailAvailable===true && !checkingEmail && <p className="text-[10px] text-green-600 mt-1">Disponible</p>}
          {touched.email && emailAvailable===false && !checkingEmail && <p className="text-[10px] text-red-600 mt-1">Email ya registrado</p>}
        </div>
        <div>
          <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} onBlur={()=>setTouched(t=>({...t,password:true}))} type="password" placeholder="Contraseña" className={`w-full border rounded px-3 py-2 ${touched.password && passwordError ? 'border-red-500' : (passedCount >=3 && touched.password ? 'border-green-500' : '')}`} />
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 rounded bg-gray-200 overflow-hidden">
              <div className={`h-full transition-all ${passedCount<=2?'bg-red-500':passedCount===3?'bg-orange-500':passedCount===4?'bg-yellow-500':'bg-green-600'}`} style={{ width: `${(passedCount/5)*100}%` }} />
            </div>
            <span className="text-[10px] text-gray-600">{passedCount}/5</span>
          </div>
          <ul className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] text-gray-600">
            <li className={pwdRules.length?'text-green-600':'text-gray-500'}>≥10 caracteres</li>
            <li className={pwdRules.number?'text-green-600':'text-gray-500'}>Número</li>
            <li className={pwdRules.upper?'text-green-600':'text-gray-500'}>Mayúscula</li>
            <li className={pwdRules.lower?'text-green-600':'text-gray-500'}>Minúscula</li>
            <li className={pwdRules.symbol?'text-green-600':'text-gray-500'}>Símbolo</li>
          </ul>
          {touched.password && passwordError && <p className="text-[10px] text-red-600 mt-1">{passwordError}</p>}
        </div>
        <div>
          <input value={phoneSanitized} onChange={e => {
            const raw = e.target.value;
            const cleaned = raw.replace(/[^0-9+]/g,'');
            setForm(f => ({ ...f, phone: cleaned }));
          }} onBlur={()=>setTouched(t=>({...t,phone:true}))} type="tel" placeholder="Celular" className={`w-full border rounded px-3 py-2 ${touched.phone && phoneError ? 'border-red-500' : ''}`} />
          {touched.phone && phoneError && <p className="text-[10px] text-red-600 mt-1">{phoneError}</p>}
        </div>
        <div>
        <select value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} onBlur={()=>setTouched(t=>({...t,reason:true}))} className={`w-full border rounded px-3 py-2 text-sm ${touched.reason && reasonError ? 'border-red-500' : ''}`}>
          <option value="">Motivo de llegada a la red</option>
          <option value="economico">Problemas económicos</option>
          <option value="familia">Problemas con la familia</option>
          <option value="vicio">Problema de algún vicio</option>
          <option value="crecimiento">Crecer en conocimientos y desarrollo personal y espiritual</option>
          <option value="cambio">Cambiar la persona que eres</option>
        </select>
          {touched.reason && reasonError && <p className="text-[10px] text-red-600 mt-1">{reasonError}</p>}
        </div>
  {error && <div className="text-red-600 text-sm">{error}</div>}
  <button disabled={loading || !isValid} type="submit" className="w-full bg-primary-600 text-white py-2 rounded font-medium disabled:opacity-60">{loading ? 'Creando...' : 'Registrarme'}</button>
      </form>
    </div>
  );
}
