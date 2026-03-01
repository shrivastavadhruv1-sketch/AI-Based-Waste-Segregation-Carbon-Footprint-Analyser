import os
os.environ["TF_USE_LEGACY_KERAS"] = "1"
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
from tensorflow.keras.models import load_model
print("Attempting to load...")
model = load_model('waste_model.keras')
print("Successfully loaded!")
