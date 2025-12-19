from ultralytics import YOLO

# 1. Load the model
model = YOLO('yolov8n.pt') 

# 2. Train the model
results = model.train(
    data='yolo_dataset/data.yaml', 
    epochs=50, 
    imgsz=640,
    plots=True
)