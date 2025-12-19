import React, { useState, useRef, useEffect } from "react";
import "./ChatBot.css";

const ChatBot = ({detectionContext}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: "text", text: "Hello! I am connected to GPT-4o, Gemini, Llama 3, and Claude. Ask me anything!", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { type: "text", text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // --- SMART CONTEXT INJECTION ---
    // 1. Define keywords that trigger the X-ray context
    const triggers = ["tooth", "teeth", "wisdom", "xray", "x-ray", "image", "detect", "see", "bad", "pain"];
    
    // 2. Check if the user's input contains any of them
    const isRelevant = triggers.some(t => input.toLowerCase().includes(t));

    // 3. Only attach context if relevant AND we have detections
    let finalPrompt = input;
    if (detectionContext && isRelevant) {
      finalPrompt = `[Context: ${detectionContext}] Question: ${input}`;
      console.log("Context injected!"); // For debugging
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: finalPrompt }),
      });

      const data = await response.json();
      const botMsg = { type: "multi", models: data.responses };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prev) => [...prev, { type: "text", text: "Error communicating with server.", sender: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chat-window expanded">
          <div className="chat-header">
            <h3>Multi-LLM Arena</h3>
            <button onClick={toggleChat}>✖</button>
          </div>
          
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-row ${msg.sender}`}>
                
                {msg.type === "text" && (
                   <div className="simple-bubble">{msg.text}</div>
                )}

                {msg.type === "multi" && (
                  <div className="model-grid">
                    <div className="model-card gpt">
                      <strong>GPT-4o</strong>
                      <p>{msg.models.gpt4}</p>
                    </div>
                    <div className="model-card gemini">
                      <strong>Gemini 1.5</strong>
                      <p>{msg.models.gemini}</p>
                    </div>
                    <div className="model-card llama">
                      <strong>Llama 3 (Groq)</strong>
                      <p>{msg.models.llama}</p>
                    </div>
                    <div className="model-card claude">
                      <strong>Claude 3.5</strong>
                      <p>{msg.models.claude}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {loading && <div className="loading-indicator">Consulting 4 AI models simultaneously...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Ask the models..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}>➤</button>
          </div>
        </div>
      )}

      <button className="chat-toggle-btn" onClick={toggleChat}>
        🤖
      </button>
    </div>
  );
};

export default ChatBot;