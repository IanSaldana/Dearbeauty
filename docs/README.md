# Dear Beauty - Sistema de Tarjeta de Fidelidad

## Descripción

Aplicación web mobile-first para gestionar tarjetas de fidelidad de un salón de uñas. Permite a la manicurista registrar clientas, marcar visitas mediante escaneo de QR o búsqueda, y otorgar recompensas automáticas. Las clientas pueden ver su progreso desde un enlace público.

---

## Stack Técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite 8 + Tailwind CSS 4 |
| Backend | Node.js + Express |
| ORM | Prisma 7 |
| Base de datos | PostgreSQL (Railway) |
| Auth | JWT + bcryptjs |
| QR | html5-qrcode (escaneo) + qrcode.react (generación) |

---

## Requisitos Previos

- **Node.js** v18+ (incluye npm)
- **Git**
- Cuenta en [Railway](https://railway.app) (base de datos PostgreSQL)

---

## Estructura del Proyecto

```
DearBeauty/
├── client/                     # Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   ├── EscanerQR.jsx      # Escáner de cámara + búsqueda manual
│   │   │   ├── Navbar.jsx          # Navegación del panel admin
│   │   │   └── TarjetaFidelidad.jsx # Componente visual de tarjeta 5x2
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Contexto de autenticación
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Login manicurista
│   │   │   ├── Dashboard.jsx       # Panel principal
│   │   │   ├── RegistrarClienta.jsx # Formulario nueva clienta
│   │   │   ├── EscanearVisita.jsx  # Escanear QR / buscar clienta
│   │   │   ├── DetalleClienta.jsx  # Detalle con QR e historial
│   │   │   └── VistaClienta.jsx    # Vista pública (sin login)
│   │   ├── services/
│   │   │   └── api.js             # Axios configurado con interceptores
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css              # Tailwind + tema personalizado
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend Express
│   ├── prisma/
│   │   ├── schema.prisma          # Modelos de la BD
│   │   ├── migrations/            # Migraciones SQL
│   │   └── seed.js                # Seed de datos iniciales
│   ├── src/
│   │   ├── lib/
│   │   │   └── prisma.js          # Cliente Prisma centralizado
│   │   ├── middleware/
│   │   │   └── auth.js            # Middleware JWT
│   │   ├── routes/
│   │   │   ├── auth.js            # Login, registro, verificación
│   │   │   ├── clientas.js        # CRUD clientas + búsqueda
│   │   │   └── visitas.js         # Marcar visitas + recompensas
│   │   └── index.js               # Entry point Express
│   ├── .env
│   ├── prisma.config.ts
│   └── package.json
│
├── prompt/                     # Documentación del prompt original
├── docs/                       # Documentación técnica
├── run-all.ps1                 # Script para levantar todo
└── .gitignore
```

---

## Puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| Backend (Express) | 3001 | http://localhost:3001 |
| PostgreSQL (Railway) | 10629 | acela.proxy.rlwy.net:10629 |

El frontend usa un proxy de Vite (`/api` → `localhost:3001`) para evitar problemas de CORS.

---

## Base de Datos

### Proveedor
PostgreSQL alojado en **Railway** (plan gratuito).

### Modelos

#### Manicurista
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int (autoincrement) | PK |
| nombre | String | Nombre completo |
| email | String (unique) | Login |
| password_hash | String | Contraseña hasheada (bcrypt) |
| created_at | DateTime | Fecha de creación |

#### Clienta
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int (autoincrement) | PK |
| nombre | String | Nombre de la clienta |
| telefono | String | Teléfono de contacto |
| email | String? | Email (opcional) |
| qr_code | String (unique, uuid) | Identificador QR único |
| created_at | DateTime | Fecha de registro |

#### Tarjeta
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int (autoincrement) | PK |
| clienta_id | Int | FK → Clienta |
| visitas_completadas | Int (default: 0) | Contador 0-10 |
| activa | Boolean (default: true) | Si está en uso |
| fecha_inicio | DateTime | Primera visita |
| fecha_vencimiento | DateTime | Expira en 1 año |
| created_at | DateTime | Fecha de creación |

#### Visita
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int (autoincrement) | PK |
| tarjeta_id | Int | FK → Tarjeta |
| numero_visita | Int | Número 1-10 |
| recompensa | String? | Texto de recompensa si aplica |
| fecha | DateTime | Fecha de la visita |
| notas | String? | Notas opcionales |

### Conexión
Configurada en `server/.env`:
```
DATABASE_URL="postgresql://usuario:password@host:puerto/database"
```

El ORM Prisma 7 usa `@prisma/adapter-pg` para conectarse.

---

## Autenticación

- **Método:** JWT (JSON Web Token)
- **Expiración:** 7 días
- **Hashing:** bcrypt con 12 rounds
- **Almacenamiento:** Token en `localStorage` del navegador
- **Middleware:** Verifica token en todas las rutas protegidas

---

## Flujos del Sistema

### 1. Login de Manicurista
```
Manicurista → Login (email + password)
  → Backend verifica credenciales (bcrypt.compare)
  → Genera JWT
  → Frontend almacena token
  → Redirige al Dashboard
```

### 2. Registrar Nueva Clienta
```
Manicurista → "Nueva Clienta" → Ingresa nombre + teléfono
  → Backend crea Clienta con qr_code UUID auto-generado
  → Crea Tarjeta activa (vencimiento: 1 año)
  → Devuelve clienta con su QR
```

### 3. Marcar Visita (flujo principal)
```
Clienta muestra QR en su celular
  → Manicurista abre "Escanear QR" en su panel
  → Escanea con cámara (HTTPS) o busca por nombre/teléfono (HTTP)
  → Sistema muestra tarjeta actual de la clienta
  → Manicurista confirma "Marcar Visita"
  → Backend registra visita, incrementa contador
  → Si hay recompensa → alerta especial
  → Si es visita 10 → cierra tarjeta, abre nueva
```

### 4. Vista Pública de Clienta
```
Clienta abre su link: /clienta/{qr_code}
  → Endpoint público (sin auth): /api/public/clienta/:qrCode
  → Muestra: QR, tarjeta visual, progreso, próxima recompensa, historial
  → No puede marcarse visitas a sí misma
```

### 5. Recompensas Automáticas
| Visita | Recompensa |
|--------|-----------|
| 5 | 🎁 REGALO - Producto o servicio sorpresa |
| 7 | 💰 15% de descuento en el servicio |
| 10 | ⭐ Servicio a elección GRATIS + nueva tarjeta |

---

## Endpoints API

### Públicos (sin auth)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/login | Login |
| POST | /api/auth/register | Registro (setup inicial) |
| GET | /api/public/clienta/:qrCode | Vista pública clienta |
| GET | /api/health | Health check |

### Protegidos (requieren JWT)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/auth/me | Verificar token |
| GET | /api/clientas | Listar clientas |
| GET | /api/clientas/buscar?q= | Buscar por nombre/teléfono |
| GET | /api/clientas/qr/:qrCode | Buscar por QR |
| GET | /api/clientas/:id | Detalle clienta |
| POST | /api/clientas | Registrar clienta |
| POST | /api/visitas/marcar | Marcar visita |
| GET | /api/visitas/recientes | Últimas 20 visitas |

---

## Seguridad

- Solo la manicurista autenticada puede marcar visitas
- El QR solo identifica a la clienta (UUID), no contiene datos sensibles
- Las clientas NO pueden marcarse visitas a sí mismas
- Rate limiting: máximo 10 marcados de visita por minuto
- Contraseñas hasheadas con bcrypt (12 rounds)
- JWT con expiración de 7 días
- Endpoint público expone solo nombre, QR y tarjetas (sin teléfono/email)

---

## Cómo Ejecutar

### 1. Clonar e instalar
```bash
cd D:\Desarrollo\DearBeauty
cd server && npm install
cd ../client && npm install
```

### 2. Configurar variables de entorno
`server/.env`:
```
DATABASE_URL="postgresql://usuario:password@host:puerto/database"
JWT_SECRET="tu-clave-secreta"
PORT=3001
```

`client/.env`:
```
VITE_API_URL=/api
```

### 3. Migrar base de datos
```bash
cd server
npx prisma migrate dev
npx prisma generate
node prisma/seed.js
```

### 4. Levantar servicios
```powershell
.\run-all.ps1
```
O manualmente:
```bash
# Terminal 1 - Backend
cd server && node src/index.js

# Terminal 2 - Frontend
cd client && npm run dev
```

### 5. Acceder
- Panel admin: http://localhost:5173
- Login: `cata.saldivialanyon@gmail.com` / `admin123`

---

## Acceso desde Celular (red local)

1. PC y celular en la misma red WiFi
2. Frontend accesible en `http://<IP-LOCAL>:5173`
3. Cámara QR requiere HTTPS (funciona en producción)
4. Alternativa en HTTP: búsqueda por nombre/teléfono

---

## Deploy en Producción

### Base de datos
- Ya configurada en Railway (PostgreSQL)

### Backend (Render / Railway)
1. Crear servicio web → conectar repo GitHub
2. Build command: `cd server && npm install && npx prisma generate`
3. Start command: `cd server && node src/index.js`
4. Variables de entorno: `DATABASE_URL`, `JWT_SECRET`, `PORT`

### Frontend (Vercel / Netlify)
1. Conectar repo GitHub
2. Root directory: `client`
3. Build command: `npm run build`
4. Output: `dist`
5. Variable: `VITE_API_URL=https://tu-backend.onrender.com/api`

Con HTTPS en producción, el escaneo de QR con cámara funcionará en todos los dispositivos.
