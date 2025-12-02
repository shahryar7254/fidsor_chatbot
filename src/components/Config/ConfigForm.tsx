import React, { useState, useEffect } from 'react';
import type { ChatbotConfig } from '../../types/index';
import { chatbotService } from '../../services/chatbotService';
import './ConfigForm.css';

export const ConfigForm: React.FC = () => {
  const [config, setConfig] = useState<ChatbotConfig>({
    name: 'Google AI Studio Config',
    apiKey: '',
    apiUrl: 'https://generativelanguage.googleapis.com',
    modelName: 'gemini-2.0-flash',
    maxTokens: 1000,
    temperature: 0.7,
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedConfig = chatbotService.getConfig();
    setConfig(savedConfig);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    chatbotService.setConfig(config);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="config-form-container">
      <h2>Custom Chatbot Configuration</h2>
      <form onSubmit={handleSubmit} className="config-form">
        <div className="form-section">
          <h3>API Configuration</h3>
          <div className="form-group">
            <label htmlFor="name">Configuration Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={config.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="apiKey">API Key</label>
            <input
              type="password"
              id="apiKey"
              name="apiKey"
              value={config.apiKey}
              onChange={handleChange}
              placeholder="Enter your Google AI Studio API key"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="apiUrl">API URL</label>
            <input
              type="text"
              id="apiUrl"
              name="apiUrl"
              value={config.apiUrl}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="modelName">Model Name</label>
            <input
              type="text"
              id="modelName"
              name="modelName"
              value={config.modelName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>AI Settings</h3>
          <div className="form-group">
            <label htmlFor="maxTokens">Max Tokens</label>
            <input
              type="number"
              id="maxTokens"
              name="maxTokens"
              value={config.maxTokens}
              onChange={handleChange}
              min="1"
              max="8192"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="temperature">Temperature</label>
            <input
              type="number"
              id="temperature"
              name="temperature"
              value={config.temperature}
              onChange={handleChange}
              min="0"
              max="2"
              step="0.1"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save">
            Save Configuration
          </button>
          {isSaved && <span className="save-indicator">✓ Saved!</span>}
        </div>
      </form>

      <div className="config-info">
        <h3>ℹ️ How to get your API Key</h3>
        <ol>
          <li>Visit <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
          <li>Sign in with your Google account</li>
          <li>Click "Get API Key" or "Create API Key"</li>
          <li>Copy the API key and paste it above</li>
        </ol>
      </div>
    </div>
  );
};
