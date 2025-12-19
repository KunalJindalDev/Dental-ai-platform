import os
from datasets import load_dataset, Image

# 1. Setup
save_dir = "raw_images"
os.makedirs(save_dir, exist_ok=True)

# 2. Download
print(">>> Downloading dataset...")
ds = load_dataset(
    "RayanAi/Main_teeth_dataset",
    split="train"
).cast_column("image", Image())  

# 3. Save first 80 images
print(">>> Saving first 80 images...")
for i in range(80):
    img = ds[i]["image"]         
    img.save(os.path.join(save_dir, f"{i}.jpg"))

print(f">>> Done! Check the '{save_dir}' folder.")
