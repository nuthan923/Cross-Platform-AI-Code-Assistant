const OpenAI = require('openai');
const axios = require('axios');

/**
 * AI Service abstraction layer to support multiple LLM providers
 * Supports: OpenAI, Ollama, LM Studio, Generic OpenAI-compatible endpoints
 */
class AIService {
    constructor(config) {
        this.config = {
            provider: 'openai', // openai, ollama, lmstudio, generic
            apiKey: '',
            baseUrl: '',
            model: 'gpt-3.5-turbo',
            ...config
        };
        this.client = null;
        this.initialize();
    }

    initialize() {
        switch (this.config.provider) {
            case 'openai':
                this.initializeOpenAI();
                break;
            case 'ollama':
                this.initializeOllama();
                break;
            case 'lmstudio':
                this.initializeLMStudio();
                break;
            case 'generic':
                this.initializeGeneric();
                break;
            default:
                console.error('Unsupported provider:', this.config.provider);
        }
    }

    initializeOpenAI() {
        if (this.config.apiKey) {
            this.client = new OpenAI({
                apiKey: this.config.apiKey,
                dangerouslyAllowBrowser: true
            });
        }
    }

    initializeOllama() {
        // Ollama runs locally on port 11434 by default
        this.config.baseUrl = this.config.baseUrl || 'http://localhost:11434';
        // No API key needed for local Ollama
        this.client = 'ollama';
    }

    initializeLMStudio() {
        // LM Studio runs locally on port 1234 by default
        this.config.baseUrl = this.config.baseUrl || 'http://localhost:1234';
        // No API key needed for local LM Studio
        this.client = 'lmstudio';
    }

    initializeGeneric() {
        // Generic OpenAI-compatible endpoint
        if (this.config.baseUrl) {
            this.client = new OpenAI({
                apiKey: this.config.apiKey || 'dummy-key', // Some endpoints need a dummy key
                baseURL: this.config.baseUrl,
                dangerouslyAllowBrowser: true
            });
        }
    }

    async generateCompletion(prompt, options = {}) {
        const defaultOptions = {
            maxTokens: 500,
            temperature: 0.2,
            systemPrompt: 'You are a helpful coding assistant. Provide clean, efficient code completions.'
        };
        const finalOptions = { ...defaultOptions, ...options };

        try {
            switch (this.config.provider) {
                case 'openai':
                    return await this.openaiCompletion(prompt, finalOptions);
                case 'ollama':
                    return await this.ollamaCompletion(prompt, finalOptions);
                case 'lmstudio':
                    return await this.lmstudioCompletion(prompt, finalOptions);
                case 'generic':
                    return await this.genericCompletion(prompt, finalOptions);
                default:
                    throw new Error('Unsupported provider');
            }
        } catch (error) {
            console.error('AI completion error:', error);
            throw error;
        }
    }

    async openaiCompletion(prompt, options) {
        if (!this.client) {
            throw new Error('OpenAI client not initialized. Please check your API key.');
        }

        const response = await this.client.chat.completions.create({
            model: this.config.model,
            messages: [
                {
                    role: 'system',
                    content: options.systemPrompt
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: options.maxTokens,
            temperature: options.temperature
        });

        return response.choices[0].message.content;
    }

    async ollamaCompletion(prompt, options) {
        const response = await axios.post(`${this.config.baseUrl}/api/generate`, {
            model: this.config.model,
            prompt: `${options.systemPrompt}\n\n${prompt}`,
            stream: false,
            options: {
                temperature: options.temperature,
                num_predict: options.maxTokens
            }
        });

        return response.data.response;
    }

    async lmstudioCompletion(prompt, options) {
        // LM Studio uses OpenAI-compatible API
        const response = await axios.post(`${this.config.baseUrl}/v1/chat/completions`, {
            model: this.config.model,
            messages: [
                {
                    role: 'system',
                    content: options.systemPrompt
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: options.maxTokens,
            temperature: options.temperature
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content;
    }

    async genericCompletion(prompt, options) {
        if (!this.client) {
            throw new Error('Generic client not initialized. Please check your configuration.');
        }

        const response = await this.client.chat.completions.create({
            model: this.config.model,
            messages: [
                {
                    role: 'system',
                    content: options.systemPrompt
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: options.maxTokens,
            temperature: options.temperature
        });

        return response.choices[0].message.content;
    }

    async testConnection() {
        try {
            switch (this.config.provider) {
                case 'openai':
                    return await this.testOpenAI();
                case 'ollama':
                    return await this.testOllama();
                case 'lmstudio':
                    return await this.testLMStudio();
                case 'generic':
                    return await this.testGeneric();
                default:
                    return { success: false, error: 'Unsupported provider' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async testOpenAI() {
        if (!this.client) {
            return { success: false, error: 'API key required' };
        }

        const response = await this.client.chat.completions.create({
            model: this.config.model,
            messages: [{ role: 'user', content: 'Hello' }],
            max_tokens: 5
        });

        return { success: true, response: 'Connected to OpenAI' };
    }

    async testOllama() {
        const response = await axios.get(`${this.config.baseUrl}/api/tags`);
        const models = response.data.models || [];
        return { 
            success: true, 
            response: `Connected to Ollama. Available models: ${models.map(m => m.name).join(', ') || 'None'}` 
        };
    }

    async testLMStudio() {
        const response = await axios.get(`${this.config.baseUrl}/v1/models`);
        const models = response.data.data || [];
        return { 
            success: true, 
            response: `Connected to LM Studio. Available models: ${models.map(m => m.id).join(', ') || 'None'}` 
        };
    }

    async testGeneric() {
        if (!this.client) {
            return { success: false, error: 'Base URL required' };
        }

        const response = await this.client.chat.completions.create({
            model: this.config.model,
            messages: [{ role: 'user', content: 'Hello' }],
            max_tokens: 5
        });

        return { success: true, response: 'Connected to generic endpoint' };
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.initialize();
    }

    isReady() {
        switch (this.config.provider) {
            case 'openai':
                return !!this.client && !!this.config.apiKey;
            case 'ollama':
            case 'lmstudio':
                return !!this.config.baseUrl;
            case 'generic':
                return !!this.client && !!this.config.baseUrl;
            default:
                return false;
        }
    }
}

module.exports = AIService;

