import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../services/api';

export default function EscanerQR({ onScan, onError }) {
  const [scanning, setScanning] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [showBuscar, setShowBuscar] = useState(false);
  const scannerRef = useRef(null);
  const containerRef = useRef(null);

  const startScanning = async () => {
    try {
      const html5Qrcode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5Qrcode;

      await html5Qrcode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          html5Qrcode.stop().then(() => {
            setScanning(false);
            onScan(decodedText);
          });
        },
        () => {}
      );
      setScanning(true);
    } catch (err) {
      const msg = err.message || err || '';
      if (typeof msg === 'string' && (msg.includes('NotAllowedError') || msg.includes('secure context') || msg.includes('Permission'))) {
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
      await scannerRef.current.stop();
      setScanning(false);
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
      onError?.(err.response?.data?.error || 'Error buscando clienta');
    } finally {
      setBuscando(false);
    }
  };

  const seleccionarClienta = (clienta) => {
    onScan(clienta.qr_code);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        id="qr-reader"
        ref={containerRef}
        className="w-full max-w-sm rounded-lg overflow-hidden"
      />
      {!scanning ? (
        <button
          onClick={startScanning}
          className="bg-rosa-dark text-white px-6 py-3 rounded-full font-medium hover:bg-rosa-dark/90 transition"
        >
          📷 Abrir cámara
        </button>
      ) : (
        <button
          onClick={stopScanning}
          className="bg-gray-500 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-600 transition"
        >
          Cerrar cámara
        </button>
      )}

      {/* Buscar por nombre o teléfono */}
      <button
        onClick={() => setShowBuscar(!showBuscar)}
        className="text-sm text-rosa-dark underline"
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
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rosa-dark/50"
            />
            <button
              type="submit"
              disabled={buscando || busqueda.trim().length < 2}
              className="bg-rosa-dark text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {buscando ? '...' : 'Buscar'}
            </button>
          </form>

          {resultados.length > 0 && (
            <ul className="bg-white rounded-lg shadow-sm border divide-y">
              {resultados.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => seleccionarClienta(c)}
                    className="w-full text-left px-4 py-3 hover:bg-rosa/20 transition"
                  >
                    <p className="font-medium text-gray-800">{c.nombre}</p>
                    <p className="text-xs text-gray-400">{c.telefono} · {c.tarjetas?.[0]?.visitas_completadas || 0}/10 visitas</p>
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
