# refresh.ps1 - Regenerar Prisma Client después de cambios en schema.prisma
Set-Location "$PSScriptRoot\server"

Write-Host "Aplicando migraciones pendientes..." -ForegroundColor Cyan
npx prisma migrate dev

Write-Host "`nRegenerando Prisma Client..." -ForegroundColor Cyan
npx prisma generate

Write-Host "`nListo. Reinicia el servidor para aplicar los cambios." -ForegroundColor Green
