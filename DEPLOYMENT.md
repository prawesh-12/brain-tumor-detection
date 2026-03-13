# Deployment Guide

This project is deployed as two separate web services:

- `brain-tumor-server` (Flask + TensorFlow API)
- `brain-tumor-client` (Next.js frontend)

The repository includes a Render Blueprint (`render.yaml`) that defines both services.

## Architecture in production

1. User opens frontend (`brain-tumor-client`).
2. Frontend sends MRI image to backend (`POST /api/predict`).
3. Backend loads model from `server/models/` and returns prediction JSON.
4. Frontend displays class and confidence.

## Service configuration (from `render.yaml`)

### Server (`brain-tumor-server`)

- Runtime: Python
- Root directory: `server`
- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn wsgi:app --bind 0.0.0.0:$PORT --timeout 300`
- Python version: `3.12.6`

### Client (`brain-tumor-client`)

- Runtime: Node
- Root directory: `client`
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Node version: `20.18.0`

## Environment variables

Set these in Render:

### Server variables

<table>
    <thead>
        <tr>
            <th>Variable</th>
            <th>Example</th>
            <th>Notes</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>PORT</code></td>
            <td>auto-provided</td>
            <td>Provided by Render</td>
        </tr>
        <tr>
            <td><code>FLASK_DEBUG</code></td>
            <td><code>0</code></td>
            <td>Keep <code>0</code> in production</td>
        </tr>
        <tr>
            <td><code>CLIENT_ORIGIN</code></td>
            <td><code>https://your-client.onrender.com</code></td>
            <td>Must match client URL for CORS</td>
        </tr>
        <tr>
            <td><code>UPLOAD_TTL_SECONDS</code></td>
            <td><code>60</code></td>
            <td>Upload auto-delete TTL</td>
        </tr>
        <tr>
            <td><code>UPLOAD_CLEANUP_INTERVAL_SECONDS</code></td>
            <td><code>15</code></td>
            <td>Cleanup scan frequency</td>
        </tr>
    </tbody>
</table>

### Client variables

<table>
    <thead>
        <tr>
            <th>Variable</th>
            <th>Example</th>
            <th>Notes</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>NEXT_PUBLIC_API_BASE_URL</code></td>
            <td><code>https://your-server.onrender.com</code></td>
            <td>Public API base URL used by browser</td>
        </tr>
    </tbody>
</table>

## Deploy on Render (Blueprint)

1. Push this repository to GitHub.
2. In Render, create a **New Blueprint** and select the repo.
3. Render reads `render.yaml` and provisions both services.
4. In service settings, set:
    - Server: `CLIENT_ORIGIN=https://<client-domain>`
    - Client: `NEXT_PUBLIC_API_BASE_URL=https://<server-domain>`
5. Trigger redeploy for both services after env updates.

## Post-deploy validation checklist

- Frontend loads without runtime errors
- Uploading a valid MRI image returns prediction data
- Browser network tab shows client calling correct server URL
- No CORS errors in browser console

## Common production issues

### CORS blocked requests

- Symptom: Browser request fails with CORS error
- Fix: Set server `CLIENT_ORIGIN` exactly to deployed client URL

### Frontend calling wrong API

- Symptom: `fetch` errors or requests to localhost in production
- Fix: Set client `NEXT_PUBLIC_API_BASE_URL` to server public URL and redeploy

### Backend cold start / slow first inference

- Symptom: First prediction is noticeably slower
- Cause: Model load/warm-up behavior
- Fix: Expected behavior; subsequent requests are faster

### Upload rejection

- Symptom: `400` or `413` from `/api/predict`
- Fix:
    - Ensure file extension is `.jpg`, `.jpeg`, or `.png`
    - Ensure file size is below `10MB`

## Local vs production command mapping

From repo root:

- Local full stack: `npm run start`
- Production-style local run: `npm run start:prod`

`npm run start` is intentionally local-friendly and may fall back to Flask dev server if `gunicorn` is not available in `server/.venv`.
