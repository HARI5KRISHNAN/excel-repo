import { CellData, SelectionArea } from "../types";

// Ollama API configuration
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const DEFAULT_MODEL = "llama3.2"; // or "mistral", "codellama", etc.

interface OllamaResponse {
  response: string;
  done: boolean;
}

interface GenerateDataResult {
  data: string[][];
  source: 'ollama' | 'fallback';
}

/**
 * Check if Ollama is available by pinging the API
 */
async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });
    return response.ok;
  } catch (error) {
    console.warn('Ollama is not available:', error);
    return false;
  }
}

/**
 * Parse AI response to extract structured data
 */
function parseAIResponse(text: string): string[][] | null {
  try {
    // Try to find JSON in the response
    const jsonMatch = text.match(/\{[\s\S]*"data"[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed && Array.isArray(parsed.data)) {
        return parsed.data;
      }
    }

    // Try to parse as direct array
    const arrayMatch = text.match(/\[\[[\s\S]*\]\]/);
    if (arrayMatch) {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    // Try to parse markdown table
    const lines = text.split('\n').filter(line => line.trim());
    const tableData: string[][] = [];

    for (const line of lines) {
      if (line.includes('|') && !line.match(/^[-| ]+$/)) {
        const cells = line
          .split('|')
          .map(cell => cell.trim())
          .filter(cell => cell);
        if (cells.length > 0) {
          tableData.push(cells);
        }
      }
    }

    if (tableData.length > 0) {
      return tableData;
    }

    return null;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return null;
  }
}

/**
 * Enhanced prompt builder that understands context better
 */
function buildEnhancedPrompt(
  userPrompt: string,
  contextData: CellData[][],
  selectionArea: SelectionArea
): string {
  const { start } = selectionArea;
  const selectedCellId = `${String.fromCharCode(65 + start.col)}${start.row + 1}`;

  // Analyze context to provide better instructions
  const contextStrings = contextData.map(row => row.map(cell => cell.value));
  const hasHeaders = contextData[0]?.some(cell => cell.value && isNaN(Number(cell.value)));
  const hasData = contextData.slice(1).some(row => row.some(cell => cell.value));

  let contextDescription = '';
  if (hasHeaders && hasData) {
    contextDescription = 'The sheet already has headers and some data. Consider this structure when generating new content.';
  } else if (hasHeaders) {
    contextDescription = 'The sheet has headers but no data yet.';
  } else if (hasData) {
    contextDescription = 'The sheet has data but no clear headers.';
  } else {
    contextDescription = 'The sheet is mostly empty.';
  }

  return `You are an AI assistant for a spreadsheet application. Generate data based on this request.

User Request: "${userPrompt}"

Context:
- Data will be inserted starting at cell ${selectedCellId}
- ${contextDescription}
- Current sheet data (top-left sample):
${JSON.stringify(contextStrings, null, 2)}

Instructions:
1. Understand the user's intent and generate appropriate data
2. If creating a table, include headers in the first row
3. Generate realistic, varied data (not just placeholders)
4. Return ONLY a JSON object in this exact format: {"data": [["row1_col1", "row1_col2"], ["row2_col1", "row2_col2"]]}
5. Do not include any explanations, markdown formatting, or extra text
6. Ensure all values are strings

Generate the data now:`;
}

/**
 * Generate data using Ollama local model
 */
async function generateWithOllama(
  prompt: string,
  contextData: CellData[][],
  selectionArea: SelectionArea
): Promise<string[][] | null> {
  try {
    const enhancedPrompt = buildEnhancedPrompt(prompt, contextData, selectionArea);

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        prompt: enhancedPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data: OllamaResponse = await response.json();
    return parseAIResponse(data.response);
  } catch (error) {
    console.error('Error generating with Ollama:', error);
    return null;
  }
}

/**
 * Fallback: Generate simple data based on prompt patterns
 */
function generateFallbackData(prompt: string): string[][] {
  const lowerPrompt = prompt.toLowerCase();

  // Budget template
  if (lowerPrompt.includes('budget')) {
    return [
      ['Category', 'Amount', 'Notes'],
      ['Rent', '1200', 'Monthly rent'],
      ['Groceries', '400', 'Food and supplies'],
      ['Utilities', '150', 'Electric, water, internet'],
      ['Transportation', '200', 'Gas and car maintenance'],
      ['Entertainment', '100', 'Movies, dining out'],
      ['Savings', '300', 'Emergency fund'],
      ['Total', '2350', 'Monthly total'],
    ];
  }

  // Attendance sheet
  if (lowerPrompt.includes('attendance')) {
    return [
      ['Name', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      ['John Doe', 'Present', 'Present', 'Absent', 'Present', 'Present'],
      ['Jane Smith', 'Present', 'Present', 'Present', 'Present', 'Absent'],
      ['Bob Johnson', 'Absent', 'Present', 'Present', 'Present', 'Present'],
      ['Alice Brown', 'Present', 'Present', 'Present', 'Absent', 'Present'],
    ];
  }

  // Sales report
  if (lowerPrompt.includes('sales') || lowerPrompt.includes('revenue')) {
    return [
      ['Product', 'Units Sold', 'Unit Price', 'Total Revenue'],
      ['Laptop', '45', '999', '44955'],
      ['Mouse', '120', '25', '3000'],
      ['Keyboard', '89', '75', '6675'],
      ['Monitor', '67', '299', '20033'],
      ['Headphones', '156', '49', '7644'],
    ];
  }

  // Employee list
  if (lowerPrompt.includes('employee') || lowerPrompt.includes('staff')) {
    return [
      ['Employee ID', 'Name', 'Department', 'Position'],
      ['E001', 'John Smith', 'Engineering', 'Senior Developer'],
      ['E002', 'Sarah Johnson', 'Marketing', 'Marketing Manager'],
      ['E003', 'Michael Brown', 'Sales', 'Sales Representative'],
      ['E004', 'Emily Davis', 'HR', 'HR Specialist'],
      ['E005', 'David Wilson', 'Engineering', 'Junior Developer'],
    ];
  }

  // Default: Generic table
  return [
    ['Column 1', 'Column 2', 'Column 3'],
    ['Data 1', 'Data 2', 'Data 3'],
    ['Data 4', 'Data 5', 'Data 6'],
  ];
}

/**
 * Main function to generate data with Ollama (primary) and fallback support
 */
export async function generateData(
  prompt: string,
  contextData: CellData[][],
  selectionArea: SelectionArea
): Promise<GenerateDataResult | null> {
  try {
    // Try Ollama first
    const ollamaAvailable = await isOllamaAvailable();

    if (ollamaAvailable) {
      console.log('Using Ollama for AI generation...');
      const data = await generateWithOllama(prompt, contextData, selectionArea);

      if (data && data.length > 0) {
        return { data, source: 'ollama' };
      }
    }

    // Fallback to pattern-based generation
    console.log('Using fallback generation...');
    const fallbackData = generateFallbackData(prompt);
    return { data: fallbackData, source: 'fallback' };

  } catch (error) {
    console.error("Error in generateData:", error);

    // Last resort fallback
    const fallbackData = generateFallbackData(prompt);
    return { data: fallbackData, source: 'fallback' };
  }
}

/**
 * Check available models in Ollama
 */
export async function getAvailableModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    if (response.ok) {
      const data = await response.json();
      return data.models?.map((m: any) => m.name) || [];
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Check Ollama status
 */
export async function getOllamaStatus(): Promise<{
  available: boolean;
  url: string;
  models: string[];
}> {
  const available = await isOllamaAvailable();
  const models = available ? await getAvailableModels() : [];

  return {
    available,
    url: OLLAMA_URL,
    models,
  };
}
