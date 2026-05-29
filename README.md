# AI Code Assistant 🤖

A powerful, cross-platform desktop application that integrates with Large Language Models (LLMs) to enhance your coding experience with AI-powered features.

![AI Code Assistant](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Electron](https://img.shields.io/badge/Built%20with-Electron-47848f)

## ✨ Features

### 🚀 Core Functionality
- **Advanced Code Editor**: Built with CodeMirror 6, supporting multiple programming languages
- **File Management**: Create, open, save, and manage code files
- **Syntax Highlighting**: Support for JavaScript, Python, HTML, CSS, and TypeScript
- **Cross-Platform**: Runs on Windows, macOS, and Linux

### 🤖 AI-Powered Features
- **Code Completion**: Intelligent code suggestions and auto-completion
- **Bug Detection**: Automated code analysis to identify potential issues
- **Documentation Generation**: Automatic generation of comprehensive code documentation
- **Code Explanation**: Detailed explanations of selected code snippets
- **Multiple LLM Provider Support**: 
  - ☁️ **OpenAI** (GPT-3.5, GPT-4) - Cloud-based AI with excellent performance
  - 🏠 **Ollama** - Run local models like Llama 2, Code Llama, Mistral, and more
  - 🖥️ **LM Studio** - Local inference with user-friendly model management
  - 🔗 **Generic OpenAI-Compatible** - Any OpenAI-compatible API endpoint
  - 🔒 **Privacy-First**: Keep your code completely private with local models

### 🎨 User Interface
- **Modern Dark Theme**: Eye-friendly interface optimized for coding
- **Multi-Panel Layout**: Organized workspace with editor, AI output, console, and problems panels
- **Keyboard Shortcuts**: Efficient workflow with customizable shortcuts
- **Real-time Status**: Live updates on file status, cursor position, and AI availability

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key (for AI features)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-code-assistant.git
   cd ai-code-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the application**
   ```bash
   npm start
   ```

### Development Mode
```bash
npm run dev
```

## 📦 Building for Distribution

### Build for all platforms
```bash
npm run build
```

### Platform-specific builds
```bash
# Windows
npm run build-win

# macOS
npm run build-mac

# Linux
npm run build-linux
```

## ⚙️ Configuration

### Setting up AI Features

#### Option 1: OpenAI (Cloud-based)
1. **Get an OpenAI API Key**
   - Visit [OpenAI Platform](https://platform.openai.com/)
   - Create an account and generate an API key
   - Note: API usage may incur costs based on OpenAI's pricing

2. **Configure the Application**
   - Open the application
   - Click the ⚙️ Settings button
   - Select "OpenAI (Cloud)" as provider
   - Enter your OpenAI API key
   - Select your preferred AI model (gpt-3.5-turbo, gpt-4, etc.)
   - Save the settings

#### Option 2: Ollama (Local)
1. **Install Ollama**
   - Download from [ollama.ai](https://ollama.ai/)
   - Install for your platform (Windows, macOS, Linux)

2. **Download a Model**
   ```bash
   ollama pull llama2
   # or
   ollama pull codellama
   # or
   ollama pull mistral
   ```

3. **Configure the Application**
   - Open AI Code Assistant settings
   - Select "Ollama (Local)" as provider
   - Verify the URL (default: http://localhost:11434)
   - Enter the model name (e.g., "llama2", "codellama")
   - Test connection and save

#### Option 3: LM Studio (Local)
1. **Install LM Studio**
   - Download from [lmstudio.ai](https://lmstudio.ai/)
   - Install and open the application

2. **Download and Load a Model**
   - Browse and download a model (e.g., Code Llama, Mistral)
   - Load the model in LM Studio
   - Start the local server (usually on port 1234)

3. **Configure the Application**
   - Open AI Code Assistant settings
   - Select "LM Studio (Local)" as provider
   - Verify the URL (default: http://localhost:1234)
   - Enter the model name as shown in LM Studio
   - Test connection and save

#### Option 4: Generic OpenAI-Compatible
For other local or cloud providers that support OpenAI-compatible APIs:
1. Set up your LLM service (e.g., Hugging Face Inference, LocalAI, etc.)
2. In settings, select "Generic OpenAI-Compatible"
3. Enter the base URL of your API endpoint
4. Add API key if required
5. Specify the model name
6. Test connection and save

### Supported Models by Provider

#### OpenAI
- **GPT-3.5 Turbo**: Fast and cost-effective for most coding tasks
- **GPT-4**: More advanced reasoning for complex code analysis
- **GPT-4 Turbo**: Latest model with improved performance

#### Local Models (Ollama/LM Studio)
- **Code Llama**: Specialized for code generation and understanding
- **Llama 2**: General-purpose model good for code explanation
- **Mistral**: Fast and efficient for various coding tasks
- **DeepSeek Coder**: Optimized for programming tasks
- **And many more**: Check Ollama library or LM Studio for available models

## 🎮 Usage

### Basic Operations

#### File Management
- **New File**: `Ctrl+N` (Windows/Linux) or `Cmd+N` (macOS)
- **Open File**: `Ctrl+O` (Windows/Linux) or `Cmd+O` (macOS)
- **Save File**: `Ctrl+S` (Windows/Linux) or `Cmd+S` (macOS)

#### AI Features
- **Code Completion**: `Ctrl+Space` (Windows/Linux) or `Cmd+Space` (macOS)
- **Bug Detection**: `Ctrl+B` (Windows/Linux) or `Cmd+B` (macOS)
- **Generate Documentation**: `Ctrl+D` (Windows/Linux) or `Cmd+D` (macOS)
- **Explain Code**: `Ctrl+E` (Windows/Linux) or `Cmd+E` (macOS)

### Workflow Examples

#### 1. Code Completion
1. Write partial code or position cursor where you need completion
2. Press `Ctrl+Space` or click "Code Completion" in the sidebar
3. Review the AI-generated suggestions in the output panel
4. Copy and implement the suggested code

#### 2. Bug Detection
1. Select the code you want to analyze (or analyze the entire file)
2. Press `Ctrl+B` or click "Bug Detection"
3. Review the analysis in the "AI Output" panel
4. Check the "Problems" panel for specific issues found
5. Address the identified problems in your code

#### 3. Documentation Generation
1. Select functions, classes, or code blocks
2. Press `Ctrl+D` or click "Generate Docs"
3. Review the generated documentation
4. Copy and add to your code comments or external documentation

#### 4. Code Explanation
1. Select the code you want explained
2. Press `Ctrl+E` or click "Explain Code"
3. Read the detailed explanation in the output panel
4. Use the insights to better understand the code logic

## 🏗️ Architecture

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Framework**: Electron for cross-platform desktop application
- **Editor**: CodeMirror 6 for advanced code editing
- **AI Integration**: OpenAI API for LLM features
- **Build Tool**: Electron Builder for packaging

### Project Structure
```
ai-code-assistant/
├── main.js                 # Main Electron process
├── package.json           # Project configuration
├── renderer/              # Renderer process files
│   ├── index.html        # Main UI layout
│   ├── styles.css        # Application styles
│   └── app.js            # Application logic
├── assets/               # Application assets
│   └── icon.png         # Application icon
└── README.md            # This file
```

### Key Components

#### Main Process (`main.js`)
- Window management
- Menu system
- File system operations
- IPC communication

#### Renderer Process (`renderer/app.js`)
- Code editor management
- AI feature implementation
- UI event handling
- Local storage management

## 🔐 Security & Privacy

### API Key Security
- API keys are stored locally in the application's localStorage
- Keys are never transmitted to any server except OpenAI's official API
- No telemetry or usage data is collected

### Code Privacy
- Your code is only sent to OpenAI when you explicitly use AI features
- No automatic code analysis or transmission
- All file operations are performed locally

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests if applicable**
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and conventions
- Add comments for complex logic
- Test on multiple platforms when possible
- Update documentation for new features

## 🐛 Troubleshooting

### Common Issues

#### Application won't start
- Ensure Node.js is installed and up to date
- Run `npm install` to ensure all dependencies are installed
- Check console for error messages

#### AI features not working
- Verify your OpenAI API key is correctly entered
- Check your internet connection
- Ensure you have sufficient API credits
- Check the console panel for error messages

#### File operations failing
- Check file permissions
- Ensure the file path is accessible
- Try running the application as administrator (Windows) if needed

### Getting Help
- Check the [Issues](https://github.com/yourusername/ai-code-assistant/issues) page
- Create a new issue with detailed description and error logs
- Join our community discussions

## 📋 Roadmap

### Completed Features
- [x] Integration with local LLMs (Ollama, LM Studio)
- [x] Multi-provider AI support (OpenAI, Ollama, LM Studio, Generic)
- [x] Connection testing for all providers
- [x] Privacy-focused local inference

### Planned Features
- [ ] Support for more programming languages
- [ ] Plugin system for extensibility
- [ ] Git integration
- [ ] Project-wide code analysis
- [ ] Custom AI model fine-tuning
- [ ] Collaborative coding features
- [ ] Cloud synchronization
- [ ] Model management interface
- [ ] Streaming responses for better UX

### Version History
- **v1.0.0** - Initial release with core AI features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Electron](https://www.electronjs.org/) for the cross-platform framework
- [CodeMirror](https://codemirror.net/) for the excellent code editor
- [OpenAI](https://openai.com/) for providing the AI capabilities
- The open-source community for inspiration and resources

## 📞 Support

If you find this project helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 🤝 Contributing to the codebase

---

**Made with ❤️ for developers who want to code smarter, not harder.**

