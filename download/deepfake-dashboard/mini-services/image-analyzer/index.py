#!/usr/bin/env python3
"""
Image Metadata Extraction and Deepfake Analysis API
"""

import os
import sys
import json
import hashlib
import random
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, ExifTags
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = '/home/z/my-project/upload'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def dms_to_decimal(dms, ref):
    """Convert DMS (Degrees Minutes Seconds) to decimal coordinates"""
    try:
        deg = float(dms[0])
        min = float(dms[1])
        sec = float(dms[2])
        dec = deg + (min / 60.0) + (sec / 3600.0)
        if ref in ["S", "W"]:
            dec *= -1
        return dec
    except:
        return None

def extract_gps(img):
    """Extract GPS coordinates from image EXIF data"""
    try:
        exif = img.getexif()
        if not exif:
            return None
        
        gps = {}
        for tag, value in exif.items():
            name = ExifTags.TAGS.get(tag, tag)
            if name == "GPSInfo":
                for t in value:
                    sub = ExifTags.GPSTAGS.get(t, t)
                    gps[sub] = value[t]
        
        if not gps:
            return None
        
        lat = dms_to_decimal(gps.get("GPSLatitude"), gps.get("GPSLatitudeRef"))
        lon = dms_to_decimal(gps.get("GPSLongitude"), gps.get("GPSLongitudeRef"))
        
        if lat and lon:
            return {"latitude": lat, "longitude": lon}
        return None
    except Exception as e:
        logger.error(f"GPS extraction error: {e}")
        return None

def extract_metadata(file_path):
    """Extract comprehensive metadata from image"""
    metadata = []
    
    try:
        img = Image.open(file_path)
        exif_data = img.getexif()
        
        # Basic file info
        file_stat = os.stat(file_path)
        file_size = file_stat.st_size
        
        metadata.append({
            "field": "File Name",
            "value": os.path.basename(file_path),
            "status": "valid"
        })
        metadata.append({
            "field": "File Size",
            "value": f"{(file_size / 1024 / 1024):.2f} MB",
            "status": "valid"
        })
        metadata.append({
            "field": "Image Format",
            "value": img.format,
            "status": "valid"
        })
        metadata.append({
            "field": "Image Dimensions",
            "value": f"{img.width} x {img.height}",
            "status": "valid"
        })
        metadata.append({
            "field": "Color Mode",
            "value": img.mode,
            "status": "valid"
        })
        
        # EXIF data
        if exif_data:
            exif_dict = {}
            for tag, value in exif_data.items():
                name = ExifTags.TAGS.get(tag, tag)
                exif_dict[name] = value
            
            # Common EXIF fields
            if "DateTime" in exif_dict or "DateTimeOriginal" in exif_dict:
                date_val = exif_dict.get("DateTimeOriginal") or exif_dict.get("DateTime")
                metadata.append({
                    "field": "Creation Date",
                    "value": str(date_val),
                    "status": "valid"
                })
            
            if "Make" in exif_dict:
                metadata.append({
                    "field": "Camera Make",
                    "value": str(exif_dict["Make"]),
                    "status": "valid"
                })
            
            if "Model" in exif_dict:
                metadata.append({
                    "field": "Camera Model",
                    "value": str(exif_dict["Model"]),
                    "status": "valid"
                })
            
            if "Software" in exif_dict:
                software = str(exif_dict["Software"])
                # Flag editing software as suspicious
                suspicious_keywords = ['photoshop', 'lightroom', 'gimp', 'affinity', 'canva']
                is_suspicious = any(kw in software.lower() for kw in suspicious_keywords)
                metadata.append({
                    "field": "Editing Software",
                    "value": software,
                    "status": "suspicious" if is_suspicious else "valid"
                })
            
            if "ExposureTime" in exif_dict:
                metadata.append({
                    "field": "Exposure Time",
                    "value": str(exif_dict["ExposureTime"]),
                    "status": "valid"
                })
            
            if "FNumber" in exif_dict:
                metadata.append({
                    "field": "Aperture",
                    "value": f"f/{exif_dict['FNumber']}",
                    "status": "valid"
                })
            
            if "ISOSpeedRatings" in exif_dict:
                metadata.append({
                    "field": "ISO",
                    "value": str(exif_dict["ISOSpeedRatings"]),
                    "status": "valid"
                })
            
            if "FocalLength" in exif_dict:
                metadata.append({
                    "field": "Focal Length",
                    "value": f"{exif_dict['FocalLength']}mm",
                    "status": "valid"
                })
            
            # GPS
            gps = extract_gps(img)
            if gps:
                metadata.append({
                    "field": "GPS Location",
                    "value": f"{gps['latitude']:.6f}, {gps['longitude']:.6f}",
                    "status": "valid"
                })
        else:
            metadata.append({
                "field": "EXIF Data",
                "value": "No EXIF data found",
                "status": "suspicious"
            })
        
        return metadata
    
    except Exception as e:
        logger.error(f"Metadata extraction error: {e}")
        metadata.append({
            "field": "Error",
            "value": str(e),
            "status": "invalid"
        })
        return metadata

def calculate_hash(file_path):
    """Calculate SHA-256 hash of file"""
    sha256_hash = hashlib.sha256()
    try:
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    except Exception as e:
        logger.error(f"Hash calculation error: {e}")
        return None

def analyze_image(file_path):
    """Perform deepfake analysis simulation"""
    try:
        img = Image.open(file_path)
        exif_data = img.getexif()
        
        # Base confidence factors
        confidence = 0
        
        # Factor 1: EXIF presence (authentic images usually have EXIF)
        if exif_data:
            confidence -= 10  # More likely authentic
        else:
            confidence += 30  # Missing EXIF is suspicious
        
        # Factor 2: Check for editing software markers
        if exif_data:
            for tag, value in exif_data.items():
                name = ExifTags.TAGS.get(tag, tag)
                if name == "Software":
                    suspicious_keywords = ['photoshop', 'lightroom', 'gimp', 'affinity']
                    if any(kw in str(value).lower() for kw in suspicious_keywords):
                        confidence += 25
        
        # Factor 3: Image dimensions (unusual dimensions can be suspicious)
        if img.width == img.height and img.width > 1000:
            confidence += 10  # Square images often edited
        
        # Factor 4: File size vs dimensions ratio
        file_size = os.path.getsize(file_path)
        pixel_count = img.width * img.height
        bytes_per_pixel = file_size / pixel_count if pixel_count > 0 else 0
        
        if bytes_per_pixel < 0.5:  # Very compressed
            confidence += 15
        elif bytes_per_pixel > 10:  # Unusually large
            confidence += 10
        
        # Add some controlled randomness for demo
        confidence += random.randint(-5, 15)
        
        # Clamp between 0-100
        confidence = max(0, min(100, confidence))
        
        return {
            "aiConfidence": confidence,
            "isDeepfake": confidence > 50,
            "realPercentage": 100 - confidence,
            "fakePercentage": confidence,
            "riskScore": round(confidence / 10, 1)
        }
    
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        return {
            "aiConfidence": 50,
            "isDeepfake": False,
            "realPercentage": 50,
            "fakePercentage": 50,
            "riskScore": 5.0
        }

def get_risk_level(confidence):
    """Determine risk level based on confidence"""
    if confidence >= 85:
        return "critical"
    elif confidence >= 70:
        return "high"
    elif confidence >= 40:
        return "medium"
    return "low"

def get_recommendations(risk_level):
    """Get recommendations based on risk level"""
    base_recommendations = [
        "Preserve original image hash for evidence chain",
        "Document all findings in case management system",
    ]
    
    if risk_level in ["high", "critical"]:
        return base_recommendations + [
            "Verify authenticity from original source",
            "Avoid public distribution until verified",
            "Escalate to senior analyst for review",
            "Consider forensic image analysis",
        ]
    elif risk_level == "medium":
        return base_recommendations + [
            "Cross-reference with known authentic sources",
            "Schedule follow-up review",
        ]
    
    return base_recommendations + [
        "Image appears authentic - standard processing recommended",
    ]

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "image-analyzer"})

@app.route('/analyze', methods=['POST'])
def analyze():
    """Analyze an uploaded image"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"error": "File type not allowed"}), 400
        
        # Save file temporarily
        filename = os.path.basename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        logger.info(f"Analyzing file: {file_path}")
        
        # Extract metadata
        metadata = extract_metadata(file_path)
        
        # Calculate hash
        file_hash = calculate_hash(file_path)
        file_size = os.path.getsize(file_path)
        
        # Analyze image
        analysis = analyze_image(file_path)
        
        # Determine risk
        risk_level = get_risk_level(analysis["aiConfidence"])
        recommendations = get_recommendations(risk_level)
        
        # Generate case ID
        case_id = f"DF-{datetime.now().strftime('%Y')}-{random.randint(1000, 9999):04d}"
        
        result = {
            "success": True,
            "caseId": case_id,
            "imageName": filename,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata,
            "hash": {
                "sha256": file_hash,
                "fileSize": f"{(file_size / 1024 / 1024):.2f} MB",
                "fileType": os.path.splitext(filename)[1].upper().replace('.', ''),
            },
            "analysis": analysis,
            "riskLevel": risk_level,
            "recommendations": recommendations
        }
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/analyze-existing/<filename>', methods=['POST'])
def analyze_existing(filename):
    """Analyze an existing file in the upload folder"""
    try:
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404
        
        logger.info(f"Analyzing existing file: {file_path}")
        
        # Extract metadata
        metadata = extract_metadata(file_path)
        
        # Calculate hash
        file_hash = calculate_hash(file_path)
        file_size = os.path.getsize(file_path)
        
        # Analyze image
        analysis = analyze_image(file_path)
        
        # Determine risk
        risk_level = get_risk_level(analysis["aiConfidence"])
        recommendations = get_recommendations(risk_level)
        
        # Generate case ID
        case_id = f"DF-{datetime.now().strftime('%Y')}-{random.randint(1000, 9999):04d}"
        
        result = {
            "success": True,
            "caseId": case_id,
            "imageName": filename,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata,
            "hash": {
                "sha256": file_hash,
                "fileSize": f"{(file_size / 1024 / 1024):.2f} MB",
                "fileType": os.path.splitext(filename)[1].upper().replace('.', ''),
            },
            "analysis": analysis,
            "riskLevel": risk_level,
            "recommendations": recommendations
        }
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/list-files', methods=['GET'])
def list_files():
    """List all files in upload folder"""
    try:
        files = []
        for f in os.listdir(UPLOAD_FOLDER):
            if allowed_file(f):
                file_path = os.path.join(UPLOAD_FOLDER, f)
                file_stat = os.stat(file_path)
                files.append({
                    "name": f,
                    "size": f"{(file_stat.st_size / 1024 / 1024):.2f} MB",
                    "modified": datetime.fromtimestamp(file_stat.st_mtime).isoformat()
                })
        return jsonify({"files": files})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Ensure upload folder exists
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    print("🚀 Image Analyzer API starting on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=False)
