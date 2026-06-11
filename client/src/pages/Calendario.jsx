import { useState, useEffect } from 'react';
import api from '../services/api';

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function Calendario() {
  const [mesActual, setMesActual] = useState(() => {
    const hoy = new Date();
    return { anio: hoy.getFullYear(), mes: hoy.getMonth() };
  });
  const [citas, setCitas] = useState([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [citasDia, setCitasDia] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editandoCita, setEditandoCita] = useState(null);
  const [clientas, setClientas] = useState([]);
  const [busquedaClienta, setBusquedaClienta] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    titulo: '', fecha: '', hora_inicio: '', hora_fin: '', notas: '', clienta_id: null,
  });

  // Cargar citas del mes
  useEffect(() => {
    const mesStr = `${mesActual.anio}-${String(mesActual.mes + 1).padStart(2, '0')}`;
    api.get(`/citas?mes=${mesStr}`)
      .then((res) => setCitas(res.data));
  }, [mesActual]);

  // Cargar citas del día seleccionado
  useEffect(() => {
    if (!diaSeleccionado) { setCitasDia([]); return; }
    const fechaStr = `${mesActual.anio}-${String(mesActual.mes + 1).padStart(2, '0')}-${String(diaSeleccionado).padStart(2, '0')}`;
    api.get(`/citas?fecha=${fechaStr}`)
      .then((res) => setCitasDia(res.data));
  }, [diaSeleccionado, mesActual, citas]);

  // Generar grid del mes
  const primerDia = new Date(mesActual.anio, mesActual.mes, 1).getDay();
  const diasEnMes = new Date(mesActual.anio, mesActual.mes + 1, 0).getDate();
  const hoy = new Date();
  const esHoy = (dia) => hoy.getFullYear() === mesActual.anio && hoy.getMonth() === mesActual.mes && hoy.getDate() === dia;

  // Contar citas por día
  const citasPorDia = {};
  citas.forEach((c) => {
    const d = new Date(c.fecha).getUTCDate();
    citasPorDia[d] = (citasPorDia[d] || 0) + 1;
  });

  const cambiarMes = (dir) => {
    setDiaSeleccionado(null);
    setMesActual((prev) => {
      let m = prev.mes + dir;
      let a = prev.anio;
      if (m < 0) { m = 11; a--; }
      if (m > 11) { m = 0; a++; }
      return { anio: a, mes: m };
    });
  };

  const abrirNuevaCita = () => {
    const fechaStr = `${mesActual.anio}-${String(mesActual.mes + 1).padStart(2, '0')}-${String(diaSeleccionado).padStart(2, '0')}`;
    setForm({ titulo: '', fecha: fechaStr, hora_inicio: '', hora_fin: '', notas: '', clienta_id: null });
    setEditandoCita(null);
    setBusquedaClienta('');
    setShowModal(true);
  };

  const abrirEditarCita = (cita) => {
    const fechaStr = cita.fecha.split('T')[0];
    setForm({
      titulo: cita.titulo,
      fecha: fechaStr,
      hora_inicio: cita.hora_inicio,
      hora_fin: cita.hora_fin || '',
      notas: cita.notas || '',
      clienta_id: cita.clienta_id,
    });
    setEditandoCita(cita);
    setBusquedaClienta(cita.clienta?.nombre || '');
    setShowModal(true);
  };

  const guardarCita = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editandoCita) {
        await api.put(`/citas/${editandoCita.id}`, form);
      } else {
        await api.post('/citas', form);
      }
      // Refrescar
      const mesStr = `${mesActual.anio}-${String(mesActual.mes + 1).padStart(2, '0')}`;
      const res = await api.get(`/citas?mes=${mesStr}`);
      setCitas(res.data);
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar cita');
    } finally {
      setLoading(false);
    }
  };

  const eliminarCita = async (id) => {
    if (!confirm('¿Eliminar esta cita?')) return;
    try {
      await api.delete(`/citas/${id}`);
      const mesStr = `${mesActual.anio}-${String(mesActual.mes + 1).padStart(2, '0')}`;
      const res = await api.get(`/citas?mes=${mesStr}`);
      setCitas(res.data);
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  const buscarClientas = async (q) => {
    setBusquedaClienta(q);
    if (q.length >= 2) {
      const res = await api.get(`/clientas/buscar?q=${encodeURIComponent(q)}`);
      setClientas(res.data);
    } else {
      setClientas([]);
    }
  };

  const seleccionarClienta = (c) => {
    setForm({ ...form, clienta_id: c.id, titulo: form.titulo || c.nombre });
    setBusquedaClienta(c.nombre);
    setClientas([]);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-4">
      {/* Header mes */}
      <div className="flex items-center justify-between">
        <button onClick={() => cambiarMes(-1)} className="p-2 text-gray-500 hover:text-rosa-dark text-lg">←</button>
        <h1 className="text-lg font-bold text-gray-800">
          {MESES[mesActual.mes]} {mesActual.anio}
        </h1>
        <button onClick={() => cambiarMes(1)} className="p-2 text-gray-500 hover:text-rosa-dark text-lg">→</button>
      </div>

      {/* Grid calendario */}
      <div className="bg-white rounded-xl shadow-sm p-3">
        {/* Encabezado días */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
          ))}
        </div>
        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: primerDia }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: diasEnMes }).map((_, i) => {
            const dia = i + 1;
            const tieneCitas = citasPorDia[dia];
            const seleccionado = diaSeleccionado === dia;
            return (
              <button
                key={dia}
                onClick={() => setDiaSeleccionado(dia)}
                className={`relative h-9 rounded-lg text-sm font-medium transition ${
                  seleccionado
                    ? 'bg-rosa-dark text-white'
                    : esHoy(dia)
                    ? 'bg-rosa/50 text-rosa-dark'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                {dia}
                {tieneCitas && (
                  <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                    seleccionado ? 'bg-white' : 'bg-rosa-dark'
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vista de día */}
      {diaSeleccionado && (
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">
              {diaSeleccionado} de {MESES[mesActual.mes]}
            </h2>
            <button
              onClick={abrirNuevaCita}
              className="w-8 h-8 bg-rosa-dark text-white rounded-full flex items-center justify-center text-lg hover:bg-rosa-dark/90 transition"
            >
              +
            </button>
          </div>

          {citasDia.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin citas este día</p>
          ) : (
            <ul className="space-y-2">
              {citasDia.map((cita) => (
                <li key={cita.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-rosa/10 transition">
                  <div className="flex-1 min-w-0" onClick={() => abrirEditarCita(cita)}>
                    <p className="text-sm font-medium text-gray-800 truncate">{cita.titulo}</p>
                    <p className="text-xs text-gray-400">
                      {cita.hora_inicio}{cita.hora_fin ? ` - ${cita.hora_fin}` : ''}
                      {cita.clienta && ` · ${cita.clienta.nombre}`}
                    </p>
                  </div>
                  <button
                    onClick={() => eliminarCita(cita.id)}
                    className="text-xs text-red-400 hover:text-red-600 shrink-0 p-1"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Modal crear/editar cita */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-gray-800 text-center">
              {editandoCita ? 'Editar cita' : 'Nueva cita'}
            </h3>

            <form onSubmit={guardarCita} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Título *</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rosa-dark/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fecha *</label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rosa-dark/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Hora inicio *</label>
                  <input
                    type="time"
                    value={form.hora_inicio}
                    onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rosa-dark/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Hora fin</label>
                  <input
                    type="time"
                    value={form.hora_fin}
                    onChange={(e) => setForm({ ...form, hora_fin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rosa-dark/50"
                  />
                </div>
              </div>

              {/* Buscar clienta */}
              <div className="relative">
                <label className="block text-xs font-medium text-gray-600 mb-1">Clienta (opcional)</label>
                <input
                  type="text"
                  value={busquedaClienta}
                  onChange={(e) => buscarClientas(e.target.value)}
                  placeholder="Buscar clienta..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rosa-dark/50"
                />
                {form.clienta_id && (
                  <button
                    type="button"
                    onClick={() => { setForm({ ...form, clienta_id: null }); setBusquedaClienta(''); }}
                    className="absolute right-2 top-7 text-xs text-gray-400 hover:text-red-400"
                  >
                    ✕
                  </button>
                )}
                {clientas.length > 0 && (
                  <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-32 overflow-y-auto">
                    {clientas.map((c) => (
                      <li
                        key={c.id}
                        onClick={() => seleccionarClienta(c)}
                        className="px-3 py-2 text-sm hover:bg-rosa/20 cursor-pointer"
                      >
                        {c.nombre} · {c.telefono}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
                <textarea
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rosa-dark/50 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-rosa-dark text-white py-2 rounded-lg text-sm font-medium hover:bg-rosa-dark/90 transition disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
