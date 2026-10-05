import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Plus, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import DatePicker from '../components/DatePicker';
import { Vacio } from '../components/Estados';
import api, { mensajeDeError } from '../services/api';
import useTecladoVirtual from '../hooks/useTecladoVirtual';

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
  const [modalError, setModalError] = useState('');
  const [eliminarId, setEliminarId] = useState(null);
  const [errorCarga, setErrorCarga] = useState('');
  const [buscandoClienta, setBuscandoClienta] = useState(false);

  const [form, setForm] = useState({
    titulo: '', fecha: '', hora_inicio: '', hora_fin: '', notas: '', clienta_id: null,
  });

  const debounceRef = useRef(null);
  useTecladoVirtual();

  const mesStr = `${mesActual.anio}-${String(mesActual.mes + 1).padStart(2, '0')}`;

  const cargarMes = useCallback(() => {
    api
      .get(`/citas?mes=${mesStr}`)
      .then((res) => setCitas(res.data))
      .catch(() => setErrorCarga('No pudimos cargar las citas del mes.'));
  }, [mesStr]);

  useEffect(cargarMes, [cargarMes]);

  const reintentarMes = () => {
    setErrorCarga('');
    cargarMes();
  };

  const cargarDia = useCallback(() => {
    if (!diaSeleccionado) return;
    const fechaStr = `${mesStr}-${String(diaSeleccionado).padStart(2, '0')}`;
    api
      .get(`/citas?fecha=${fechaStr}`)
      .then((res) => setCitasDia(res.data))
      .catch(() => setCitasDia([]));
  }, [diaSeleccionado, mesStr, citas]);

  useEffect(cargarDia, [cargarDia]);

  const primerDia = new Date(mesActual.anio, mesActual.mes, 1).getDay();
  const diasEnMes = new Date(mesActual.anio, mesActual.mes + 1, 0).getDate();
  const hoy = new Date();
  const esHoy = (dia) =>
    hoy.getFullYear() === mesActual.anio && hoy.getMonth() === mesActual.mes && hoy.getDate() === dia;

  const citasPorDia = {};
  citas.forEach((c) => {
    const d = new Date(c.fecha).getUTCDate();
    citasPorDia[d] = (citasPorDia[d] || 0) + 1;
  });

  const cambiarMes = (dir) => {
    setDiaSeleccionado(null);
    setCitasDia([]);
    setMesActual((prev) => {
      let m = prev.mes + dir;
      let a = prev.anio;
      if (m < 0) { m = 11; a--; }
      if (m > 11) { m = 0; a++; }
      return { anio: a, mes: m };
    });
  };

  const abrirNuevaCita = () => {
    setForm({
      titulo: '', fecha: `${mesStr}-${String(diaSeleccionado).padStart(2, '0')}`,
      hora_inicio: '', hora_fin: '', notas: '', clienta_id: null,
    });
    setEditandoCita(null);
    setBusquedaClienta('');
    setModalError('');
    setShowModal(true);
  };

  const abrirEditarCita = (cita) => {
    setForm({
      titulo: cita.titulo,
      fecha: cita.fecha.split('T')[0],
      hora_inicio: cita.hora_inicio,
      hora_fin: cita.hora_fin || '',
      notas: cita.notas || '',
      clienta_id: cita.clienta_id,
    });
    setEditandoCita(cita);
    setBusquedaClienta(cita.clienta?.nombre || '');
    setModalError('');
    setShowModal(true);
  };

  const guardarCita = async (e) => {
    e.preventDefault();
    setLoading(true);
    setModalError('');
    try {
      if (editandoCita) {
        await api.put(`/citas/${editandoCita.id}`, form);
      } else {
        await api.post('/citas', form);
      }
      const res = await api.get(`/citas?mes=${mesStr}`);
      setCitas(res.data);
      setShowModal(false);
    } catch (err) {
      setModalError(mensajeDeError(err, 'No pudimos guardar la cita.'));
    } finally {
      setLoading(false);
    }
  };

  const eliminarCita = async () => {
    if (eliminarId == null) return;
    try {
      await api.delete(`/citas/${eliminarId}`);
      const res = await api.get(`/citas?mes=${mesStr}`);
      setCitas(res.data);
      setEliminarId(null);
    } catch {
      setEliminarId(null);
      setModalError('No pudimos eliminar la cita.');
    }
  };

  const buscarClientas = (q) => {
    setBusquedaClienta(q);
    clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setClientas([]);
      return;
    }
    setBuscandoClienta(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/clientas/buscar?q=${encodeURIComponent(q.trim())}`);
        setClientas(res.data);
      } catch {
        setClientas([]);
      } finally {
        setBuscandoClienta(false);
      }
    }, 300);
  };

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const seleccionarClienta = (c) => {
    setForm((prev) => ({ ...prev, clienta_id: c.id, titulo: prev.titulo || c.nombre }));
    setBusquedaClienta(c.nombre);
    setClientas([]);
  };

  const campo = 'w-full min-h-11 px-3 py-2 border border-line rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary/50';
  const navBtn = 'w-11 h-11 flex items-center justify-center text-tinta-suave rounded-lg transition-colors hover:bg-primary-soft active:bg-primary-soft';

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-4 safe-top safe-bottom">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => cambiarMes(-1)} aria-label="Mes anterior" className={navBtn}>
          <ChevronLeft aria-hidden="true" className="size-5" />
        </button>
        <h1 className="text-lg font-bold text-tinta">
          {MESES[mesActual.mes]} {mesActual.anio}
        </h1>
        <button type="button" onClick={() => cambiarMes(1)} aria-label="Mes siguiente" className={navBtn}>
          <ChevronRight aria-hidden="true" className="size-5" />
        </button>
      </div>

      {errorCarga && (
        <div role="alert" className="bg-danger/10 text-danger text-sm p-3 rounded-lg">
          {errorCarga}{' '}
          <button
            type="button"
            onClick={reintentarMes}
            className="min-h-11 px-2 underline underline-offset-2"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="bg-surface rounded-xl shadow-sm p-3">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-tinta-suave py-1">{d}</div>
          ))}
        </div>
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
                type="button"
                onClick={() => setDiaSeleccionado(dia)}
                aria-label={`Día ${dia} de ${MESES[mesActual.mes]}`}
                aria-pressed={seleccionado}
                className={`relative h-11 rounded-lg text-base font-medium transition-colors motion-reduce:transition-none ${
                  seleccionado
                    ? 'bg-primary text-white'
                    : esHoy(dia)
                    ? 'bg-primary-soft text-primary'
                    : 'text-tinta hover:bg-line active:bg-line'
                }`}
              >
                {dia}
                {tieneCitas ? (
                  <span
                    className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                      seleccionado ? 'bg-white' : 'bg-primary'
                    }`}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {diaSeleccionado && (
        <div className="bg-surface rounded-xl shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-tinta">
              {diaSeleccionado} de {MESES[mesActual.mes]}
            </h2>
            <button
              type="button"
              onClick={abrirNuevaCita}
              aria-label="Nueva cita"
              className="w-11 h-11 bg-primary text-white rounded-full flex items-center justify-center text-lg transition-colors hover:bg-primary/90 active:bg-primary/95"
            >
              <Plus aria-hidden="true" className="size-5" />
            </button>
          </div>

          {citasDia.length === 0 ? (
            <p className="text-sm text-tinta-suave text-center py-4">
              Sin citas este día. Usa + para agendar una.
            </p>
          ) : (
            <ul className="space-y-2">
              {citasDia.map((cita) => (
                <li key={cita.id} className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => abrirEditarCita(cita)}
                    className="flex-1 min-w-0 min-h-11 text-left p-2 rounded-lg transition-colors hover:bg-primary-soft active:bg-primary-soft"
                  >
                    <p className="text-sm font-medium text-tinta truncate">{cita.titulo}</p>
                    <p className="text-xs text-tinta-suave">
                      {cita.hora_inicio}{cita.hora_fin ? ` – ${cita.hora_fin}` : ''}
                      {cita.clienta && ` · ${cita.clienta.nombre}`}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setModalError(''); setEliminarId(cita.id); }}
                    aria-label={`Eliminar cita ${cita.titulo}`}
                    className="w-11 h-11 flex items-center justify-center text-danger rounded-lg transition-colors hover:bg-danger/10 active:bg-danger/20 shrink-0"
                  >
                    <Trash2 aria-hidden="true" className="size-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!diaSeleccionado && (
        <Vacio
          titulo="Elige un día para ver sus citas"
          detalle="Toca un día del calendario o usa las flechas para cambiar de mes."
        />
      )}

      {showModal && (
        <Modal titulo={editandoCita ? 'Editar cita' : 'Nueva cita'} onCerrar={() => { setShowModal(false); setModalError(''); }}>
          {modalError && (
            <div role="alert" className="bg-danger/10 text-danger text-sm p-3 rounded-lg mb-3">
              {modalError}
            </div>
          )}

          <form onSubmit={guardarCita} className="space-y-3">
            <div>
              <label htmlFor="cita-titulo" className="block text-sm font-medium text-tinta mb-1">
                Título *
              </label>
              <input
                id="cita-titulo"
                type="text"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                className={campo}
                enterKeyHint="next"
                required
              />
            </div>

            <div>
              <span className="block text-sm font-medium text-tinta mb-1" id="cita-fecha-label">
                Fecha *
              </span>
              <DatePicker
                value={form.fecha}
                onChange={(v) => setForm({ ...form, fecha: v })}
                ariaLabel="Fecha de la cita"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="cita-hora-inicio" className="block text-sm font-medium text-tinta mb-1">
                  Hora inicio *
                </label>
                <input
                  id="cita-hora-inicio"
                  type="time"
                  value={form.hora_inicio}
                  onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
                  className={campo}
                  enterKeyHint="next"
                  required
                />
              </div>
              <div>
                <label htmlFor="cita-hora-fin" className="block text-sm font-medium text-tinta mb-1">
                  Hora fin
                </label>
                <input
                  id="cita-hora-fin"
                  type="time"
                  value={form.hora_fin}
                  onChange={(e) => setForm({ ...form, hora_fin: e.target.value })}
                  className={campo}
                />
              </div>
            </div>

            <div className="relative">
              <label htmlFor="cita-clienta" className="block text-sm font-medium text-tinta mb-1">
                Clienta (opcional)
              </label>
              <input
                id="cita-clienta"
                type="text"
                role="combobox"
                aria-expanded={clientas.length > 0}
                aria-controls="resultados-clientas"
                aria-autocomplete="list"
                autoComplete="off"
                value={busquedaClienta}
                onChange={(e) => buscarClientas(e.target.value)}
                placeholder="Buscar clienta..."
                className={`${campo} ${form.clienta_id ? 'pr-12' : ''}`}
              />
              {form.clienta_id && (
                <button
                  type="button"
                  onClick={() => { setForm({ ...form, clienta_id: null }); setBusquedaClienta(''); }}
                  aria-label="Quitar clienta seleccionada"
                  className="absolute right-0 top-8 bottom-0 w-11 flex items-center justify-center text-tinta-suave transition-colors active:bg-line"
                >
                  <X aria-hidden="true" className="size-5" />
                </button>
              )}
              {buscandoClienta && (
                <p className="text-xs text-tinta-suave mt-1" role="status">
                  Buscando…
                </p>
              )}
              <ul
                id="resultados-clientas"
                role="listbox"
                aria-label="Clientas encontradas"
                className={`absolute left-0 right-0 top-full mt-1 bg-surface border border-line rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto ${
                  clientas.length > 0 ? '' : 'hidden'
                }`}
              >
                {clientas.map((c) => (
                  <li key={c.id} role="option" aria-selected="false">
                    <button
                      type="button"
                      onClick={() => seleccionarClienta(c)}
                      className="w-full text-left px-3 py-3 min-h-11 text-sm transition-colors hover:bg-primary-soft active:bg-primary-soft"
                    >
                      {c.nombre} · {c.telefono}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <label htmlFor="cita-notas" className="block text-sm font-medium text-tinta mb-1">
                Notas
              </label>
              <textarea
                id="cita-notas"
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                rows={2}
                className={`${campo} resize-none`}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 min-h-11 bg-primary text-white py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-primary/90 active:bg-primary/95 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={() => { setShowModal(false); setModalError(''); }}
                className="flex-1 min-h-11 bg-line text-tinta py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-line/80 active:bg-line"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {eliminarId != null && (
        <Modal titulo="Eliminar cita" onCerrar={() => { setEliminarId(null); setModalError(''); }}>
          <p className="text-sm text-tinta-suave text-center">
            Esta acción no se puede deshacer.
          </p>
          {modalError && (
            <div role="alert" className="mt-3 bg-danger/10 text-danger text-sm p-3 rounded-lg">
              {modalError}
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={eliminarCita}
              className="flex-1 min-h-11 bg-danger text-white py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-danger/90 active:bg-danger/95"
            >
              Sí, eliminar
            </button>
            <button
              type="button"
              onClick={() => { setEliminarId(null); setModalError(''); }}
              className="flex-1 min-h-11 bg-line text-tinta py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-line/80 active:bg-line"
            >
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}