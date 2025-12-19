import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import ChatBot from "./ChatBot";

function App() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]); // Keeps track of recent uploads

  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetections([]);
    }
  };

  const handleUpload = async () => {
    if (!image) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch("http://127.0.0.1:5000/detect", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setDetections(data.detections);
      
      // Add to history log
      setHistory(prev => [{
        name: image.name,
        count: data.detections.length,
        time: new Date().toLocaleTimeString()
      }, ...prev]);

    } catch (error) {
      console.error("Error:", error);
      alert("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (detections.length > 0 && imgRef.current && canvasRef.current) {
      drawBoxes();
    }
  }, [detections, previewUrl]);

  const drawBoxes = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;
    
    // Calculate Scale
    const scaleX = img.width / img.naturalWidth;
    const scaleY = img.height / img.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Style settings
    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 4;
    ctx.font = "bold 18px Roboto, sans-serif";
    ctx.fillStyle = "#00FF00";

    detections.forEach((det) => {
      const [x1, y1, x2, y2] = det.bbox;
      const rectX = x1 * scaleX;
      const rectY = y1 * scaleY;
      const rectW = (x2 - x1) * scaleX;
      const rectH = (y2 - y1) * scaleY;

      ctx.strokeRect(rectX, rectY, rectW, rectH);
      
      // Background for text to make it readable
      const text = `${det.label} ${Math.round(det.confidence * 100)}%`;
      const textWidth = ctx.measureText(text).width;
      
      ctx.fillStyle = "rgba(0, 255, 0, 0.2)"; // Semi-transparent fill
      ctx.fillRect(rectX, rectY, rectW, rectH);
      
      ctx.fillStyle = "black";
      ctx.fillRect(rectX, rectY - 25, textWidth + 10, 25);
      
      ctx.fillStyle = "#00FF00";
      ctx.fillText(text, rectX + 5, rectY - 7);
    });
  };

  return (
    <div className="App">
      
      {/* 1. Navbar */}
      <nav className="navbar">
        <div className="logo">🦷 DentAI Scan</div>
        <div className="nav-links">
          <a href="#detector">Detector</a>
          <a href="#tech-stack">Tech Stack</a>
          <a href="#about">About</a>
        </div>
      </nav>

      {/* 2. Hero Section (Detector) */}
      <header id="detector" className="hero-section">
        <div className="card">
          <h1>Wisdom Tooth Analysis</h1>
          <p className="subtitle">Upload a dental X-ray to detect wisdom teeth instantly using AI.</p>
          
          <div className="upload-area">
            <input type="file" id="file-upload" className="file-input" onChange={handleFileChange} accept="image/*" />
            <label htmlFor="file-upload" className="file-label">
              {image ? image.name : "📁 Click to Upload X-Ray"}
            </label>

            <button className="analyze-btn" onClick={handleUpload} disabled={!image || loading}>
              {loading ? "Processing..." : "Run Analysis ⚡"}
            </button>
          </div>

          <div className="workspace">
            <div className="image-wrapper">
              {!previewUrl && <div className="placeholder">No Image Selected</div>}
              {previewUrl && (
                <div className="canvas-container">
                   <img ref={imgRef} src={previewUrl} alt="Analysis" onLoad={() => setDetections([])} />
                   <canvas ref={canvasRef} />
                </div>
              )}
            </div>
            
            {/* Sidebar for stats */}
            <div className="stats-panel">
               <h3>Detection Log</h3>
               {history.length === 0 ? <p className="empty-log">No recent analyses.</p> : (
                 <ul>
                   {history.map((h, i) => (
                     <li key={i}>
                       <span>{h.time}</span>
                       <strong>{h.count} Teeth Found</strong>
                     </li>
                   ))}
                 </ul>
               )}
            </div>
          </div>
        </div>
      </header>

      {/* 3. Tech Stack Section */}
      <section id="tech-stack" className="tech-section">
        <h2>Built With Modern AI Stack</h2>
        <div className="tech-grid">
          <div className="tech-card">
            <span className="icon">🧠</span>
            <h3>YOLOv8</h3>
            <p>State-of-the-art object detection model trained on custom dental datasets.</p>
          </div>
          <div className="tech-card">
            <span className="icon">🐍</span>
            <h3>Python & Flask</h3>
            <p>Robust backend API processing images and serving inference results.</p>
          </div>
          <div className="tech-card">
            <span className="icon">⚛️</span>
            <h3>React.js</h3>
            <p>Interactive frontend for real-time visualization and user experience.</p>
          </div>
          <div className="tech-card">
            <span className="icon">📊</span>
            <h3>Roboflow</h3>
            <p>Dataset management, annotation, and augmentation pipeline.</p>
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer id="about">
        <p>Developed for Dental AI Research • 2025</p>
        <p className="small">Powered by Ultralytics YOLO & React</p>
      </footer>
      <ChatBot detectionContext={detections.length > 0 ? `The user just analyzed an X-ray and found ${detections.length} wisdom teeth.` : ""} />
    </div>
  );
}

export default App;