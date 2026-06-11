import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import TarjetaFidelidad from '../components/TarjetaFidelidad';
import BannerEvento from '../components/BannerEvento';
import BotonCompartir from '../components/BotonCompartir';
import api from '../services/api';

export default function DetalleClienta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clienta, setClienta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state for editing
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', fecha_nacimiento: '' });

  useEffect(() => {
    api.get(`/clientas/${id}`)
      .then((res) => {
        setClienta(res.data);
        setForm({
          nombre: res.data.nombre || '',
          telefono: res.data.telefono || '',
          email: res.data.email || '',
          fecha_nacimiento: res.data.fecha_nacimiento
            ? res.data.fecha_nacimiento.split('T')[0]
            : '',
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleEdit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await api.put(`/clientas/${id}`, {
        nombre: form.nombre,
        telefono: form.telefono,
        email: form.email || null,
        fecha_nacimiento: form.fecha_nacimiento || null,
      });
      setClienta(res.data);
      setEditando(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/clientas/${id}`);
      navigate('/clientas');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar');
      setConfirmDelete(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64">Cargando...</div>;
  if (!clienta) return <div className="text-center py-8 text-gray-500">Clienta no encontrada</div>;

  const tarjetaActiva = clienta.tarjetas?.find((t) => t.activa);
  const qrUrl = `${window.location.origin}/clienta/${clienta.qr_code}`;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Info clienta */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        {!editando ? (
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-800">{clienta.nombre}</h1>
            <p className="text-sm text-gray-500">{clienta.telefono}</p>
            {clienta.email && <p className="text-sm text-gray-400">{clienta.email}</p>}
            {clienta.fecha_nacimiento && (
              <p className="text-sm text-gray-400">
                🎂 {new Date(clienta.fecha_nacimiento).toLocaleDateString('es-CL', { timeZone: 'UTC' })}
              </p>
            )}
            <div className="flex justify-center gap-2 mt-3">
              <button
                onClick={() => setEditando(true)}
                className="px-4 py-1.5 text-sm bg-rosa/50 text-rosa-dark rounded-lg hover:bg-rosa transition"
              >
                ✏️ Editar
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-1.5 text-sm bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition"
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleEdit} className="space-y-3">
            <h2 className="font-semibold text-gray-800 text-center mb-2">Editar datos</h2>
            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-2 rounded-lg">{error}</div>
            )}
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rosa-dark/50"
              required
            />
            <input
              type="tel"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              placeholder="Teléfono"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rosa-dark/50"
              required
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email (opcional)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rosa-dark/50"
            />
            <input
              type="date"
              value={form.fecha_nacimiento}
              onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rosa-dark/50"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-rosa-dark text-white py-2 rounded-lg text-sm font-medium hover:bg-rosa-dark/90 transition disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={() => { setEditando(false); setError(''); }}
                className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Modal confirmación eliminar */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-gray-800 text-center">¿Estás segura?</h3>
            <p className="text-sm text-gray-500 text-center">
              Se borrarán todos los datos de <strong>{clienta.nombre}</strong>: tarjetas, visitas y toda su información.
            </p>
            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-2 rounded-lg">{error}</div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition disabled:opacity-50"
              >
                {saving ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
              <button
                onClick={() => { setConfirmDelete(false); setError(''); }}
                className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner próximo evento */}
      <BannerEvento evento={clienta.proximo_evento} />

      {/* Tarjeta */}
      {tarjetaActiva && (
        <TarjetaFidelidad visitas={tarjetaActiva.visitas_completadas} />
      )}

      {/* QR Code */}
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
        <h2 className="font-semibold text-gray-800 mb-3">Código QR</h2>
        <div className="inline-block p-3 bg-white border rounded-lg">
          <QRCodeSVG value={clienta.qr_code} size={180} />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          La clienta puede mostrar este QR desde su celular
        </p>
        <div className="flex items-center justify-center gap-3 mt-3">
          <a
            href={qrUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-rosa-dark underline"
          >
            Ver vista de clienta
          </a>
          <BotonCompartir url={qrUrl} />
        </div>
      </div>

      {/* Historial */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="font-semibold text-gray-800 mb-3">Historial de visitas</h2>
        {tarjetaActiva?.visitas?.length > 0 ? (
          <ul className="space-y-2">
            {tarjetaActiva.visitas.map((v) => (
              <li key={v.id} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2">
                <span>Visita {v.numero_visita}</span>
                <div className="text-right">
                  <span className="text-gray-400">{new Date(v.fecha).toLocaleDateString()}</span>
                  {v.recompensa && (
                    <span className="ml-2 text-dorado">🏆</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">Sin visitas aún</p>
        )}
      </div>
    </div>
  );
}
