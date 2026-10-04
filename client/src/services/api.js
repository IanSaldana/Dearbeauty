import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  // El wifi del salón se cae; sin timeout las pantallas quedan en "Cargando..." para siempre
  timeout: 10000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/clienta/')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    if (!error.response) {
      error.esRed = true;
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        error.mensajeUI = 'Sin conexión a internet.';
      } else if (error.code === 'ECONNABORTED') {
        error.mensajeUI = 'La conexión está muy lenta. Revisa el wifi e intenta de nuevo.';
      } else {
        error.mensajeUI = 'No pudimos conectarnos al servidor.';
      }
    }

    return Promise.reject(error);
  }
);

/** Mensaje de la API si existe; si no, el diagnóstico de red o el genérico. */
export function mensajeDeError(err, porDefecto = 'Ocurrió un error. Intenta de nuevo.') {
  return err?.response?.data?.error || err?.mensajeUI || porDefecto;
}

/** ¿La API respondió 404 de verdad, o nunca respondió? */
export function esNoEncontrado(err) {
  return err?.response?.status === 404;
}

export default API;