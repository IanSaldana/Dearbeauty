# run-all.ps1 - Levanta backend y frontend de Dear Beauty
# Ejecutar desde: D:\Desarrollo\DearBeauty
# Uso: .\run-all.ps1

$ErrorActionPreference = "Stop"

# Refrescar PATH por si Node/npm se instalaron recientemente
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "=== Dear Beauty - Iniciando servicios ===" -ForegroundColor Magenta
Write-Host ""

# Verificar que node y npm están disponibles
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js no encontrado. Instala Node.js primero." -ForegroundColor Red
    exit 1
}

# Iniciar Backend (Express + Prisma + PostgreSQL)
Write-Host ""
Write-Host ">> Iniciando Backend (puerto 3001)..." -ForegroundColor Cyan
$backend = Start-Process -FilePath "cmd.exe" -ArgumentList "/c node src/index.js" -WorkingDirectory "$PSScriptRoot\server" -PassThru
Start-Sleep -Seconds 2

# Iniciar Frontend (Vite + React)
Write-Host ">> Iniciando Frontend (puerto 5173)..." -ForegroundColor Cyan
$frontend = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev" -WorkingDirectory "$PSScriptRoot\client" -PassThru
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "=== Servicios iniciados ===" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Login: admin@dearbeauty.com / admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "Presiona ENTER para detener ambos servicios..." -ForegroundColor Magenta
Read-Host

# Detener procesos
Write-Host "Deteniendo servicios..." -ForegroundColor Red
if ($backend -and !$backend.HasExited) { Stop-Process -Id $backend.Id -Force }
if ($frontend -and !$frontend.HasExited) { Stop-Process -Id $frontend.Id -Force }

# También matar procesos hijos de node en esos puertos
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.Id -eq $backend.Id -or $_.Id -eq $frontend.Id
} | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "Servicios detenidos." -ForegroundColor Green
