# Ollama AI Integration Setup

This spreadsheet application supports local AI generation using **Ollama**, an offline AI model runner. This provides privacy and doesn't require internet connectivity or API keys.

## What is Ollama?

Ollama allows you to run large language models locally on your machine. The spreadsheet will automatically detect and use Ollama if available, otherwise it falls back to pattern-based generation.

## Installation

### 1. Install Ollama

Visit [https://ollama.ai](https://ollama.ai) and download the installer for your operating system:

- **macOS**: Download the `.dmg` file
- **Linux**: Run `curl -fsSL https://ollama.ai/install.sh | sh`
- **Windows**: Download the installer from the website

### 2. Pull a Model

After installing Ollama, open a terminal and pull a model:

```bash
# Recommended: Llama 3.2 (smaller, faster)
ollama pull llama3.2

# Alternative models:
ollama pull mistral        # Good balance of speed and quality
ollama pull codellama      # Better for technical/structured data
ollama pull llama2         # Older but reliable
```

### 3. Verify Installation

Check that Ollama is running:

```bash
ollama list
```

You should see the models you've pulled listed.

### 4. Start Ollama Server (if not running)

Ollama usually starts automatically, but if needed:

```bash
ollama serve
```

The server runs on `http://localhost:11434` by default.

## Using AI in the Spreadsheet

### Features

1. **Ollama Status Indicator**: Click the info button (ℹ️) in the AI Panel to see connection status
2. **Smart Context Reading**: AI reads nearby cells to understand your data structure
3. **Multi-row/column Output**: AI can generate tables with multiple rows and columns
4. **Pattern Recognition**: Even without Ollama, the app recognizes common patterns

### Example Prompts

Try these prompts to see the AI in action:

- "Create a monthly budget for a student"
- "Generate a sales report with Product, Units Sold, and Revenue"
- "Make an attendance sheet for 5 employees"
- "Create an inventory list with Item, SKU, Quantity, and Price"
- "Generate project tasks with Name, Assignee, Status, and Due Date"

### Tips for Best Results

1. **Be Specific**: Include column names and data types
   - ✅ "Create a table with Name, Age, Email, and Phone columns"
   - ❌ "Make a table"

2. **Mention Row Count**: Tell AI how much data you need
   - ✅ "Generate 10 sample employees"
   - ❌ "Generate employees"

3. **Use Keywords**: Certain keywords trigger better patterns
   - budget, sales, attendance, inventory, employees, tasks

4. **Leverage Context**: If you have headers, AI will follow that structure
   - Place selection below headers for AI to continue the pattern

## Fallback Mode

If Ollama is not available, the app uses **pattern-based generation**:

- Recognizes common templates (budgets, sales, attendance, etc.)
- Generates realistic sample data
- No AI required, works offline

The AI Panel shows which mode is active (Ollama or Fallback).

## Configuration

### Custom Ollama URL

If Ollama runs on a different port or host, set the environment variable:

```bash
export OLLAMA_URL="http://localhost:11434"
```

### Choosing a Different Model

Edit `/home/user/excel-repo/services/ollamaService.ts`:

```typescript
const DEFAULT_MODEL = "llama3.2"; // Change to your preferred model
```

## Troubleshooting

### Ollama Not Detected

1. Check if Ollama is running: `ollama list`
2. Verify the server is accessible: `curl http://localhost:11434/api/tags`
3. Check firewall settings

### Slow Generation

1. Use a smaller model (llama3.2 is recommended)
2. Reduce the amount of data requested
3. Check system resources (RAM, CPU)

### Poor Quality Results

1. Try a larger model (mistral or llama2)
2. Be more specific in your prompts
3. Provide example data in nearby cells for context

## Privacy & Security

- **All processing happens locally** - no data sent to external servers
- Ollama models run entirely on your machine
- No internet connection required (after initial model download)
- No API keys or accounts needed

## Model Recommendations

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| llama3.2 | ~2GB | ⚡⚡⚡ | ⭐⭐⭐ | General use |
| mistral | ~4GB | ⚡⚡ | ⭐⭐⭐⭐ | Better quality |
| codellama | ~4GB | ⚡⚡ | ⭐⭐⭐⭐ | Technical data |
| llama2 | ~4GB | ⚡⚡ | ⭐⭐⭐ | Balanced |

## Support

For Ollama issues, see [Ollama Documentation](https://github.com/ollama/ollama)

For application issues, check the browser console for error messages.
