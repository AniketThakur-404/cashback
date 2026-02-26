param(
    [string]$Server = "root@82.112.235.245",
    [string]$RemoteDir = "/var/www/assuredrewards/frontend"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $projectRoot

npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Warning "npm ci failed. Retrying with npm install..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "Dependency install failed."
    }
}

npm run build
if ($LASTEXITCODE -ne 0) {
    throw "Frontend build failed."
}

ssh $Server "rm -rf $RemoteDir/assets $RemoteDir/index.html"
if ($LASTEXITCODE -ne 0) {
    throw "Remote frontend cleanup failed."
}

$remoteTarget = "${Server}:${RemoteDir}/"
scp -r .\dist\* $remoteTarget
if ($LASTEXITCODE -ne 0) {
    throw "Frontend upload failed."
}

ssh $Server "nginx -t && systemctl reload nginx"
if ($LASTEXITCODE -ne 0) {
    throw "Nginx reload failed."
}

Write-Host "Frontend deploy complete."
