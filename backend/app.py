import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import io
import concurrent.futures
import time
import uuid
import json
from datetime import datetime

# Import AI Clients
import google.generativeai as genai
from openai import OpenAI
from groq import Groq
from anthropic import Anthropic

load_dotenv()

app = Flask(__name__)
CORS(app)

# --- 1. CONFIGURATION (API KEYS) ---
GEMINI_KEY = os.getenv("GEMINI_KEY")
GROQ_KEY = os.getenv("GROQ_KEY")
OPENAI_KEY = os.getenv("OPENAI_KEY")
CLAUDE_KEY = os.getenv("CLAUDE_KEY")

# Initialize Clients
genai.configure(api_key=GEMINI_KEY)
openai_client = OpenAI(api_key=OPENAI_KEY)
groq_client = Groq(api_key=GROQ_KEY)
claude_client = Anthropic(api_key=CLAUDE_KEY)

# Load YOLO Model
print("Loading YOLO model...")
try:
    model = YOLO('dental_model.pt')
    print("Model loaded successfully!")
except:
    print("Warning: 'dental_model.pt' not found. Using 'yolov8n.pt' as fallback.")
    model = YOLO('yolov8n.pt')

# --- 2. HELPER FUNCTIONS FOR AI CALLS ---
def call_gpt(prompt):
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error (GPT): {str(e)}"

def call_gemini(prompt):
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error (Gemini): {str(e)}"

def call_llama(prompt):
    try:
        response = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error (Llama): {str(e)}"

def call_claude(prompt):
    try:
        message = claude_client.messages.create(
            model="claude-opus-4-5-20251101",
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )
        return message.content[0].text
    except Exception as e:
        return f"Error (Claude): {str(e)}"

# --- 3. ROUTES ---

@app.route('/detect', methods=['POST'])
def detect_teeth():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    img_bytes = file.read()
    img = Image.open(io.BytesIO(img_bytes))

    results = model(img)

    detections = []
    for result in results:
        for box in result.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            conf = float(box.conf[0])
            cls = int(box.cls[0])
            label = result.names[cls]

            detections.append({
                'label': label,
                'confidence': conf,
                'bbox': [x1, y1, x2, y2]
            })

    log_xray_event(file.filename, detections, results[0].speed['inference'])

    return jsonify({
        'message': 'Success', 
        'count': len(detections),
        'detections': detections
    })

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    
    # Use ThreadPoolExecutor to run all 4 AI calls AT THE SAME TIME
    # This reduces wait time from ~8s to ~2s
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_gpt = executor.submit(call_gpt, user_message)
        future_gemini = executor.submit(call_gemini, user_message)
        future_llama = executor.submit(call_llama, user_message)
        future_claude = executor.submit(call_claude, user_message)

        responses = {
            "gpt4": future_gpt.result(),
            "gemini": future_gemini.result(),
            "llama": future_llama.result(),
            "claude": future_claude.result()
        }

    log_chat_event(user_message, responses)

    return jsonify({
        'type': 'multi_model',
        'responses': responses
    })

# --- LOGGING SYSTEM CONFIGURATION ---
BASE_LOG_DIR = "logs"
XRAY_LOG_DIR = os.path.join(BASE_LOG_DIR, "xray_analysis")
CHAT_LOG_DIR = os.path.join(BASE_LOG_DIR, "chat_history")

def ensure_log_dirs():
    """Creates the necessary folder structure: logs/xray_analysis & logs/chat_history"""
    os.makedirs(XRAY_LOG_DIR, exist_ok=True)
    os.makedirs(CHAT_LOG_DIR, exist_ok=True)

def log_xray_event(filename, detections, inference_speed):
    """Saves a detailed JSON log for every X-ray analyzed."""
    ensure_log_dirs()
    
    log_id = str(uuid.uuid4())[:8] # Short unique ID
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    
    log_data = {
        "log_id": log_id,
        "timestamp": datetime.now().isoformat(),
        "file_analyzed": filename,
        "inference_speed_ms": inference_speed,
        "findings": {
            "total_teeth_detected": len(detections),
            "raw_boxes": detections # Saves the exact coordinates
        }
    }
    
    # Save as: logs/xray_analysis/xray_2025-12-19_10-30-05_a1b2c3d4.json
    log_filename = f"xray_{timestamp}_{log_id}.json"
    save_path = os.path.join(XRAY_LOG_DIR, log_filename)
    
    with open(save_path, "w") as f:
        json.dump(log_data, f, indent=4)
    print(f"📝 [LOG] X-ray Analysis saved to {log_filename}")

def log_chat_event(user_prompt, responses_dict):
    """Saves the User Prompt + All 4 AI Responses in a single JSON file."""
    ensure_log_dirs()
    
    log_id = str(uuid.uuid4())[:8]
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    
    log_data = {
        "log_id": log_id,
        "timestamp": datetime.now().isoformat(),
        "interaction": {
            "user_prompt": user_prompt,
            "ai_responses": responses_dict # Stores Gemini, GPT, Claude, Groq responses
        }
    }
    
    # Save as: logs/chat_history/chat_2025-12-19_10-30-05_a1b2c3d4.json
    log_filename = f"chat_{timestamp}_{log_id}.json"
    save_path = os.path.join(CHAT_LOG_DIR, log_filename)
    
    with open(save_path, "w") as f:
        json.dump(log_data, f, indent=4)
    print(f"📝 [LOG] Chat Interaction saved to {log_filename}")

if __name__ == '__main__':
    app.run(debug=True, port=5000)