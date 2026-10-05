# AGENTS.md

App de tarjeta de fidelidad para un salón de uñas. Son **dos proyectos npm independientes** (no hay `package.json` en la raíz, ni workspaces) — ejecuta cada comando dentro de `client/` o `server/`.

## Comandos

```bash
# instalar (una vez por proyecto, hay que hacerlo por separado)
cd server && npm install
cd client && npm install

# desarrollo
.\run-all.ps1              # desde la raíz: verifica el servicio de Postgres, aplica migraciones y levanta ambos
cd server && npm run dev   # nodemon, puerto 3001
cd client && npm run dev   # vite --host, HTTPS en 5173 (basicSsl: la cámara exige contexto seguro)
```

- `server` **no tiene script de test ni de lint**. En `client`, el lint es `npm run lint` (`eslint .`).
- **No existen tests, CI ni typecheck.** La verificación es manual: levanta ambos servidores y recorre a mano el flujo tocado. Usa `curl http://localhost:3001/api/health` para confirmar que la API responde.
- `npm run lint` falla hoy con **1 error preexistente** (`react-refresh/only-export-components` en `client/src/context/AuthContext.jsx:45`). No lo persigas; simplemente no agregues errores nuevos.
- `POST /api/visitas/marcar` tiene rate limit de **10/min** (`server/src/routes/visitas.js:9`) — si pruebas en bucle vas a recibir 429.
- Login del seed: `cata.saldivialanyon@gmail.com` / `admin123` (`server/prisma/seed.js`).

## Base de datos

- **Solo PostgreSQL**, local en `postgresql://postgres:postgres@localhost:5432/dearbeauty` (`server/.env`). `run-all.ps1` falla si el servicio de Windows `postgresql*` no está corriendo.
- Prisma 7 con **driver adapter**: un `new PrismaClient()` sin `new PrismaPg({ connectionString: process.env.DATABASE_URL })` va a fallar. El adapter se instancia en **dos** lugares — `server/src/lib/prisma.js` y `server/prisma/seed.js`. Mantenlos sincronizados.
- El `datasource` de `schema.prisma` **no tiene `url`**; viene de `server/prisma.config.ts` → `process.env.DATABASE_URL`.
- `server/dev.db`, `@prisma/adapter-better-sqlite3` y `better-sqlite3` son **restos muertos de una época SQLite**. Ignóralos; el runtime es Postgres.
- Después de editar `schema.prisma`: corre `.\refresh.ps1` (migrate dev + generate) **y reinicia el servidor**. Las sesiones de dev abiertas siguen con el cliente viejo.

## Documentación desactualizada

`docs/README.md` está desactualizado: dice React 18, hosting en Railway, y omite `citas`, `fecha_nacimiento` y los eventos de cumpleaños/vencimiento. Confía en `server/.env`, `server/src/index.js` y el schema de Prisma por encima del README. Hoy no hay despliegue a producción.

## Pendiente de deploy (bloqueante para el enlace público)

El QR que la clienta recibe es `/clienta/:qrCode`. La app usa `BrowserRouter` y `server/src/index.js`
**no sirve el front ni tiene fallback SPA**, así que ese enlace da **404 en cualquier host** hasta que se
elija dónde desplegar y se configure el rewrite a `index.html` (Netlify `_redirects`, Vercel `vercel.json`,
o `app.get('*')` si el server sirve el `dist/`). Es lo primero que hay que resolver antes de production.

## Notas de arquitectura

- Puntos de entrada: `server/src/index.js` (Express, puerto 3001) y `client/src/App.jsx` (todas las rutas están definidas ahí mismo; no hay archivos de rutas).
- **Todo el HTTP del client debe pasar por `client/src/services/api.js`** — nunca uses `axios`/`fetch` sueltos. Esa instancia inyecta el token `Bearer` desde `localStorage.token` y ante cualquier 401 lo borra y redirige a `/login`, *excepto* en las páginas públicas `/clienta/*`.
- El CORS es una lista blanca hardcodeada en `server/src/index.js:15`. Si agregas un origen del frontend, edita ese arreglo.
- **Las reglas de recompensa están duplicadas** en `server/src/routes/visitas.js:16` (`getRecompensa`) y en `server/src/lib/eventos.js` (texto de "próxima visita"). La lógica de visitas 5/7/10 está en ambos lados: cámbialos en los dos o la UI va a mentir.
- Todo el ciclo de vida de la tarjeta vive en `POST /api/visitas/marcar`: si falta la tarjeta o está vencida se crea una nueva (vencimiento a 1 año), y en la visita 10 se desactiva y se abre una nueva.
- Trampa de rutas: `/clienta/:qrCode` es la vista pública y `/clienta/detalle/:id` es privada. `App.jsx:23` las disambigua con un chequeo de string. Las rutas nuevas bajo `/clienta/*` necesitan el mismo cuidado o el `BottomNav` se renderiza encima de la página pública.
- El endpoint público `/api/public/clienta/:qrCode` (`server/src/index.js:30`) omite teléfono/email a propósito. Mantenlo así.
- Las fechas de `Cita` y `fecha_nacimiento` son **valores de solo fecha anclados a UTC** — el client manda `YYYY-MM-DD`, el server hace `new Date(str + 'T00:00:00.000Z')`, y el render usa `toLocaleDateString('es-CL', { timeZone: 'UTC' })` (`server/src/lib/eventos.js:10`, `client/src/components/DatePicker.jsx`). No las parses con `new Date()` en hora local o los cumpleaños se corren un día.
- El `POST /register` de `server/src/routes/auth.js` **no tiene guard de auth** y está expuesto públicamente. No lo reutilices para flujos de registro nuevos sin agregarle uno.
- `client/src/components/Navbar.jsx` fue eliminado: estaba muerto (nadie lo importaba) y su botón "Salir" medía 24px de alto. El logout real vive en `Dashboard.jsx`.
- `client/src/services/api.js` tiene `timeout: 10000` y normaliza los fallos de red en `error.mensajeUI`. Usa `mensajeDeError(err)` y `esNoEncontrado(err)` en vez de leer `err.response` a mano: `DetalleClienta` distingue 404 real de caída de red con el segundo.

## Sistema de diseño

- Lee `DESIGN.md` (y `.impeccable/design.json`) antes de tocar UI. Ambos están **gitignorados** — son locales, no asumas que un clon los tenga.
- Los tokens de marca están definidos en `client/src/index.css` vía `@theme` de Tailwind 4 (paleta extraída del logo: `orquidea`, `lavanda`, `durazno`, `tinta`) más los roles semánticos `canvas`, `surface`, `line`, `primary`, `primary-soft`, `secondary`, `danger`. Usa siempre los roles semánticos, nunca hex sueltos. La paleta antigua `rosa/dorado` se eliminó (Fase 1: rediseño del Inicio).
- Reglas duras del design system: las recompensas se distinguen con `durazno` + icono lucide (ya no hay dorado); las superficies se mantienen planas en reposo con `shadow-sm` (`shadow-lg` solo para la tarjeta de fidelidad, el login y modales); toda superficie lleva radio; la página es una única columna `max-w-lg` sobre `bg-canvas` con `BottomNav` fijo (`pb-24` lo despeja, el Inicio usa `pb-28`).
- Fuentes web aprobadas: `Plus Jakarta Sans Variable` (texto) y `Yellowtail` (clase `font-script`, solo saludo de cabecera). El skill `impeccable` (`.opencode/skills/`) es la vía prevista para trabajo de diseño.
- Sin emojis en la UI: usa `lucide-react` con `aria-hidden="true"`.

## Convenciones

- **Todo el texto de cara al usuario, los mensajes de error de la API y los comentarios del código están en español (es-CL).** Mantenlos en español; no traduzcas a inglés las cadenas que ya existen.
- Los archivos de componentes del client son `PascalCase.jsx`; los del server van en minúsculas (`routes/visitas.js`).
- Las rutas del server devuelven `{ error: '...' }` en caso de fallo y hacen `console.error` antes del 500. Sigue esa forma.
- Mensajes de commit: `DEV: <descripción corta>` en español. El trabajo está en `tarjeta-fidelidad-mejoras`, sale de `main`. No hagas commit salvo que te lo pidan.
- `migracion/` contiene scripts de una sola vez con **credenciales de base de datos de producción hardcodeadas**. Está gitignorado — nunca lo des-ignorees ni muevas esas cadenas a código versionado.
