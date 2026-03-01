# ♻️ EcoScan AI

### AI-Based Waste Segregation & Carbon Footprint Analyser

EcoScan AI is an AI-powered web application that classifies waste images into **Biodegradable**, **Recyclable**, or **Hazardous** categories using a fine-tuned MobileNetV2 deep learning model.

The system also calculates the associated **carbon footprint impact** of proper vs. improper disposal.

Developed for **NMIMS University Hackathon 2026**.

---

## 🏗️ System Architecture

| Layer               | Technology Stack                       | Port |
| ------------------- | -------------------------------------- | ---- |
| Frontend            | HTML, CSS, Vanilla JavaScript          | 3000 |
| AI Inference Engine | Python, Flask, TensorFlow, MobileNetV2 | 8000 |
| Backend API         | Node.js, Express, Firebase Firestore   | 5000 |

The system follows a microservice-style separation:

* Frontend → Sends image to backend
* Backend → Forwards to AI Flask server
* AI Server → Returns classification & confidence
* Backend → Stores results in Firestore & returns carbon data

---

## ✨ Core Features

### 🤖 AI Waste Classification

* Upload or capture an image
* Classifies waste into:

  * **Biodegradable**
  * **Recyclable**
  * **Hazardous**

### 🛡️ Hazard Safety Override

If hazardous probability exceeds 30%, the item is flagged as **Hazardous** for safety prioritization.

### ❓ Uncertainty Detection

Predictions with confidence below 60% are marked as:

> “Possibly Non-Waste / Uncertain”

This prevents overconfident misclassification.

### 🌍 Carbon Impact Calculator

Displays:

* Estimated CO₂ saved by proper disposal
* CO₂ impact if sent to landfill

### 📊 User Dashboard

* Scan history
* Category breakdown visualization
* Carbon impact tracking

### 🔐 Secure Authentication

* JWT-based login & registration
* Firebase Firestore integration
* Per-user data isolation

---

## 🧠 Model Overview

**Architecture:**

```
MobileNetV2 (ImageNet Pretrained)
→ GlobalAveragePooling2D
→ Dense(128, ReLU)
→ Dropout(0.3)
→ Dense(3, Softmax)
```

**Input Size:** 224 × 224 RGB
**Classes:** Biodegradable, Hazardous, Recyclable

> Note: This is a waste classification model. It assumes the image contains a waste object and classifies its disposal category.

---

## ⚙️ Installation & Setup

### Prerequisites

* Python 3.10+
* Node.js v20+ (recommended via nvm)
* Firebase project with Firestore enabled

---

## 1️⃣ Clone Repository

```bash
git clone https://github.com/shrivastavadhruv1-sketch/AI-Based-Waste-Segregation-Carbon-Footprint-Analyser.git
cd AI-Based-Waste-Segregation-Carbon-Footprint-Analyser
```

---

## 2️⃣ Add Required Secret Files

### Firebase Service Account Key

1. Go to Firebase Console
2. Project Settings → Service Accounts
3. Generate new private key
4. Save file as:

```
hackathon-firebasekey.json
```

Place it in the project root directory.

---

### backend/.env File

Create a `.env` file inside `backend/` with:

```
PORT=5000
JWT_SECRET=your_secret_key_here
FLASK_URL=http://localhost:8000
```

---

## 3️⃣ Add Model Weights

Place:

```
model.weights.h5
```

At:

```
../waste_model_taco_adapted/model.weights.h5
```

(one directory level above the repository root)

---

## 4️⃣ Start AI Flask Server

```bash
cd flask_api
python3 -m venv venv
venv/bin/pip install tensorflow flask flask-cors pillow numpy
venv/bin/python app.py
```

Runs at:

```
http://localhost:8000
```

---

## 5️⃣ Start Node Backend

```bash
cd backend
npm install
node server.js
```

Runs at:

```
http://localhost:5000
```

---

## 6️⃣ Start Frontend

```bash
cd frontend
python3 -m http.server 3000
```

Open in browser:

```
http://localhost:3000
```

---

## 📁 Project Structure

```
frontend/       → UI layer
backend/        → Node.js API + Firebase integration
flask_api/      → AI inference server
waste_model/    → Model weights (external)
```

---

## 🎯 Design Philosophy

EcoScan AI was built with:

* Real-world waste classification robustness
* Safety-first hazardous handling
* Environmental impact awareness
* Modular AI–backend separation
* Deployment-ready architecture

---

## 👥 Team Name -> #include
