import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { mensajeDeError } from '../services/api';
import DatePicker from '../components/DatePicker';
import useTecladoVirtual from '../hooks/useTecladoVirtual';

export default function RegistrarClienta() {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useTecladoVirtual();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/clientas', {
        nombre,
        telefono,
        email: email || undefined,
        fecha_nacimiento: fechaNacimiento || undefined,
      });
      navigate('/');
    } catch (err) {
      setError(mensajeDeError(err, 'No pudimos registrar la clienta.'));
    } finally {
      setLoading(false);
    }
  };

  const campo = 'w-full min-h-11 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rosa-ink/50';

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 safe-top safe-bottom">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Nueva Clienta</h1>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <div role="alert" className="bg-red-50 text-red-800 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="clienta-nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              id="clienta-nombre"
              name="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={campo}
              autoComplete="name"
              enterKeyHint="next"
              autoCapitalize="words"
              minLength={2}
              required
            />
          </div>

          <div>
            <label htmlFor="clienta-telefono" className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono *
            </label>
            <input
              id="clienta-telefono"
              name="telefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className={campo}
              autoComplete="tel"
              inputMode="tel"
              enterKeyHint="next"
              maxLength={20}
              required
            />
          </div>

          <div>
            <label htmlFor="clienta-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email (opcional)
            </label>
            <input
              id="clienta-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={campo}
              autoComplete="email"
              inputMode="email"
              enterKeyHint="next"
              autoCapitalize="none"
              spellCheck="false"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-1" id="clienta-nacimiento-label">
              Fecha de nacimiento (opcional)
            </span>
            <DatePicker
              value={fechaNacimiento}
              onChange={setFechaNacimiento}
              disableFuture
              ariaLabel="Fecha de nacimiento"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-11 bg-rosa-ink text-white py-3 rounded-lg font-medium transition-colors hover:bg-rosa-ink/90 active:bg-rosa-ink/95 disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Registrar Clienta'}
          </button>
        </form>
      </div>
    </div>
  );
}