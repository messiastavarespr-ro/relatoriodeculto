
import React, { useState, useEffect } from 'react';
import { User, EntryMarker } from '../types';
import { supabase } from '../src/lib/supabase';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const [markers, setMarkers] = useState<EntryMarker[]>([]);
  const [editingMarker, setEditingMarker] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editIcon, setEditIcon] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchMarkers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('app_users').select('*').order('created_at', { ascending: false });
      if (data) {
        setUsers(data);
      }
    } catch (e) {
      console.error("Error loading users", e);
    }
  };

  const fetchMarkers = async () => {
    try {
      const { data } = await supabase.from('entry_markers').select('*').order('order');
      if (data) setMarkers(data);
    } catch (e) {
      console.error("Error loading markers", e);
    }
  };

  const saveMarker = async (key: string) => {
    try {
      const updateData: any = { label: editLabel };
      if (editIcon !== undefined) updateData.icon = editIcon || null; // Allow clearing icon

      const { error } = await supabase.from('entry_markers').update(updateData).eq('key', key);
      if (error) throw error;

      setEditingMarker(null);
      fetchMarkers();
    } catch (e) {
      console.error("Error updating marker", e);
      alert("Erro ao atualizar marcador.");
    }
  };

  const startEdit = (marker: EntryMarker) => {
    setEditingMarker(marker.key);
    setEditLabel(marker.label);
    setEditIcon(marker.icon || '');
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const { error } = await supabase.from('app_users').insert([
        { name: newName.trim(), username: newName.trim(), password: newPassword.trim(), role: 'user' }
      ]);

      if (error) throw error;

      fetchUsers();
      setNewName('');
      setNewPassword('');
      setShowNewPassword(false);
    } catch (e) {
      console.error("Error adding user", e);
      alert("Erro ao adicionar usuário. Verifique se o nome já existe.");
    }
  };

  const deleteUser = async (id: string) => {
    if (confirm('Deseja realmente excluir este usuário?')) {
      try {
        const { error } = await supabase.from('app_users').delete().eq('id', id);
        if (error) throw error;
        fetchUsers();
      } catch (e) {
        console.error("Error deleting user", e);
      }
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Voltar ao Relatório
        </button>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Painel Administrativo</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
            Novo Usuário
          </h3>
          <form onSubmit={addUser} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Nome do Responsável</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Senha do Usuário</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                >
                  {showNewPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none mt-2"
            >
              Adicionar Usuário
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            Usuários Cadastrados
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {users.length === 0 ? (
              <p className="text-slate-400 text-center py-8 italic">Nenhum usuário cadastrado.</p>
            ) : (
              users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 group">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{user.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        {user.password ? (visiblePasswords[user.id] ? user.password : '••••••••') : 'Sem senha'}
                      </span>
                      {user.password && (
                        <button
                          onClick={() => togglePasswordVisibility(user.id)}
                          className="text-[10px] text-indigo-500 hover:text-indigo-600 font-bold"
                        >
                          {visiblePasswords[user.id] ? 'Esconder' : 'Ver'}
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors md:opacity-0 md:group-hover:opacity-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 md:col-span-2">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            Personalizar Botões de Entrada
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {markers.map(marker => (
              <div key={marker.key} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                {editingMarker === marker.key ? (
                  <div className="flex flex-col gap-2">
                    <input
                      value={editLabel}
                      onChange={e => setEditLabel(e.target.value)}
                      className="px-2 py-1 rounded border dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                      placeholder="Nome"
                    />
                    <div className="flex gap-2">
                      <input
                        value={editIcon}
                        onChange={e => setEditIcon(e.target.value)}
                        className="px-2 py-1 rounded border dark:bg-slate-800 dark:border-slate-600 dark:text-white w-12 text-center"
                        placeholder="Emoji"
                      />
                      <button onClick={() => saveMarker(marker.key)} className="bg-indigo-600 text-white px-2 py-1 rounded text-xs">Salvar</button>
                      <button onClick={() => setEditingMarker(null)} className="text-slate-400 px-2 py-1 text-xs">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{marker.icon || (marker.key === 'pix' ? '💠' : '•')}</span>
                      <span className="font-semibold dark:text-slate-200">{marker.label}</span>
                    </div>
                    <button onClick={() => startEdit(marker)} className="text-indigo-500 hover:text-indigo-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
