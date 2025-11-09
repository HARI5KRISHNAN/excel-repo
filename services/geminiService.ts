
import { GoogleGenAI, Type } from "@google/genai";
import { CellData, SelectionArea } from "../types";

// Assume API_KEY is set in the environment
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set. Please provide it in your environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    data: {
      type: Type.ARRAY,
      description: "A 2D array of strings representing rows and columns for the spreadsheet.",
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
      },
    },
  },
  required: ['data'],
};

export async function generateData(
  prompt: string,
  contextData: CellData[][],
  selectionArea: SelectionArea
): Promise<{ data: string[][] } | null> {
  const model = "gemini-2.5-flash";
  const { start } = selectionArea;
  const selectedCellId = `${String.fromCharCode(65 + start.col)}${start.row + 1}`;
  
  const contextStrings = contextData.map(row => row.map(cell => cell.value));

  const fullPrompt = `
You are an AI assistant integrated into a spreadsheet application.
The user wants to generate data based on the following request.
The data will be inserted starting at cell ${selectedCellId}.
You can use the provided context data from the sheet to inform your response.

User Request: "${prompt}"

Context Data (a sample from the top-left of the sheet, in JSON format):
${JSON.stringify(contextStrings)}

Please provide the data to be inserted as a JSON object that strictly follows this schema: { "data": [["row1_col1", "row1_col2"], ["row2_col1", "row2_col2"]] }.
Do not include any explanations or markdown formatting. Only return the valid JSON object.
`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    
    const cleanedJsonText = jsonText.replace(/^```json\s*|```\s*$/g, '');

    const parsed = JSON.parse(cleanedJsonText);

    if (parsed && Array.isArray(parsed.data)) {
        return parsed as { data: string[][] };
    }
    
    return null;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate data from AI.");
  }
}
