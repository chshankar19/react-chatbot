import React, { useState } from 'react';
import './styles.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const newMessage = { sender: 'user', text: input };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Send the input to the backend for response
    const response = await getChatbotResponse(input);
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'bot', text: response }
    ]);

    setInput(''); // Clear input
  };

  const getChatbotResponse = async (userInput) => {
    try {
      // Log only the POST request and the response
      console.log(`Sending user input to the backend: ${userInput}`);
      
      const response = await fetch('http://127.0.0.1:5001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userInput }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Received response from Flask API: ${data.response}`);
      return data.response;
    } catch (error) {
      console.error('Error fetching chatbot response:', error);
      return 'Sorry, something went wrong.';
    }
  };

  return (
    <div className="chat-container">
      <h1>Chat with Jarvis</h1>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
