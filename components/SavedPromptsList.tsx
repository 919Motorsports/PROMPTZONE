
import React, { useState } from 'react';
import { Prompt } from '../types';
import ClipboardIcon from './icons/ClipboardIcon';
import TrashIcon from './icons/TrashIcon';

interface SavedPromptsListProps {
  prompts: Prompt[];
  onDelete: (id: number) => void;
}

const SavedPromptsList: React.FC<SavedPromptsListProps> = ({ prompts, onDelete }) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (promptText: string, id: number) => {
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-100 border-b-2 border-slate-700 pb-2">
        Saved Prompts
      </h2>
      {prompts.length === 0 ? (
        <div className="text-center py-10 px-4 bg-slate-800/50 rounded-lg">
            <p className="text-slate-400">Your saved prompts will appear here.</p>
            <p className="text-sm text-slate-500 mt-2">Create a prompt on the left to get started.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {prompts.map((prompt) => (
            <li
              key={prompt.id}
              className="bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-700 transition-all hover:border-indigo-500"
            >
              <div className="flex justify-between items-start">
                  <div className="prose prose-invert prose-sm max-w-none mr-4">
                    <p className="whitespace-pre-wrap text-slate-300">{prompt.fullPrompt}</p>
                  </div>
                <div className="flex-shrink-0 flex flex-col space-y-2">
                  <button
                    onClick={() => handleCopy(prompt.fullPrompt, prompt.id)}
                    className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors duration-200"
                    aria-label="Copy prompt"
                  >
                    {copiedId === prompt.id ? (
                        <span className="text-xs text-indigo-400">Copied!</span>
                    ) : (
                        <ClipboardIcon className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => onDelete(prompt.id)}
                    className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-red-500 transition-colors duration-200"
                    aria-label="Delete prompt"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SavedPromptsList;
