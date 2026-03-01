import os
os.environ["TF_USE_LEGACY_KERAS"] = "1"
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
from tensorflow.keras.models import load_model

print("Loading...")
try:
    model = load_model('waste_model_patched.keras')
    print("Successfully loaded patched model!")
except Exception as e:
    import traceback
    traceback.print_exc()
