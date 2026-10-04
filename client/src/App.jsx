import { useEffect } from 'react';
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
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh text-gray-500" role="status">
        Cargando...
      </div>
    );
  }
  return token ? children : <Navigate to="/login" />;
}

/* Sin esto, navegar desde una lista larga deja la página a media altura */
function ScrollAlCambiarDeRuta() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppRoutes() {
  const { token } = useAuth();
  const location = useLocation();
  const isClientaView =
    location.pathname.startsWith('/clienta/') && !location.pathname.includes('/detalle/');

  return (
    <div className="min-h-dvh bg-rosa/30">
      <ScrollAlCambiarDeRuta />
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-white focus:text-rosa-ink focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm"
      >
        Saltar al contenido
      </a>
      <main id="contenido" className="focus:outline-none">
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
      </main>
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