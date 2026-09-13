[CmdletBinding()]
param(
  # Required confirmation. Nothing happens without it.
  [switch]$Yes,

  # Compose service that has Prisma installed and can reach the DB.
  [string]$Service = 'api',

  # Path to the Prisma schema inside the container/workdir.
  [string]$SchemaPath = './bdd.prisma'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not $Yes) {
  Write-Host "Refusing to run: this will DELETE ALL DATA in the database." -ForegroundColor Yellow
  Write-Host "Re-run with: -Yes" -ForegroundColor Yellow
  Write-Host "Example: powershell -ExecutionPolicy Bypass -File .\scripts\purge_db.ps1 -Yes" -ForegroundColor Yellow
  exit 2
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

Write-Host "Purging DB via Prisma (force reset)" -ForegroundColor Red
Write-Host "- Service: $Service" -ForegroundColor Red
Write-Host "- Schema:  $SchemaPath" -ForegroundColor Red

Push-Location $repoRoot
try {
  # Uses Prisma to drop and recreate the schema from bdd.prisma.
  # --accept-data-loss avoids interactive prompts.
  docker compose exec -T $Service sh -lc "npx prisma db push --force-reset --accept-data-loss --schema=$SchemaPath"

  Write-Host "Done. Database has been reset to match schema." -ForegroundColor Green
} finally {
  Pop-Location
}
