param(
    [string]$Host = "root@82.112.235.245",
    [string]$RemoteDir = "/var/www/assuredrewards/frontend"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $projectRoot

npm ci
if ($LASTEXITCODE -ne 0) {
    throw "npm ci failed."
}

npm run build
if ($LASTEXITCODE -ne 0) {
    throw "Frontend build failed."
}

ssh $Host "rm -rf $RemoteDir/assets $RemoteDir/index.html"
if ($LASTEXITCODE -ne 0) {
    throw "Remote frontend cleanup failed."
}

$remoteTarget = "${Host}:${RemoteDir}/"
scp -r .\dist\* $remoteTarget
if ($LASTEXITCODE -ne 0) {
    throw "Frontend upload failed."
}

ssh $Host "nginx -t && systemctl reload nginx"
if ($LASTEXITCODE -ne 0) {
    throw "Nginx reload failed."
}

Write-Host "Frontend deploy complete."
