import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <input
          className={`
            block w-full rounded-lg border 
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900'} 
            ${icon ? 'pl-10' : 'pl-3'} 
            pr-3 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 transition-shadow shadow-sm
          `}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};