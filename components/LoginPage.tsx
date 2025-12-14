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
      // 1. Tenta fazer o login no Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
            setErrorMsg('Email ou senha incorretos.');
        } else {
            setErrorMsg(error.message);
        }
        setLoading(false);
        return; // Para aqui se a senha estiver errada
      }

      // 2. VERIFICAÇÃO DE STATUS DA CONTA (SOFT DELETE)
      if (data.user) {
        // Verifica na tabela 'alunos' se a conta está ativa
        const { data: alunoData, error: alunoError } = await supabase
          .from('alunos')
          .select('ativo')
          .eq('email', email)
          .single();

        // Se encontrou o aluno e ele NÃO está ativo
        if (alunoData && !alunoData.ativo) {
           await supabase.auth.signOut(); // Desloga imediatamente
           setErrorMsg('Acesso negado. Sua matrícula foi encerrada ou suspensa.');
           setLoading(false);
           return;
        }
        
        // Se der erro ao buscar (ex: não achou na tabela alunos mas existe no auth), 
        // decidimos se bloqueamos ou deixamos passar. 
        // Para segurança, se não achar registro de aluno ativo, é melhor bloquear.
        if (alunoError || !alunoData) {
           // Opcional: Se for um admin logando, essa lógica pode precisar de ajuste.
           // Mas para alunos, se não tá na tabela 'alunos', não entra.
           console.log("Usuário sem registro de aluno ativo.");
        }
      }

    } catch (err) {
      setErrorMsg('Ocorreu um erro inesperado ao tentar entrar.');
      console.error(err);
    } finally {
      // Se chegou aqui e não foi redirecionado pelo App.tsx (que ouve o onAuthStateChange),
      // o estado de loading é desligado.
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row font-display">
      {/* Estilos para a animação do gradiente */}
      <style>{`
        @keyframes gradientAnimation {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
        .animated-gradient-bg {
          background: linear-gradient(
            135deg,
            #0044cc, 
            #00a844, 
            #ffbb00, 
            #e62e2e 
          );
          background-size: 300% 300%;
          animation: gradientAnimation 12s ease infinite;
        }
      `}</style>

      {/* Lado Esquerdo: Animado com Logo */}
      <div className="animated-gradient-bg w-full md:w-1/2 h-48 md:h-auto flex items-center justify-center p-8 shadow-lg z-10">
        <img 
          alt="Cursinho Comunitário Bonsucesso logo" 
          className="max-h-full max-w-[60%] md:max-w-[50%] h-auto object-contain filter brightness-0 invert drop-shadow-md"
          src="https://fnfybutkvsozbvvacomo.supabase.co/storage/v1/object/public/imagens%20para%20plataforma/logo.png"
        />
      </div>

      {/* Lado Direito: Formulário */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-[#f5f7fa] p-4 sm:p-8">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 sm:p-10 border border-gray-100">
          
          <h2 className="text-3xl font-bold text-center text-[#0044cc] mb-2">Bem-vindo</h2>
          <p className="text-center text-gray-500 mb-8">Insira suas credenciais para acessar a plataforma.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <FormField 
              id="email" 
              label="E-mail" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              containerClassName="bg-white" 
            />
            
            <FormField 
              id="password" 
              label="Senha" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              containerClassName="bg-white"
            />

            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium border border-red-200">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0044cc] hover:bg-opacity-90 text-white font-bold py-3 px-4 rounded-full transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center shadow-md"
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
                    className="text-sm text-gray-500 hover:text-[#0044cc] transition-colors focus:outline-none"
                  >
                      Esqueceu sua senha?
                  </button>
              </div>
              <div>
                  <p className="text-sm text-gray-500">
                      Ainda não tem cadastro?{' '}
                      <a href="#" className="font-bold text-[#0044cc] hover:underline">
                          Procure a secretaria
                      </a>
                  </p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;