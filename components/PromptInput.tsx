
import React from 'react';

interface PromptInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  placeholder: string;
  rows?: number;
  type?: string;
}

const PromptInput: React.FC<PromptInputProps> = ({ id, value, onChange, placeholder, rows = 2, type = 'textarea' }) => {
  const commonProps = {
    id,
    value,
    onChange,
    placeholder,
    className: "w-full p-4 bg-slate-800/80 border border-slate-700/80 rounded-lg text-slate-200 placeholder:text-slate-400 placeholder:text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
  };

  if (type === 'text') {
    return <input type="text" {...commonProps} />;
  }

  return (
    <textarea
      rows={rows}
      {...commonProps}
      className={`${commonProps.className} resize-y min-h-[60px]`}
    />
  );
};

export default PromptInput;
