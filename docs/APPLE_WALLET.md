# Apple Wallet — Tarjeta de Fidelidad (Mejora Futura)

## ¿Qué es?
Permitir que las clientas agreguen su tarjeta de fidelidad Dear Beauty
directamente a Apple Wallet como una tarjeta tipo "Store Card".

## Requisitos

1. **Cuenta Apple Developer** ($99 USD/año)
2. **Certificado Pass Type ID** generado desde developer.apple.com
3. **Servidor con HTTPS** (ya lo tenemos con Render)

## Librería recomendada

`passkit-generator` (npm)
```bash
npm install passkit-generator
```

## Estructura del .pkpass

Un archivo .pkpass es un ZIP firmado que contiene:
```
pass.json          # Definición de la tarjeta
icon.png           # 29x29
icon@2x.png        # 58x58
logo.png           # 160x50
strip.png          # 375x123 (imagen de fondo)
manifest.json      # Hash SHA1 de cada archivo
signature          # Firma PKCS7
```

### pass.json (estructura básica)
```json
{
  "formatVersion": 1,
  "passTypeIdentifier": "pass.com.dearbeauty.fidelidad",
  "teamIdentifier": "TU_TEAM_ID",
  "organizationName": "Dear Beauty",
  "serialNumber": "clienta-{qr_code}",
  "description": "Tarjeta de Fidelidad Dear Beauty",
  "storeCard": {
    "headerFields": [
      { "key": "visitas", "label": "Visitas", "value": "6/10" }
    ],
    "primaryFields": [
      { "key": "nombre", "label": "Cliente", "value": "Nombre Clienta" }
    ],
    "secondaryFields": [
      { "key": "recompensa", "label": "Próxima recompensa", "value": "🎁 Regalo en visita 7" }
    ]
  },
  "barcode": {
    "format": "PKBarcodeFormatQR",
    "message": "{qr_code}",
    "messageEncoding": "iso-8859-1"
  },
  "backgroundColor": "rgb(236, 72, 153)",
  "foregroundColor": "rgb(255, 255, 255)",
  "expirationDate": "2027-06-01T00:00:00Z"
}
```

## Endpoint sugerido

```
GET /api/public/clienta/:qrCode/wallet
→ Devuelve el archivo .pkpass para descargar
```

## Flujo
1. Clienta abre su vista pública desde el celular
2. Toca botón "Agregar a Apple Wallet"
3. Backend genera el .pkpass con datos actualizados
4. iPhone muestra preview de la tarjeta
5. Clienta confirma y se agrega a Wallet

## Push Notifications (opcional)
Apple Wallet soporta actualizar tarjetas vía push notifications.
Esto permitiría actualizar el conteo de visitas automáticamente
sin que la clienta tenga que hacer nada.

## Cuándo implementar
Cuando el negocio justifique el costo de $99/año de Apple Developer
y haya suficientes clientas con iPhone usando el sistema activamente.
