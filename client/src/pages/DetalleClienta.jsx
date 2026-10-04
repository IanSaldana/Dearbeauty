import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import TarjetaFidelidad from '../components/TarjetaFidelidad';
import BannerEvento from '../components/BannerEvento';
import BotonCompartir from '../components/BotonCompartir';
import Modal from '../components/Modal';
import DatePicker from '../components/DatePicker';
import { EsqueletoTarjeta, Vacio, ErrorConReintento } from '../components/Estados';
import api, { mensajeDeError, esNoEncontrado } from '../services/api';
import useTecladoVirtual from '../hooks/useTecladoVirtual';

/* Fecha de solo fecha anclada a UTC: formatear en hora local la corre un día */
const fmtFecha = (iso) => new Date(iso).toLocaleDateString('es-CL', { timeZone: 'UTC' });

export default function DetalleClienta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clienta, setClienta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noEncontrada, setNoEncontrada] = useState(false);
  const [falloCarga, setFalloCarga] = useState('');
  const [editando, setEditando] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', fecha_nacimiento: '' });

  useTecladoVirtual();

  const cargar = useCallback(() => {
    api
      .get(`/clientas/${id}`)
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
      /* Antes un fallo de red terminaba mostrando "Clienta no encontrada" */
      .catch((err) => {
        if (esNoEncontrado(err)) setNoEncontrada(true);
        else setFalloCarga(mensajeDeError(err, 'No pudimos cargar esta clienta.'));
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(cargar, [cargar]);

  const reintentar = () => {
    setLoading(true);
    setNoEncontrada(false);
    setFalloCarga('');
    cargar();
  };

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
      setError(mensajeDeError(err, 'No pudimos guardar los cambios.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/clientas/${id}`);
      navigate('/clientas', { replace: true });
    } catch (err) {
      setError(mensajeDeError(err, 'No pudimos eliminar la clienta.'));
      setConfirmDelete(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 pb-24" role="status" aria-busy="true">
        <span className="sr-only">Cargando…</span>
        <EsqueletoTarjeta />
      </div>
    );
  }

  if (noEncontrada) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <Vacio
          titulo="Clienta no encontrada"
          detalle="Es posible que se haya eliminado. Vuelve al listado."
          accion={
            <button
              type="button"
              onClick={() => navigate('/clientas')}
              className="mt-2 min-h-11 px-5 rounded-lg bg-rosa-ink text-white font-medium transition-colors active:bg-rosa-ink/95"
            >
              Ver clientas
            </button>
          }
        />
      </div>
    );
  }

  if (falloCarga || !clienta) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <ErrorConReintento
          mensaje={falloCarga || 'No pudimos cargar esta clienta.'}
          onReintentar={reintentar}
        />
      </div>
    );
  }

  const tarjetaActiva = clienta.tarjetas?.find((t) => t.activa);
  const qrUrl = `${window.location.origin}/clienta/${clienta.qr_code}`;
  const campo = 'w-full min-h-11 px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-rosa-ink/50';

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-6 safe-top safe-bottom">
      {/* Info clienta */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        {!editando ? (
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-800 break-words">{clienta.nombre}</h1>
            <p className="text-sm text-gray-600">{clienta.telefono}</p>
            {clienta.email && <p className="text-sm text-gray-600 break-words">{clienta.email}</p>}
            {clienta.fecha_nacimiento && (
              <p className="text-sm text-gray-600">
                🎂 {fmtFecha(clienta.fecha_nacimiento)}
              </p>
            )}
            <div className="flex justify-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => setEditando(true)}
                className="min-h-11 px-4 py-2.5 text-sm bg-rosa/50 text-rosa-ink rounded-lg transition-colors hover:bg-rosa active:bg-rosa/70"
              >
                ✏️ Editar
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="min-h-11 px-4 py-2.5 text-sm bg-red-50 text-red-700 rounded-lg transition-colors hover:bg-red-100 active:bg-red-200"
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleEdit} className="space-y-3">
            <h2 className="font-semibold text-gray-800 text-center mb-2">Editar datos</h2>
            {error && (
              <div role="alert" className="bg-red-50 text-red-800 text-sm p-2 rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="editar-nombre" className="sr-only">
                Nombre
              </label>
              <input
                id="editar-nombre"
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Nombre"
                className={campo}
                autoComplete="name"
                enterKeyHint="next"
                autoCapitalize="words"
                minLength={2}
                required
              />
            </div>
            <div>
              <label htmlFor="editar-telefono" className="sr-only">
                Teléfono
              </label>
              <input
                id="editar-telefono"
                type="tel"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                placeholder="Teléfono"
                className={campo}
                autoComplete="tel"
                inputMode="tel"
                enterKeyHint="next"
                maxLength={20}
                required
              />
            </div>
            <div>
              <label htmlFor="editar-email" className="sr-only">
                Email (opcional)
              </label>
              <input
                id="editar-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email (opcional)"
                className={campo}
                autoComplete="email"
                inputMode="email"
                enterKeyHint="next"
                autoCapitalize="none"
                spellCheck="false"
              />
            </div>
            <div>
              <span className="sr-only">Fecha de nacimiento</span>
              {/* DatePicker propio en vez de type="date": el nativo es pésimo en móvil */}
              <DatePicker
                value={form.fecha_nacimiento}
                onChange={(v) => setForm({ ...form, fecha_nacimiento: v })}
                ariaLabel="Fecha de nacimiento"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 min-h-11 bg-rosa-ink text-white py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-rosa-ink/90 active:bg-rosa-ink/95 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={() => { setEditando(false); setError(''); }}
                className="flex-1 min-h-11 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-gray-200 active:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Modal confirmación eliminar */}
      {confirmDelete && (
        <Modal titulo="Confirmar eliminación" onCerrar={() => { setConfirmDelete(false); setError(''); }}>
          <p className="text-sm text-gray-700 text-center">
            Se borrarán todos los datos de <strong className="break-words">{clienta.nombre}</strong>:
            tarjetas, visitas y toda su información.
          </p>
          {error && (
            <div role="alert" className="mt-3 bg-red-50 text-red-800 text-sm p-2 rounded-lg">
              {error}
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="flex-1 min-h-11 bg-red-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-red-800 active:bg-red-900 disabled:opacity-50"
            >
              {saving ? 'Eliminando...' : 'Sí, eliminar'}
            </button>
            <button
              type="button"
              onClick={() => { setConfirmDelete(false); setError(''); }}
              className="flex-1 min-h-11 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-gray-200 active:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {/* Banner próximo evento */}
      <BannerEvento evento={clienta.proximo_evento} />

      {/* Tarjeta */}
      {tarjetaActiva ? (
        <TarjetaFidelidad visitas={tarjetaActiva.visitas_completadas} />
      ) : (
        <Vacio
          titulo="Sin tarjeta activa"
          detalle="Se creará una nueva automáticamente en su próxima visita."
        />
      )}

      {/* QR Code */}
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
        <h2 className="font-semibold text-gray-800 mb-3">Código QR</h2>
        <div className="inline-block p-3 bg-white border rounded-lg max-w-full">
          <QRCodeSVG
            value={clienta.qr_code}
            size={180}
            style={{ width: '100%', maxWidth: '180px', height: 'auto' }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          La clienta puede mostrar este QR desde su celular
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <a
            href={qrUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-11 flex items-center text-sm text-rosa-ink underline underline-offset-2"
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
              <li
                key={v.id}
                className="flex items-center justify-between text-sm border-b border-gray-100 pb-2 last:border-0"
              >
                <span>Visita {v.numero_visita}</span>
                <div className="text-right flex items-center gap-2">
                  <span className="text-gray-600 tabular-nums">{fmtFecha(v.fecha)}</span>
                  {v.recompensa && (
                    <span className="text-dorado-ink" title={v.recompensa} aria-label={v.recompensa}>
                      🏆
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">Sin visitas aún</p>
        )}
      </div>
    </div>
  );
}