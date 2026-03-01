# ♻️ EcoScan AI — Waste Segregation & Carbon Footprint Analyser

An AI-powered web application that classifies waste images into **Biodegradable**, **Recyclable**, or **Hazardous** categories using a fine-tuned MobileNetV2 model, and calculates the associated carbon footprint impact.

Built for NMIMS University Hackathon 2026.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (HTML/JS)                  │
│              Served on localhost:3000                │
└──────────────┬──────────────────┬───────────────────┘
               │                  │
               ▼                  ▼
┌──────────────────────┐  ┌──────────────────────────┐
│   Flask AI Server    │  │   Node.js Backend API    │
│   (TensorFlow)       │  │   (Express + Firebase)   │
│   localhost:8000     │  │   localhost:5000         │
└──────────────────────┘  └──────────────────────────┘
```

| Component | Technology | Port |
|-----------|-----------|------|
| Frontend | HTML, CSS, Vanilla JS | 3000 |
| AI Inference | Python, Flask, TensorFlow, MobileNetV2 | 8000 |
| Backend API | Node.js, Express, Firebase Firestore | 5000 |

---

## ✨ Features

- 🤖 **AI Waste Classification** — Upload or capture an image to classify waste as Biodegradable, Recyclable, or Hazardous
- 🛡️ **Safety Override** — Hazardous items detected at >30% probability are always flagged as hazardous (safety-critical domain logic)
- ❓ **Uncertainty Detection** — Low-confidence predictions (<60%) are flagged as "Possibly Non-Waste"
- 🌍 **Carbon Impact Calculator** — Shows CO₂ saved vs. CO₂ wasted per scan
- 📊 **User Dashboard** — Per-user scan history, category breakdown charts
- 🔐 **Authentication** — JWT-based login/register with Firebase Firestore

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js v20+ (install via [nvm](https://github.com/nvm-sh/nvm) on Linux)
- A Firebase project with Firestore enabled

---

### 1. Clone the Repository

```bash
git clone https://github.com/shrivastavadhruv1-sketch/AI-Based-Waste-Segregation-Carbon-Footprint-Analyser.git
cd AI-Based-Waste-Segregation-Carbon-Footprint-Analyser
```

---

### 2. Add Required Secret Files (not in repo for security)

**Firebase Service Account Key:**
1. Go to [Firebase Console](https://console.firebase.google.com) → Project Settings → Service Accounts
2. Click **"Generate new private key"** → download the JSON file
3. Place it at the repo root as: `hackathon-firebasekey.json`

**Backend `.env` file** — create `backend/.env`:
```
PORT=5000
JWT_SECRET=your_secret_key_here
FLASK_URL=http://localhost:8000
```

---

### 3. Add the ML Model Weights (not in repo — too large for GitHub)

The model weights file (`model.weights.h5`) must be placed at:
```
../waste_model_taco_adapted/model.weights.h5
```
i.e., one level above the repo folder in a directory named `waste_model_taco_adapted`.

---

### 4. Flask AI Server Setup

```bash
cd flask_api

# Create virtual environment
python3 -m venv venv

# Install dependencies
venv/bin/pip install tensorflow flask flask-cors pillow numpy

# Start server
venv/bin/python app.py
```

Server runs at **http://localhost:8000**

---

### 5. Node.js Backend Setup

```bash
cd backend

# Install Node v20 via nvm (if not installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20 && nvm use 20

# Install dependencies
npm install

# Start server
node server.js
```

Server runs at **http://localhost:5000**

---

### 6. Frontend

```bash
cd frontend
python3 -m http.server 3000
```

Open **http://localhost:3000** in your browser.

---

## 🧠 Model Details

- **Architecture:** MobileNetV2 (no top) → GlobalAveragePooling2D → Dense(128, ReLU) → Dropout(0.3) → Dense(3, Softmax)
- **Training Data:** GarbageDatasetV2 + TACO dataset (mapped to 3 classes)
- **Classes:** `Biodegradable`, `Hazardous`, `Recyclable` (alphabetical order)
- **Input Size:** 224×224 RGB
- **Note:** Model is a waste classifier — it assumes the input is already a waste object.

---

## 🔒 Security Notes

- `hackathon-firebasekey.json` and `.env` are in `.gitignore` and never committed
- Model weight files are excluded due to GitHub file size limits
- JWT tokens expire after 7 days

---

## 👥 Team

Built by **Dhruv Shrivastava** and team — NMIMS University, 2026.
