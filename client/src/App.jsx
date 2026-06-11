import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientas from './pages/Clientas';
import Visitas from './pages/Visitas';
import Calendario from './pages/Calendario';
import RegistrarClienta from './pages/RegistrarClienta';
import EscanearVisita from './pages/EscanearVisita';
import DetalleClienta from './pages/DetalleClienta';
import VistaClienta from './pages/VistaClienta';
import BottomNav from './components/BottomNav';

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  return token ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { token } = useAuth();
  const location = useLocation();
  const isClientaView = location.pathname.startsWith('/clienta/') && !location.pathname.includes('/detalle/');

  return (
    <div className="min-h-screen bg-rosa/30">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/clienta/:qrCode" element={<VistaClienta />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/clientas" element={<PrivateRoute><Clientas /></PrivateRoute>} />
        <Route path="/visitas" element={<PrivateRoute><Visitas /></PrivateRoute>} />
        <Route path="/calendario" element={<PrivateRoute><Calendario /></PrivateRoute>} />
        <Route path="/registrar" element={<PrivateRoute><RegistrarClienta /></PrivateRoute>} />
        <Route path="/escanear" element={<PrivateRoute><EscanearVisita /></PrivateRoute>} />
        <Route path="/clienta/detalle/:id" element={<PrivateRoute><DetalleClienta /></PrivateRoute>} />
      </Routes>
      {token && !isClientaView && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
