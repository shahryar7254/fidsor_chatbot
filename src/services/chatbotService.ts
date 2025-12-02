import type { ProcessMessageRequest, ChatResponse, ChatbotConfig } from '../types/index';

// Default configuration - loads from .env file
const DEFAULT_CONFIG: ChatbotConfig = {
    name: import.meta.env.VITE_CHATBOT_NAME || 'Google AI Studio Config',
    apiKey: import.meta.env.VITE_API_KEY || '', // Load from .env
    apiUrl: import.meta.env.VITE_API_URL || 'https://generativelanguage.googleapis.com',
    modelName: import.meta.env.VITE_MODEL_NAME || 'gemini-2.0-flash',
    maxTokens: parseInt(import.meta.env.VITE_MAX_TOKENS || '1000'),
    temperature: 0.7,
};

class ChatbotService {
    private config: ChatbotConfig = DEFAULT_CONFIG;

    // Set configuration
    setConfig(config: Partial<ChatbotConfig>) {
        this.config = { ...this.config, ...config };
        // Save to localStorage
        localStorage.setItem('chatbot_config', JSON.stringify(this.config));
    }

    // Get configuration
    getConfig(): ChatbotConfig {
        const saved = localStorage.getItem('chatbot_config');
        if (saved) {
            this.config = JSON.parse(saved);
        }
        return this.config;
    }

    // Extract text from PDF (client-side using pdfjs-dist)
    async extractTextFromPDF(base64: string): Promise<string> {
        try {
            // Dynamic import to avoid SSR issues if we were using Next.js, 
            // and to keep bundle size smaller until needed
            const pdfjsLib = await import('pdfjs-dist');

            // Set worker source to a reliable CDN (matching version 3.11.174)
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

            // Decode base64
            const binaryString = window.atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Load document
            const loadingTask = pdfjsLib.getDocument({ data: bytes });
            const doc = await loadingTask.promise;

            let fullText = '';

            // Iterate through pages
            for (let i = 1; i <= doc.numPages; i++) {
                const page = await doc.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join(' ');
                fullText += pageText + '\n';
            }

            return fullText;
        } catch (error) {
            console.error('PDF extraction failed:', error);
            return `Error: Could not process PDF. ${error}`;
        }
    }

    // Extract text from URL (requires backend API)
    async extractTextFromURL(url: string): Promise<string> {
        try {
            console.log(`🌍 Extracting URL: ${url}`);

            // NOTE: Browser security (CORS) prevents us from scraping websites directly from the frontend.
            // We must use a backend server or a proxy to fetch the website content.

            const response = await fetch('/api/extract-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            console.log(`📡 Response status: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Server error: ${errorText}`);

                // If 404, it means the backend endpoint doesn't exist
                if (response.status === 404) {
                    return `[System Note: URL Scraping requires a backend server. The React app cannot scrape '${url}' directly due to browser security (CORS). Please implement the /api/extract-url endpoint in a Node.js/Python backend.]`;
                }
                throw new Error(`Failed to extract from URL: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ Extracted ${data.text?.length || 0} characters from ${url}`);
            return data.text || '';
        } catch (error) {
            console.error('URL extraction failed:', error);
            return `[Failed to extract content from URL: ${url}. Reason: ${error}]`;
        }
    }

    // Call Google Gemini API
    async callGoogleAI(prompt: string, contextText: string = ''): Promise<string> {
        const config = this.getConfig();

        if (!config.apiKey) {
            return 'Error: API key not configured. Please set up your configuration.';
        }

        const url = `${config.apiUrl}/v1beta/models/${config.modelName}:generateContent?key=${config.apiKey}`;

        // Strict Context Prompt
        const finalPrompt = contextText
            ? `You are a helpful assistant designed to answer questions based ONLY on the provided context.
            
Context:
${contextText}

Instructions:
1. Answer the user's question using ONLY the information from the Context above.
2. If the answer is not present in the Context, you MUST reply with exactly: "I'm not sure about this."
3. Do not use outside knowledge or make up information.

Question: ${prompt}`
            : `You are a helpful assistant.
            
Instructions:
1. Since no context was provided, you MUST reply with exactly: "I'm not sure about this." (unless the user is just saying hello).

Question: ${prompt}`;

        const payload = {
            contents: [{ parts: [{ text: finalPrompt }] }],
            generationConfig: {
                temperature: 0.1, // Lower temperature for more strict/deterministic responses
                maxOutputTokens: config.maxTokens || 512,
            },
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', errorText);
                return `API Error: Received status code ${response.status}`;
            }

            const result = await response.json();
            const candidates = result.candidates || [];

            if (candidates.length > 0 && candidates[0].content) {
                const parts = candidates[0].content.parts || [];
                if (parts.length > 0 && parts[0].text) {
                    return parts[0].text;
                }
            }

            return 'Error: AI returned empty response.';
        } catch (error) {
            console.error('Connection failed:', error);
            return `Connection Error: ${error}`;
        }
    }

    // Process message with PDFs and URLs
    async processMessage(request: ProcessMessageRequest): Promise<ChatResponse> {
        let context = '';
        const newSources: any[] = [];

        // 1. Add pre-existing sources from Knowledge Base
        const savedSources = this.getSources();
        for (const source of savedSources) {
            if (source.active && source.extractedText) {
                context += `Source (${source.name}):\n${source.extractedText}\n\n`;
            }
        }

        // 2. Process and SAVE dynamic PDFs from chat
        if (request.pdfFiles && request.pdfFiles.length > 0) {
            for (const pdf of request.pdfFiles) {
                try {
                    const text = await this.extractTextFromPDF(pdf.content);
                    context += `Source (${pdf.name}):\n${text}\n\n`;

                    // Add to new sources to be saved
                    newSources.push({
                        id: Date.now().toString() + Math.random().toString().slice(2, 5),
                        name: pdf.name,
                        sourceType: 'pdf',
                        extractedText: text,
                        active: true
                    });
                } catch (error) {
                    console.error('PDF handling failed:', error);
                }
            }
        }

        // 3. Process and SAVE dynamic URLs from chat
        if (request.urls && request.urls.length > 0) {
            for (const url of request.urls) {
                try {
                    const text = await this.extractTextFromURL(url);
                    context += `Source (${url}):\n${text}\n\n`;

                    // Add to new sources to be saved
                    newSources.push({
                        id: Date.now().toString() + Math.random().toString().slice(2, 5),
                        name: url,
                        sourceType: 'url',
                        url: url,
                        extractedText: text,
                        active: true
                    });
                } catch (error) {
                    console.error('URL handling failed:', error);
                }
            }
        }

        // 4. Save new sources to Knowledge Base (LocalStorage)
        if (newSources.length > 0) {
            const updatedSources = [...savedSources, ...newSources];
            this.saveSources(updatedSources);
        }

        // Send to Gemini
        const botResponse = await this.callGoogleAI(request.message, context);

        return {
            response: botResponse,
            conversationId: request.conversationId || '1',
            messageId: Date.now().toString(),
        };
    }

    // Source data management
    getSources() {
        const saved = localStorage.getItem('chatbot_sources');
        return saved ? JSON.parse(saved) : [];
    }

    saveSources(sources: any[]) {
        localStorage.setItem('chatbot_sources', JSON.stringify(sources));
    }
}

export const chatbotService = new ChatbotService();
