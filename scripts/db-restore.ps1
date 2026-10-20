$ErrorActionPreference = 'Stop'

if ($args.Count -lt 1) {
    Write-Host 'Usage: .\db-restore.ps1 <fichier-backup.sql>'
    exit 1
}

$filePath = [System.IO.Path]::GetFullPath($args[0])
if (-not (Test-Path $filePath)) {
    Write-Error "Fichier introuvable : $filePath"
    exit 1
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectRoot '.env'
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith('#')) { return }
        $parts = $line -split '=', 2
        if ($parts.Count -ne 2) { return }
        $name = $parts[0].Trim()
        $value = $parts[1].Trim().Trim('"')
        if (-not [string]::IsNullOrWhiteSpace($name)) {
            [Environment]::SetEnvironmentVariable($name, $value, 'Process')
        }
    }
}

$dbName = if ($env:MYSQL_DATABASE) { $env:MYSQL_DATABASE } else { 'forum_assurance' }
$dbUser = if ($env:MYSQL_USER) { $env:MYSQL_USER } else { 'forum' }
$dbPassword = if ($env:MYSQL_PASSWORD) { $env:MYSQL_PASSWORD } else { 'forum_password' }

Write-Host "Restauration de $filePath vers $dbName..."
$composeFile = Join-Path $projectRoot 'docker-compose.yml'
Get-Content -Raw $filePath | & docker compose -f $composeFile exec -T db mysql "-u$dbUser" "-p$dbPassword" $dbName
Write-Host 'Restauration terminée.'
