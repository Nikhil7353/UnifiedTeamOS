import { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import api from '../../services/api';
import { Send, Hash, Users, MessageCircle, Sparkles, Bot, Paperclip, Loader2, Download, Image as ImageIcon, FileText, User as UserIcon } from 'lucide-react';

export default function ChatWindow({ currentUser, activeChannel }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Load Chat History & Connect WebSocket
  useEffect(() => {
    if (activeChannel) {
      fetchHistory();
      connectWebSocket();
    }

    return () => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        try {
          stompClientRef.current.disconnect();
        } catch (e) {
          console.log("Cleanup ignored:", e);
        }
      }
    };
  }, [activeChannel]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchHistory = async () => {
    if (!activeChannel) return;

    try {
      const response = await api.get(`/chat/channels/${activeChannel.id}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error("Could not load message history", error);
    }
  };

  const connectWebSocket = () => {
    const socket = new SockJS('http://localhost:8000/ws');
    const client = Stomp.over(socket);

    // Disable debug logs
    client.debug = null;

    client.connect({}, () => {
      setIsConnected(true);
      client.subscribe('/topic/public', (payload) => {
        const newMessage = JSON.parse(payload.body);
        if (newMessage.channel_id === activeChannel?.id) {
          setMessages((prev) => [...prev, newMessage]);
        }
      });
    }, (err) => {
      console.error("WebSocket Error:", err);
      setIsConnected(false);
    });

    stompClientRef.current = client;
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !stompClientRef.current || !activeChannel) return;

    const messagePayload = {
      content: input,
      sender: currentUser,
      channel_id: activeChannel.id,
      message_type: 'text',
      timestamp: new Date().toISOString()
    };

    try {
      // Send via WebSocket if connected, otherwise via API
      if (stompClientRef.current.connected) {
        stompClientRef.current.send("/app/chat.sendMessage", {}, JSON.stringify(messagePayload));
      } else {
        await api.post(`/chat/channels/${activeChannel.id}/messages`, messagePayload);
      }
      setInput('');
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const handleFileUpload = async (e) => {
    if (!activeChannel) return;
    const file = e.target.files?.[0];
    if (!file) return;

    // Frontend guardrails: 10MB and allowed types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('File type not allowed');
      e.target.value = null;
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File too large (max 10MB)');
      e.target.value = null;
      return;
    }

    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const res = await api.post(`/chat/channels/${activeChannel.id}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Append a lightweight system message so users see the upload
      setMessages((prev) => [
        ...prev,
        {
          id: `file-${res.data.id}`,
          content: `Uploaded file: ${res.data.filename}`,
          message_type: 'file',
          sender: currentUser,
          timestamp: new Date().toISOString(),
          file_url: res.data.file_url,
          filename: res.data.filename,
          file_size: res.data.file_size,
          file_type: res.data.file_type,
        },
      ]);
    } catch (error) {
      console.error("File upload failed", error);
      setUploadError('Upload failed. Try again.');
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  const getAISuggestion = () => {
    // Mock AI suggestion - in real implementation, this would call an AI service
    const suggestions = [
      "Great work on that task!",
      "Let me check that for you",
      "Here's what I found:",
      "Thanks for the update",
      "That looks good to me"
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  return (
    <div className="flex flex-col h-full bg-secondary-50 dark:bg-secondary-900">
      {/* Header */}
      <div className="bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Hash className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-secondary-900 dark:text-white text-lg">
                {activeChannel?.name || 'general'}
              </h3>
              <p className="text-xs text-secondary-500 dark:text-secondary-400">
                {isConnected ? (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                    Live chat
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-secondary-400 rounded-full"></div>
                    Connecting...
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-secondary-500 dark:text-secondary-400">
              <Users className="w-3 h-3" />
              <span>12</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-secondary-300 dark:text-secondary-600 mx-auto mb-4" />
            <p className="text-secondary-500 dark:text-secondary-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender?.username === currentUser?.username;
            const isAI = msg.message_type === 'ai';
            const isFile = msg.message_type === 'file' || msg.file_url;

            return (
              <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                  isMe ? 'message-own' : 'message-other'
                } ${isAI ? 'border-l-4 border-accent-500' : ''}`}>

                  {/* AI Badge */}
                  {isAI && (
                    <div className="flex items-center gap-1 mb-2">
                      <Bot className="w-3 h-3 text-accent-500" />
                      <span className="text-xs text-accent-600 dark:text-accent-400 font-medium">AI Assistant</span>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className={isMe ? 'text-white' : 'text-secondary-900 dark:text-white'}>
                    {isFile ? (
                      <div className="space-y-2">
                        {(msg.file_type || '').startsWith('image/') ? (
                          <img
                            src={msg.file_url || msg.content}
                            alt={msg.filename}
                            className="max-h-48 rounded-lg shadow-soft"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            {(msg.file_type || '').includes('pdf') ? <FileText className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                            <a
                              href={msg.file_url || msg.content}
                              target="_blank"
                              rel="noreferrer"
                              className="underline"
                            >
                              {msg.filename || msg.content || 'Download file'}
                            </a>
                          </div>
                        )}
                        <div className={`text-xs ${isMe ? 'text-white/70' : 'text-secondary-500 dark:text-secondary-400'}`}>
                          {msg.file_type} · {(msg.file_size ? (msg.file_size / 1024).toFixed(1) : '?')} KB
                        </div>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>

                  {/* Message Meta */}
                  <div className={`text-xs mt-2 ${
                    isMe ? 'text-white/70' : 'text-secondary-500 dark:text-secondary-400'
                  }`}>
                    {!isMe && !isAI && (
                      <span className="font-medium mr-2">{msg.sender?.username}</span>
                    )}
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* AI Suggestions */}
      {input.length > 0 && (
        <div className="px-4 py-2 bg-secondary-50 dark:bg-secondary-800/50 border-t border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center gap-2 text-xs text-secondary-500 dark:text-secondary-400">
            <Sparkles className="w-3 h-3" />
            <span>AI Suggestion: </span>
            <button
              onClick={() => setInput(getAISuggestion())}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
            >
              {getAISuggestion()}
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white dark:bg-secondary-800 border-t border-secondary-200 dark:border-secondary-700 p-4">
        <form onSubmit={sendMessage} className="flex items-end gap-3">
          <div className="flex-1">
            <div className="relative">
              <textarea
                rows="1"
                className="input-modern resize-none"
                placeholder={`Message ${activeChannel?.name || '#general'}...`}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // Auto-resize textarea
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
              />
            </div>
          </div>

          <label className="btn-secondary p-3 flex-shrink-0 cursor-pointer relative">
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileUpload}
              accept=".png,.jpg,.jpeg,.gif,.pdf,.txt"
              disabled={isUploading || !activeChannel}
            />
          </label>

          {uploadError && (
            <div className="text-xs text-danger-600 dark:text-danger-400">
              {uploadError}
            </div>
          )}

          <button
            type="submit"
            disabled={!input.trim() || !activeChannel}
            className="btn-primary p-3 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Typing Indicator */}
        {isTyping && (
          <div className="mt-2 text-xs text-secondary-500 dark:text-secondary-400">
            Someone is typing...
          </div>
        )}
      </div>
    </div>
  );
}