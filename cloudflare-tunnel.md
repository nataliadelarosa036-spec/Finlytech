# Cloudflare Tunnel — Guía para Finlytech

## Arquitectura en producción

```
Internet
  │
  ▼
https://finlytech.site       → frontend (landing, login, app)
https://api.finlytech.site   → (opcional, si quieres separar el API)
  │
  ▼
Cloudflare Tunnel (cloudflared corriendo en tu PC)
  │
  ▼
localhost:3001  ← Express sirve TANTO el frontend (dist/) COMO el /api
```

---

## Paso 1 — Descargar cloudflared

Descarga el ejecutable de:
https://github.com/cloudflare/cloudflared/releases/latest

Archivo a descargar: `cloudflared-windows-amd64.exe`

Renómbralo a `cloudflared.exe` y ponlo en `C:\cloudflared\`

Verifica en PowerShell (como administrador):
```powershell
C:\cloudflared\cloudflared.exe --version
```

---

## Paso 2 — Crear el Tunnel en Cloudflare Dashboard

1. Entra a https://dash.cloudflare.com
2. Ve a: Zero Trust → Networks → Tunnels
3. Click "Create a tunnel"
4. Nombre: `finlytech`
5. En "Choose connector": selecciona Windows
6. Copia el comando que te da, tiene este formato:
   ```
   C:\cloudflared\cloudflared.exe service install eyJhIjo...TOKEN_LARGO...
   ```
7. Ejecuta ese comando en PowerShell como Administrador
8. El Tunnel aparecerá como 🟢 Healthy

---

## Paso 3 — Configurar los hostnames públicos

En el Tunnel → "Public Hostname" → Add hostname:

### Para el sitio principal (frontend + app + api en uno):
| Campo     | Valor              |
|-----------|-------------------|
| Subdomain | (vacío)           |
| Domain    | finlytech.site      |
| Service   | http://localhost:3001 |

### Opcional — subdominio para la app:
| Campo     | Valor                    |
|-----------|--------------------------|
| Subdomain | app                      |
| Domain    | finlytech.site            |
| Service   | http://localhost:3001    |

Cloudflare crea el CNAME DNS automáticamente. No necesitas configurar nada más en DNS.

---

## Paso 4 — Antes de arrancar, actualiza Google Console

Agrega estos orígenes en tu OAuth Client ID:
- https://finlytech.site
- https://www.finlytech.site

Y estos Redirect URIs:
- https://finlytech.site
- https://finlytech.site/api/auth/google/callback

---

## Paso 5 — Arrancar Finlytech en producción

Doble clic en: `start-prod.bat`

O desde CMD:
```cmd
cd C:\Users\daniel\Desktop\finlytech
start-prod.bat
```

El servidor arranca en `localhost:3001`.
Cloudflare Tunnel lo expone en `https://finlytech.site`.

---

## Variables de entorno a actualizar en backend/.env

Cuando tengas el dominio activo, cambia:
```
FRONTEND_URL=https://finlytech.site
APP_URL=https://finlytech.site
GOOGLE_CALLBACK_URL=https://finlytech.site/api/auth/google/callback
```

---

## Para desarrollo (sin Tunnel)

Doble clic en: `start-dev.bat`

- Frontend: http://localhost:5173
- Backend:  http://localhost:3001
