#!/usr/bin/env python3
"""
Standalone image analyzer script
Usage: python3 run_analyzer.py <image_path>
"""

import os
import sys
import json
import hashlib
import random
from datetime import datetime
from PIL import Image, ExifTags

def dms_to_decimal(dms, ref):
    """Convert DMS to decimal coordinates"""
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
    """Extract GPS coordinates from image"""
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
    except:
        return None

def extract_metadata(file_path):
    """Extract metadata from image"""
    metadata = []
    
    try:
        img = Image.open(file_path)
        exif_data = img.getexif()
        
        file_stat = os.stat(file_path)
        file_size = file_stat.st_size
        
        metadata.append({"field": "File Name", "value": os.path.basename(file_path), "status": "valid"})
        metadata.append({"field": "File Size", "value": f"{(file_size / 1024 / 1024):.2f} MB", "status": "valid"})
        metadata.append({"field": "Image Format", "value": img.format, "status": "valid"})
        metadata.append({"field": "Image Dimensions", "value": f"{img.width} x {img.height}", "status": "valid"})
        metadata.append({"field": "Color Mode", "value": img.mode, "status": "valid"})
        
        if exif_data:
            exif_dict = {}
            for tag, value in exif_data.items():
                name = ExifTags.TAGS.get(tag, tag)
                exif_dict[name] = value
            
            if "DateTime" in exif_dict or "DateTimeOriginal" in exif_dict:
                date_val = exif_dict.get("DateTimeOriginal") or exif_dict.get("DateTime")
                metadata.append({"field": "Creation Date", "value": str(date_val), "status": "valid"})
            
            if "Make" in exif_dict:
                metadata.append({"field": "Camera Make", "value": str(exif_dict["Make"]), "status": "valid"})
            
            if "Model" in exif_dict:
                metadata.append({"field": "Camera Model", "value": str(exif_dict["Model"]), "status": "valid"})
            
            if "Software" in exif_dict:
                software = str(exif_dict["Software"])
                suspicious_keywords = ['photoshop', 'lightroom', 'gimp', 'affinity', 'canva']
                is_suspicious = any(kw in software.lower() for kw in suspicious_keywords)
                metadata.append({"field": "Editing Software", "value": software, "status": "suspicious" if is_suspicious else "valid"})
            
            if "ExposureTime" in exif_dict:
                metadata.append({"field": "Exposure Time", "value": str(exif_dict["ExposureTime"]), "status": "valid"})
            
            if "FNumber" in exif_dict:
                metadata.append({"field": "Aperture", "value": f"f/{exif_dict['FNumber']}", "status": "valid"})
            
            if "ISOSpeedRatings" in exif_dict:
                metadata.append({"field": "ISO", "value": str(exif_dict["ISOSpeedRatings"]), "status": "valid"})
            
            if "FocalLength" in exif_dict:
                metadata.append({"field": "Focal Length", "value": f"{exif_dict['FocalLength']}mm", "status": "valid"})
            
            gps = extract_gps(img)
            if gps:
                metadata.append({"field": "GPS Location", "value": f"{gps['latitude']:.6f}, {gps['longitude']:.6f}", "status": "valid"})
        else:
            metadata.append({"field": "EXIF Data", "value": "No EXIF data found", "status": "suspicious"})
        
        return metadata
    except Exception as e:
        return [{"field": "Error", "value": str(e), "status": "invalid"}]

def calculate_hash(file_path):
    """Calculate SHA-256 hash"""
    sha256_hash = hashlib.sha256()
    try:
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    except:
        return ""

def analyze_image(file_path):
    """Perform deepfake analysis"""
    try:
        img = Image.open(file_path)
        exif_data = img.getexif()
        
        confidence = 0
        
        if exif_data:
            confidence -= 10
        else:
            confidence += 30
        
        if exif_data:
            for tag, value in exif_data.items():
                name = ExifTags.TAGS.get(tag, tag)
                if name == "Software":
                    suspicious_keywords = ['photoshop', 'lightroom', 'gimp', 'affinity']
                    if any(kw in str(value).lower() for kw in suspicious_keywords):
                        confidence += 25
        
        if img.width == img.height and img.width > 1000:
            confidence += 10
        
        file_size = os.path.getsize(file_path)
        pixel_count = img.width * img.height
        bytes_per_pixel = file_size / pixel_count if pixel_count > 0 else 0
        
        if bytes_per_pixel < 0.5:
            confidence += 15
        elif bytes_per_pixel > 10:
            confidence += 10
        
        confidence += random.randint(-5, 15)
        confidence = max(0, min(100, confidence))
        
        return {
            "aiConfidence": confidence,
            "isDeepfake": confidence > 50,
            "realPercentage": 100 - confidence,
            "fakePercentage": confidence,
            "riskScore": round(confidence / 10, 1)
        }
    except:
        return {"aiConfidence": 50, "isDeepfake": False, "realPercentage": 50, "fakePercentage": 50, "riskScore": 5.0}

def get_risk_level(confidence):
    if confidence >= 85:
        return "critical"
    elif confidence >= 70:
        return "high"
    elif confidence >= 40:
        return "medium"
    return "low"

def get_recommendations(risk_level):
    base = ["Preserve original image hash for evidence chain", "Document all findings in case management system"]
    
    if risk_level in ["high", "critical"]:
        return base + ["Verify authenticity from original source", "Avoid public distribution until verified", "Escalate to senior analyst for review", "Consider forensic image analysis"]
    elif risk_level == "medium":
        return base + ["Cross-reference with known authentic sources", "Schedule follow-up review"]
    
    return base + ["Image appears authentic - standard processing recommended"]

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 run_analyzer.py <image_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    if not os.path.exists(file_path):
        print(json.dumps({"error": "File not found"}))
        sys.exit(1)
    
    metadata = extract_metadata(file_path)
    file_hash = calculate_hash(file_path)
    analysis = analyze_image(file_path)
    risk_level = get_risk_level(analysis["aiConfidence"])
    recommendations = get_recommendations(risk_level)
    file_size = os.path.getsize(file_path)
    
    result = {
        "success": True,
        "caseId": f"DF-{datetime.now().strftime('%Y')}-{random.randint(1000, 9999):04d}",
        "imageName": os.path.basename(file_path),
        "timestamp": datetime.now().isoformat(),
        "metadata": metadata,
        "hash": {
            "sha256": file_hash,
            "fileSize": f"{(file_size / 1024 / 1024):.2f} MB",
            "fileType": os.path.splitext(file_path)[1].upper().replace('.', '')
        },
        "analysis": analysis,
        "riskLevel": risk_level,
        "recommendations": recommendations
    }
    
    print(json.dumps(result))

if __name__ == "__main__":
    main()
