import { useState, Suspense, lazy } from 'react';
import { PartyPopper, Trophy, Check } from 'lucide-react';
import TarjetaFidelidad from '../components/TarjetaFidelidad';
import api, { mensajeDeError } from '../services/api';

const EscanerQR = lazy(() => import('../components/EscanerQR'));

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
      <h1 className="text-xl font-bold text-tinta text-center">Escanear Visita</h1>

      {error && (
        <div role="alert" className="bg-danger/10 text-danger text-sm p-3 rounded-lg text-center">
          <p>{error}</p>
          <button
            type="button"
            onClick={resetear}
            className="mt-1 inline-flex items-center justify-center min-h-11 px-4 rounded-lg font-medium text-primary underline underline-offset-2"
          >
            Intentar de nuevo
          </button>
        </div>
      )}

      {resultado && (
        <div className="animate-celebracion bg-surface rounded-2xl p-6 text-center space-y-3 border border-line">
          <PartyPopper aria-hidden="true" className="size-12 mx-auto text-primary" />
          <p className="font-bold text-primary text-lg">{resultado.mensaje}</p>
          <p className="text-sm text-tinta-suave">{resultado.clienta.nombre}</p>
          {resultado.recompensa && (
            <div className="bg-durazno-100 rounded-xl p-3 mt-3">
              <div className="inline-flex items-center gap-2 font-bold text-primary">
                <Trophy aria-hidden="true" className="size-5" />
                ¡Recompensa!
              </div>
              <p className="text-sm text-primary mt-1">{resultado.recompensa}</p>
            </div>
          )}
          <button
            type="button"
            onClick={resetear}
            className="mt-2 min-h-11 bg-primary text-white px-6 py-2.5 rounded-full font-medium transition-colors hover:bg-primary/90 active:bg-primary/95"
          >
            Escanear otra
          </button>
        </div>
      )}

      {!clienta && !resultado && (
        <Suspense
          fallback={
            <div className="text-center text-tinta-suave py-8" role="status">
              Preparando la cámara…
            </div>
          }
        >
          <EscanerQR onScan={handleScan} onError={(msg) => setError(msg)} />
        </Suspense>
      )}

      {clienta && !resultado && (
        <div className="space-y-4">
          <div className="bg-surface rounded-2xl shadow-lg p-4 text-center">
            <h2 className="text-lg font-semibold text-tinta">{clienta.nombre}</h2>
            <p className="text-sm text-tinta-suave">{clienta.telefono}</p>
          </div>

          <TarjetaFidelidad visitas={clienta.tarjetas?.[0]?.visitas_completadas || 0} />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetear}
              className="flex-1 min-h-11 bg-line text-tinta py-3 rounded-lg font-medium transition-colors hover:bg-line/80 active:bg-line"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleMarcar}
              disabled={loading}
              className="flex-1 min-h-11 bg-primary text-white py-3 rounded-lg font-medium transition-colors hover:bg-primary/90 active:bg-primary/95 disabled:opacity-50"
            >
              {loading ? 'Marcando...' : <Check aria-hidden="true" className="size-5 mx-auto" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}