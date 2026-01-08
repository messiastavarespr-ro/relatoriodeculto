
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ReportState, DayOfWeek, User, EntryMarker } from './types';
import CurrencyInput from './components/CurrencyInput';
import WhatsAppPreview from './components/WhatsAppPreview';
import AdminDashboard from './components/AdminDashboard';
import LoginScreen from './components/LoginScreen';
import { supabase } from './src/lib/supabase';
import { formatCurrency } from './utils/formatter';

const PixIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.0001 2.3999L2.4001 11.9999L12.0001 21.5999L21.6001 11.9999L12.0001 2.3999ZM12.0001 18.5999L5.4001 11.9999L12.0001 5.3999L18.6001 11.9999L12.0001 18.5999Z" fill="currentColor" />
    <path d="M12 8.4L8.4 12L12 15.6L15.6 12L12 8.4Z" fill="currentColor" />
  </svg>
);

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    } catch {
      return 'light';
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<'report' | 'admin'>('report');
  const [users, setUsers] = useState<User[]>([]);
  const [entryMarkers, setEntryMarkers] = useState<EntryMarker[]>([]);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [report, setReport] = useState<ReportState>({
    date: new Date().toISOString().split('T')[0],
    dayType: DayOfWeek.DOMINGO,
    otherDayDescription: '',
    serviceName: '',
    responsible: '',
    entries: {}, // Dynamic
    values: {}, // Dynamic
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn("Could not save theme to localStorage", e);
    }
  }, [theme]);

  // Carregar marcadores
  useEffect(() => {
    const fetchMarkers = async () => {
      const { data } = await supabase.from('entry_markers').select('*').order('order');
      if (data) {
        setEntryMarkers(data);
        // Initialize dynamic state if empty
        setReport(prev => {
          const newEntries = { ...prev.entries };
          const newValues = { ...prev.values };
          data.forEach(m => {
            if (newEntries[m.key] === undefined) newEntries[m.key] = false;
            if (newValues[m.key] === undefined) newValues[m.key] = 0;
          });
          return { ...prev, entries: newEntries, values: newValues };
        });
      }
    };
    fetchMarkers();
  }, []);

  // Carregar usuários para o dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase.from('app_users').select('*').order('name');
        if (data) {
          setUsers(data);
        }
      } catch (e) {
        console.error("Error loading users from Supabase", e);
        setUsers([]);
      }
    };

    fetchUsers();
  }, [view]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const handleDateChange = (dateVal: string) => {
    if (!dateVal) return;
    try {
      const dateObj = new Date(dateVal + 'T00:00:00');
      const dayIndex = dateObj.getDay();
      const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

      let newDayType = DayOfWeek.OUTROS;
      let newOtherDesc = weekdays[dayIndex];

      if (dayIndex === 0) {
        newDayType = DayOfWeek.DOMINGO;
        newOtherDesc = '';
      } else if (dayIndex === 3) {
        newDayType = DayOfWeek.QUARTA;
        newOtherDesc = '';
      }

      setReport(prev => ({
        ...prev,
        date: dateVal,
        dayType: newDayType,
        otherDayDescription: newOtherDesc
      }));
    } catch (e) {
      console.error("Invalid date", e);
    }
  };

  const total = useMemo(() => {
    let sum = 0;
    entryMarkers.forEach(marker => {
      if (report.entries[marker.key]) {
        sum += (report.values[marker.key] || 0);
      }
    });
    return sum;
  }, [report, entryMarkers]);

  const toggleEntry = (key: string) => {
    setReport(prev => ({ ...prev, entries: { ...prev.entries, [key]: !prev.entries[key] } }));
  };

  const updateValue = (key: string, val: number) => {
    setReport(prev => ({ ...prev, values: { ...prev.values, [key]: val } }));
  };

  const handleOpenCalendar = () => {
    const input = dateInputRef.current;
    if (!input) return;

    if ('showPicker' in HTMLInputElement.prototype) {
      try {
        input.showPicker();
      } catch (e) {
        input.click();
      }
    } else {
      input.click();
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLoginSuccess={(user) => {
          setIsAuthenticated(true);
          setReport(prev => ({ ...prev, responsible: user.name }));
        }}
        onBack={() => { }}
      />
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 md:px-8 max-w-6xl mx-auto transition-colors duration-300">
      <header className="mb-8 flex flex-col items-center relative">
        <div className="absolute right-0 top-0 flex gap-2">
          <button
            onClick={() => setView('admin')}
            className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
            title="Acesso Administrativo"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </button>
          <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:scale-110 transition-transform"
          >
            {theme === 'light' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707-.707M7.757 5.657l.707-.707M12 8a4 4 0 110 8 4 4 0 010-8z"></path></svg>
            )}
          </button>
        </div>

        <div className="bg-indigo-600 text-white p-3 rounded-2xl mb-4 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white text-center">Relatório de Culto MVPfin</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-center font-medium">Controle Administrativo Financeiro</p>
      </header>

      {view === 'admin' ? (
        <AdminDashboard onBack={() => setView('report')} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Informações Gerais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Data do Culto</label>
                      <button
                        type="button"
                        onClick={handleOpenCalendar}
                        className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 p-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all active:scale-90"
                        title="Abrir Calendário"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={report.date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dia do Culto</label>
                  <select value={report.dayType} onChange={(e) => setReport({ ...report, dayType: e.target.value as DayOfWeek })} className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white">
                    <option value={DayOfWeek.DOMINGO}>Domingo</option>
                    <option value={DayOfWeek.QUARTA}>Quarta-feira</option>
                    <option value={DayOfWeek.ESCOLA_DO_REINO}>Escola do Reino</option>
                    <option value={DayOfWeek.OUTROS}>Outros</option>
                  </select>
                </div>
                {report.dayType === DayOfWeek.OUTROS && (
                  <div className="md:col-span-2 flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Descrição do Dia</label>
                    <input type="text" placeholder="Ex: Vigília" value={report.otherDayDescription} onChange={(e) => setReport({ ...report, otherDayDescription: e.target.value })} className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" />
                  </div>
                )}
                <div className="md:col-span-2 flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome/Tipo do Culto</label>
                  <input type="text" placeholder="Ex: Culto de Celebração" value={report.serviceName} onChange={(e) => setReport({ ...report, serviceName: e.target.value })} className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Responsável pelo Relatório</label>
                  {users.length > 0 ? (
                    <select
                      value={report.responsible}
                      disabled
                      onChange={(e) => setReport({ ...report, responsible: e.target.value })}
                      className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white opacity-70 cursor-not-allowed"
                    >
                      <option value="">Selecione um responsável...</option>
                      {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    </select>
                  ) : (
                    <input type="text" disabled placeholder="Cadastre usuários no Admin" value={report.responsible} onChange={(e) => setReport({ ...report, responsible: e.target.value })} className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white opacity-70 cursor-not-allowed" />
                  )}
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                Marcador de Entradas
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {entryMarkers.length > 0 ? entryMarkers.map((marker) => (
                  <button
                    key={marker.key}
                    onClick={() => toggleEntry(marker.key)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 ${report.entries[marker.key] ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-400' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-400 grayscale'} `}
                  >
                    <span className="text-xl flex items-center justify-center">
                      {marker.icon ? marker.icon : marker.key === 'pix' ? <PixIcon className="w-6 h-6" /> : '•'}
                    </span>
                    <span className="text-xs font-bold uppercase">{marker.label}</span>
                  </button>
                )) : (
                  <p className="col-span-4 text-center text-slate-400">Carregando...</p>
                )}
              </div>

              <div className="space-y-6">
                {entryMarkers.map(marker => (
                  report.entries[marker.key] && (
                    <CurrencyInput
                      key={marker.key}
                      id={marker.key}
                      label={`Valor ${marker.label}`}
                      value={report.values[marker.key] || 0}
                      onChange={(val) => updateValue(marker.key, val)}
                      icon={marker.icon ? <span className="text-indigo-500 text-xl">{marker.icon}</span> : marker.key === 'pix' ? <PixIcon className="w-5 h-5 text-[#32BCAD]" /> : <span className="text-indigo-500">💰</span>}
                      description={`Valor recebido via ${marker.label}`}
                    />
                  )
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 rounded-[2rem] text-white relative border border-white/5">
              <div className="relative z-10">
                <h2 className="text-indigo-300 text-xs font-bold uppercase mb-2 opacity-80 tracking-widest">Consolidação de Entradas</h2>
                <span className="text-4xl md:text-5xl font-black">{formatCurrency(total)}</span>
                <div className="space-y-4 mt-8 pt-6 border-t border-white/10">
                  {entryMarkers.map((marker) => {
                    if (!report.entries[marker.key]) return null;
                    const val = report.values[marker.key] || 0;
                    const percent = total > 0 ? (val / total) * 100 : 0;
                    return (
                      <div key={marker.key} className="flex flex-col gap-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize text-slate-300">{marker.label}</span>
                          <span className="font-bold">{formatCurrency(val)}</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percent}% ` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
            <WhatsAppPreview report={report} entryMarkers={entryMarkers} />
          </div>
        </div>
      )}

      <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">© {new Date().getFullYear()} Relatório de Culto MVPfin • Sistema Administrativo</p>
      </footer>
    </div>
  );
};

export default App;
