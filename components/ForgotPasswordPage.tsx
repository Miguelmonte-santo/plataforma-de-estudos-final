import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import FormField from './FormField';

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin, // O Supabase redirecionará para a raiz, e o App.tsx detectará o evento de recuperação
      });

      if (error) {
        throw error;
      }

      setMessage({
        type: 'success',
        text: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha em instantes.',
      });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Ocorreu um erro ao tentar enviar o e-mail.',
      });
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
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhSDtHDpdeJXLcolK0EB8X3LfE3OSaQfvoTO6hRLkwrWhAe7NM_CYaBd0GaLe63u3-lobyhpay51bvrqpGjkjLdzPOV0JUAvxbAkcF-hAemDJorCtoLJEyh6Iss9qcVdPd5BWKnSZcHFeccAHhqSIaQ8b2zBURA8SrwxaPnOIs6i0qO9HslOdLVxtqu8KnmFpt7HPBmjE70RDBUIvvqEwJHTKLBTvztITae1Pd0q79Iu-jtb7N_I_6316AnVZ-DKhtTCqT8orfbQ"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-brand-dark-blue dark:text-white mb-2">Recuperar Senha</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Digite seu e-mail para receber o link de redefinição.</p>

        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm text-center font-medium border ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
              : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-6">
          <FormField 
            id="email" 
            label="E-mail" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-dark-blue hover:bg-opacity-90 text-white font-bold py-3 px-4 rounded-full transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center shadow-md"
          >
            {loading ? (
               <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              'ENVIAR LINK'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={onBackToLogin}
            className="text-sm text-gray-500 hover:text-brand-dark-blue dark:hover:text-white transition-colors"
          >
            Voltar para o Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;