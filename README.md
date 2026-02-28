# 🗑️ AI-Based Waste Segregation & Carbon Footprint Analyser

> **Problem Statement 1** — NMIMS Hackathon  
> A computer vision-based system that classifies waste into **Biodegradable**, **Recyclable**, and **Hazardous** categories and estimates carbon footprint reduction potential.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Objectives](#-objectives)
- [Tech Stack](#-tech-stack)
- [Dataset](#-dataset)
- [Model Architecture](#-model-architecture)
- [Dataset Preparation](#-dataset-preparation)
- [Training Pipeline](#-training-pipeline)
- [Evaluation](#-evaluation)
- [Inference](#-inference)
- [How to Run](#-how-to-run)
- [Results](#-results)
- [Future Scope](#-future-scope)

---

## 🌍 Overview

Improper waste management is a growing environmental crisis. This project leverages **Transfer Learning with MobileNetV2** to automatically classify waste images into three actionable categories:

| Category        | Waste Types Included                              |
|-----------------|--------------------------------------------------|
| ♻️ Recyclable   | Metal, Glass, Paper, Cardboard, Plastic          |
| 🌱 Biodegradable | Biological / Organic waste                       |
| ☢️ Hazardous    | Batteries, Trash, Clothes, Shoes                 |

By automating waste segregation, this system promotes **smart waste management**, supports **circular economy initiatives**, and contributes to a **sustainability analytics dashboard**.

---

## 🎯 Objectives

- ✅ Classify waste images into 3 categories using computer vision
- ✅ Promote smart, automated waste management
- ✅ Support circular economy initiatives by identifying recyclable materials
- ✅ Lay the groundwork for estimating **carbon footprint reduction potential**
- ✅ Provide insights via a sustainability analytics dashboard

---

## 🛠️ Tech Stack

| Layer            | Technology                                          |
|------------------|-----------------------------------------------------|
| Language         | Python 3                                            |
| Deep Learning    | TensorFlow / Keras                                  |
| Base Model       | MobileNetV2 (pre-trained on ImageNet)               |
| Data Augmentation| Keras `ImageDataGenerator`                          |
| Data Processing  | NumPy, OS, Shutil                                   |
| Evaluation       | Scikit-learn (confusion matrix, classification report) |
| Visualization    | Matplotlib, Seaborn                                 |
| Dataset Source   | Kaggle — `sumn2u/garbage-classification-v2`         |
| Environment      | Google Colab (GPU-accelerated)                      |

---

## 📦 Dataset

**Source:** [Garbage Classification V2 — Kaggle](https://www.kaggle.com/datasets/sumn2u/garbage-classification-v2)

The dataset contains standardized `256×256` images across **10 raw categories**:

```
biological, metal, glass, paper, cardboard, plastic, battery, trash, clothes, shoes
```

These are **remapped** into 3 target classes for our model:

```python
mapping = {
    "biological": "biodegradable",
    "metal":      "recyclable",
    "glass":      "recyclable",
    "paper":      "recyclable",
    "cardboard":  "recyclable",
    "plastic":    "recyclable",
    "battery":    "hazardous",
    "trash":      "hazardous",
    "clothes":    "hazardous",
    "shoes":      "hazardous"
}
```

---

## 🧠 Model Architecture

We use **MobileNetV2** as a feature extractor (frozen weights from ImageNet) and add custom classification layers on top:

```
MobileNetV2 (frozen, pre-trained on ImageNet)
    ↓
GlobalAveragePooling2D
    ↓
Dense(128, activation='relu')
    ↓
Dropout(0.3)
    ↓
Dense(3, activation='softmax')   ← [biodegradable | hazardous | recyclable]
```

**Compiler settings:**
- Optimizer: `Adam`
- Loss: `Categorical Crossentropy`
- Metrics: `Accuracy`

---

## 📂 Dataset Preparation

The raw dataset is split into **Train (70%)** and **Validation (15%)** sets. The remaining 15% is discarded to keep validation lean.

```
Garbage_3Class/
├── train/
│   ├── biodegradable/
│   ├── recyclable/
│   └── hazardous/
└── val/
    ├── biodegradable/
    ├── recyclable/
    └── hazardous/
```

**Data Augmentation** (applied on training set only):
- Rotation: ±20°
- Zoom: 20%
- Horizontal Flip: Enabled
- Rescaling: `1/255`

---

## 🏋️ Training Pipeline

```python
IMG_SIZE   = 224      # MobileNetV2 input resolution
BATCH_SIZE = 32
EPOCHS     = 10
```

Training is run on **Google Colab** with GPU acceleration.

```bash
# Download dataset via Kaggle API
kaggle datasets download -d sumn2u/garbage-classification-v2
unzip garbage-classification-v2.zip -d GarbageDatasetV2
```

---

## 📊 Evaluation

After training, the model is evaluated on the validation set with:

- **Confusion Matrix** — visualized as a heatmap (Seaborn)
- **Classification Report** — precision, recall, F1-score per class
- **Validation Accuracy** — printed after `model.evaluate()`

Sample output metrics (expected):
```
              precision    recall  f1-score   support
biodegradable     0.xx      0.xx      0.xx       xxx
    hazardous     0.xx      0.xx      0.xx       xxx
   recyclable     0.xx      0.xx      0.xx       xxx
     accuracy                         0.xx      xxxx
```

---

## 🔍 Inference

The model supports **single-image inference**. Upload any waste image and get:

- Predicted class: `biodegradable` / `recyclable` / `hazardous`
- Confidence score in `%`
- Raw softmax probabilities for all 3 classes
- Image displayed with prediction title

```python
# Example usage (in Colab)
predict_image("plastic_bottle.jpg")
# Output: recyclable (94.32%)
```

---

## 🚀 How to Run

### Prerequisites

```bash
pip install tensorflow kaggle scikit-learn seaborn matplotlib
```

### Steps (Google Colab)

1. **Set up Kaggle credentials** in the notebook:
   ```python
   os.environ['KAGGLE_USERNAME'] = "your_username"
   os.environ['KAGGLE_KEY'] = "your_api_key"
   ```

2. **Download and extract** the dataset:
   ```python
   !kaggle datasets download -d sumn2u/garbage-classification-v2
   !unzip garbage-classification-v2.zip -d GarbageDatasetV2
   ```

3. **Run `main.py`** (or the Colab notebook) top-to-bottom for:
   - Dataset re-mapping & splitting
   - Model training
   - Evaluation with confusion matrix
   - Inference on uploaded images

4. **Upload a test image** when prompted by `files.upload()` to get predictions.

---

## 📈 Results

| Metric                | Value          |
|-----------------------|----------------|
| Model                 | MobileNetV2    |
| Input Resolution      | 224 × 224      |
| Training Split        | 70%            |
| Validation Split      | 15%            |
| Epochs                | 10             |
| Classes               | 3              |

> Full accuracy and F1 scores will be populated after model training run.

---

## 🔭 Future Scope

- 🌱 **Carbon Footprint Estimator** — Map each waste category to a CO₂ reduction coefficient and compute footprint savings per classification
- 📊 **Sustainability Dashboard** — Real-time analytics panel showing waste category distribution and environmental impact
- 📱 **Mobile App Integration** — Deploy model via TensorFlow Lite for on-device inference
- 🔄 **Circular Economy Module** — Provide location-based recycling center recommendations
- 🗺️ **Geo-tagged Waste Heatmap** — Track waste distribution by region for smart city planning
- 🤖 **Object Detection** — Upgrade from classification to bounding-box-level detection (YOLO / SSD)

---

## 👥 Team

**NMIMS Hackathon — Problem Statement 1**  
*AI-Based Waste Segregation & Carbon Footprint Analyser*

---

## 📄 License

This project is for academic and educational purposes under the NMIMS Hackathon.
