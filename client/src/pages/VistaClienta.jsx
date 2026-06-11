import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import TarjetaFidelidad from '../components/TarjetaFidelidad';
import BannerEvento from '../components/BannerEvento';
import BotonCompartir from '../components/BotonCompartir';
import api from '../services/api';

export default function VistaClienta() {
  const { qrCode } = useParams();
  const [clienta, setClienta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/public/clienta/${qrCode}`)
      .then((res) => setClienta(res.data))
      .catch(() => setError('Tarjeta no encontrada'))
      .finally(() => setLoading(false));
  }, [qrCode]);

  if (loading) return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-gray-500">{error}</div>;

  const tarjetaActiva = clienta?.tarjetas?.[0];
  const shareUrl = window.location.href;

  return (
    <div className="min-h-screen bg-rosa/30 px-4 py-8">
      <div className="max-w-sm mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <img src="/icon-192.png" alt="Dear Beauty" className="w-16 h-16 mx-auto mb-1" />
          <h1 className="text-2xl font-bold text-rosa-dark">Dear Beauty</h1>
          <p className="text-gray-500 text-sm">Tarjeta de Fidelidad</p>
        </div>

        {/* Nombre */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-800">
            ¡Hola, {clienta.nombre}! 👋
          </h2>
        </div>

        {/* Banner próximo evento */}
        <BannerEvento evento={clienta.proximo_evento} />

        {/* QR para mostrar a la manicurista */}
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <h3 className="font-medium text-gray-700 mb-2">Tu código QR</h3>
          <p className="text-xs text-gray-400 mb-4">Muéstralo a tu manicurista para registrar tu visita</p>
          <div className="inline-block p-4 bg-white border-2 border-rosa-dark/20 rounded-xl">
            <QRCodeSVG value={clienta.qr_code} size={200} />
          </div>
          <div className="mt-4">
            <BotonCompartir url={shareUrl} />
          </div>
        </div>

        {/* Tarjeta */}
        {tarjetaActiva && (
          <>
            <TarjetaFidelidad visitas={tarjetaActiva.visitas_completadas} />

            {/* Próxima recompensa */}
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <h3 className="font-medium text-gray-700 mb-2">Próxima recompensa</h3>
              {tarjetaActiva.visitas_completadas < 5 && (
                <p className="text-sm text-gray-500">
                  🎁 Te faltan <strong>{5 - tarjetaActiva.visitas_completadas}</strong> visitas para tu regalo sorpresa
                </p>
              )}
              {tarjetaActiva.visitas_completadas >= 5 && tarjetaActiva.visitas_completadas < 7 && (
                <p className="text-sm text-gray-500">
                  💰 Te faltan <strong>{7 - tarjetaActiva.visitas_completadas}</strong> visitas para tu 15% de descuento
                </p>
              )}
              {tarjetaActiva.visitas_completadas >= 7 && tarjetaActiva.visitas_completadas < 10 && (
                <p className="text-sm text-gray-500">
                  ⭐ Te faltan <strong>{10 - tarjetaActiva.visitas_completadas}</strong> visitas para tu servicio GRATIS
                </p>
              )}
            </div>

            {/* Historial */}
            {tarjetaActiva.visitas?.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-medium text-gray-700 mb-2">Tus visitas</h3>
                <ul className="space-y-1">
                  {tarjetaActiva.visitas.map((v) => (
                    <li key={v.id} className="flex justify-between text-sm text-gray-500">
                      <span>Visita {v.numero_visita}</span>
                      <span>{new Date(v.fecha).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Vencimiento */}
            <p className="text-center text-xs text-gray-400">
              Tarjeta válida hasta: {new Date(tarjetaActiva.fecha_vencimiento).toLocaleDateString()}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
