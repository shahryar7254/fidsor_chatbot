import { useState } from 'react';
import { ChatbotLauncher } from './components/Chatbot/ChatbotLauncher';
import { ChatbotWidget } from './components/Chatbot/ChatbotWidget';
import { ConfigForm } from './components/Config/ConfigForm';
import { SourceManager } from './components/SourceData/SourceManager';
import './App.css';

function App() {
  const [showChatbot, setShowChatbot] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'config' | 'sources'>('home');

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🤖 Custom AI Chatbot</h1>
          <p>AI-powered chatbot using Google AI Studio API</p>
        </div>
        <nav className="app-nav">
          <button
            className={`nav-button ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            Home
          </button>
          <button
            className={`nav-button ${activeTab === 'sources' ? 'active' : ''}`}
            onClick={() => setActiveTab('sources')}
          >
            Knowledge Base
          </button>
          <button
            className={`nav-button ${activeTab === 'config' ? 'active' : ''}`}
            onClick={() => setActiveTab('config')}
          >
            Configuration
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'config' && <ConfigForm />}
        {activeTab === 'sources' && <SourceManager />}
        {activeTab === 'home' && (
          <div className="home-content">
            <div className="hero-section">
              <div className="hero-icon">💬</div>
              <h2>Welcome to Your AI Assistant</h2>
              <p className="hero-description">
                Click the button in the bottom right corner to start chatting with your AI assistant.
                You can upload PDFs and provide URLs for context-aware responses.
              </p>
              <div className="features">
                <div className="feature-card">
                  <div className="feature-icon">📄</div>
                  <h3>PDF Support</h3>
                  <p>Upload PDF documents to provide context for your questions</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🌐</div>
                  <h3>URL Scraping</h3>
                  <p>Provide website URLs to extract and use their content</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🧠</div>
                  <h3>AI-Powered</h3>
                  <p>Powered by Google's Gemini AI for intelligent responses</p>
                </div>
              </div>
            </div>

            <div className="getting-started">
              <h3>🚀 Getting Started</h3>
              <ol>
                <li>Go to the <strong>Configuration</strong> page to set your API key</li>
                <li>Go to <strong>Knowledge Base</strong> to save PDFs and URLs permanently</li>
                <li>Click the <strong>💬 AI Assistant</strong> button to start chatting</li>
              </ol>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Created by Raja Shahryar Shabeer | <a href="https://www.fidsor.com" target="_blank" rel="noopener noreferrer">www.fidsor.com</a></p>
      </footer>

      {/* Chatbot Components */}
      {!showChatbot && <ChatbotLauncher onClick={() => setShowChatbot(true)} />}
      {showChatbot && <ChatbotWidget onClose={() => setShowChatbot(false)} />}
    </div>
  );
}

export default App;
