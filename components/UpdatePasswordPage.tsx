import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import FormField from './FormField';

interface UpdatePasswordPageProps {
  onPasswordUpdated: () => void;
}

const UpdatePasswordPage: React.FC<UpdatePasswordPageProps> = ({ onPasswordUpdated }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      alert('Senha atualizada com sucesso!');
      onPasswordUpdated();
      
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao atualizar a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-md p-8 sm:p-10 border border-gray-100 dark:border-gray-700">
        <div className="flex justify-center mb-6">
          <img 
            alt="Cursinho Comunitário Bonsucesso logo" 
            className="h-12 w-auto"
            src="https://fnfybutkvsozbvvacomo.supabase.co/storage/v1/object/public/imagens%20para%20plataforma/logo.png"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-brand-dark-blue dark:text-white mb-2">Criar Nova Senha</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Digite sua nova senha abaixo.</p>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <FormField 
            id="password" 
            label="Nova Senha" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          
          <FormField 
            id="confirmPassword" 
            label="Confirmar Senha" 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
          />

          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center font-medium border border-red-200 dark:border-red-800">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-dark-blue hover:bg-opacity-90 text-white font-bold py-3 px-4 rounded-full transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center shadow-md"
          >
            {loading ? (
               <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              'ATUALIZAR SENHA'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;