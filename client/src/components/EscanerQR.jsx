import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api, { mensajeDeError } from '../services/api';

export default function EscanerQR({ onScan, onError }) {
  const [scanning, setScanning] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [showBuscar, setShowBuscar] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const scannerRef = useRef(null);

  /* En el salón la luz es mala: la linterna es la diferencia entre
     escanear el QR en dos segundos o no poder escanearlo. */
  const applyTorch = async (activo) => {
    const scanner = scannerRef.current;
    if (!scanner?.isScanning) return;
    try {
      const capabilities = await Html5Qrcode.getCapabilities();
      if (!capabilities?.torch) return;
      await scanner.applyVideoConstraints({ advanced: [{ torch: activo }] });
      setTorchOn(activo);
    } catch {
      /* muchos navegadores no lo soportan: el botón simplemente no aparece */
    }
  };

  const startScanning = async () => {
    try {
      const html5Qrcode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5Qrcode;

      await html5Qrcode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            /*qrbox responsivo: en un celular angosto un cuadrado fijo se sale del visor */
            const lado = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.72);
            return { width: lado, height: lado };
          },
          aspectRatio: 1,
        },
        (decodedText) => {
          html5Qrcode.stop().then(() => {
            setScanning(false);
            setTorchOn(false);
            onScan(decodedText);
          });
        },
        () => {}
      );
      setScanning(true);

      const capabilities = await Html5Qrcode.getCapabilities();
      if (capabilities?.torch) {
        applyTorch(true).catch(() => {});
      }
    } catch (err) {
      const msg = err.message || err || '';
      if (
        typeof msg === 'string' &&
        (msg.includes('NotAllowedError') ||
          msg.includes('secure context') ||
          msg.includes('Permission'))
      ) {
        onError?.('La cámara requiere HTTPS. Busca a la clienta por nombre o teléfono.');
        setShowBuscar(true);
      } else {
        onError?.(typeof msg === 'string' ? msg : 'No se pudo acceder a la cámara');
        setShowBuscar(true);
      }
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
      setScanning(false);
      setTorchOn(false);
    }
  };

  const handleBuscar = async (e) => {
    e.preventDefault();
    if (busqueda.trim().length < 2) return;
    setBuscando(true);
    setResultados([]);
    try {
      const res = await api.get(`/clientas/buscar?q=${encodeURIComponent(busqueda.trim())}`);
      setResultados(res.data);
      if (res.data.length === 0) {
        onError?.('No se encontraron clientas');
      }
    } catch (err) {
      onError?.(mensajeDeError(err, 'No pudimos buscar la clienta.'));
    } finally {
      setBuscando(false);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div id="qr-reader" className="w-full max-w-sm rounded-lg overflow-hidden" />

      {!scanning ? (
        <button
          type="button"
          onClick={startScanning}
          className="min-h-11 bg-rosa-ink text-white px-6 py-3 rounded-full font-medium transition-colors hover:bg-rosa-ink/90 active:bg-rosa-ink/95"
        >
          📷 Abrir cámara
        </button>
      ) : (
        <div className="flex gap-3">
          {torchOn && (
            <button
              type="button"
              onClick={() => applyTorch(false)}
              aria-pressed="true"
              className="min-h-11 px-5 py-3 rounded-full bg-dorado/25 text-dorado-ink font-medium transition-colors active:bg-dorado/40"
            >
              🔦 Apagar luz
            </button>
          )}
          <button
            type="button"
            onClick={stopScanning}
            className="min-h-11 bg-gray-600 text-white px-6 py-3 rounded-full font-medium transition-colors hover:bg-gray-700 active:bg-gray-800"
          >
            Cerrar cámara
          </button>
        </div>
      )}

      {/* Buscar por nombre o teléfono: el camino cuando la cámara no abre */}
      <button
        type="button"
        onClick={() => setShowBuscar(!showBuscar)}
        aria-expanded={showBuscar}
        className="min-h-11 px-3 text-sm text-rosa-ink underline underline-offset-2"
      >
        {showBuscar ? 'Ocultar búsqueda' : 'Buscar por nombre o teléfono'}
      </button>

      {showBuscar && (
        <div className="w-full max-w-sm space-y-3">
          <form onSubmit={handleBuscar} className="flex gap-2">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Nombre o teléfono..."
              aria-label="Buscar clienta por nombre o teléfono"
              className="flex-1 min-w-0 min-h-11 px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-rosa-ink/50"
              enterKeyHint="search"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
            />
            <button
              type="submit"
              disabled={buscando || busqueda.trim().length < 2}
              className="min-h-11 shrink-0 bg-rosa-ink text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors active:bg-rosa-ink/95 disabled:opacity-50"
            >
              {buscando ? '...' : 'Buscar'}
            </button>
          </form>

          {resultados.length > 0 && (
            <ul className="bg-white rounded-lg shadow-sm border divide-y">
              {resultados.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onScan(c.qr_code)}
                    className="w-full text-left px-4 py-3 min-h-11 transition-colors hover:bg-rosa/20 active:bg-rosa/30"
                  >
                    <p className="font-medium text-gray-800">{c.nombre}</p>
                    <p className="text-sm text-gray-600">
                      {c.telefono} · {c.tarjetas?.[0]?.visitas_completadas || 0}/10 visitas
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}