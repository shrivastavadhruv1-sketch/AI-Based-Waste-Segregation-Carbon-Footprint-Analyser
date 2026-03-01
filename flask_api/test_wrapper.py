import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
from tensorflow.keras.models import load_model
try:
    print("Attempting to load compile=False...")
    model = load_model('waste_model.keras', compile=False)
    print("Successfully loaded!")
except Exception as e:
    print("Failed compile=False!")
    print(e)
