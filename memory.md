# memory.md — Dear Beauty

App de tarjeta de fidelidad para salón de uñas. Web **mobile-first**: la manicurista la usa
de pie, con una mano, entre servicios. El cliente es React 19 + Vite 8 + Tailwind 4; el server
es Express + Prisma 7 + Postgres. Detalles de comandos y arquitectura en `AGENTS.md`.

## Reglas móviles (duras)

- `viewport-fit=cover` en `index.html` es **obligatorio**: sin él `env(safe-area-inset-*)` vale 0.
- Usa `dvh`/`svh`, **nunca** `vh`: la barra de URL de iOS y el teclado virtual hacen saltar el layout.
- Toda página con `BottomNav` fijo necesita `pb-24`. Sin eso los botones inferiores quedan tapados.
- Área táctil mínima **44×44px** (`min-h-11`, `w-11 h-11`). Nada de `py-1.5` en botones.
- Texto mínimo **12px (`text-xs`)**. `text-[9px]`/`text-[10px]` son ilegibles en un celular real.
- En táctil `hover:` no existe: toda interacción necesita `active:` (ya está en `index.css`).
- El teclado iOS tapa submits y popovers → `hooks/useTecladoVirtual.js` (usa `visualViewport`).
- Fechas de solo fecha ancladas a **UTC**: construye y formatea con `Date.UTC`/`getUTC*` y
  renderiza con `toLocaleDateString('es-CL', { timeZone: 'UTC' })`. Si no, los cumpleaños se corren un día.
- `EscanerQR.jsx` se carga con `React.lazy`: `html5-qrcode` pesa ~370 kB y no debe bloquear el primer render.

## Trampas del repo

- Las reglas de recompensa 5/7/10 están **duplicadas** en `server/src/routes/visitas.js` y
  `server/src/lib/eventos.js`. Cámbialas en los dos o la UI miente.
- `POST /api/auth/register` **no tiene guard de auth**. No lo reutilices para flujos nuevos.
- `/clientas` devuelve la lista completa; el filtrado es client-side. La paginación es del cliente.
- `BrowserRouter` sin fallback SPA y el server no sirve estáticos → el enlace público
  `/clienta/:qrCode` **da 404 en cualquier host** hasta que se elija deploy (falta el rewrite).
- La cámara exige contexto seguro. En LAN el certificado de `basicSsl` es autofirmado: para probar
  de verdad usa un túnel HTTPS. El dev server ya sirve HTTPS por `basicSsl()` en `vite.config.js`.
- `POST /api/visitas/marcar` tiene rate limit de 10/min.

## Design system

- Texto de marca: `primary` (`orquidea-700`) sobre superficies claras. Contraste AA verificado en los tonos 600-900.
- Recompensas (visitas 5/7/10): superficies `durazno` + icono lucide. Ya no hay dorado (paleta `rosa/dorado` eliminada).
- Iconos: `lucide-react` con `aria-hidden="true"`. Sin emojis en la UI.
- Fuentes: `Plus Jakarta Sans Variable` + `Yellowtail` (`font-script`, solo saludo de cabecera).
- Superficies planas en reposo (`shadow-sm`); `shadow-lg` solo para la tarjeta de fidelidad, login y modales.
- Toda superficie lleva radio. Superficies de operación sobrias: el encanto vive en la tarjeta y la recompensa.
- Iconos y textos de cara al usuario en español (es-CL). Los comentarios del código también.

## Verificación

- No hay tests, CI ni typecheck. `server` no tiene lint. La validación es manual.
- `cd client && npm run lint` → 1 error preexistente (`AuthContext.jsx:45`, `react-refresh`) y
  1 warning preexistente (`Calendario.jsx`, dep `citas`). No los persigas; no agregues nuevos.
- `npm run lint` prohíbe `setState` síncrono dentro de un effect (`react-hooks/set-state-in-effect`):
  pon el `setLoading(true)` en el handler que dispara la carga, no en el `useEffect`.
- Recorrido manual completo: Login → Registrar → Escanear (QR + búsqueda) → marcar → recompensa →
  Calendario → vista pública. Probar en un teléfono real, no solo en DevTools.