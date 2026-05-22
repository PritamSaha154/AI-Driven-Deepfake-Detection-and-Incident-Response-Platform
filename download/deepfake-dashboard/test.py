import tkinter as tk
from tkinter import filedialog, Text, Scrollbar, messagebox
from PIL import Image
import piexif
import os
import hashlib
from datetime import datetime

class VeriFakeForensicEngine:
    def __init__(self, root):
        self.root = root
        self.root.title("VeriFake Deep Forensic Analyzer v2.0")
        self.root.geometry("1000x800")
        self.root.config(bg="#0b0e14")
        self.setup_ui()

    def setup_ui(self):
        # Header
        tk.Label(self.root, text="🛡️ VERIFAKE DEEP SCAN", font=("Consolas", 18, "bold"), fg="#58a6ff", bg="#0b0e14").pack(pady=10)
        
        # Action Button
        tk.Button(self.root, text="LOAD ASSET FOR SCAN", command=self.analyze_asset, bg="#238636", fg="white", font=("Arial", 11, "bold"), padx=20, pady=10).pack(pady=5)

        # Output Terminal
        self.output = Text(self.root, bg="#0d1117", fg="#c9d1d9", font=("Consolas", 10), padx=15, pady=15, borderwidth=0)
        self.output.pack(fill="both", expand=True, padx=20, pady=20)
        
        # Tag Configs for Colors
        self.output.tag_config("critical", foreground="#f85149", font=("Consolas", 10, "bold"))
        self.output.tag_config("verified", foreground="#7ee787")
        self.output.tag_config("header", foreground="#d2a8ff", font=("Consolas", 11, "bold"))

    def get_hash(self, path):
        return hashlib.sha256(open(path, 'rb').read()).hexdigest()

    def analyze_asset(self):
        path = filedialog.askopenfilename()
        if not path: return
        
        self.output.delete(1.0, tk.END)
        self.output.insert(tk.END, f"ANALYZING: {os.path.basename(path)}\n", "header")
        self.output.insert(tk.END, f"HASH (SHA256): {self.get_hash(path)}\n\n")

        try:
            # 1. FILE SYSTEM AUDIT
            stats = os.stat(path)
            self.output.insert(tk.END, "[LAYER 1: FILE SYSTEM AUDIT]\n", "header")
            self.output.insert(tk.END, f"Size: {stats.st_size / 1024:.2f} KB\n")
            self.output.insert(tk.END, f"OS Created: {datetime.fromtimestamp(stats.st_ctime)}\n")
            self.output.insert(tk.END, f"OS Modified: {datetime.fromtimestamp(stats.st_mtime)}\n\n")

            # 2. DEEP EXIF SCAN (PIEXIF)
            exif_data = piexif.load(path)
            
            # --- 0th IFD (Primary Info) ---
            self.output.insert(tk.END, "[LAYER 2: HARDWARE & SOFTWARE]\n", "header")
            make = exif_data["0th"].get(piexif.ImageIFD.Make, b"N/A").decode('utf-8').strip('\x00')
            model = exif_data["0th"].get(piexif.ImageIFD.Model, b"N/A").decode('utf-8').strip('\x00')
            soft = exif_data["0th"].get(piexif.ImageIFD.Software, b"None (Clean)").decode('utf-8').strip('\x00')
            
            self.output.insert(tk.END, f"Manufacturer: {make}\n")
            self.output.insert(tk.END, f"Device:       {model}\n")
            
            if "Adobe" in soft or "Photoshop" in soft or "GIMP" in soft:
                self.output.insert(tk.END, f"SOFTWARE:     {soft} (MANIPULATION DETECTED)\n", "critical")
            else:
                self.output.insert(tk.END, f"SOFTWARE:     {soft} (ORIGINAL FIRMWARE)\n", "verified")

            # --- EXIF IFD (Sub-surface data) ---
            self.output.insert(tk.END, "\n[LAYER 3: INTERNAL TIMESTAMP & LENS]\n", "header")
            if exif_data["Exif"]:
                cap_date = exif_data["Exif"].get(piexif.ExifIFD.DateTimeOriginal, b"N/A").decode('utf-8')
                lens = exif_data["Exif"].get(piexif.ExifIFD.LensModel, b"Unknown").decode('utf-8')
                self.output.insert(tk.END, f"Capture Date: {cap_date}\n")
                self.output.insert(tk.END, f"Lens Model:   {lens}\n")
            else:
                self.output.insert(tk.END, "⚠️ INTERNAL DATA STRIPPED\n", "critical")

            # --- GPS IFD ---
            self.output.insert(tk.END, "\n[LAYER 4: GEOLOCATION]\n", "header")
            if exif_data["GPS"]:
                self.output.insert(tk.END, "✅ GPS GEOTAGS FOUND (Coordinates Extractable)\n", "verified")
            else:
                self.output.insert(tk.END, "❌ NO GEOLOCATION DATA\n")

        except Exception as e:
            self.output.insert(tk.END, f"\nCRITICAL ERROR: {str(e)}\n", "critical")

if __name__ == "__main__":
    root = tk.Tk()
    VeriFakeForensicEngine(root)
    root.mainloop()