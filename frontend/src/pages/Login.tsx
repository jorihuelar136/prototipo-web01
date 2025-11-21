import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h2 className="text-2xl font-semibold mb-6">Acceder</h2>
      <form className="space-y-4" onSubmit={async e => {
        e.preventDefault();
        setError(null);
        try {
          await login(email, password);
          navigate('/dashboard');
        } catch (err: any) {
          setError('Credenciales inválidas');
        }
      }}>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full border rounded px-3 py-2" />
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Contraseña" className="w-full border rounded px-3 py-2" />
  {error && <div className="text-red-600 text-sm">{error}</div>}
  <button disabled={loading} type="submit" className="w-full bg-primary-600 text-white py-2 rounded font-medium disabled:opacity-60">{loading ? 'Ingresando...' : 'Entrar'}</button>
      </form>
    </div>
  );
}
