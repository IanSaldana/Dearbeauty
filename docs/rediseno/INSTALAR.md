# Aplicar el rediseño

1. Dependencias
   npm i lucide-react @fontsource-variable/plus-jakarta-sans @fontsource/yellowtail

2. Estilos: reemplaza el CSS global (el que importa Tailwind) por src/styles/theme.css.

3. Logo: src/assets/logo.png es icon-512.png. Úsalo también como favicon e icono PWA.

4. index.html
   <html lang="es">
   <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
   <meta name="theme-color" content="#7a2a8c" />

5. Emojis reemplazados por lucide-react (siempre con aria-hidden):
   Escanear QR -> QrCode | Nueva clienta -> UserPlus | Inicio -> House
   Clientas -> Users | Visitas -> ClipboardList | Calendario -> CalendarDays | Salir -> LogOut

6. HomePage recibe todo por props; conecta tus datos reales en la ruta.
