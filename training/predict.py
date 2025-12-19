from ultralytics import YOLO
import os

# 1. Load model
model = YOLO('runs/detect/train/weights/best.pt')

# 2. Pick images to test
test_images_path = 'yolo_dataset/test/images'
test_image_files = os.listdir(test_images_path)

if test_image_files:
    # Get the full path of the first image
    image_path = os.path.join(test_images_path, test_image_files[0])
    print(f"Testing on: {image_path}")

    # 3. Run prediction
    results = model(image_path)

    # 4. Save the results
    for r in results:
        r.save() 
        print("Prediction saved! Check the 'runs/detect/predict' folder.")
else:
    print("No images found in test folder!")