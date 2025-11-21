import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import axios, { InternalAxiosRequestConfig, AxiosError, type AxiosResponse } from 'axios';

// Ensure axios points to backend API (fallback to localhost:4000 if env var not set)
const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000';
if (!axios.defaults.baseURL) {
  axios.defaults.baseURL = API_BASE;
  // Optional small debug once
  // eslint-disable-next-line no-console
  console.debug('[Auth] axios baseURL set to', axios.defaults.baseURL);
}

interface User { id: string; email: string; name: string; roles: string[]; avatar?: string|null; phone?: string|null; reason?: string|null; mentorId?: string|null; allowedMenus?: string[] }
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string, reason?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem('refreshToken'));
  const [initialized, setInitialized] = useState(false);

  const reqInterceptor = useRef<number | null>(null);
  const resInterceptor = useRef<number | null>(null);
  const refreshingRef = useRef(false);
  const queueRef = useRef<Array<{resolve:(v:AxiosResponse)=>void; reject:(e:any)=>void; config:InternalAxiosRequestConfig & {_retry?:boolean}}>>([]);

  async function refreshProfile() {
    if (!token) { setInitialized(true); return; }
    try {
      // Forzar header Authorization en primera llamada antes de que se registren los interceptores.
      const res = await axios.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      setUser(res.data);
      setInitialized(true);
    } catch (e) {
      // Intentar refresh sólo si tenemos refreshToken y no estamos ya refrescando
      if (refreshToken && !refreshingRef.current) {
        try {
          const r = await axios.post('/auth/refresh', { refreshToken });
          setToken(r.data.accessToken); localStorage.setItem('accessToken', r.data.accessToken);
          setRefreshToken(r.data.refreshToken); localStorage.setItem('refreshToken', r.data.refreshToken);
          setUser(r.data.user);
          // Enriquecer con /auth/me usando nuevo token (header explícito por seguridad)
          try {
            const full = await axios.get('/auth/me', { headers: { Authorization: `Bearer ${r.data.accessToken}` } });
            setUser(full.data);
          } catch {}
          setInitialized(true);
          return;
        } catch {
          // Si falla el refresh, limpiar sesión
        }
      }
      clearSession();
      setInitialized(true);
    }
  }

  function clearSession() {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Mantener initialized en true para que la UI no siga en estado de espera
  }

  // Ejecutar refreshProfile en cada cambio de token para obtener siempre allowedMenus y demás datos.
  useEffect(() => {
    if (token) {
      refreshProfile();
    } else {
      // Si no hay token asegurar que initialized esté true para que rutas protegidas redirijan correctamente.
      setInitialized(true);
    }
  }, [token]);

  useEffect(() => {
    if (reqInterceptor.current !== null) axios.interceptors.request.eject(reqInterceptor.current);
    reqInterceptor.current = axios.interceptors.request.use((config) => {
      if (token) {
        config.headers = config.headers || {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
      return config;
    });

    if (resInterceptor.current !== null) axios.interceptors.response.eject(resInterceptor.current);
    resInterceptor.current = axios.interceptors.response.use(r=>r, async (error: AxiosError<any>) => {
      const status = error.response?.status;
      const original = error.config as InternalAxiosRequestConfig & {_retry?:boolean};
      const url = (original?.url||'').toString();
      if (status === 401 && refreshToken && !original._retry && !url.includes('/auth/refresh')) {
        original._retry = true;
        if (!refreshingRef.current) {
          refreshingRef.current = true;
          try {
            const rf = await axios.post('/auth/refresh', { refreshToken });
            const newAccess = rf.data.accessToken;
            const newRefresh = rf.data.refreshToken;
            setToken(newAccess); localStorage.setItem('accessToken', newAccess);
            setRefreshToken(newRefresh); localStorage.setItem('refreshToken', newRefresh);
            setUser(rf.data.user);
            // Enrich
            try { const full = await axios.get('/auth/me'); setUser(full.data); } catch {}
            // Flush queue
            queueRef.current.forEach(p => {
              p.config.headers = p.config.headers || {};
              (p.config.headers as any).Authorization = `Bearer ${newAccess}`;
              axios.request(p.config).then(p.resolve).catch(p.reject);
            });
            queueRef.current = [];
            refreshingRef.current = false;
            // Retry original
            original.headers = original.headers || {};
            (original.headers as any).Authorization = `Bearer ${newAccess}`;
            return axios.request(original);
          } catch (err) {
            queueRef.current.forEach(p => p.reject(err));
            queueRef.current = [];
            refreshingRef.current = false;
            clearSession();
            return Promise.reject(err);
          }
        } else {
          // Queue
          return new Promise((resolve, reject) => {
            queueRef.current.push({ resolve, reject, config: original });
          });
        }
      }
      return Promise.reject(error);
    });
    return () => {
      if (reqInterceptor.current !== null) axios.interceptors.request.eject(reqInterceptor.current);
      if (resInterceptor.current !== null) axios.interceptors.response.eject(resInterceptor.current);
    };
  }, [token, refreshToken]);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
  const res = await axios.post('/auth/login', { email, password });
      setToken(res.data.accessToken); localStorage.setItem('accessToken', res.data.accessToken);
      setRefreshToken(res.data.refreshToken); localStorage.setItem('refreshToken', res.data.refreshToken);
      setUser(res.data.user);
      await refreshProfile();
    } finally { setLoading(false); }
  }

  async function register(name: string, email: string, password: string, phone?: string, reason?: string) {
    setLoading(true);
    try {
  const res = await axios.post('/auth/register', { name, email, password, phone, reason });
      setToken(res.data.accessToken); localStorage.setItem('accessToken', res.data.accessToken);
      setRefreshToken(res.data.refreshToken); localStorage.setItem('refreshToken', res.data.refreshToken);
      setUser(res.data.user);
      await refreshProfile();
    } finally { setLoading(false); }
  }

  function logout() {
    clearSession();
    setInitialized(true); // estado listo para mostrar login sin spinner
  }

  const value: AuthContextValue = { user, loading, initialized, login, register, logout, refreshProfile };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
