import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import tensorflow as tf
from tensorflow.keras.models import load_model

class CustomBN(tf.keras.layers.BatchNormalization):
    def __call__(self, inputs, *args, **kwargs):
        if isinstance(inputs, list):
            inputs = inputs[0]
        return super().__call__(inputs, *args, **kwargs)

try:
    print("Attempting to load with custom_objects...")
    model = load_model('waste_model.keras', custom_objects={'BatchNormalization': CustomBN}, compile=False)
    print("Successfully loaded!")
except Exception as e:
    print("Failed custom_objects!")
    print(repr(e))
