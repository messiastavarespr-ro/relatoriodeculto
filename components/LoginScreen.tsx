import React, { useState } from 'react';
import { supabase } from '../src/lib/supabase';

interface LoginScreenProps {
    onLoginSuccess: () => void;
    onBack: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onBack }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(false);

        try {
            const { data, error } = await supabase
                .from('app_users')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .single();

            if (error || !data) {
                setError(true);
            } else {
                onLoginSuccess();
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative border border-slate-100 dark:border-slate-700">
                <button
                    onClick={onBack}
                    className="absolute left-6 top-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center gap-1 text-sm font-medium"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Voltar
                </button>

                <div className="flex flex-col items-center mt-8 mb-8">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 p-5 rounded-3xl mb-6 shadow-inner">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Bem-vindo</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-center">
                        Faça login para acessar o sistema.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-1">Usuário</label>
                        <input
                            type="text"
                            autoFocus
                            value={username}
                            onChange={(e) => { setUsername(e.target.value); setError(false); }}
                            placeholder="Digite seu usuário..."
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white text-lg placeholder:text-slate-400 placeholder:text-base"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-1">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(false); }}
                            placeholder="Digite sua senha..."
                            className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border ${error ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-700'} rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white text-lg placeholder:text-slate-400 placeholder:text-base`}
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-center font-bold animate-bounce flex items-center justify-center gap-1 pt-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Usuário ou senha incorretos
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 active:scale-[0.98] hover:shadow-xl mt-4 flex justify-center items-center"
                    >
                        {loading ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Entrar'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-400">
                        Esqueceu a senha? Contate o administrador.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
