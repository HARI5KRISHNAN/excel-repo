
import React, { useState } from 'react';
import { SparklesIcon } from './Icons';

interface AIPanelProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  error: string | null;
}

export const AIPanel: React.FC<AIPanelProps> = ({ onGenerate, isLoading, error }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt);
    }
  };
  
  const suggestions = [
    "Fill with names of the 10 largest cities in the world and their populations.",
    "Create a monthly budget for a student.",
    "List the first 15 Fibonacci numbers in column A.",
  ];

  return (
    <aside className="w-80 bg-white border-l border-gray-200 p-4 flex flex-col shadow-lg">
      <div className="flex items-center space-x-2 mb-4">
        <SparklesIcon className="w-6 h-6 text-blue-500" />
        <h2 className="text-lg font-bold text-gray-800">AI Assistant</h2>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Describe what you want to generate in the selected cell(s). The AI will use surrounding data for context.
      </p>

      <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'Create a sales report for Q1 with columns for Product, Units Sold, and Revenue'"
          className="w-full flex-grow p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none"
          rows={6}
        />
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="mt-4 w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
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
             "Generate Data"
          )}
        </button>
      </form>
      
      <div className="mt-6 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Suggestions</h3>
          <div className="space-y-2">
            {suggestions.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => setPrompt(s)}
                  className="w-full text-left text-xs text-blue-600 hover:underline p-1.5 rounded-md bg-blue-50 hover:bg-blue-100"
                >
                  {s}
                </button>
            ))}
          </div>
      </div>
    </aside>
  );
};
