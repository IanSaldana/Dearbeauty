# Tarjeta de Fidelidad — Prompt & Guía de Proyecto

---

## 1. PROMPT PARA DESARROLLAR LA APP

Copia y pega este prompt cuando empieces a construir la app:

---

```
Necesito una aplicación web mobile-first para un sistema de tarjeta de fidelidad
de un salón de uñas (manicura). La app será usada por UNA sola manicurista y
sus clientas.

## CONTEXTO DEL NEGOCIO
- Cada clienta tiene una tarjeta digital de fidelidad con 10 visitas
- La clienta presenta un código QR (desde su celular o impreso) a la manicurista
- La manicurista escanea el QR desde su celular y marca la visita
- Solo la manicurista autenticada puede marcar visitas
- Recompensas automáticas:
  - Visita 5 → REGALO (producto o servicio sorpresa)
  - Visita 7 → 15% de descuento en el servicio
  - Visita 10 → Servicio a elección GRATIS
- Al completar las 10 visitas, la tarjeta se reinicia automáticamente
  (se guarda historial de tarjetas completadas)
- La tarjeta tiene vigencia de 1 año desde la primera visita

## FUNCIONALIDADES

### Panel Manicurista (requiere login)
- Login con email y contraseña
- Dashboard: ver clientas activas, visitas recientes, tarjetas por vencer
- Registrar nueva clienta (nombre, teléfono, email opcional)
- Escanear QR de clienta → mostrar su tarjeta → confirmar marcado de visita
- Al marcar, mostrar animación de celebración + indicar si hay recompensa
- Ver historial de una clienta
- Poder generar/imprimir el QR de una clienta

### Vista Clienta (acceso público con su link/QR)
- Ver su tarjeta de fidelidad (cuántas visitas lleva)
- Ver recompensas próximas
- Ver historial de visitas con fechas
- Diseño tipo tarjeta visual (estética rosa/pastel similar a la imagen adjunta)

## STACK TÉCNICO
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Base de datos: PostgreSQL (se hospedará en Railway)
- Auth: JWT (bcrypt para passwords)
- QR: librería "qrcode" para generar, "html5-qrcode" para escanear con cámara
- ORM: Prisma

## DISEÑO
- Mobile-first (90% del uso será desde celular)
- Paleta: rosa pastel (#F5E6F0), blanco, negro, acentos dorados
- Tipografía elegante y femenina
- La tarjeta de fidelidad debe verse como la imagen de referencia:
  10 círculos en grid 5x2, los que están marcados se rellenan con un ícono/stamp
- Animaciones sutiles al marcar visitas
- Los círculos de visita 5, 7 y 10 deben mostrar la recompensa

## ESTRUCTURA DE BASE DE DATOS

### Tabla: manicurista
- id, nombre, email, password_hash, created_at

### Tabla: clienta
- id, nombre, telefono, email, qr_code (string único), created_at

### Tabla: tarjeta
- id, clienta_id, visitas_completadas (0-10), activa (boolean),
  fecha_inicio, fecha_vencimiento, created_at

### Tabla: visita
- id, tarjeta_id, numero_visita (1-10), recompensa (nullable),
  fecha, notas

## FLUJO PRINCIPAL
1. Manicurista inicia sesión
2. Clienta muestra su QR en el celular
3. Manicurista toca "Escanear QR"
4. La cámara lee el QR → busca la clienta
5. Muestra la tarjeta actual con las visitas
6. Manicurista confirma "Marcar visita"
7. Se registra la visita, se actualiza la tarjeta
8. Si hay recompensa → mostrar alerta especial
9. Si es la visita 10 → cerrar tarjeta y abrir una nueva

## SEGURIDAD
- Solo la manicurista autenticada puede marcar visitas
- El QR solo identifica a la clienta, no contiene datos sensibles
- Las clientas NO pueden marcarse visitas a sí mismas
- Rate limiting en el endpoint de marcar visita
```

---

## 2. CÓMO INICIAR EL PROYECTO

### Prerrequisitos
Asegúrate de tener instalado:
- **Node.js** v18+ → https://nodejs.org
- **npm** (viene con Node)
- **Git** → https://git-scm.com
- **PostgreSQL** local para desarrollo → https://postgresql.org
  (o usa Docker: `docker run -p 5432:5432 -e POSTGRES_PASSWORD=dev postgres`)

### Paso 1: Crear la estructura del proyecto

```bash
mkdir tarjeta-fidelidad
cd tarjeta-fidelidad

# Crear monorepo con frontend y backend
mkdir client server
```

### Paso 2: Inicializar el Backend

```bash
cd server
npm init -y
npm install express prisma @prisma/client cors dotenv bcryptjs jsonwebtoken
npm install -D nodemon
npx prisma init
```

Esto crea `prisma/schema.prisma` donde definirás las tablas.

### Paso 3: Inicializar el Frontend

```bash
cd ../client
npm create vite@latest . -- --template react
npm install
npm install tailwindcss @tailwindcss/vite
npm install react-router-dom html5-qrcode qrcode.react axios
```

### Paso 4: Configurar Tailwind (en vite.config.js)

```js
import tailwindcss from '@tailwindcss/vite'

export default {
  plugins: [react(), tailwindcss()]
}
```

En tu CSS principal agregar: `@import "tailwindcss";`

### Paso 5: Variables de entorno

Crear `server/.env`:
```
DATABASE_URL="postgresql://usuario:password@localhost:5432/fidelidad"
JWT_SECRET="tu-clave-secreta-aqui"
PORT=3001
```

Crear `client/.env`:
```
VITE_API_URL=http://localhost:3001/api
```

### Paso 6: Estructura de carpetas sugerida

```
tarjeta-fidelidad/
├── client/                  # Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   ├── TarjetaFidelidad.jsx   # Componente visual de la tarjeta
│   │   │   ├── EscanerQR.jsx          # Escáner de cámara
│   │   │   ├── QRClientа.jsx          # Muestra QR de la clienta
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── RegistrarClienta.jsx
│   │   │   ├── EscanearVisita.jsx
│   │   │   ├── DetalleClienta.jsx
│   │   │   └── VistaClienta.jsx       # Vista pública de la clienta
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                  # Backend Express
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── clientas.js
│   │   │   └── visitas.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── utils/
│   │   │   └── qr.js
│   │   └── index.js
│   └── package.json
│
└── README.md
```

---

## 3. ORDEN DE DESARROLLO SUGERIDO

Fase 1 — Base (1-2 días):
  Setup del proyecto, esquema Prisma, migraciones, endpoints de auth

Fase 2 — CRUD Clientas (1 día):
  Registrar clientas, generar QR único, listar clientas

Fase 3 — Escaneo y Visitas (1-2 días):
  Escáner QR con cámara, marcar visitas, lógica de recompensas

Fase 4 — Vista Clienta (1 día):
  Página pública donde la clienta ve su tarjeta y progreso

Fase 5 — Pulido (1-2 días):
  Animaciones, diseño final de la tarjeta, manejo de errores, testing

Fase 6 — Deploy (medio día):
  Subir backend a Railway, frontend a Vercel o Netlify


## 4. DEPLOY EN RAILWAY

1. Crear cuenta en https://railway.app
2. Nuevo proyecto → "Provision PostgreSQL" (base de datos gratis)
3. Agregar servicio → "Deploy from GitHub repo" (tu backend)
4. Configurar variables de entorno (DATABASE_URL la da Railway automáticamente)
5. El frontend se puede desplegar en Vercel (gratis) conectando el repo de GitHub
