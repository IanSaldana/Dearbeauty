import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import TarjetaFidelidad from '../components/TarjetaFidelidad';
import api from '../services/api';

export default function DetalleClienta() {
  const { id } = useParams();
  const [clienta, setClienta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/clientas/${id}`)
      .then((res) => setClienta(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64">Cargando...</div>;
  if (!clienta) return <div className="text-center py-8 text-gray-500">Clienta no encontrada</div>;

  const tarjetaActiva = clienta.tarjetas?.find((t) => t.activa);
  const qrUrl = `${window.location.origin}/clienta/${clienta.qr_code}`;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Info clienta */}
      <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
        <h1 className="text-xl font-bold text-gray-800">{clienta.nombre}</h1>
        <p className="text-sm text-gray-500">{clienta.telefono}</p>
        {clienta.email && <p className="text-sm text-gray-400">{clienta.email}</p>}
      </div>

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
        <a
          href={qrUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-sm text-rosa-dark underline"
        >
          Ver vista de clienta
        </a>
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
