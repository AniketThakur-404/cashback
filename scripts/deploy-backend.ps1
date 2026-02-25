param(
    [string]$Host = "root@82.112.235.245",
    [string]$RemoteAppDir = "/var/www/cashback/cashback",
    [string]$Branch = "main",
    [string]$Pm2App = "cashback-api"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$remoteCommand = @"
cd $RemoteAppDir &&
git pull origin $Branch &&
npm ci --omit=dev &&
npx prisma migrate deploy &&
npx prisma generate &&
pm2 restart $Pm2App --update-env &&
pm2 status $Pm2App
"@

ssh $Host $remoteCommand
if ($LASTEXITCODE -ne 0) {
    throw "Backend deploy failed."
}

Write-Host "Backend deploy complete."
