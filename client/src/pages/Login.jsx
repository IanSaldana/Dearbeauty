import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mensajeDeError } from '../services/api';
import useTecladoVirtual from '../hooks/useTecladoVirtual';
import logo from '../assets/logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  useTecladoVirtual();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(mensajeDeError(err, 'No pudimos iniciar sesión. Revisa tus datos.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-canvas px-4 safe-top safe-bottom">
      <div className="bg-surface rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <img src={logo} alt="" width={80} height={80} className="w-20 h-20 mx-auto mb-2 rounded-full" />
          <h1 className="text-2xl font-bold text-primary">Dear Beauty</h1>
          <p className="text-tinta-suave text-sm mt-1">Panel de Manicurista</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div role="alert" className="bg-danger/10 text-danger text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-tinta-suave mb-1">
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full min-h-11 px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoComplete="username"
              inputMode="email"
              enterKeyHint="next"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              required
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-tinta-suave mb-1">
              Contraseña
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-h-11 px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoComplete="current-password"
              enterKeyHint="go"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-11 bg-primary text-white py-3 rounded-lg font-medium transition-colors hover:bg-primary/90 active:bg-primary/95 disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}