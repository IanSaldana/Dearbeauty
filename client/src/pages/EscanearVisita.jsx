import { useState } from 'react';
import EscanerQR from '../components/EscanerQR';
import TarjetaFidelidad from '../components/TarjetaFidelidad';
import api from '../services/api';

export default function EscanearVisita() {
  const [clienta, setClienta] = useState(null);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (qrCode) => {
    setError('');
    setResultado(null);
    try {
      const res = await api.get(`/clientas/qr/${qrCode}`);
      setClienta({ ...res.data, qrCodeValue: qrCode });
    } catch (err) {
      setError(err.response?.data?.error || 'Clienta no encontrada');
    }
  };

  const handleMarcar = async () => {
    if (!clienta) return;
    setLoading(true);
    try {
      const res = await api.post('/visitas/marcar', { qrCode: clienta.qr_code });
      setResultado(res.data);
      setClienta(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al marcar visita');
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
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-800 text-center">Escanear Visita</h1>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center">
          {error}
          <button onClick={resetear} className="block mx-auto mt-2 text-rosa-dark underline">
            Intentar de nuevo
          </button>
        </div>
      )}

      {/* Resultado exitoso */}
      {resultado && (
        <div className="bg-green-50 rounded-2xl p-6 text-center space-y-3">
          <p className="text-4xl">🎉</p>
          <p className="font-bold text-green-800">{resultado.mensaje}</p>
          <p className="text-sm text-green-600">
            {resultado.clienta.nombre}
          </p>
          {resultado.recompensa && (
            <div className="bg-dorado/20 rounded-lg p-3 mt-3">
              <p className="text-dorado font-bold">🏆 ¡Recompensa!</p>
              <p className="text-sm">{resultado.recompensa}</p>
            </div>
          )}
          <button
            onClick={resetear}
            className="mt-4 bg-rosa-dark text-white px-6 py-2 rounded-full"
          >
            Escanear otra
          </button>
        </div>
      )}

      {/* Escáner */}
      {!clienta && !resultado && (
        <EscanerQR onScan={handleScan} onError={(msg) => setError(msg)} />
      )}

      {/* Confirmar visita */}
      {clienta && !resultado && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
            <h2 className="text-lg font-semibold">{clienta.nombre}</h2>
            <p className="text-sm text-gray-500">{clienta.telefono}</p>
          </div>

          <TarjetaFidelidad
            visitas={clienta.tarjetas?.[0]?.visitas_completadas || 0}
          />

          <div className="flex gap-3">
            <button
              onClick={resetear}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleMarcar}
              disabled={loading}
              className="flex-1 bg-rosa-dark text-white py-3 rounded-lg font-medium hover:bg-rosa-dark/90 transition disabled:opacity-50"
            >
              {loading ? 'Marcando...' : '✓ Marcar Visita'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
