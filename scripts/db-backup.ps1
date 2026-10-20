$ErrorActionPreference = 'Continue'

$projectRoot = Split-Path -Parent $PSScriptRoot
$backupDir = if ($args.Count -gt 0) { $args[0] } else { Join-Path $projectRoot 'backups' }
$backupDir = [System.IO.Path]::GetFullPath($backupDir)

if (Test-Path (Join-Path $projectRoot '.env')) {
    Get-Content (Join-Path $projectRoot '.env') | ForEach-Object {
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

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$dumpFile = Join-Path $backupDir "$dbName`_$timestamp.sql"

New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$composeFile = Join-Path $projectRoot 'docker-compose.yml'
$containerStatus = docker compose -f $composeFile ps db 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Error 'Le conteneur MySQL n''est pas démarré. Lancez : docker compose up -d'
    exit 1
}

& docker compose -f $composeFile exec -T db mysqladmin ping -h 127.0.0.1 "-u$dbUser" "-p$dbPassword" --silent 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Error 'La base de données n''est pas accessible depuis le conteneur DB.'
    exit 1
}

& docker compose -f $composeFile exec -T db mysqldump "-u$dbUser" "-p$dbPassword" --databases $dbName --single-transaction --no-tablespaces --routines --events --triggers | Out-File -FilePath $dumpFile -Encoding utf8

Write-Host "Sauvegarde créée : $dumpFile"
