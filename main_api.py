from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import io
import uvicorn
import os
import piexif
import hashlib

app = FastAPI(title="AI-Driven Deepfake Detection & Incident Response API")

# --- ENVIRONMENT CONFIGURATIONS ---
# Moving these to environment variables makes deploying to servers like Render, AWS, or Docker clean and easy.
# If no environment variables are present, they fallback safely to your local development defaults.
CORS_ORIGINS_RAW = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
ALLOWED_ORIGINS = [origin.strip() for origin in CORS_ORIGINS_RAW.split(",")]

MODEL_PATH = os.getenv("MODEL_PATH", "ViT_Model/verifake_ViT_epoch_15.pth")
SERVER_HOST = os.getenv("HOST", "0.0.0.0")
SERVER_PORT = int(os.getenv("PORT", "8000"))

# --- CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AI MODEL SETUP ---
device = torch.device("cpu")

def load_model():
    model = models.vit_b_16()
    model.heads.head = nn.Linear(model.heads.head.in_features, 2)
    
    if os.path.exists(MODEL_PATH):
        model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        print(f"SUCCESS: Forensic Weight File Loaded from '{MODEL_PATH}'.")
    else:
        print(f"WARNING: Model path '{MODEL_PATH}' not found. Running with base weights.")
        
    model.to(device)
    model.eval()
    return model

model = load_model()

# --- METADATA EXTRACTOR ---
def deep_forensic_extract(image_bytes):
    data = {
        "exif": {"Software": "Clean Trace", "Make": "Unknown", "Model": "Unknown", "DateTimeOriginal": "Unknown"},
        "gps": None
    }
    try:
        exif_dict = piexif.load(image_bytes)
        if exif_dict.get("0th"):
            make = exif_dict["0th"].get(piexif.ImageIFD.Make, b"Unknown").decode('utf-8', errors='ignore').strip('\x00').strip()
            model_name = exif_dict["0th"].get(piexif.ImageIFD.Model, b"Unknown").decode('utf-8', errors='ignore').strip('\x00').strip()
            soft = exif_dict["0th"].get(piexif.ImageIFD.Software, b"Clean Trace").decode('utf-8', errors='ignore').strip('\x00').strip()
            data["exif"].update({"Make": make, "Model": model_name, "Software": soft if soft else "Clean Trace"})
        
        if exif_dict.get("Exif"):
            date = exif_dict["Exif"].get(piexif.ExifIFD.DateTimeOriginal, b"Unknown").decode('utf-8', errors='ignore').strip('\x00')
            data["exif"]["DateTimeOriginal"] = date

        if exif_dict.get("GPS") and piexif.GPSIFD.GPSLatitude in exif_dict["GPS"]:
            def to_deg(v): return (v[0][0]/v[0][1]) + (v[1][0]/v[1][1]/60.0) + (v[2][0]/v[2][1]/3600.0)
            lat = to_deg(exif_dict["GPS"][piexif.GPSIFD.GPSLatitude])
            if exif_dict["GPS"][piexif.GPSIFD.GPSLatitudeRef] == b"S": lat *= -1
            lon = to_deg(exif_dict["GPS"][piexif.GPSIFD.GPSLongitude])
            if exif_dict["GPS"][piexif.GPSIFD.GPSLongitudeRef] == b"W": lon *= -1
            data["gps"] = {"lat": round(lat, 4), "lon": round(lon, 4)}
    except: 
        pass
    return data

# --- FIXED ROUTES ---

# Handle the Pre-flight browser check
@app.options("/predict")
async def predict_options():
    return {}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        raw_bytes = await file.read()
        forensics = deep_forensic_extract(raw_bytes)
        file_hash = hashlib.sha256(raw_bytes).hexdigest()
        
        image = Image.open(io.BytesIO(raw_bytes)).convert('RGB')
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.5]*3, [0.5]*3)
        ])
        img_t = transform(image).unsqueeze(0).to(device)
        
        with torch.no_grad():
            outputs = model(img_t)
            probs = torch.nn.functional.softmax(outputs, dim=1)
            conf, pred = torch.max(probs, 1)
        
        is_fake = pred.item() == 1
        score = round(float(conf.item()) * 100, 2)
        
        return {
            "status": "success",
            "ai_score": score,
            "prediction": "FAKE" if is_fake else "REAL",
            "risk_level": "CRITICAL" if is_fake and score > 80 else "LOW",
            "forensics": forensics,
            "hash": file_hash,
            "incident_response": f"Forensic scan verified asset integrity: {file_hash[:10]}..."
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host=SERVER_HOST, port=SERVER_PORT)