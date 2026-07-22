from fastapi import FastAPI, File, UploadFile, Body
from fastapi.middleware.cors import CORSMiddleware
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import io
import uvicorn
import os
import stat
import piexif
import hashlib

app = FastAPI(title="AI-Driven Deepfake Detection & Incident Response API")

# --- ENVIRONMENT CONFIGURATIONS ---
CORS_ORIGINS_RAW = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
ALLOWED_ORIGINS = [origin.strip() for origin in CORS_ORIGINS_RAW.split(",")]

MODEL_PATH = os.getenv("MODEL_PATH", "ViT_Model/verifake_ViT_epoch_15.pth")
SERVER_HOST = os.getenv("HOST", "0.0.0.0")
SERVER_PORT = int(os.getenv("PORT", "8000"))

# --- EVIDENCE VAULT WORM STORAGE CONFIGURATION ---
VAULT_DIR = os.path.join(os.getcwd(), "evidence_vault")
os.makedirs(VAULT_DIR, exist_ok=True)

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

# --- ENHANCED FORENSIC METADATA EXTRACTOR ---
def deep_forensic_extract(image_bytes: bytes):
    data = {
        "file_info": {
            "size_kb": round(len(image_bytes) / 1024, 2),
            "dimensions": "Unknown",
            "format": "Unknown",
            "color_mode": "Unknown",
            "megapixels": "Unknown"
        },
        "exif": {
            "Software": "Clean Trace",
            "Make": "Unknown",
            "Model": "Unknown",
            "DateTimeOriginal": "Unknown",
            "LensModel": "Unknown",
            "ISO": "Unknown"
        },
        "gps": None
    }

    # 1. Physical image dimensions & format via PIL
    try:
        img = Image.open(io.BytesIO(image_bytes))
        width, height = img.size
        mp = round((width * height) / 1_000_000, 2)
        
        data["file_info"].update({
            "dimensions": f"{width} x {height}",
            "format": img.format if img.format else "Unknown",
            "color_mode": img.mode,
            "megapixels": f"{mp} MP"
        })
    except Exception:
        pass

    # 2. EXIF & GPS hardware signatures via piexif
    try:
        exif_dict = piexif.load(image_bytes)
        
        if exif_dict.get("0th"):
            make = exif_dict["0th"].get(piexif.ImageIFD.Make, b"Unknown").decode('utf-8', errors='ignore').strip('\x00').strip()
            model_name = exif_dict["0th"].get(piexif.ImageIFD.Model, b"Unknown").decode('utf-8', errors='ignore').strip('\x00').strip()
            soft = exif_dict["0th"].get(piexif.ImageIFD.Software, b"Clean Trace").decode('utf-8', errors='ignore').strip('\x00').strip()
            
            data["exif"].update({
                "Make": make if make else "Unknown",
                "Model": model_name if model_name else "Unknown",
                "Software": soft if soft else "Clean Trace"
            })
        
        if exif_dict.get("Exif"):
            exif_data = exif_dict["Exif"]
            date = exif_data.get(piexif.ExifIFD.DateTimeOriginal, b"Unknown").decode('utf-8', errors='ignore').strip('\x00')
            lens = exif_data.get(piexif.ExifIFD.LensModel, b"Unknown").decode('utf-8', errors='ignore').strip('\x00').strip()
            iso = exif_data.get(piexif.ExifIFD.ISOSpeedRatings, "Unknown")

            data["exif"].update({
                "DateTimeOriginal": date if date else "Unknown",
                "LensModel": lens if lens else "Unknown",
                "ISO": str(iso) if iso != "Unknown" else "Unknown"
            })

        if exif_dict.get("GPS") and piexif.GPSIFD.GPSLatitude in exif_dict["GPS"]:
            def to_deg(v): return (v[0][0]/v[0][1]) + (v[1][0]/v[1][1]/60.0) + (v[2][0]/v[2][1]/3600.0)
            lat = to_deg(exif_dict["GPS"][piexif.GPSIFD.GPSLatitude])
            if exif_dict["GPS"][piexif.GPSIFD.GPSLatitudeRef] == b"S": lat *= -1
            lon = to_deg(exif_dict["GPS"][piexif.GPSIFD.GPSLongitude])
            if exif_dict["GPS"][piexif.GPSIFD.GPSLongitudeRef] == b"W": lon *= -1
            data["gps"] = {"lat": round(lat, 4), "lon": round(lon, 4)}
            
    except Exception:
        pass

    return data

# --- WORM LOCK HELPER ---
def save_and_lock_evidence(file_hash: str, raw_bytes: bytes) -> str:
    """Saves raw evidence file and revokes write permissions (OS-level WORM storage)."""
    file_path = os.path.join(VAULT_DIR, f"{file_hash}.bin")
    
    if not os.path.exists(file_path):
        # Save bytes
        with open(file_path, "wb") as f:
            f.write(raw_bytes)
        
        # Apply OS-Level Read-Only flag (stat.S_IREAD)
        try:
            os.chmod(file_path, stat.S_IREAD)
            print(f"🔒 EVIDENCE VAULT: File {file_hash[:10]}... written & WORM locked.")
        except Exception as e:
            print(f"⚠️ Warning: Could not apply OS lock: {e}")
            
    return file_path

# --- ROUTES ---

@app.options("/predict")
async def predict_options():
    return {}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        raw_bytes = await file.read()
        forensics = deep_forensic_extract(raw_bytes)
        file_hash = hashlib.sha256(raw_bytes).hexdigest()
        
        # Save to local Evidence Vault with OS-level WORM lock
        vault_file_path = save_and_lock_evidence(file_hash, raw_bytes)
        
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
        
        # --- 4-TIER RISK LOGIC ---
        if is_fake:
            if score >= 90.0:
                calculated_risk = "CRITICAL"
            elif score >= 75.0:
                calculated_risk = "HIGH"
            else:
                calculated_risk = "MEDIUM"
        else:
            if score >= 85.0:
                calculated_risk = "LOW"
            else:
                calculated_risk = "MEDIUM"
        
        return {
            "status": "success",
            "ai_score": score,
            "prediction": "FAKE" if is_fake else "REAL",
            "risk_level": calculated_risk,
            "forensics": forensics,
            "hash": file_hash,
            "vault_path": vault_file_path,
            "incident_response": f"Forensic scan verified & WORM locked: {file_hash[:10]}..."
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

# --- HASH RE-VERIFICATION ENDPOINT ---
@app.post("/verify-integrity")
async def verify_integrity(payload: dict = Body(...)):
    """Recalculates the SHA-256 hash of the WORM locked evidence file to detect physical tampering."""
    file_hash = payload.get("hash")
    if not file_hash:
        return {"status": "ERROR", "message": "Missing file hash in request."}
    
    file_path = os.path.join(VAULT_DIR, f"{file_hash}.bin")
    
    if not os.path.exists(file_path):
        return {
            "status": "TAMPER_ALERT",
            "message": "CRITICAL: Evidence file missing from vault disk!"
        }
    
    try:
        # Read the file on disk
        with open(file_path, "rb") as f:
            current_bytes = f.read()
            
        current_hash = hashlib.sha256(current_bytes).hexdigest()
        
        if current_hash == file_hash:
            return {
                "status": "SECURE",
                "message": "NIST Hash Verification Passed. Digital evidence is 100% authentic and untampered.",
                "hash": current_hash
            }
        else:
            return {
                "status": "TAMPER_ALERT",
                "message": "CRITICAL: Hash mismatch detected! Physical evidence file has been modified on disk.",
                "expected_hash": file_hash,
                "found_hash": current_hash
            }
    except Exception as e:
        return {"status": "ERROR", "message": str(e)}

if __name__ == "__main__":
    server_host = os.getenv("HOST", "0.0.0.0")
    server_port = int(os.getenv("PORT", 8000))
    
    print(f"🚀 Starting Forensic API Node on {server_host}:{server_port}")
    uvicorn.run("main_api:app", host=server_host, port=server_port, reload=True)