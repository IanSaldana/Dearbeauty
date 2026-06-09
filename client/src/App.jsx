import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegistrarClienta from './pages/RegistrarClienta';
import EscanearVisita from './pages/EscanearVisita';
import DetalleClienta from './pages/DetalleClienta';
import VistaClienta from './pages/VistaClienta';
import Navbar from './components/Navbar';

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
      {token && !isClientaView && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/clienta/:qrCode" element={<VistaClienta />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/registrar" element={<PrivateRoute><RegistrarClienta /></PrivateRoute>} />
        <Route path="/escanear" element={<PrivateRoute><EscanearVisita /></PrivateRoute>} />
        <Route path="/clienta/detalle/:id" element={<PrivateRoute><DetalleClienta /></PrivateRoute>} />
      </Routes>
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
