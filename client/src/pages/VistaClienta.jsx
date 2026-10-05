import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Gift, BadgePercent, Star, Hand } from 'lucide-react';
import TarjetaFidelidad from '../components/TarjetaFidelidad';
import BannerEvento from '../components/BannerEvento';
import BotonCompartir from '../components/BotonCompartir';
import api from '../services/api';
import { EsqueletoTarjeta, ErrorConReintento, Vacio } from '../components/Estados';

const fmtFecha = (iso) => new Date(iso).toLocaleDateString('es-CL', { timeZone: 'UTC' });

export default function VistaClienta() {
  const { qrCode } = useParams();
  const [clienta, setClienta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(() => {
    api
      .get(`/public/clienta/${qrCode}`)
      .then((res) => setClienta(res.data))
      .catch(() => setError('No encontramos esta tarjeta.'))
      .finally(() => setLoading(false));
  }, [qrCode]);

  useEffect(cargar, [cargar]);

  const reintentar = () => {
    setLoading(true);
    setError('');
    cargar();
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-canvas px-4 py-8 safe-top safe-bottom">
        <div className="max-w-sm mx-auto space-y-6">
          <span className="sr-only">Cargando…</span>
          <EsqueletoTarjeta />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh bg-canvas px-4 py-8 flex items-center safe-top safe-bottom">
        <div className="max-w-sm mx-auto w-full">
          <ErrorConReintento mensaje={error} onReintentar={reintentar} />
        </div>
      </div>
    );
  }

  const tarjetaActiva = clienta?.tarjetas?.[0];
  const shareUrl = window.location.href;

  return (
    <div className="min-h-dvh bg-canvas px-4 py-8 safe-top safe-bottom">
      <div className="max-w-sm mx-auto space-y-6">
        <div className="text-center">
          <img src="/icon-192.png" alt="" width={64} height={64} className="w-16 h-16 mx-auto mb-1" />
          <h1 className="text-2xl font-bold text-primary">Dear Beauty</h1>
          <p className="text-sm text-tinta-suave">Tarjeta de Fidelidad</p>
        </div>

        <div className="text-center">
          <h2 className="text-lg font-semibold text-tinta flex items-center justify-center gap-1.5">
Hola, {clienta.nombre}
          <Hand aria-hidden="true" className="size-5" />
          </h2>
        </div>

        <BannerEvento evento={clienta.proximo_evento} />

        <div className="bg-surface rounded-2xl shadow-sm p-6 text-center">
          <h3 className="font-medium text-tinta mb-1">Tu código QR</h3>
          <p className="text-sm text-tinta-suave mb-4">
            Muéstralo a tu manicurista para registrar tu visita
          </p>
          <div className="inline-block p-4 bg-surface border-2 border-line rounded-xl max-w-full">
            <QRCodeSVG
              value={clienta.qr_code}
              size={200}
              style={{ width: '100%', maxWidth: '200px', height: 'auto' }}
            />
          </div>
          <div className="mt-4">
            <BotonCompartir url={shareUrl} />
          </div>
        </div>

        {tarjetaActiva ? (
          <>
            <TarjetaFidelidad visitas={tarjetaActiva.visitas_completadas} />

            <div className="bg-surface rounded-xl p-4 shadow-sm text-center">
              <h3 className="font-medium text-tinta mb-2">Próxima recompensa</h3>
              {tarjetaActiva.visitas_completadas < 5 && (
                <p className="text-sm text-tinta-suave">
                  <Gift aria-hidden="true" className="inline-block size-4 align-middle" />
                  Te faltan <strong>{5 - tarjetaActiva.visitas_completadas}</strong> visitas
                  para tu regalo sorpresa
                </p>
              )}
              {tarjetaActiva.visitas_completadas >= 5 && tarjetaActiva.visitas_completadas < 7 && (
                <p className="text-sm text-tinta-suave">
                  <BadgePercent aria-hidden="true" className="inline-block size-4 align-middle" />
                  Te faltan <strong>{7 - tarjetaActiva.visitas_completadas}</strong> visitas
                  para tu 15% de descuento
                </p>
              )}
              {tarjetaActiva.visitas_completadas >= 7 && tarjetaActiva.visitas_completadas < 10 && (
                <p className="text-sm text-tinta-suave">
                  <Star aria-hidden="true" className="inline-block size-4 align-middle" />
                  Te faltan <strong>{10 - tarjetaActiva.visitas_completadas}</strong> visitas
                  para tu servicio GRATIS
                </p>
              )}
              {tarjetaActiva.visitas_completadas >= 10 && (
                <p className="text-sm text-primary font-medium flex items-center justify-center gap-1.5">
                  <Star aria-hidden="true" className="size-4" />
                  Completaste las 10 visitas. Tu próxima tarjeta ya está disponible.
                </p>
              )}
            </div>

            {tarjetaActiva.visitas?.length > 0 && (
              <div className="bg-surface rounded-xl p-4 shadow-sm">
                <h3 className="font-medium text-tinta mb-2">Tus visitas</h3>
                <ul className="space-y-1">
                  {tarjetaActiva.visitas.map((v) => (
                    <li key={v.id} className="flex justify-between text-sm text-tinta-suave">
                      <span>Visita {v.numero_visita}</span>
                      <span className="tabular-nums">{fmtFecha(v.fecha)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-center text-sm text-tinta-suave">
              Tarjeta válida hasta: {fmtFecha(tarjetaActiva.fecha_vencimiento)}
            </p>
          </>
        ) : (
          <Vacio
            titulo="No tienes una tarjeta activa"
            detalle="Tu manicurista puede abrirte una tarjeta nueva en tu próxima visita."
          />
        )}
      </div>
    </div>
  );
}