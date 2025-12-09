import { Routes, Route, useLocation } from 'react-router-dom';
import Landing from './Landing';
import Login from './Login';
import Register from './Register';
import Unete from './Unete';
import LaRed from './LaRed';
import Ensenanzas from './Ensenanzas';
import Dashboard from './Dashboard';
import Courses from './Courses';
import Events from './Events';
import Profile from './Profile';
import Mentoria from './Mentoria';
import Oracion from './Oracion';
import Recursos from './Recursos';
import Comunidad from './Comunidad';
import MiProgreso from './MiProgreso';
import Crecimiento from './Crecimiento';
import Administracion from './Administracion';
import MentorMentees from './MentorMentees';
import IntranetLayout from '../components/IntranetLayout';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthProvider, useAuth } from '../context/AuthContext';

function AppInner() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const intranetPaths = ['/dashboard','/mentoria','/oracion','/recursos','/comunidad','/miprogreso','/crecimiento','/profile','/administracion','/mentor'];
  const isIntranet = user && intranetPaths.some(p => pathname.startsWith(p));
  return (
    <div className="min-h-screen flex flex-col">
      {!isIntranet && <Navbar />}
      <main className={isIntranet ? 'flex-1' : 'flex-1 pt-16'}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unete" element={<Unete />} />
          <Route path="/red" element={<LaRed />} />
          <Route path="/ensenanzas" element={<Ensenanzas />} />
          <Route path="/events" element={<Events />} />
          <Route path="/dashboard" element={<ProtectedRoute><IntranetLayout><Dashboard /></IntranetLayout></ProtectedRoute>} />
          <Route path="/mentoria" element={<ProtectedRoute><IntranetLayout><Mentoria /></IntranetLayout></ProtectedRoute>} />
          <Route path="/oracion" element={<ProtectedRoute><IntranetLayout><Oracion /></IntranetLayout></ProtectedRoute>} />
          <Route path="/recursos" element={<ProtectedRoute><IntranetLayout><Recursos /></IntranetLayout></ProtectedRoute>} />
          <Route path="/comunidad" element={<ProtectedRoute><IntranetLayout><Comunidad /></IntranetLayout></ProtectedRoute>} />
          <Route path="/miprogreso" element={<ProtectedRoute><IntranetLayout><MiProgreso /></IntranetLayout></ProtectedRoute>} />
          <Route path="/crecimiento" element={<ProtectedRoute><IntranetLayout><Crecimiento /></IntranetLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><IntranetLayout><Profile /></IntranetLayout></ProtectedRoute>} />
          <Route path="/administracion" element={<ProtectedRoute><IntranetLayout><Administracion /></IntranetLayout></ProtectedRoute>} />
          <Route path="/mentor" element={<ProtectedRoute><IntranetLayout><MentorMentees /></IntranetLayout></ProtectedRoute>} />
        </Routes>
      </main>
      {/* <footer className="py-6 text-center text-sm text-gray-500">© {new Date().getFullYear()} Desarrollo Integral - Hombres</footer> */}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
