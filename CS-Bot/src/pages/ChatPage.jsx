// src/pages/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import '../App.css'; // or update path if you move CSS

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatRef = useRef(null);

  const handleSend = async () => {
  if (!input.trim()) return;

  const userMsg = { sender: 'user', text: input };
  setMessages((prev) => [...prev, userMsg]);

  try {
    const res = await axios.post('http://localhost:5000/routes/chat', {
      message: input
    });

    const botText = res.data.reply; // Make sure `reply` matches backend
    const botMsg = { sender: 'bot', text: botText };
    setMessages((prev) => [...prev, botMsg]);
  } catch (err) {
    console.error('Error:', err);
    setMessages((prev) => [
      ...prev,
      { sender: 'bot', text: 'Error contacting bot.' },
    ]);
  }

  setInput('');
};



  const generateBotReply = (msg) => {
    const text = msg.toLowerCase();
    if (text.includes('hi') || text.includes('hello')) return 'Hey there! 👋';
    if (text.includes('balance')) return 'Your balance is ₹0 😅';
    return "Sorry, I didn’t understand that.";
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        sender: 'bot',
        text: "Hi there! I am Amazon's CS chatBot. How can I help you today? 🤖",
      },
    ]);
  }, []);
  

  return (
    <div className="chat-container">
      <h2>CS-Bot 🤖</h2>
      <div className="chat-box" ref={chatRef}>
        {messages.map((msg, i) => (
          <p key={i} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
            <strong>{msg.sender === 'user' ? 'You' : 'Bot'}:</strong> {msg.text}
          </p>
        ))}
      </div>

      <div className="input-area">
        <input
          type="text"
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
        />
        <button onClick={handleSend}><FaPaperPlane /></button>
      </div>
    </div>
  );
}

export default ChatPage;
