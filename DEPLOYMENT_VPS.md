# Assured Rewards VPS Deployment Guide

This guide is aligned with the current repo structure and scripts.

## Server Details

- Server IP: `82.112.235.245`
- SSH user: `root`
- Frontend deploy path: `/var/www/assuredrewards/frontend`
- Backend deploy path: `/var/www/cashback/cashback`
- PM2 app name: `cashback-api`

## Deployment Options

- Option A (recommended on Windows): use the provided PowerShell scripts.
- Option B: run manual commands step by step.

---

## Option A: Script-Based Deployment (Windows PowerShell)

Run these from the repo root (`e:\webapp`).

### Frontend

```powershell
.\scripts\deploy-frontend.ps1
```

What this script does:

1. Runs `npm ci` (falls back to `npm install` if needed).
2. Runs `npm run build`.
3. Removes old frontend `assets` + `index.html` on server.
4. Uploads `dist/*` to `/var/www/assuredrewards/frontend`.
5. Runs `nginx -t && systemctl reload nginx`.

### Backend

```powershell
.\scripts\deploy-backend.ps1
```

What this script does:

1. SSH into server.
2. Pulls latest code from `main`.
3. Runs `npm ci --omit=dev`.
4. Runs `npx prisma migrate deploy`.
5. Runs `npx prisma generate`.
6. Restarts PM2 app with `--update-env`.
7. Shows PM2 status.

### Optional Script Parameters

If needed, you can override defaults:

```powershell
.\scripts\deploy-frontend.ps1 -Server "root@82.112.235.245" -RemoteDir "/var/www/assuredrewards/frontend"
.\scripts\deploy-backend.ps1 -Server "root@82.112.235.245" -RemoteAppDir "/var/www/cashback/cashback" -Branch "main" -Pm2App "cashback-api"
```

---

## Option B: Manual Deployment Commands

### Frontend Manual Flow

### 1) Build frontend locally

```bash
npm run build
```

### 2) Upload build to server

Windows PowerShell:

```powershell
scp -r .\dist\* root@82.112.235.245:/var/www/assuredrewards/frontend/
```

Git Bash / macOS / Linux:

```bash
scp -r ./dist/* root@82.112.235.245:/var/www/assuredrewards/frontend/
```

### 3) Validate and reload Nginx

```bash
ssh root@82.112.235.245 "nginx -t && systemctl reload nginx"
```

### Backend Manual Flow

### 1) SSH to server

```bash
ssh root@82.112.235.245
```

### 2) Run backend update steps

```bash
cd /var/www/cashback/cashback
git pull origin main
npm ci --omit=dev
npx prisma migrate deploy
npx prisma generate
pm2 restart cashback-api --update-env
pm2 status cashback-api
```

---

## First-Time Server Setup (PM2)

If `cashback-api` is not already registered in PM2:

```bash
cd /var/www/cashback/cashback
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

`ecosystem.config.js` in this repo already defines:

- app name: `cashback-api`
- script: `./src/index.js`
- mode: `cluster`
- memory restart: `500M`

---

## Pre-Deploy Checklist

- Local code has been tested.
- Frontend build succeeds (`npm run build`).
- Backend `.env` on server is up to date.
- `DATABASE_URL` and Prisma migrations are correct for production DB.
- PM2 app name is still `cashback-api`.

## Post-Deploy Checklist

- Frontend loads from public domain.
- API health endpoint responds:

```bash
curl -I https://your-domain/
curl -I https://your-domain/api/public/home
```

- PM2 status is `online`:

```bash
pm2 status cashback-api
pm2 logs cashback-api --lines 100
```

- Nginx config test passes:

```bash
nginx -t
```

---

## Quick Command Blocks

### Frontend

```bash
npm run build
scp -r ./dist/* root@82.112.235.245:/var/www/assuredrewards/frontend/
ssh root@82.112.235.245 "nginx -t && systemctl reload nginx"
```

### Backend

```bash
ssh root@82.112.235.245
cd /var/www/cashback/cashback
git pull origin main
npm ci --omit=dev
npx prisma migrate deploy
npx prisma generate
pm2 restart cashback-api --update-env
pm2 status cashback-api
```

---

## Security Notes

- Prefer SSH keys over root password login.
- Avoid storing credentials in scripts or shared chat history.
- Restrict firewall ports to required services only.
