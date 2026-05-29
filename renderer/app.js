const { ipcRenderer } = require('electron');
const { EditorView, basicSetup } = require('codemirror');
const { EditorState } = require('@codemirror/state');
const { javascript } = require('@codemirror/lang-javascript');
const { python } = require('@codemirror/lang-python');
const { html } = require('@codemirror/lang-html');
const { css } = require('@codemirror/lang-css');
const { oneDark } = require('@codemirror/theme-one-dark');
const AIService = require('./ai-service');

class AICodeAssistant {
    constructor() {
        this.editor = null;
        this.currentFile = null;
        this.aiService = null;
        this.settings = {
            provider: 'openai',
            apiKey: '',
            baseUrl: '',
            model: 'gpt-3.5-turbo',
            theme: 'dark'
        };
        this.init();
    }

    init() {
        this.loadSettings();
        this.initializeEditor();
        this.setupEventListeners();
        this.setupIPCListeners();
        this.updateStatus('Ready');
    }

    loadSettings() {
        const saved = localStorage.getItem('aiCodeAssistantSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        this.initializeAI();
    }

    saveSettings() {
        localStorage.setItem('aiCodeAssistantSettings', JSON.stringify(this.settings));
        this.initializeAI();
    }

    initializeAI() {
        this.aiService = new AIService(this.settings);
        if (this.aiService.isReady()) {
            this.updateAIStatus('🤖 AI Ready');
        } else {
            const providerName = this.settings.provider.charAt(0).toUpperCase() + this.settings.provider.slice(1);
            this.updateAIStatus(`🤖 ${providerName} Configuration Required`);
        }
    }

    initializeEditor() {
        const extensions = [
            basicSetup,
            oneDark,
            javascript(),
            EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                    this.updateFileStatus('Modified');
                    this.updateCharacterCount();
                }
                if (update.selectionSet) {
                    this.updateCursorPosition();
                }
            })
        ];

        this.editor = new EditorView({
            state: EditorState.create({
                doc: '// Welcome to AI Code Assistant!\n// Start typing your code here...\n\nfunction greet(name) {\n    return `Hello, ${name}!`;\n}\n\nconsole.log(greet("World"));',
                extensions
            }),
            parent: document.getElementById('editor')
        });

        this.updateCharacterCount();
    }

    setupEventListeners() {
        // File operations
        document.getElementById('newFileBtn').addEventListener('click', () => this.newFile());
        document.getElementById('openFileBtn').addEventListener('click', () => this.openFile());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveFile());

        // AI features
        document.getElementById('codeCompletionBtn').addEventListener('click', () => this.codeCompletion());
        document.getElementById('bugDetectionBtn').addEventListener('click', () => this.bugDetection());
        document.getElementById('generateDocsBtn').addEventListener('click', () => this.generateDocumentation());
        document.getElementById('explainCodeBtn').addEventListener('click', () => this.explainCode());

        // Settings
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettingsModal());
        document.getElementById('cancelSettings').addEventListener('click', () => this.closeSettings());
        document.querySelector('.modal-close').addEventListener('click', () => this.closeSettings());

        // Panel tabs
        document.querySelectorAll('.panel-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchPanel(e.target.dataset.panel));
        });

        // Clear buttons
        document.getElementById('clearAiOutput').addEventListener('click', () => this.clearOutput('aiOutputContent'));
        document.getElementById('clearConsole').addEventListener('click', () => this.clearOutput('consoleContent'));
        document.getElementById('clearProblems').addEventListener('click', () => this.clearOutput('problemsContent'));

        // Language selection
        document.getElementById('languageSelect').addEventListener('change', (e) => this.changeLanguage(e.target.value));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    setupIPCListeners() {
        // Menu actions from main process
        ipcRenderer.on('menu-new-file', () => this.newFile());
        ipcRenderer.on('menu-save-file', () => this.saveFile());
        ipcRenderer.on('file-opened', (event, data) => this.loadFileContent(data));
        ipcRenderer.on('ai-code-completion', () => this.codeCompletion());
        ipcRenderer.on('ai-bug-detection', () => this.bugDetection());
        ipcRenderer.on('ai-generate-docs', () => this.generateDocumentation());
        ipcRenderer.on('ai-explain-code', () => this.explainCode());
    }

    // File Operations
    newFile() {
        this.currentFile = null;
        this.editor.dispatch({
            changes: { from: 0, to: this.editor.state.doc.length, insert: '' }
        });
        this.updateTabName('untitled.js');
        this.updateFileStatus('New File');
    }

    async openFile() {
        // This will be handled by the main process through IPC
        // Just trigger the main process to show open dialog
    }

    loadFileContent(data) {
        this.currentFile = data.path;
        this.editor.dispatch({
            changes: { from: 0, to: this.editor.state.doc.length, insert: data.content }
        });
        
        const fileName = data.path.split(/[\\/]/).pop();
        this.updateTabName(fileName);
        this.updateFileStatus('Opened');
        this.detectLanguageFromFile(fileName);
    }

    async saveFile() {
        const content = this.editor.state.doc.toString();
        const result = await ipcRenderer.invoke('save-file', {
            filePath: this.currentFile,
            content: content
        });

        if (result.success) {
            this.currentFile = result.path;
            const fileName = result.path.split(/[\\/]/).pop();
            this.updateTabName(fileName);
            this.updateFileStatus('Saved');
            this.addToConsole(`File saved: ${fileName}`);
        } else {
            this.addToConsole(`Error saving file: ${result.error || 'Unknown error'}`);
        }
    }

    // AI Features
    async codeCompletion() {
        if (!this.aiService || !this.aiService.isReady()) {
            const providerName = this.settings.provider.charAt(0).toUpperCase() + this.settings.provider.slice(1);
            this.showAIError(`Please configure your ${providerName} settings.`);
            return;
        }

        const selectedText = this.getSelectedText();
        const contextCode = this.getContextCode();
        
        if (!selectedText && !contextCode) {
            this.showAIError('Please select some code or position cursor in code for completion.');
            return;
        }

        this.showLoading('Generating code completion...');
        
        try {
            const prompt = `Complete the following code:\n\n${selectedText || contextCode}\n\nProvide only the completion without explanation:`;
            
            const completion = await this.aiService.generateCompletion(prompt, {
                maxTokens: 500,
                temperature: 0.2,
                systemPrompt: 'You are a helpful coding assistant. Provide clean, efficient code completions.'
            });

            this.showAIResponse('Code Completion', completion, 'completion');
            
        } catch (error) {
            this.showAIError(`Error generating completion: ${error.message}`);
        }
    }

    async bugDetection() {
        if (!this.aiService || !this.aiService.isReady()) {
            const providerName = this.settings.provider.charAt(0).toUpperCase() + this.settings.provider.slice(1);
            this.showAIError(`Please configure your ${providerName} settings.`);
            return;
        }

        const code = this.getSelectedText() || this.editor.state.doc.toString();
        
        if (!code.trim()) {
            this.showAIError('No code to analyze. Please write some code first.');
            return;
        }

        this.showLoading('Analyzing code for bugs...');
        
        try {
            const prompt = `Analyze the following code for potential bugs, issues, and improvements:\n\n${code}\n\nProvide a detailed analysis including:\n1. Potential bugs\n2. Code quality issues\n3. Performance improvements\n4. Best practice suggestions`;
            
            const analysis = await this.aiService.generateCompletion(prompt, {
                maxTokens: 1000,
                temperature: 0.1,
                systemPrompt: 'You are an expert code reviewer. Analyze code for bugs, performance issues, and improvements.'
            });

            this.showAIResponse('Bug Analysis', analysis, 'bug-detection');
            this.parseProblems(analysis);
            
        } catch (error) {
            this.showAIError(`Error analyzing code: ${error.message}`);
        }
    }

    async generateDocumentation() {
        if (!this.aiService || !this.aiService.isReady()) {
            const providerName = this.settings.provider.charAt(0).toUpperCase() + this.settings.provider.slice(1);
            this.showAIError(`Please configure your ${providerName} settings.`);
            return;
        }

        const code = this.getSelectedText() || this.editor.state.doc.toString();
        
        if (!code.trim()) {
            this.showAIError('No code to document. Please write some code first.');
            return;
        }

        this.showLoading('Generating documentation...');
        
        try {
            const prompt = `Generate comprehensive documentation for the following code:\n\n${code}\n\nInclude:\n1. Function/class descriptions\n2. Parameter explanations\n3. Return value descriptions\n4. Usage examples\n5. JSDoc/docstring format where appropriate`;
            
            const documentation = await this.aiService.generateCompletion(prompt, {
                maxTokens: 1200,
                temperature: 0.3,
                systemPrompt: 'You are a documentation expert. Generate clear, comprehensive documentation for code.'
            });

            this.showAIResponse('Generated Documentation', documentation, 'documentation');
            
        } catch (error) {
            this.showAIError(`Error generating documentation: ${error.message}`);
        }
    }

    async explainCode() {
        if (!this.aiService || !this.aiService.isReady()) {
            const providerName = this.settings.provider.charAt(0).toUpperCase() + this.settings.provider.slice(1);
            this.showAIError(`Please configure your ${providerName} settings.`);
            return;
        }

        const code = this.getSelectedText();
        
        if (!code) {
            this.showAIError('Please select the code you want explained.');
            return;
        }

        this.showLoading('Explaining code...');
        
        try {
            const prompt = `Explain the following code in detail:\n\n${code}\n\nProvide:\n1. What the code does\n2. How it works step by step\n3. Key concepts or patterns used\n4. Potential use cases`;
            
            const explanation = await this.aiService.generateCompletion(prompt, {
                maxTokens: 800,
                temperature: 0.4,
                systemPrompt: 'You are a patient coding teacher. Explain code clearly and comprehensively.'
            });

            this.showAIResponse('Code Explanation', explanation, 'explanation');
            
        } catch (error) {
            this.showAIError(`Error explaining code: ${error.message}`);
        }
    }

    // Helper Methods
    getSelectedText() {
        const selection = this.editor.state.selection.main;
        if (selection.empty) return '';
        return this.editor.state.doc.sliceString(selection.from, selection.to);
    }

    getContextCode() {
        // Get a few lines around the cursor for context
        const pos = this.editor.state.selection.main.head;
        const line = this.editor.state.doc.lineAt(pos);
        const fromLine = Math.max(1, line.number - 2);
        const toLine = Math.min(this.editor.state.doc.lines, line.number + 2);
        
        const from = this.editor.state.doc.line(fromLine).from;
        const to = this.editor.state.doc.line(toLine).to;
        
        return this.editor.state.doc.sliceString(from, to);
    }

    showLoading(message) {
        this.switchPanel('ai-output');
        const content = document.getElementById('aiOutputContent');
        content.innerHTML = `
            <div class="ai-response">
                <div class="ai-response-header">
                    <span>🤖 AI Processing</span>
                    <span class="loading"></span>
                </div>
                <div class="ai-response-content">${message}</div>
            </div>
        `;
    }

    showAIResponse(title, content, type) {
        this.switchPanel('ai-output');
        const container = document.getElementById('aiOutputContent');
        const timestamp = new Date().toLocaleTimeString();
        
        // Format code blocks
        const formattedContent = content.replace(/```([\s\S]*?)```/g, '<div class="code-block">$1</div>');
        
        const responseHtml = `
            <div class="ai-response">
                <div class="ai-response-header">
                    <span>🤖 ${title}</span>
                    <span>${timestamp}</span>
                </div>
                <div class="ai-response-content">${formattedContent}</div>
            </div>
        `;
        
        if (container.innerHTML.includes('welcome-message')) {
            container.innerHTML = responseHtml;
        } else {
            container.innerHTML += responseHtml;
        }
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    showAIError(message) {
        this.switchPanel('ai-output');
        const content = document.getElementById('aiOutputContent');
        const timestamp = new Date().toLocaleTimeString();
        
        const errorHtml = `
            <div class="ai-response">
                <div class="ai-response-header">
                    <span>❌ Error</span>
                    <span>${timestamp}</span>
                </div>
                <div class="ai-response-content" style="color: #f14c4c;">${message}</div>
            </div>
        `;
        
        if (content.innerHTML.includes('welcome-message')) {
            content.innerHTML = errorHtml;
        } else {
            content.innerHTML += errorHtml;
        }
        
        content.scrollTop = content.scrollHeight;
    }

    parseProblems(analysis) {
        const problemsContent = document.getElementById('problemsContent');
        
        // Simple parsing of problems - in a real app, you'd want more sophisticated parsing
        const lines = analysis.split('\n');
        let problems = [];
        
        lines.forEach(line => {
            if (line.includes('bug') || line.includes('error') || line.includes('issue') || line.includes('problem')) {
                problems.push({
                    severity: 'error',
                    message: line.trim()
                });
            } else if (line.includes('warning') || line.includes('improve') || line.includes('consider')) {
                problems.push({
                    severity: 'warning',
                    message: line.trim()
                });
            }
        });
        
        if (problems.length > 0) {
            problemsContent.innerHTML = problems.map(problem => `
                <div class="problem-item">
                    <div class="problem-severity">${problem.severity}</div>
                    <div class="problem-message">${problem.message}</div>
                </div>
            `).join('');
        }
    }

    // UI Methods
    switchPanel(panelId) {
        // Update tabs
        document.querySelectorAll('.panel-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.panel === panelId) {
                tab.classList.add('active');
            }
        });
        
        // Update panels
        document.querySelectorAll('.panel-content').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(panelId).classList.add('active');
    }

    clearOutput(contentId) {
        const content = document.getElementById(contentId);
        if (contentId === 'aiOutputContent') {
            content.innerHTML = `
                <div class="welcome-message">
                    <p>Welcome to AI Code Assistant! 🚀</p>
                    <p>Select some code and use the AI features to get started.</p>
                </div>
            `;
        } else {
            content.innerHTML = '';
        }
    }

    addToConsole(message) {
        const console = document.getElementById('consoleContent');
        const timestamp = new Date().toLocaleTimeString();
        console.innerHTML += `<div>[${timestamp}] ${message}</div>`;
        console.scrollTop = console.scrollHeight;
    }

    updateTabName(name) {
        document.querySelector('.tab-name').textContent = name;
    }

    updateFileStatus(status) {
        document.getElementById('fileStatus').textContent = status;
    }

    updateStatus(status) {
        document.getElementById('fileStatus').textContent = status;
    }

    updateAIStatus(status) {
        document.getElementById('aiStatus').textContent = status;
    }

    updateCursorPosition() {
        const selection = this.editor.state.selection.main;
        const pos = this.editor.state.doc.lineAt(selection.head);
        document.getElementById('cursorPosition').textContent = `Ln ${pos.number}, Col ${selection.head - pos.from + 1}`;
    }

    updateCharacterCount() {
        const length = this.editor.state.doc.length;
        document.getElementById('fileSize').textContent = `${length} chars`;
    }

    detectLanguageFromFile(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const langMap = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'javascript',
            'tsx': 'javascript',
            'py': 'python',
            'html': 'html',
            'htm': 'html',
            'css': 'css',
            'scss': 'css',
            'sass': 'css'
        };
        
        const language = langMap[ext] || 'javascript';
        document.getElementById('languageSelect').value = language;
        this.changeLanguage(language);
    }

    changeLanguage(language) {
        // Update editor language support
        const langExtensions = {
            'javascript': javascript(),
            'python': python(),
            'html': html(),
            'css': css()
        };
        
        const extension = langExtensions[language] || javascript();
        
        // This is a simplified language change - in a real implementation,
        // you'd want to properly reconfigure the editor
        this.addToConsole(`Language changed to: ${language}`);
    }

    // Settings
    openSettings() {
        const modal = document.getElementById('settingsModal');
        
        // Populate current settings
        document.getElementById('providerSelect').value = this.settings.provider;
        document.getElementById('apiKeyInput').value = this.settings.apiKey;
        document.getElementById('ollamaUrlInput').value = this.settings.baseUrl || 'http://localhost:11434';
        document.getElementById('lmstudioUrlInput').value = this.settings.baseUrl || 'http://localhost:1234';
        document.getElementById('genericUrlInput').value = this.settings.baseUrl || '';
        document.getElementById('genericKeyInput').value = this.settings.apiKey || '';
        document.getElementById('modelInput').value = this.settings.model;
        document.getElementById('themeSelect').value = this.settings.theme;
        
        // Set up provider selection event listener
        const providerSelect = document.getElementById('providerSelect');
        providerSelect.addEventListener('change', this.handleProviderChange.bind(this));
        
        // Set up test connection button
        const testBtn = document.getElementById('testConnectionBtn');
        testBtn.addEventListener('click', this.testConnection.bind(this));
        
        // Show appropriate provider settings
        this.handleProviderChange();
        
        modal.classList.add('show');
    }

    closeSettings() {
        document.getElementById('settingsModal').classList.remove('show');
    }

    saveSettingsModal() {
        const provider = document.getElementById('providerSelect').value;
        this.settings.provider = provider;
        this.settings.model = document.getElementById('modelInput').value;
        this.settings.theme = document.getElementById('themeSelect').value;
        
        // Set provider-specific settings
        switch (provider) {
            case 'openai':
                this.settings.apiKey = document.getElementById('apiKeyInput').value;
                this.settings.baseUrl = '';
                break;
            case 'ollama':
                this.settings.baseUrl = document.getElementById('ollamaUrlInput').value;
                this.settings.apiKey = '';
                break;
            case 'lmstudio':
                this.settings.baseUrl = document.getElementById('lmstudioUrlInput').value;
                this.settings.apiKey = '';
                break;
            case 'generic':
                this.settings.baseUrl = document.getElementById('genericUrlInput').value;
                this.settings.apiKey = document.getElementById('genericKeyInput').value;
                break;
        }
        
        this.saveSettings();
        this.closeSettings();
        this.addToConsole('Settings saved successfully!');
    }
    
    handleProviderChange() {
        const provider = document.getElementById('providerSelect').value;
        
        // Hide all provider settings
        document.querySelectorAll('.provider-settings').forEach(el => {
            el.style.display = 'none';
        });
        
        // Show selected provider settings
        const settingsMap = {
            'openai': 'openaiSettings',
            'ollama': 'ollamaSettings',
            'lmstudio': 'lmstudioSettings',
            'generic': 'genericSettings'
        };
        
        const settingsId = settingsMap[provider];
        if (settingsId) {
            document.getElementById(settingsId).style.display = 'block';
        }
        
        // Update model placeholder based on provider
        const modelInput = document.getElementById('modelInput');
        const modelPlaceholders = {
            'openai': 'gpt-3.5-turbo',
            'ollama': 'llama2',
            'lmstudio': 'local-model',
            'generic': 'model-name'
        };
        
        modelInput.placeholder = modelPlaceholders[provider] || 'gpt-3.5-turbo';
    }
    
    async testConnection() {
        const statusDiv = document.getElementById('connectionStatus');
        const testBtn = document.getElementById('testConnectionBtn');
        
        statusDiv.innerHTML = '<span style="color: #ffa500;">🔄 Testing connection...</span>';
        testBtn.disabled = true;
        
        try {
            // Create temporary AI service with current form values
            const provider = document.getElementById('providerSelect').value;
            const tempConfig = {
                provider: provider,
                model: document.getElementById('modelInput').value
            };
            
            switch (provider) {
                case 'openai':
                    tempConfig.apiKey = document.getElementById('apiKeyInput').value;
                    break;
                case 'ollama':
                    tempConfig.baseUrl = document.getElementById('ollamaUrlInput').value;
                    break;
                case 'lmstudio':
                    tempConfig.baseUrl = document.getElementById('lmstudioUrlInput').value;
                    break;
                case 'generic':
                    tempConfig.baseUrl = document.getElementById('genericUrlInput').value;
                    tempConfig.apiKey = document.getElementById('genericKeyInput').value;
                    break;
            }
            
            const tempService = new (require('./ai-service'))(tempConfig);
            const result = await tempService.testConnection();
            
            if (result.success) {
                statusDiv.innerHTML = `<span style="color: #4caf50;">✅ ${result.response}</span>`;
            } else {
                statusDiv.innerHTML = `<span style="color: #f44336;">❌ ${result.error}</span>`;
            }
        } catch (error) {
            statusDiv.innerHTML = `<span style="color: #f44336;">❌ Connection failed: ${error.message}</span>`;
        } finally {
            testBtn.disabled = false;
        }
    }

    handleKeyboard(e) {
        // Handle keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'n':
                    e.preventDefault();
                    this.newFile();
                    break;
                case 's':
                    e.preventDefault();
                    this.saveFile();
                    break;
                case ' ':
                    e.preventDefault();
                    this.codeCompletion();
                    break;
                case 'b':
                    e.preventDefault();
                    this.bugDetection();
                    break;
                case 'd':
                    e.preventDefault();
                    this.generateDocumentation();
                    break;
                case 'e':
                    e.preventDefault();
                    this.explainCode();
                    break;
            }
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AICodeAssistant();
});

