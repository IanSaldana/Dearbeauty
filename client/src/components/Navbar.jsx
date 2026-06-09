import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { manicurista, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-rosa-dark/20 sticky top-0 z-50">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold text-rosa-dark">
          💅 Dear Beauty
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden sm:inline">
            {manicurista?.nombre}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-rosa-dark"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}
