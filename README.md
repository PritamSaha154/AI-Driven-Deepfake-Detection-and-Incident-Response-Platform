# AI-Driven Deepfake Detection & Incident Response Platform

This platform provides a multimodal approach to detecting deepfakes using Vision Transformers (ViT) and offers an incident response dashboard for forensic analysis.

## 🚀 Features
- **Deepfake Analysis:** Image-based detection using a Vision Transformer model.
- **Forensic Dashboard:** A Next.js-driven interface for managing cases and risk assessments.
- **API Access:** FastAPI backend for seamless integration and real-time inference.

## 🛠️ Project Structure
- `main_api.py`: FastAPI backend script.
- `download/deepfake-dashboard`: Next.js frontend application.
- `ViT_Model/`: Directory for storing model weights (contains `.gitkeep`).
- `Testing Photos/`: Sample datasets for metadata and authenticity verification.

---

## 📦 Setup & Installation

### 1. Prerequisites
- **Python:** 3.9+
- **Node.js:** 18+
- **Machine Learning:** PyTorch and torchvision

### 2. Download Model Weights
Due to GitHub file size limits, the trained weights are hosted on Hugging Face.
- **File:** `verifake_ViT_epoch_15.pth`
- **Link:** [Download from Hugging Face](https://huggingface.co/PritamSaha154/Deepfake_detector/blob/main/verifake_ViT_epoch_15.pth)
- **Placement:** Place the downloaded `.pth` file inside the `ViT_Model/` folder.

### 3. Backend Setup
Navigate to the root directory and run:
```bash
pip install -r requirements.txt
python main_api.py
```

### 4. Frontend & Dashboard Setup
The dashboard is built with Next.js and Tailwind CSS.
```bash
cd download/deepfake-dashboard
npm install
npm run dev
```

The dashboard will be available at http://localhost:3000

🛡️ Incident Response Workflow

a.	Media Ingestion: Upload suspected media via the dashboard.

b.	Analysis: The ViT model analyzes spatial and frequency domain inconsistencies.

c.	Reporting: Automated forensic reports are generated with risk scores and metadata logs.


👥 Contributors
•	Pritam Saha (AI/ML Developer)
•	Argha Raj (Cybersecurity & Incident Response)
•	Goursundar Ghosh (Frontend Devoloper)