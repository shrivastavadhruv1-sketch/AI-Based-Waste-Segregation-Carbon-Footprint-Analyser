import os
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image

# Suppress overly verbose TF warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

app = Flask(__name__)
# Enable CORS for all origins, required because your frontend runs on file:// or a different local web server
CORS(app)

# Settings - paths to the adapted model
MODEL_DIR    = '/home/sisyphus/pvt./Yuni-6/hackathon/finalmorning/Final Waste Segregation/waste_model_taco_adapted'
WEIGHTS_PATH = os.path.join(MODEL_DIR, 'model.weights.h5')
TARGET_SIZE  = (224, 224)
# Keras strictly sorts strings alphabetically, maintaining exactly this order:
CLASS_LABELS = ['Biodegradable', 'Hazardous', 'Recyclable']

# Build the exact same architecture the adapted model was trained with:
#   MobileNetV2 (no top) -> GlobalAveragePooling2D -> Dense(128, relu) -> Dropout(0.3) -> Dense(3, softmax)
# NOTE: The adapted model does NOT have a BatchNormalization after GAP — matching config.json exactly.
print(f"Loading adapted model weights from {WEIGHTS_PATH}...")
try:
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights=None
    )

    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(224, 224, 3)),
        base_model,
        tf.keras.layers.GlobalAveragePooling2D(),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(3, activation='softmax')
    ])

    model.load_weights(WEIGHTS_PATH)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Failed to load model: {e}")
    model = None

# GET /health - basic connectivity check
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'server': 'Flask ML Inference', 'model_loaded': model is not None})

# POST /predict - Inference endpoint called by front-end
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # File checks
        if 'image' not in request.files:
            return jsonify({'error': 'No image formally attached inside form-data with key `image`'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No selected image file.'}), 400

        if model is None:
            return jsonify({'error': 'Prediction model failed to load internally on server.'}), 500

        # Preprocessing: Load -> RGB -> 224x224 -> Numpy Array -> MobileNet preprocess
        try:
            image = Image.open(file.stream).convert('RGB')
            image = image.resize(TARGET_SIZE)
        except Exception as e:
            return jsonify({'error': 'Uploaded file is not a valid image format.'}), 400
            
        img_array = np.array(image, dtype=np.float32)
        # We must use MobileNetV2's native preprocessing which scales from -1 to 1 correctly
        img_array = np.expand_dims(img_array, axis=0) # Shape maps to (1, 224, 224, 3)
        img_array = preprocess_input(img_array)

        # Execute Prediction
        predictions = model.predict(img_array)[0] # Extract the first vector from output batch
        
        # Format the confidences out to 2 decimals mathematically
        confidence_scores = {
            CLASS_LABELS[i]: round(float(predictions[i]) * 100, 2) 
            for i in range(len(CLASS_LABELS))
        }
        
        # Grabbing the maximum confidence string explicitly matching the array string literal
        top_index = np.argmax(predictions)
        top_class = CLASS_LABELS[top_index]
        top_confidence = round(float(predictions[top_index]) * 100, 2)

        # ── Safety Override ──────────────────────────────────────────────────
        # In a real-world waste system, a false-negative on HAZARDOUS waste is
        # far more dangerous than a false-positive. If hazardous probability
        # exceeds 30%, always classify as Hazardous regardless of argmax.
        # CLASS_LABELS is alphabetically sorted: [Biodegradable=0, Hazardous=1, Recyclable=2]
        HAZARDOUS_IDX = 1
        HAZARDOUS_THRESHOLD = 0.30
        if predictions[HAZARDOUS_IDX] > HAZARDOUS_THRESHOLD and top_class != 'Hazardous':
            print(f"[Safety Override] Hazardous prob={predictions[HAZARDOUS_IDX]:.2f} > {HAZARDOUS_THRESHOLD} → overriding '{top_class}' to 'Hazardous'")
            top_class = 'Hazardous'
            top_confidence = round(float(predictions[HAZARDOUS_IDX]) * 100, 2)

        # ── Low-Confidence Guard ──────────────────────────────────────────────
        # If the model isn't confident enough, the image is likely outside the
        # training distribution (e.g. clean reusable items, non-waste objects).
        CONFIDENCE_THRESHOLD = 0.60
        if float(predictions[top_index if top_class != 'Hazardous' else HAZARDOUS_IDX]) < CONFIDENCE_THRESHOLD and top_class != 'Hazardous':
            top_class = 'Uncertain – Possibly Non-Waste'

        return jsonify({
            'wasteType': top_class,
            'confidence': top_confidence,
            'allScores': confidence_scores
        })

    except Exception as e:
        print("Prediction Error Exception Event:", e)
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("Flask AI server running on port 8000")
    # Bind to 0.0.0.0 and explicit PORT specification mapping perfectly
    app.run(host='0.0.0.0', port=8000, debug=True)
