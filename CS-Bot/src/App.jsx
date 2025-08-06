// // App.jsx
// import React, { useState, useEffect, useRef } from 'react';
// import { FaPaperPlane } from 'react-icons/fa';
// import './App.css';

// function App() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const chatRef = useRef(null);

//   const handleSend = () => {
//     if (input.trim() === '') return;

//     const userMsg = { sender: 'user', text: input };
//     setMessages((prev) => [...prev, userMsg]);

//     const botReply = { sender: 'bot', text: generateBotReply(input) };
//     setTimeout(() => {
//       setMessages((prev) => [...prev, botReply]);
//     }, 600);

//     setInput('');
//   };

//   const generateBotReply = (msg) => {
//     const text = msg.toLowerCase();
//     if (text.includes('hi') || text.includes('hello')) return 'Hey there! 👋';
//     if (text.includes('balance')) return 'Your balance is ₹0 😅';
//     return "Sorry, I didn’t understand that.";
//   };

//   useEffect(() => {
//   if (chatRef.current) {
//     chatRef.current.scrollTop = chatRef.current.scrollHeight;
//   }
// }, [messages]);

//   useEffect(() => {
//   // Greet only when component mounts first time
//   setMessages([{ sender: 'bot', text: "Hi there! I am Amazon's CS chatBot. How can I help you today? 🤖" }]);
// }, []);


//   return (
//     <div className="chat-container">
//       <h2>CS-Bot 🤖</h2>
//       <div className="chat-box" ref={chatRef}>
//         {messages.map((msg, i) => (
//           <p key={i} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
//             <strong>{msg.sender === 'user' ? 'You' : 'Bot'}:</strong> {msg.text}
//           </p>
//         ))}
//       </div>

//       <div className="input-area">
//         <input
//           type="text"
//           placeholder="Ask something..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === 'Enter') handleSend();
//           }}
//         />
//         <button onClick={handleSend}><FaPaperPlane /></button>
//       </div>
//     </div>
//   );
// }

// export default App;


// src/App.jsx
import React from 'react';
import ChatPage from './pages/ChatPage';

function App() {
  return <ChatPage />;
}

export default App;
