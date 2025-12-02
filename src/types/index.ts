// Type definitions for the chatbot application

export interface ChatbotConfig {
  id?: string;
  name: string;
  apiKey: string;
  apiUrl: string;
  modelName: string;
  maxTokens: number;
  temperature: number;
}

export interface Message {
  id: string;
  conversationId: string;
  messageType: 'user' | 'bot';
  content: string;
  createDate: Date;
}

export interface Conversation {
  id: string;
  name: string;
  userId?: string;
  messages: Message[];
  isActive: boolean;
  createDate: Date;
}

export interface SourceData {
  id: string;
  name: string;
  sourceType: 'pdf' | 'url';
  file?: File;
  url?: string;
  extractedText?: string;
  active: boolean;
}

export interface PDFFile {
  name: string;
  content: string; // base64
}

export interface ChatResponse {
  response: string;
  conversationId: string;
  messageId: string;
}

export interface ProcessMessageRequest {
  message: string;
  pdfFiles?: PDFFile[];
  urls?: string[];
  conversationId?: string | null;
}
