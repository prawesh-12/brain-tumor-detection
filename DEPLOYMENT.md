# Deployment Guide

This project has 2 services:
- `server` (Flask + TensorFlow API)
- `client` (Next.js frontend)

## Required environment variables

### Server
- `PORT` (provided by platform)
- `FLASK_DEBUG=0`
- `CLIENT_ORIGIN=<your-client-url>`
- `UPLOAD_TTL_SECONDS=60`
- `UPLOAD_CLEANUP_INTERVAL_SECONDS=15`

### Client
- `NEXT_PUBLIC_API_BASE_URL=<your-server-url>`

## Deploy on Render (Blueprint)

1. Push this repo.
2. Create a new Blueprint service in Render and select this repo.
3. Render reads `render.yaml` and creates:
   - `brain-tumor-server`
   - `brain-tumor-client`
4. Set env vars:
   - On `brain-tumor-server`: `CLIENT_ORIGIN=https://<client-domain>`
   - On `brain-tumor-client`: `NEXT_PUBLIC_API_BASE_URL=https://<server-domain>`
5. Redeploy both services.

## Production start commands

- Server: `gunicorn wsgi:app --bind 0.0.0.0:$PORT --timeout 300`
- Client: `npm run start`
