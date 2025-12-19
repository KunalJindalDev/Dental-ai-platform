import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import io
import concurrent.futures

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

    return jsonify({
        'type': 'multi_model',
        'responses': responses
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)