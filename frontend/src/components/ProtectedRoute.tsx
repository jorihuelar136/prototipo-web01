import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReactNode } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, initialized } = useAuth();
  // Mientras no se haya inicializado la verificación de token, no redirigir.
  if (!initialized) {
    return <div className="w-full flex items-center justify-center py-24 text-sm text-gray-500">Verificando sesión...</div>;
  }
  if (!user && initialized) return <Navigate to="/login" replace />;
  return <>{children}</>; 
}
