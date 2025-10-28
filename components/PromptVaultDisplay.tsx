import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import { Prompt } from '../types';
import ClipboardIcon from './icons/ClipboardIcon';
import TrashIcon from './icons/TrashIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import DownloadIcon from './icons/DownloadIcon';

interface PromptVaultDisplayProps {
  prompts: Prompt[];
  onDelete: (id: number) => void;
  onNavigateHome: () => void;
}

const PromptVaultDisplay: React.FC<PromptVaultDisplayProps> = ({ prompts, onDelete, onNavigateHome }) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (promptText: string, id: number) => {
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const groupedPrompts = useMemo(() => {
    return prompts.reduce((acc, prompt) => {
      const category = prompt.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(prompt);
      return acc;
    }, {} as Record<string, Prompt[]>);
  }, [prompts]);

  const sortedCategories = useMemo(() => Object.keys(groupedPrompts).sort((a,b) => a.localeCompare(b)), [groupedPrompts]);
  
  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let y = margin;

    const writeText = (text: string, options: { size: number; style?: 'normal' | 'bold' | 'italic' | 'bolditalic'; spaceAfter?: number; x?: number; }) => {
        const { size, style = 'normal', spaceAfter = 0, x = margin } = options;
        
        const textLines = doc.splitTextToSize(text, pageWidth - margin - x);
        const textHeight = doc.getTextDimensions(textLines).h;

        if (y + textHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }

        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        doc.text(textLines, x, y);
        y += textHeight + spaceAfter;
    };

    writeText('My Prompt Vault', { size: 22, style: 'bold', spaceAfter: 10 });

    sortedCategories.forEach((category, catIndex) => {
        if (catIndex > 0) y += 5;
        
        writeText(category, { size: 16, style: 'bold', spaceAfter: 5 });
        
        groupedPrompts[category].forEach((prompt, promptIndex) => {
             if (promptIndex > 0) {
                 if (y + 5 > pageHeight - margin) {
                     doc.addPage();
                     y = margin;
                 }
                 doc.setDrawColor(200, 200, 200);
                 doc.line(margin, y, pageWidth - margin, y);
                 y += 5;
             }
             writeText(prompt.fullPrompt, { size: 11, style: 'normal', spaceAfter: 8 });
        });
    });

    doc.save('prompt-vault.pdf');
  };

  const headerContent = (
      <div className="flex justify-between items-center border-b-2 border-slate-700 pb-4 mb-8 flex-wrap gap-4">
         <button onClick={onNavigateHome} className="flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-700/50 px-3 py-2 rounded-lg transition-colors duration-200">
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="font-semibold">Back to Creator</span>
         </button>
         <h2 className="text-3xl font-bold text-slate-100 hidden sm:block mx-auto">
            Your Prompt Vault
          </h2>
          <button 
            onClick={handleDownloadPdf}
            disabled={prompts.length === 0}
            className="flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-700/50 px-3 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Download prompts as PDF"
          >
            <DownloadIcon className="w-5 h-5" />
            <span className="font-semibold">Download PDF</span>
        </button>
      </div>
  );


  if (prompts.length === 0) {
    return (
        <div className="w-full max-w-4xl mx-auto">
            {headerContent}
            <div className="text-center py-16 px-4 mt-8 bg-slate-900/50 border border-slate-800 rounded-xl">
                <h3 className="text-2xl font-bold text-slate-100">Your Vault is Empty</h3>
                <p className="text-slate-400 mt-2">Use the "Create" page to build and save a new prompt.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
        {headerContent}
        <div className="space-y-8">
        {sortedCategories.map((category) => (
            <div key={category} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-xl">
            <h3 className="text-xl font-bold text-blue-400 mb-4 tracking-wider uppercase">{category}</h3>
            <div className="space-y-4">
                {groupedPrompts[category].map((prompt) => (
                <div
                    key={prompt.id}
                    className="bg-slate-800/60 p-4 rounded-lg border border-slate-700 transition-all hover:border-blue-600"
                >
                    <div className="flex justify-between items-start gap-4">
                    <div className="prose prose-invert prose-sm max-w-none mr-4 flex-1">
                        <p className="whitespace-pre-wrap text-slate-300">{prompt.fullPrompt}</p>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-center space-y-2">
                        <button
                        onClick={() => handleCopy(prompt.fullPrompt, prompt.id)}
                        className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors duration-200"
                        aria-label="Copy prompt"
                        >
                        {copiedId === prompt.id ? (
                            <span className="text-xs text-blue-400">Copied!</span>
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
                </div>
                ))}
            </div>
            </div>
        ))}
        </div>
    </div>
  );
};

export default PromptVaultDisplay;