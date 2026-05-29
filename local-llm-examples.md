# Local LLM Setup Examples

This guide provides specific examples for setting up local LLMs with AI Code Assistant.

## Ollama Setup Examples

### Code Llama (Recommended for coding)
```bash
# Install Code Llama 7B
ollama pull codellama:7b

# Or install Code Llama 13B (requires more RAM)
ollama pull codellama:13b
```

**Settings in AI Code Assistant:**
- Provider: Ollama (Local)
- URL: http://localhost:11434
- Model: codellama:7b

### Llama 2 (Good general purpose model)
```bash
# Install Llama 2 7B
ollama pull llama2:7b

# Or install Llama 2 13B
ollama pull llama2:13b
```

**Settings in AI Code Assistant:**
- Provider: Ollama (Local)
- URL: http://localhost:11434
- Model: llama2:7b

### DeepSeek Coder (Optimized for programming)
```bash
# Install DeepSeek Coder
ollama pull deepseek-coder:6.7b
```

**Settings in AI Code Assistant:**
- Provider: Ollama (Local)
- URL: http://localhost:11434
- Model: deepseek-coder:6.7b

## LM Studio Setup Examples

### Popular Models for Coding
1. **CodeLlama-7B-Instruct-GGUF**
   - Search for "CodeLlama" in LM Studio
   - Download the 7B or 13B version
   - Load and start the server

2. **Mistral-7B-Instruct**
   - Search for "Mistral" in LM Studio
   - Download the instruct version
   - Good balance of speed and capability

3. **DeepSeek-Coder-6.7B-Instruct**
   - Specialized for programming tasks
   - Available in various quantizations

**Settings in AI Code Assistant:**
- Provider: LM Studio (Local)
- URL: http://localhost:1234
- Model: [exact model name as shown in LM Studio]

## Performance Tips

### System Requirements by Model Size
- **7B models**: 8GB+ RAM, decent CPU
- **13B models**: 16GB+ RAM, good CPU/GPU
- **70B models**: 64GB+ RAM or good GPU

### Optimization Tips
1. **Use quantized models** (Q4_K_M, Q5_K_M) for better performance
2. **Close unnecessary applications** when running large models
3. **Use GPU acceleration** if available (check model compatibility)
4. **Start with smaller models** and upgrade as needed

## Model Recommendations by Use Case

### Best for Code Completion
- CodeLlama 7B/13B
- DeepSeek Coder 6.7B
- StarCoder 7B/15B

### Best for Code Explanation
- Llama 2 7B/13B
- Mistral 7B
- Code Llama Instruct

### Best for Bug Detection
- DeepSeek Coder
- CodeLlama Instruct
- Phind CodeLlama

### Best for Documentation
- Llama 2
- Mistral
- Zephyr 7B

## Troubleshooting

### Ollama Issues
- **Service not running**: Check if Ollama is started
- **Model not found**: Verify model name with `ollama list`
- **Connection refused**: Ensure Ollama is running on correct port

### LM Studio Issues
- **Server not started**: Start the local server in LM Studio
- **Model not loaded**: Load a model before starting server
- **Wrong port**: Check the port number in LM Studio settings

### Performance Issues
- **Slow responses**: Try smaller models or better hardware
- **Out of memory**: Reduce model size or close other applications
- **High CPU usage**: Consider GPU acceleration if available

## Example Configurations

### Development Environment
```json
{
  "provider": "ollama",
  "baseUrl": "http://localhost:11434",
  "model": "codellama:7b",
  "description": "Good balance of speed and accuracy for coding"
}
```

### Production Environment
```json
{
  "provider": "lmstudio",
  "baseUrl": "http://localhost:1234",
  "model": "deepseek-coder-6.7b-instruct",
  "description": "Optimized for professional development"
}
```

### Privacy-Focused Setup
```json
{
  "provider": "ollama",
  "baseUrl": "http://localhost:11434",
  "model": "llama2:13b",
  "description": "Completely local, no data leaves your machine"
}
```

