[CmdletBinding()]
param(
  [int]$EnterpriseCount = 5,
  [int]$UsersPerEnterprise = 30,
  [string]$EnterprisePassword = 'Enterprise123!',
  # Optional: enterprise id or slug (e.g. 2 or 'enterprise-02').
  # If omitted, seeds all enterprises (default).
  [string]$Enterprise = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

function Get-PythonExe {
  $venvPy = Join-Path $repoRoot '.venv\Scripts\python.exe'
  if (Test-Path $venvPy) { return $venvPy }
  return 'py'
}

Write-Host "[1/2] Creating enterprises (count=$EnterpriseCount)" -ForegroundColor Cyan
Push-Location $repoRoot
try {
  docker compose exec -T api node scripts/create_enterprises.js --count $EnterpriseCount --password $EnterprisePassword
} finally {
  Pop-Location
}

Write-Host "[2/2] Seeding users per enterprise (count=$UsersPerEnterprise)" -ForegroundColor Cyan
$pythonExe = Get-PythonExe
$seedScript = Join-Path $repoRoot 'scripts\seed_static_users.py'

$cmd = @($pythonExe, $seedScript, 'create', '--count', [string]$UsersPerEnterprise)
if ($Enterprise -and $Enterprise.Trim().Length -gt 0) {
  $cmd += @('--enterprise', $Enterprise.Trim())
}

& $cmd[0] @($cmd[1..($cmd.Length-1)])

Write-Host "Done." -ForegroundColor Green
if ($Enterprise -and $Enterprise.Trim().Length -gt 0) {
  Write-Host "Seed scope: enterprise '$Enterprise'" -ForegroundColor DarkGreen
} else {
  Write-Host "Seed scope: all enterprises" -ForegroundColor DarkGreen
}
