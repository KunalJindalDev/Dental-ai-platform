# 🦷 Dental AI Platform — Wisdom Tooth Detection & Multi-Model Arena

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
![React](https://img.shields.io/badge/React-18.x-61DAFB.svg?logo=react&logoColor=black)
![Flask](https://img.shields.io/badge/Flask-2.x-lightgrey?logo=flask&logoColor=white)
![YOLOv8](https://img.shields.io/badge/AI-YOLOv8-FF0000)
![GPT](https://img.shields.io/badge/LLM-GPT-000000?logo=openai&logoColor=white)
![Gemini](https://img.shields.io/badge/LLM-Gemini-1A73E8?logo=google&logoColor=white)
![Claude](https://img.shields.io/badge/LLM-Claude-FF6F00?logo=anthropic&logoColor=white)
![Groq](https://img.shields.io/badge/LLM-Groq-00B3A4?logo=groq&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## 🧠 Project Overview

**Dental AI Platform** is a dual-purpose AI application developed for the **Tiny Project (Dec 2025)** research initiative at **North Carolina State University** under **PI Dr. Dongkuan (DK) Xu**.

This platform addresses two core challenges in medical AI integration as specified in **Project 2**:
1.  **Visual Diagnostics:** Automated detection of wisdom teeth in dental X-rays using computer vision.
2.  **Multi-Model Reasoning:** A "Quad-Chat" interface that queries **GPT**, **Gemini**, **Groq**, and **Claude** simultaneously to compare diverse AI perspectives on dental queries.



## ⚙️ Tech Stack

| Layer | Technologies | Key Focus |
|-------|---------------|-----------|
| **Frontend** | React.js, CSS3 (Medical Dark Mode) | Interactive UI, X-ray visualization, Grid Chat |
| **Backend** | Python 3, Flask, Flask-CORS | API routing, Image processing, Parallel LLM calls |
| **Computer Vision** | **YOLOv8** (Ultralytics) | Object detection trained on custom Roboflow dataset |
| **LLM Engine** | OpenAI, Google GenAI, Groq, Anthropic | Parallel threading for multi-model inference |
| **Tools** | Roboflow, Git, npm | Data annotation, version control, package management |



## 🧩 Core Features

### 1. Wisdom Tooth Detection (Vision)
- **Custom Trained Model:** Utilizes YOLOv8 trained on annotated dental X-rays to identify wisdom teeth areas.
- **Real-time Inference:** Users upload an X-ray, and the system outputs the image with the wisdom area highlighted.
- **Visual Feedback:** Color-coded bounding boxes drawn dynamically over the user's image via HTML5 Canvas.

### 2. Multi-LLM Arena (Chatbot)
- **Parallel Processing:** Uses Python `ThreadPoolExecutor` to query 4 distinct foundation models at the same time.
- **Model Comparison:** Displays responses from **GPT**, **Gemini**, **Groq**, and **Claude** in a comparative grid.

## 🧱 Architecture

```text
Dental-Platform/   
├── backend/  
│   ├── app.py                 # Main Flask Server (API Routes)
│   ├── dental_model.pt        # Trained YOLOv8 weights
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # API Keys (OpenAI, Gemini, Groq, Anthropic)
├── frontend/    
│   ├── src/
│   │   ├── App.jsx            # Main Detection Interface
│   │   ├── ChatBot.jsx        # Multi-Model Chat Widget
│   │   └── App.css            # Medical Dark Theme Styling
│   ├── public/ 
│   └── package.json           # React dependencies
├── training/
│   ├── raw_images/            # Source data
│   ├── yolo_dataset/          # Train/Test/Valid split images
│   ├── train.py               # YOLOv8 Training Script
│   └── download_raw.py        # Dataset Fetcher
├── .gitignore                 # Security exclusions
├── LICENSE
└── README.md                  # Project Documentation
```

## 🔑 Configuration

1. Create a file named `.env` in the `backend/` folder.
2. Add your API keys in this format:
   ```ini
   GEMINI_KEY=your_key_here
   GROQ_KEY=your_key_here
   OPENAI_KEY=your_key_here
   CLAUDE_KEY=your_key_here


## 🚀 Installation & Usage

Prerequisites

    Python 3.10+

    Node.js & npm

### 1. Setup Backend
```Bash
cd backend
pip install -r requirements.txt
# Ensure your .env file is populated with API keys for OpenAI, Gemini, Groq, and Anthropic
python app.py
```
Server runs on http://127.0.0.1:5000

### 2. Setup Frontend
```Bash
cd frontend
npm install
npm start
```
Client runs on http://localhost:3000

## 📸 Usage Guide

### 1. Detecting Teeth:

* Navigate to the home page.

* Click "Upload X-Ray" and select a dental image.

* Click "Run Analysis" to see YOLOv8 identify wisdom teeth areas.

### 2. Consulting the AI Board:

* Click the 🤖 Robot Icon in the bottom right.

* Ask a medical question (e.g., "When should wisdom teeth be removed?").

* Watch as multiple AI models answer simultaneously in the grid view.

## 👥 Contributors

    Kunal Jindal 
    Berwin Chen (Lead Phd Student)
    Dr. Dongkuan (DK) Xu (Principal Investigator)

## 📜 License

This project is submitted for the NCSU Tiny Project Research Initiative. Distributed under the MIT License.

