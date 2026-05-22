#!/usr/bin/env python3
"""
Test the image analyzer directly
"""

import sys
sys.path.insert(0, '/home/z/my-project/mini-services/image-analyzer')

from index import analyze_image, extract_metadata, calculate_hash, get_risk_level, get_recommendations
import json

# Test with Canon image
file_path = '/home/z/my-project/upload/Canon_40D_photoshop_import.jpg'

print("=" * 50)
print(f"Analyzing: {file_path}")
print("=" * 50)

# Extract metadata
print("\n📸 METADATA:")
metadata = extract_metadata(file_path)
for item in metadata:
    print(f"  {item['field']}: {item['value']} [{item['status']}]")

# Calculate hash
print("\n🔐 HASH:")
file_hash = calculate_hash(file_path)
print(f"  SHA256: {file_hash[:64]}...")

# Analyze
print("\n🤖 AI ANALYSIS:")
analysis = analyze_image(file_path)
print(f"  Confidence: {analysis['aiConfidence']}%")
print(f"  Is Deepfake: {analysis['isDeepfake']}")
print(f"  Risk Score: {analysis['riskScore']}/10")

# Risk level
risk = get_risk_level(analysis['aiConfidence'])
print(f"\n⚠️ RISK LEVEL: {risk.upper()}")

# Recommendations
print("\n📋 RECOMMENDATIONS:")
for rec in get_recommendations(risk):
    print(f"  • {rec}")
