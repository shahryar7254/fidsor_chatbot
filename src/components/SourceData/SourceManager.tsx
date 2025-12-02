import React, { useState, useEffect } from 'react';
import type { SourceData } from '../../types/index';
import { chatbotService } from '../../services/chatbotService';
import './SourceManager.css';

export const SourceManager: React.FC = () => {
  const [sources, setSources] = useState<SourceData[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = () => {
    const saved = chatbotService.getSources();
    setSources(saved);
  };

  const handleDelete = (id: string) => {
    const updated = sources.filter(s => s.id !== id);
    chatbotService.saveSources(updated);
    setSources(updated);
  };

  const handleToggleActive = (id: string) => {
    const updated = sources.map(s => 
      s.id === id ? { ...s, active: !s.active } : s
    );
    chatbotService.saveSources(updated);
    setSources(updated);
  };

  const handleUrlAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput) return;

    setIsUploading(true);
    setUploadStatus('Extracting text from URL...');

    try {
      const text = await chatbotService.extractTextFromURL(urlInput);
      
      const newSource: SourceData = {
        id: Date.now().toString(),
        name: urlInput,
        sourceType: 'url',
        url: urlInput,
        extractedText: text,
        active: true
      };

      const updated = [...sources, newSource];
      chatbotService.saveSources(updated);
      setSources(updated);
      setUrlInput('');
      setUploadStatus('');
    } catch (error) {
      console.error(error);
      setUploadStatus('Failed to add URL');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsUploading(true);
    setUploadStatus('Processing PDF...');

    const file = e.target.files[0];
    
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        
        // Extract text
        const text = await chatbotService.extractTextFromPDF(base64);
        
        const newSource: SourceData = {
          id: Date.now().toString(),
          name: file.name,
          sourceType: 'pdf',
          extractedText: text,
          active: true
        };

        const updated = [...sources, newSource];
        chatbotService.saveSources(updated);
        setSources(updated);
        setUploadStatus('');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setUploadStatus('Failed to process PDF');
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div className="source-manager-container">
      <h2>📚 Knowledge Base</h2>
      <p className="description">
        Add PDFs and URLs here. The chatbot will use these sources to answer your questions.
      </p>

      <div className="add-source-section">
        <div className="add-card">
          <h3>Add URL</h3>
          <form onSubmit={handleUrlAdd}>
            <input
              type="url"
              placeholder="https://example.com"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={isUploading}
            />
            <button type="submit" disabled={isUploading || !urlInput}>
              {isUploading ? 'Adding...' : 'Add URL'}
            </button>
          </form>
        </div>

        <div className="add-card">
          <h3>Upload PDF</h3>
          <div className="file-upload-wrapper">
            <input
              type="file"
              accept=".pdf"
              id="pdf-upload"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <label htmlFor="pdf-upload" className="btn-upload">
              {isUploading ? 'Processing...' : 'Choose PDF File'}
            </label>
          </div>
        </div>
      </div>

      {uploadStatus && <div className="status-message">{uploadStatus}</div>}

      <div className="sources-list">
        <h3>Saved Sources ({sources.length})</h3>
        {sources.length === 0 ? (
          <p className="empty-state">No sources added yet.</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source) => (
                  <tr key={source.id}>
                    <td>
                      <span className={`badge ${source.sourceType}`}>
                        {source.sourceType === 'pdf' ? '📄 PDF' : '🌐 URL'}
                      </span>
                    </td>
                    <td className="source-name" title={source.name}>
                      {source.name}
                    </td>
                    <td>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={source.active}
                          onChange={() => handleToggleActive(source.id)}
                        />
                        <span className="slider round"></span>
                      </label>
                    </td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(source.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
