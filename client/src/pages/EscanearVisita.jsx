import { useState, Suspense, lazy } from 'react';
import TarjetaFidelidad from '../components/TarjetaFidelidad';
import api, { mensajeDeError } from '../services/api';

/* html5-qrcode arrastra ZXing completo (~500 kB). Cargarlo solo al abrir
   /escanear evita que el primer render en el celular espere ese peso. */
const EscanerQR = lazy(() => import('../components/EscanerQR'));

/* El teléfono en la mano vibra al confirmar: la clienta siente que su visita
   quedó registrada sin mirar la pantalla. */
const vibrar = (patron) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(patron);
  }
};

export default function EscanearVisita() {
  const [clienta, setClienta] = useState(null);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (qrCode) => {
    setError('');
    setResultado(null);
    vibrar(15);
    try {
      const res = await api.get(`/clientas/qr/${qrCode}`);
      setClienta({ ...res.data, qrCodeValue: qrCode });
      vibrar([12, 60, 12]);
    } catch (err) {
      setError(mensajeDeError(err, 'Clienta no encontrada'));
    }
  };

  const handleMarcar = async () => {
    if (!clienta) return;
    setLoading(true);
    try {
      const res = await api.post('/visitas/marcar', { qrCode: clienta.qr_code });
      setResultado(res.data);
      setClienta(null);
      /* dos pulsos: uno por la visita, otro por la recompensa */
      vibrar(res.data.recompensa ? [20, 50, 20, 50, 40] : [20, 50, 20]);
    } catch (err) {
      setError(mensajeDeError(err, 'No pudimos marcar la visita.'));
      vibrar([60, 40, 60]);
    } finally {
      setLoading(false);
    }
  };

  const resetear = () => {
    setClienta(null);
    setResultado(null);
    setError('');
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 safe-top safe-bottom space-y-6">
      <h1 className="text-xl font-bold text-gray-800 text-center">Escanear Visita</h1>

      {error && (
        <div role="alert" className="bg-red-50 text-red-800 text-sm p-3 rounded-lg text-center">
          <p>{error}</p>
          <button
            type="button"
            onClick={resetear}
            className="mt-1 inline-flex items-center justify-center min-h-11 px-4 rounded-lg font-medium text-rosa-ink underline underline-offset-2"
          >
            Intentar de nuevo
          </button>
        </div>
      )}

      {/* Resultado exitoso: el momento de premio, el único lugar donde brilla el dorado */}
      {resultado && (
        <div className="animate-celebracion bg-green-50 rounded-2xl p-6 text-center space-y-3">
          <p className="text-4xl" aria-hidden="true">🎉</p>
          <p className="font-bold text-green-900 text-lg">{resultado.mensaje}</p>
          <p className="text-sm text-green-800">{resultado.clienta.nombre}</p>
          {resultado.recompensa && (
            <div className="bg-dorado/20 rounded-xl p-3 mt-3">
              <p className="text-dorado-ink font-bold">🏆 ¡Recompensa!</p>
              <p className="text-sm text-dorado-ink mt-1">{resultado.recompensa}</p>
            </div>
          )}
          <button
            type="button"
            onClick={resetear}
            className="mt-2 min-h-11 bg-rosa-ink text-white px-6 py-2.5 rounded-full font-medium transition-colors hover:bg-rosa-ink/90 active:bg-rosa-ink/95"
          >
            Escanear otra
          </button>
        </div>
      )}

      {/* Escáner */}
      {!clienta && !resultado && (
        <Suspense
          fallback={
            <div className="text-center text-gray-600 py-8" role="status">
              Preparando la cámara…
            </div>
          }
        >
          <EscanerQR onScan={handleScan} onError={(msg) => setError(msg)} />
        </Suspense>
      )}

      {/* Confirmar visita */}
      {clienta && !resultado && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
            <h2 className="text-lg font-semibold">{clienta.nombre}</h2>
            <p className="text-sm text-gray-600">{clienta.telefono}</p>
          </div>

          <TarjetaFidelidad visitas={clienta.tarjetas?.[0]?.visitas_completadas || 0} />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetear}
              className="flex-1 min-h-11 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors hover:bg-gray-300 active:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleMarcar}
              disabled={loading}
              className="flex-1 min-h-11 bg-rosa-ink text-white py-3 rounded-lg font-medium transition-colors hover:bg-rosa-ink/90 active:bg-rosa-ink/95 disabled:opacity-50"
            >
              {loading ? 'Marcando...' : '✓ Marcar Visita'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}