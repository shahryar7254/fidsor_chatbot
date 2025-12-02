# Custom Chatbot - Complete Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Folder Structure](#folder-structure)
4. [Key Components](#key-components)
5. [Services](#services)
6. [APIs Used](#apis-used)
7. [Features](#features)
8. [Setup & Installation](#setup--installation)
9. [How It Works](#how-it-works)
10. [Configuration](#configuration)

---

## 🎯 Project Overview

This is a **React-based AI Chatbot** with a Knowledge Base system that can:
- Answer questions using AI (Google Gemini API)
- Learn from uploaded PDFs
- Crawl and extract information from websites
- Remember conversation history
- Work in "Strict Context Mode" (only answers from provided knowledge)

**Tech Stack:**
- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express + Puppeteer
- **AI:** Google Gemini API
- **PDF Processing:** PDF.js
- **Styling:** CSS

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                        │
│  (React Components: ChatbotWidget, ConfigForm, etc.)    │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  CHATBOT SERVICE                         │
│  (chatbotService.ts - Business Logic Layer)             │
│  • PDF Processing                                        │
│  • URL Scraping (via Backend API)                       │
│  • AI Communication                                      │
│  • Knowledge Base Management                             │
└─────────────────────┬───────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│  GOOGLE GEMINI   │    │  BACKEND SERVER  │
│      API         │    │  (server.js)     │
│  (AI Responses)  │    │  • Puppeteer     │
│                  │    │  • Web Crawling  │
└──────────────────┘    └──────────────────┘
```

---

## 📁 Folder Structure

```
react-chatbot/
├── src/
│   ├── components/          # UI Components
│   │   ├── Chatbot/        # Chatbot Widget & Launcher
│   │   ├── Config/         # Configuration Form
│   │   ├── KnowledgeBase/  # Knowledge Base Manager
│   │   └── SourceData/     # Source Data Display
│   │
│   ├── services/           # Business Logic
│   │   └── chatbotService.ts  # Main service file
│   │
│   ├── types/              # TypeScript Definitions
│   │   └── index.ts
│   │
│   ├── App.tsx             # Main Application
│   ├── App.css             # Global Styles
│   └── main.tsx            # Entry Point
│
├── server.js               # Backend Server (Node.js)
├── package.json            # Dependencies
├── vite.config.ts          # Vite Configuration
└── README.md               # This file
```

---

## 🧩 Key Components

### 1. **ChatbotWidget** (`src/components/Chatbot/ChatbotWidget.tsx`)
- **Purpose:** Main chat interface
- **Features:**
  - Message display (user & AI)
  - Input field for questions
  - Auto-scroll to latest message
  - Loading indicators
  - Error handling

### 2. **ChatbotLauncher** (`src/components/Chatbot/ChatbotLauncher.tsx`)
- **Purpose:** Floating chat button
- **Features:**
  - Opens/closes chatbot
  - Unread message indicator
  - Smooth animations

### 3. **ConfigForm** (`src/components/Config/ConfigForm.tsx`)
- **Purpose:** Chatbot configuration
- **Settings:**
  - Chatbot name
  - Welcome message
  - AI model selection (Gemini 1.5 Pro/Flash)
  - Strict Context Mode toggle
  - API key management

### 4. **KnowledgeBaseManager** (`src/components/KnowledgeBase/KnowledgeBaseManager.tsx`)
- **Purpose:** Manage knowledge sources
- **Features:**
  - Upload PDF files
  - Add website URLs
  - View/delete sources
  - Auto-save uploaded files

### 5. **SourceDataDisplay** (`src/components/SourceData/SourceManager.tsx`)
- **Purpose:** Display active knowledge sources
- **Shows:**
  - List of PDFs
  - List of URLs
  - Delete functionality

---

## 🔧 Services

### **chatbotService.ts** (`src/services/chatbotService.ts`)

This is the **brain** of the chatbot. It handles all business logic.

#### **Why it was created:**
- Separates business logic from UI components
- Makes code reusable and testable
- Centralizes all API calls and data processing

#### **What's inside:**

1. **Configuration Management**
   ```typescript
   saveConfig(config: ChatbotConfig): void
   loadConfig(): ChatbotConfig
   ```
   - Saves/loads chatbot settings to localStorage

2. **Knowledge Base Management**
   ```typescript
   saveKnowledgeBase(sources: KnowledgeSource[]): void
   loadKnowledgeBase(): KnowledgeSource[]
   ```
   - Manages PDFs and URLs
   - Stores in localStorage

3. **PDF Processing**
   ```typescript
   extractTextFromPDF(file: File): Promise<string>
   ```
   - Uses **PDF.js** library
   - Extracts text from all pages
   - Runs in browser (client-side)

4. **URL Scraping**
   ```typescript
   extractTextFromURL(url: string): Promise<string>
   ```
   - Calls backend API (`/api/extract-url`)
   - Backend uses **Puppeteer** to crawl websites
   - Extracts text from up to 1500 pages

5. **AI Communication**
   ```typescript
   callGoogleAI(prompt: string, contextText: string): Promise<string>
   ```
   - Calls **Google Gemini API**
   - Sends user question + knowledge base context
   - Returns AI-generated answer

6. **Message Handling**
   ```typescript
   sendMessage(message: string, knowledgeBase: KnowledgeSource[]): Promise<string>
   ```
   - Main function that orchestrates everything
   - Loads knowledge base
   - Calls AI
   - Returns response

---

## 🌐 APIs Used

### 1. **Google Gemini API** (AI Model)
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
- **Purpose:** Generate AI responses
- **Models Available:**
  - `gemini-1.5-pro-latest` (More accurate, slower)
  - `gemini-1.5-flash-latest` (Faster, less accurate)
- **Authentication:** API Key (stored in localStorage)
- **Cost:** Free tier available (60 requests/minute)

### 2. **Backend API** (`/api/extract-url`)
- **Endpoint:** `http://localhost:3000/api/extract-url`
- **Purpose:** Crawl websites and extract content
- **Method:** POST
- **Request:**
  ```json
  {
    "url": "https://example.com"
  }
  ```
- **Response:**
  ```json
  {
    "text": "Extracted content from all pages..."
  }
  ```

### 3. **PDF.js** (Client-side library)
- **Not an API** - JavaScript library
- **Purpose:** Extract text from PDF files
- **Runs:** In the browser (no server needed)

---

## ✨ Features

### 1. **Strict Context Mode**
- When enabled: Chatbot ONLY answers from provided knowledge (PDFs/URLs)
- When disabled: Chatbot can use general knowledge
- **How it works:** Adds instruction to AI prompt

### 2. **Auto-Save Chat Uploads**
- PDFs/URLs uploaded during chat are automatically saved to Knowledge Base
- Prevents re-uploading same files

### 3. **Website Crawling**
- Crawls up to **1500 pages** per website
- Prioritizes important pages (About, Services, Career, etc.)
- Extracts text, links, and buttons
- **Speed:** ~20-25 minutes for 1000 pages

### 4. **Conversation History**
- Saves last 10 messages
- Stored in localStorage
- Persists across page refreshes

### 5. **Multi-Tab Support**
- Configuration Tab
- Knowledge Base Tab
- Source Data Tab
- Chat Tab

---

## 🚀 Setup & Installation

### **Prerequisites:**
- Node.js (v18 or higher)
- npm or yarn

### **Installation Steps:**

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Get Google Gemini API Key:**
   - Go to: https://makersuite.google.com/app/apikey
   - Create a new API key
   - Copy it

3. **Start Backend Server:**
   ```bash
   node server.js
   ```
   - Runs on: http://localhost:3000

4. **Start Frontend:**
   ```bash
   npm run dev
   ```
   - Runs on: http://localhost:5173

5. **Configure Chatbot:**
   - Open http://localhost:5173
   - Go to "Configuration" tab
   - Paste your API key
   - Set chatbot name and welcome message
   - Click "Save Configuration"

6. **Add Knowledge:**
   - Go to "Knowledge Base" tab
   - Upload PDFs or add website URLs
   - Wait for processing

7. **Start Chatting:**
   - Go to "Chat" tab
   - Ask questions!

---

## 🔄 How It Works

### **User Asks a Question:**

```
1. User types: "What services do you offer?"
   ↓
2. ChatbotWidget captures input
   ↓
3. Calls chatbotService.sendMessage()
   ↓
4. Service loads Knowledge Base from localStorage
   ↓
5. Extracts text from all PDFs and URLs
   ↓
6. Builds context: "Based on this information: [knowledge]"
   ↓
7. Calls Google Gemini API with:
   - System prompt (strict mode instruction)
   - Context (knowledge base)
   - User question
   ↓
8. Gemini returns answer
   ↓
9. Service returns answer to component
   ↓
10. ChatbotWidget displays answer
```

### **Website Crawling Process:**

```
1. User adds URL: "https://example.com"
   ↓
2. Frontend calls: POST /api/extract-url
   ↓
3. Backend (server.js) receives request
   ↓
4. Launches Puppeteer (headless Chrome)
   ↓
5. Visits homepage
   ↓
6. Waits 1.2 seconds for JavaScript to load
   ↓
7. Extracts all links from page
   ↓
8. Visits each link (up to 1500 pages)
   ↓
9. Prioritizes important pages (About, Career, etc.)
   ↓
10. Extracts text, links, buttons from each page
   ↓
11. Combines all content
   ↓
12. Returns to frontend
   ↓
13. Frontend saves to Knowledge Base
```

---

## ⚙️ Configuration

### **Environment Variables** (Optional)
Create `.env` file:
```env
VITE_API_KEY=your_gemini_api_key_here
```

### **Chatbot Settings** (Stored in localStorage)
```typescript
{
  name: "My Chatbot",
  welcomeMessage: "Hello! How can I help?",
  apiKey: "your-api-key",
  model: "gemini-1.5-pro-latest",
  strictContextMode: true
}
```

### **Knowledge Base** (Stored in localStorage)
```typescript
[
  {
    id: "uuid-1",
    type: "pdf",
    name: "document.pdf",
    content: "Extracted text...",
    uploadedAt: "2024-12-02T10:00:00Z"
  },
  {
    id: "uuid-2",
    type: "url",
    name: "https://example.com",
    content: "Crawled content...",
    uploadedAt: "2024-12-02T10:05:00Z"
  }
]
```

---

## 🐛 Troubleshooting

### **"API Key not configured"**
- Go to Configuration tab
- Add your Google Gemini API key
- Click Save

### **"Failed to extract from URL"**
- Make sure backend server is running (`node server.js`)
- Check if port 3000 is available
- Try a different website

### **"PDF processing failed"**
- Check if PDF is not password-protected
- Try a smaller PDF file
- Check browser console for errors

### **Crawling takes too long**
- Current setting: 1.2s per page
- For 1000 pages: ~20-25 minutes
- You can reduce `maxPages` in `server.js` (line 39)

---

## 📊 Performance

- **PDF Processing:** Instant (client-side)
- **URL Crawling:** 
  - 1 page: ~2 seconds
  - 100 pages: ~2-3 minutes
  - 1000 pages: ~20-25 minutes
- **AI Response:** 2-5 seconds
- **Storage:** localStorage (5-10 MB limit)

---

## 🔐 Security

- API keys stored in localStorage (browser only)
- No server-side storage
- CORS enabled for localhost only
- Puppeteer runs in sandbox mode

---

## 📝 License

MIT License - Feel free to use and modify!

---

## 🤝 Support

For issues or questions, check:
- Browser console (F12) for errors
- Terminal output for backend logs
- This README file

---

**Created with ❤️ using React, TypeScript, and Google Gemini AI**
