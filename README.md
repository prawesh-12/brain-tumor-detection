# Brain Tumor Detection (Client + Server)

A full-stack brain MRI classification app with:
- **Next.js frontend** (`client/`)
- **Flask + TensorFlow backend API** (`server/`)

Users upload an MRI image, the backend predicts one of:
- `glioma`
- `meningioma`
- `pituitary`
- `notumor`

## Features

- Image upload and preview in UI
- Click-to-view larger MRI image
- Backend prediction API (`/api/predict`)
- Health endpoint (`/api/health`)
- Per-user upload cleanup logic:
  - previous upload for same user is deleted on new upload
  - each uploaded file auto-deletes after 60 seconds (configurable)

## Project Structure

```text
brain-tumor-detection/
├── client/                  # Next.js app
│   ├── app/
│   ├── components/
│   └── .env.example
├── server/                  # Flask + TensorFlow API
│   ├── main.py
│   ├── wsgi.py              # Gunicorn entrypoint
│   ├── requirements.txt
│   ├── models/
│   ├── uploads/
│   └── .env.example
├── render.yaml              # Render blueprint (2 services)
├── DEPLOYMENT.md
└── .gitignore
```

## Tech Stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS
- Backend: Flask, TensorFlow/Keras, NumPy, Gunicorn

## Prerequisites

- Node.js 20+
- npm
- Python 3.12+
- pip + virtual environment

## Local Development

### 1. Backend setup

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python main.py
```

Backend runs at: `http://127.0.0.1:5000`

### 2. Frontend setup

```bash
cd client
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs at: `http://localhost:3000`

## Environment Variables

### Server (`server/.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | API port |
| `FLASK_DEBUG` | `0` | Flask debug mode |
| `CLIENT_ORIGIN` | `http://localhost:3000` | Allowed CORS origin |
| `UPLOAD_TTL_SECONDS` | `60` | File auto-delete TTL |
| `UPLOAD_CLEANUP_INTERVAL_SECONDS` | `15` | Fallback sweep frequency |

### Client (`client/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://127.0.0.1:5000` | Backend base URL |

## API

### `GET /api/health`
Returns server health.

Example response:

```json
{ "status": "ok" }
```

### `POST /api/predict`
Upload MRI image as multipart form-data.

- Field name: `file`
- Allowed types: `.jpg`, `.jpeg`, `.png`
- Max size: `10MB`

Example response:

```json
{
  "predictedClass": "meningioma",
  "displayClass": "Meningioma",
  "confidence": 80.68,
  "filename": "<clientId>__<uuid>_image.jpg"
}
```

## Upload Cleanup Behavior (Per User)

The system uses a client identifier (`X-Client-Id`) sent by the frontend:

1. On upload, backend identifies user by `X-Client-Id`.
2. Any previous uploads from that same user are deleted first.
3. New file is stored and used for prediction.
4. File is scheduled for deletion after `UPLOAD_TTL_SECONDS` (default 60 sec).
5. Additional periodic cleanup also removes expired files.

This keeps storage usage low and avoids manual server restarts for cleanup.

## Production Deployment (Render)

`render.yaml` is included for deploying both services:
- `brain-tumor-server` (Python)
- `brain-tumor-client` (Node)

Server start command:

```bash
gunicorn wsgi:app --bind 0.0.0.0:$PORT --timeout 300
```

For full steps, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Notes

- Model files are loaded from `server/models/` on startup.
- First request can be slower due to model warm-up.
- Keep `CLIENT_ORIGIN` and `NEXT_PUBLIC_API_BASE_URL` aligned in production.
