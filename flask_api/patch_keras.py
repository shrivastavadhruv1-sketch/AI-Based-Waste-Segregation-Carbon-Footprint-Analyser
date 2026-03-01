import zipfile
import json
import os
import shutil

model_path = 'waste_model.keras'
patched_path = 'waste_model_patched.keras'
temp_dir = 'temp_keras_extract'

if os.path.exists(temp_dir):
    shutil.rmtree(temp_dir)
os.makedirs(temp_dir)

with zipfile.ZipFile(model_path, 'r') as zip_ref:
    zip_ref.extractall(temp_dir)

config_path = os.path.join(temp_dir, 'config.json')
if os.path.exists(config_path):
    with open(config_path, 'r') as f:
        config_data = f.read()
    
    # Replace batch_shape with batch_input_shape for legacy tf_keras
    config_data = config_data.replace('"batch_shape"', '"batch_input_shape"')
    
    with open(config_path, 'w') as f:
        f.write(config_data)
else:
    print("config.json not found in keras archive.")

with zipfile.ZipFile(patched_path, 'w') as zip_ref:
    for root, dirs, files in os.walk(temp_dir):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, temp_dir)
            zip_ref.write(file_path, arcname)

print("Patch complete!")
    
