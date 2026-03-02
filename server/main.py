from flask import Flask, jsonify, request
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array, load_img
from werkzeug.utils import secure_filename
import numpy as np
import os
import hashlib
import time
import re
import threading
from uuid import uuid4

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
MODEL_PATH = os.path.join(BASE_DIR, "models", "best_model.keras")
LABELS_PATH = os.path.join(BASE_DIR, "models", "labels.npy")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB
UPLOAD_TTL_SECONDS = int(os.getenv("UPLOAD_TTL_SECONDS", "60"))
UPLOAD_CLEANUP_INTERVAL_SECONDS = int(os.getenv("UPLOAD_CLEANUP_INTERVAL_SECONDS", "15"))
CLIENT_ID_HEADER = "X-Client-Id"
CLIENT_ID_PATTERN = re.compile(r"[^a-zA-Z0-9-]")
_last_cleanup_run = 0.0

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

model = load_model(MODEL_PATH)
class_labels = np.load(LABELS_PATH, allow_pickle=True)

DISPLAY_LABELS = {
    "glioma": "Glioma",
    "meningioma": "Meningioma",
    "pituitary": "Pituitary",
    "notumor": "No Tumor",
}


def normalize_label(label: str) -> str:
    normalized = str(label).strip().lower().replace(" ", "")
    if normalized == "notumor":
        return "notumor"
    return normalized


def allowed_file(filename: str) -> bool:
    _, ext = os.path.splitext(filename.lower())
    return ext in ALLOWED_EXTENSIONS


def safe_remove(path: str):
    try:
        os.remove(path)
    except FileNotFoundError:
        pass
    except OSError:
        pass


def sanitize_client_id(client_id: str) -> str:
    sanitized = CLIENT_ID_PATTERN.sub("", client_id)[:64]
    return sanitized or "anonymous"


def get_client_id() -> str:
    header_client_id = (request.headers.get(CLIENT_ID_HEADER) or "").strip()
    if header_client_id:
        return sanitize_client_id(header_client_id)

    # Fallback for clients that do not send a custom ID.
    fingerprint = f"{request.remote_addr or ''}:{request.user_agent.string or ''}"
    fallback = hashlib.sha256(fingerprint.encode("utf-8")).hexdigest()[:32]
    return sanitize_client_id(fallback)


def is_user_upload(filename: str, client_id: str) -> bool:
    return filename.startswith(f"{client_id}__")


def cleanup_expired_uploads(force: bool = False):
    global _last_cleanup_run

    now = time.time()
    if not force and (now - _last_cleanup_run) < UPLOAD_CLEANUP_INTERVAL_SECONDS:
        return

    _last_cleanup_run = now
    for entry in os.scandir(UPLOAD_FOLDER):
        if not entry.is_file():
            continue
        if entry.name == ".gitkeep":
            continue

        file_age_seconds = now - entry.stat().st_mtime
        if file_age_seconds >= UPLOAD_TTL_SECONDS:
            safe_remove(entry.path)


def cleanup_user_previous_uploads(client_id: str):
    for entry in os.scandir(UPLOAD_FOLDER):
        if not entry.is_file():
            continue
        if entry.name == ".gitkeep":
            continue
        if is_user_upload(entry.name, client_id):
            safe_remove(entry.path)


def schedule_file_cleanup(path: str):
    timer = threading.Timer(UPLOAD_TTL_SECONDS, safe_remove, args=[path])
    timer.daemon = True
    timer.start()


def predict_tumor(image_path: str):
    image_size = 128
    img = load_img(image_path, target_size=(image_size, image_size))
    img_array = img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    preds = model.predict(img_array, verbose=0)
    idx = int(np.argmax(preds))
    confidence = float(preds[0][idx] * 100)
    predicted_class = normalize_label(class_labels[idx])

    return predicted_class, DISPLAY_LABELS.get(predicted_class, predicted_class.title()), confidence


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = os.getenv("CLIENT_ORIGIN", "*")
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, X-Client-Id"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return response


@app.errorhandler(413)
def payload_too_large(_error):
    return jsonify({"error": "File is too large. Maximum allowed size is 10MB."}), 413


@app.route("/", methods=["GET"])
def root():
    return jsonify(
        {
            "message": "Brain tumor detection API is running.",
            "health_endpoint": "/api/health",
            "predict_endpoint": "/api/predict",
        }
    )


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":
        return ("", 204)

    cleanup_expired_uploads()
    client_id = get_client_id()

    file = request.files.get("file")
    if file is None:
        return jsonify({"error": "No file uploaded. Use form-data key 'file'."}), 400

    if not file.filename:
        return jsonify({"error": "Uploaded file is empty."}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type. Allowed: .jpg, .jpeg, .png"}), 400

    cleanup_user_previous_uploads(client_id)

    safe_name = secure_filename(file.filename)
    filename = f"{client_id}__{uuid4().hex}_{safe_name}"
    path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(path)

    try:
        predicted_class, display_class, confidence = predict_tumor(path)
    except Exception:
        safe_remove(path)
        return jsonify({"error": "Prediction failed for the uploaded image."}), 500

    schedule_file_cleanup(path)

    return jsonify(
        {
            "predictedClass": predicted_class,
            "displayClass": display_class,
            "confidence": round(confidence, 2),
            "filename": filename,
        }
    )


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG", "0") == "1",
    )
