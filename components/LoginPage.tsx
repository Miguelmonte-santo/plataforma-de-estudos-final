import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import FormField from './FormField';

interface LoginPageProps {
  onForgotPassword: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        // Tratamento básico de mensagens de erro
        if (error.message.includes('Invalid login credentials')) {
            setErrorMsg('Email ou senha incorretos.');
        } else {
            setErrorMsg(error.message);
        }
      }
      // O redirecionamento é tratado automaticamente pelo onAuthStateChange no App.tsx
    } catch (err) {
      setErrorMsg('Ocorreu um erro inesperado ao tentar entrar.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-md p-8 sm:p-10 border border-gray-100 dark:border-gray-700">
        
        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <img 
            alt="Cursinho Comunitário Bonsucesso logo" 
            className="h-16 w-auto"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhSDtHDpdeJXLcolK0EB8X3LfE3OSaQfvoTO6hRLkwrWhAe7NM_CYaBd0GaLe63u3-lobyhpay51bvrqpGjkjLdzPOV0JUAvxbAkcF-hAemDJorCtoLJEyh6Iss9qcVdPd5BWKnSZcHFeccAHhqSIaQ8b2zBURA8SrwxaPnOIs6i0qO9HslOdLVxtqu8KnmFpt7HPBmjE70RDBUIvvqEwJHTKLBTvztITae1Pd0q79Iu-jtb7N_I_6316AnVZ-DKhtTCqT8orfbQ"
          />
        </div>

        <h2 className="text-3xl font-bold text-center text-brand-dark-blue dark:text-white mb-2">Bem-vindo</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Insira suas credenciais para acessar a plataforma.</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <FormField 
            id="email" 
            label="E-mail" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          
          <FormField 
            id="password" 
            label="Senha" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
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
              'ENTRAR'
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-2">
            <div>
                <button 
                  onClick={onForgotPassword}
                  className="text-sm text-gray-500 hover:text-brand-dark-blue dark:hover:text-white transition-colors focus:outline-none"
                >
                    Esqueceu sua senha?
                </button>
            </div>
            <div>
                <p className="text-sm text-gray-500">
                    Ainda não tem cadastro?{' '}
                    <a href="#" className="font-bold text-brand-dark-blue dark:text-indigo-400 hover:underline">
                        Procure a secretaria
                    </a>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;