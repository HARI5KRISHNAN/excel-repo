
import React, { useState, useEffect } from 'react';
import { SparklesIcon } from './Icons';
import { getOllamaStatus } from '../services/ollamaService';

interface AIPanelProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  error: string | null;
}

export const AIPanel: React.FC<AIPanelProps> = ({ onGenerate, isLoading, error }) => {
  const [prompt, setPrompt] = useState('');
  const [ollamaStatus, setOllamaStatus] = useState<{
    available: boolean;
    url: string;
    models: string[];
  } | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    // Check Ollama status on mount
    getOllamaStatus().then(setOllamaStatus);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt);
      // Don't clear prompt so user can modify and retry if needed
    }
  };

  const examplePrompts = [
    {
      title: "Monthly Budget",
      prompt: "Create a monthly budget for a student with categories like rent, groceries, utilities, transportation, and entertainment"
    },
    {
      title: "Attendance Sheet",
      prompt: "Generate an attendance sheet with 5 employees and days of the week"
    },
    {
      title: "Sales Report",
      prompt: "Create a Q1 sales report with columns for Product, Units Sold, Unit Price, and Total Revenue"
    },
    {
      title: "Employee Directory",
      prompt: "Generate an employee directory with ID, Name, Department, and Position"
    },
    {
      title: "Inventory List",
      prompt: "Create an inventory list with Item Name, SKU, Quantity, Unit Price, and Total Value"
    },
    {
      title: "Project Tasks",
      prompt: "Generate a project task list with Task Name, Assignee, Priority, Status, and Due Date"
    }
  ];

  return (
    <aside className="w-80 bg-white border-l border-gray-200 p-4 flex flex-col shadow-lg overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="w-6 h-6 text-blue-500" />
          <h2 className="text-lg font-bold text-gray-800">AI Assistant</h2>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-gray-500 hover:text-gray-700 text-xs"
          title="Toggle info"
        >
          ℹ️
        </button>
      </div>

      {/* Ollama Status */}
      {showInfo && ollamaStatus && (
        <div className={`mb-4 p-2 rounded-md text-xs ${
          ollamaStatus.available ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-center space-x-1 mb-1">
            <span className={`w-2 h-2 rounded-full ${ollamaStatus.available ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
            <span className="font-semibold">
              {ollamaStatus.available ? 'Ollama Connected' : 'Using Fallback Mode'}
            </span>
          </div>
          {ollamaStatus.available ? (
            <div className="text-gray-600">
              <div>URL: {ollamaStatus.url}</div>
              {ollamaStatus.models.length > 0 && (
                <div>Models: {ollamaStatus.models.join(', ')}</div>
              )}
            </div>
          ) : (
            <div className="text-gray-600">
              Ollama not available. Using pattern-based generation.
              <a
                href="https://ollama.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                Install Ollama
              </a>
            </div>
          )}
        </div>
      )}

      <p className="text-sm text-gray-600 mb-4">
        Describe what you want to generate. The AI will consider surrounding data and insert results at your selection.
      </p>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="flex-shrink-0 mb-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'Create a sales report for Q1 with Product, Units Sold, and Revenue columns'"
          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none"
          rows={5}
        />
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-xs">{error}</p>
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="mt-3 w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="w-4 h-4 mr-2" />
              Generate Data
            </>
          )}
        </button>
      </form>

      {/* Example Prompts */}
      <div className="flex-grow border-t pt-4 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Example Prompts</h3>
        <div className="space-y-2">
          {examplePrompts.map((example, i) => (
            <button
              key={i}
              onClick={() => setPrompt(example.prompt)}
              disabled={isLoading}
              className="w-full text-left p-2 rounded-md bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="font-semibold text-xs text-gray-800 mb-1">{example.title}</div>
              <div className="text-xs text-gray-600 line-clamp-2">{example.prompt}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 pt-4 border-t">
        <details className="text-xs text-gray-600">
          <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
            💡 Tips for better results
          </summary>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Be specific about columns and data types</li>
            <li>Mention how many rows you need</li>
            <li>Reference existing data for context</li>
            <li>Use keywords like "budget", "sales", "attendance"</li>
          </ul>
        </details>
      </div>
    </aside>
  );
};
