import { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import api from '../../services/api';

export default function ChatWindow({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 1. Load Chat History & Connect WebSocket
  useEffect(() => {
    fetchHistory();
    connectWebSocket();

    return () => {
      // SAFETY CHECK: Only disconnect if client exists and connection is live
      if (stompClientRef.current && stompClientRef.current.connected) {
        try {
            stompClientRef.current.disconnect();
        } catch (e) {
            console.log("Cleanup ignored:", e); // Ignore errors during cleanup
        }
      }
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/messages');
      setMessages(response.data);
    } catch (error) {
      console.error("Could not load history", error);
    }
  };

  const connectWebSocket = () => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = Stomp.over(socket);
    
    // Disable debug logs
    client.debug = null; 

    client.connect({}, () => {
      client.subscribe('/topic/public', (payload) => {
        const newMessage = JSON.parse(payload.body);
        setMessages((prev) => [...prev, newMessage]);
      });
    }, (err) => {
      console.error("WebSocket Error:", err);
    });

    stompClientRef.current = client;
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !stompClientRef.current) return;

    const messagePayload = {
      content: input,
      sender: currentUser,
      timestamp: new Date().toISOString()
    };

    stompClientRef.current.send("/app/chat.sendMessage", {}, JSON.stringify(messagePayload));
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden">
      {/* HEADER */}
      <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
        <h3 className="font-bold text-lg text-slate-700"># general</h3>
        <span className="text-xs text-green-500 font-bold">● Live</span>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-100 space-y-4">
        {messages.map((msg, index) => {
          const isMe = msg.sender?.username === currentUser?.username;
          return (
            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md p-3 rounded-lg shadow ${
                isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none'
              }`}>
                {!isMe && <div className="text-xs text-slate-400 mb-1">{msg.sender?.username}</div>}
                <div>{msg.content}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t flex gap-2">
        <input
          type="text"
          className="flex-1 p-2 border rounded focus:outline-none focus:border-indigo-500"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 font-bold">
          Send
        </button>
      </form>
    </div>
  );
}