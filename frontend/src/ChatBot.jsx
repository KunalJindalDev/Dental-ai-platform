import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown"; 
import remarkGfm from "remark-gfm";         
import "./ChatBot.css";

const ChatBot = ({ detectionContext }) => {
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

    const triggers = ["tooth", "teeth", "wisdom", "xray", "x-ray", "image", "detect", "see", "bad", "pain", "them", "they", "it", "that", "those", "these", ];
    const isRelevant = triggers.some(t => input.toLowerCase().includes(t));

    let finalPrompt = input;
    if (detectionContext && isRelevant) {
      finalPrompt = `[Context: ${detectionContext}] Question: ${input}`;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: finalPrompt }),
      });

      const data = await response.json();
      // Ensure we are grabbing the .responses object
      const botMsg = { type: "multi", models: data.responses || data }; 
      setMessages((prev) => [...prev, botMsg]);

    } catch (error) {
      console.error("Error:", error);
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
                   <div className="simple-bubble">
                     {/* Allow simple markdown even in user bubbles if needed */}
                     <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                   </div>
                )}

                {msg.type === "multi" && (
                  <div className="model-grid">
                    {/* GPT-4o Card */}
                    <div className="model-card gpt">
                      <strong>GPT-4o</strong>
                      <div className="markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.models.gpt4}</ReactMarkdown>
                      </div>
                    </div>

                    {/* Gemini Card */}
                    <div className="model-card gemini">
                      <strong>Gemini 1.5</strong>
                      <div className="markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.models.gemini}</ReactMarkdown>
                      </div>
                    </div>

                    {/* Llama Card */}
                    <div className="model-card llama">
                      <strong>Llama 3 (Groq)</strong>
                      <div className="markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.models.llama}</ReactMarkdown>
                      </div>
                    </div>

                    {/* Claude Card */}
                    <div className="model-card claude">
                      <strong>Claude 3.5</strong>
                      <div className="markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.models.claude}</ReactMarkdown>
                      </div>
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