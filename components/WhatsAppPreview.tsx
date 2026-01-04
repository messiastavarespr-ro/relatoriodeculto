
import React, { useState } from 'react';
import { ReportState, EntryMarker } from '../types';
import { formatCurrency, formatDate, getDayLabel } from '../utils/formatter';

interface WhatsAppPreviewProps {
  report: ReportState;
  entryMarkers: EntryMarker[];
}

const WhatsAppPreview: React.FC<WhatsAppPreviewProps> = ({ report, entryMarkers }) => {
  const [copied, setCopied] = useState(false);

  const total = entryMarkers.reduce((sum, marker) => {
    if (report.entries[marker.key]) {
      return sum + (report.values[marker.key] || 0);
    }
    return sum;
  }, 0);

  const generateMessage = () => {
    const lines = [];
    // Cabeçalho
    lines.push(`📆 *Relatório Financeiro – ${formatDate(report.date)} (${getDayLabel(report.dayType, report.otherDayDescription)})*`);

    // Nome do culto com emoji
    const serviceTitle = report.serviceName || 'Culto';
    lines.push(`🙌 *${serviceTitle}*`);

    lines.push('');

    // Valores das entradas
    entryMarkers.forEach(marker => {
      if (report.entries[marker.key]) {
        const val = report.values[marker.key] || 0;
        const icon = marker.icon ? marker.icon : (marker.key === 'pix' ? '💠' : '•');
        lines.push(`${icon} *${marker.label}:* ${formatCurrency(val)}`);
      }
    });

    lines.push('');
    lines.push(`🧾 *Total Geral: ${formatCurrency(total)}*`);

    // Responsável no final
    if (report.responsible) {
      lines.push('');
      lines.push(`👤 *Responsável:* ${report.responsible}`);
    }

    return lines.join('\n');
  };

  const message = generateMessage();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 4000);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-full transition-colors duration-300">
      <div className="bg-emerald-500 px-6 py-4 flex items-center justify-between transition-colors duration-500">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.011 20L12 20C8.483 20 5.488 17.65 4.393 14.331C3.882 12.783 3.754 11.231 4.025 9.71L3.037 6.138L6.721 7.087C8.182 6.113 9.944 5.589 11.854 5.602C16.402 5.641 20.103 9.442 20.012 13.991C19.927 18.256 16.34 20 12.011 20ZM17.152 14.773C16.924 14.658 15.803 14.108 15.592 14.032C15.382 13.955 15.228 13.917 15.074 14.148C14.346 15.052C14.211 15.206 14.077 15.225 13.847 15.11C13.618 14.995 12.879 14.753 12.002 13.968C11.319 13.358 10.858 12.606 10.724 12.375C10.59 12.144 10.71 12.019 10.825 11.905C10.928 11.802 11.055 11.636 11.17 11.521C11.285 11.405 11.324 11.328 11.401 11.174C11.478 11.021 11.439 10.886 11.382 10.771C11.324 10.655 10.882 9.577 10.699 9.138C10.521 8.71 10.34 8.766 10.203 8.759C10.075 8.753 9.921 8.752 9.768 8.752C9.614 8.752 9.364 8.81 9.153 9.041C8.942 9.271 8.347 9.829 8.347 10.963C8.347 12.097 9.173 13.193 9.288 13.347C9.403 13.501 10.912 15.828 13.225 16.824C13.775 17.061 14.208 17.205 14.544 17.311C15.097 17.487 15.6 17.462 16.002 17.402C16.449 17.335 17.377 16.84 17.569 16.302C17.761 15.764 17.761 15.302 17.703 15.206C17.646 15.11 17.492 15.052 17.262 14.937L17.152 14.773Z" /></svg>
          Preview WhatsApp
        </h3>
        <button
          onClick={copyToClipboard}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 transform active:scale-95 ${copied
              ? 'bg-white text-emerald-600 dark:bg-slate-100 dark:text-emerald-700 scale-105 shadow-md shadow-emerald-900/20 ring-4 ring-white/30 dark:ring-white/10'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105'
            }`}
        >
          {copied ? (
            <>
              <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              COPIADO!
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
              Copiar Mensagem
            </>
          )}
        </button>
      </div>
      <div className="p-6 flex-grow overflow-y-auto">
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 font-mono text-sm whitespace-pre-wrap break-words leading-relaxed text-slate-800 dark:text-slate-200 shadow-inner">
          {message}
        </div>
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 text-center border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Este preview mostra exatamente como será a mensagem no WhatsApp.</p>
      </div>
    </div>
  );
};

export default WhatsAppPreview;
