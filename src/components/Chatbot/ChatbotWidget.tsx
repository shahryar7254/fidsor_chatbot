import React, { useState, useRef, useEffect } from 'react';
import type { Message, PDFFile } from '../../types/index';
import { chatbotService } from '../../services/chatbotService';
import './ChatbotWidget.css';

interface ChatbotWidgetProps {
  onClose: () => void;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPdfFiles(Array.from(e.target.files));
    }
  };

  const readFileAsBase64 = (file: File): Promise<PDFFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64 = result.split(',')[1];
        resolve({
          name: file.name,
          content: base64,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const sendMessage = async () => {
    const message = inputValue.trim();
    if (!message || isSending) return;

    setIsSending(true);

    // Process PDFs
    const pdfData: PDFFile[] = [];
    if (pdfFiles.length > 0) {
      for (const file of pdfFiles) {
        try {
          const pdf = await readFileAsBase64(file);
          pdfData.push(pdf);
        } catch (error) {
          console.error('Failed to read PDF:', error);
        }
      }
    }

    // Process URLs
    const urlList = urls
      .split(',')
      .map((u) => u.trim())
      .filter((u) => u && u.startsWith('http'));

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      conversationId: '1',
      messageType: 'user',
      content: message,
      createDate: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Clear inputs
    setInputValue('');
    setPdfFiles([]);
    setUrls('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Show typing indicator
    setIsTyping(true);

    try {
      const response = await chatbotService.processMessage({
        message,
        pdfFiles: pdfData,
        urls: urlList,
        conversationId: '1',
      });

      // Add bot response
      const botMessage: Message = {
        id: response.messageId,
        conversationId: response.conversationId,
        messageType: 'bot',
        content: response.response,
        createDate: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        conversationId: '1',
        messageType: 'bot',
        content: `Error: ${error}`,
        createDate: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className={`o_chatbot_widget ${isMinimized ? 'minimized' : ''}`}>
      <div className="chatbot-header">
        <h4>AI Assistant</h4>
        <div>
          <button className="btn btn-minimize" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? '□' : '−'}
          </button>
          <button className="btn btn-close" onClick={onClose}>
            ×
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="welcome-message">
                <p>Hello! I'm your AI assistant. How can I help you today?</p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.messageType}`}>
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
            {isTyping && (
              <div className="message bot typing-message">
                <div className="message-content typing-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <textarea
              ref={textareaRef}
              className="o_chatbot_input"
              placeholder="Type your message here..."
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />
            <input
              ref={fileInputRef}
              type="file"
              className="o_chatbot_pdf"
              multiple
              accept=".pdf"
              onChange={handleFileChange}
            />
            <input
              type="text"
              className="o_chatbot_urls"
              placeholder="Enter URLs, separated by commas"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
            />
            <button
              className="btn btn-primary o_chatbot_send"
              onClick={sendMessage}
              disabled={isSending}
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
