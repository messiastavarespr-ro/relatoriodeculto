
import React from 'react';

interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  id: string;
  icon?: React.ReactNode;
  description?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({ label, value, onChange, id, icon, description }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const numericValue = rawValue ? parseInt(rawValue, 10) / 100 : 0;
    onChange(numericValue);
  };

  const displayValue = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
  }).format(value);

  return (
    <div className="flex flex-col gap-1 w-full animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={id} className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          {icon}
          {label}
        </label>
        
        {description && (
          <div className="group relative flex items-center">
            <button 
              type="button" 
              className="text-slate-400 hover:text-indigo-500 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors"
              aria-label="Informação sobre este campo"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            
            {/* Tooltip Content */}
            <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-slate-800 dark:bg-slate-700 text-white text-[11px] font-medium leading-tight rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-1 group-hover:translate-y-0 z-50 pointer-events-none border border-white/10 backdrop-blur-sm">
              {description}
              <div className="absolute top-full right-1.5 -mt-1 border-4 border-transparent border-t-slate-800 dark:border-t-slate-700"></div>
            </div>
          </div>
        )}
      </div>
      
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-bold z-10 text-sm">R$</span>
        <input
          type="text"
          id={id}
          value={displayValue}
          onChange={handleChange}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white font-bold placeholder:text-slate-400 shadow-sm"
          placeholder="0,00"
        />
      </div>
    </div>
  );
};

export default CurrencyInput;
