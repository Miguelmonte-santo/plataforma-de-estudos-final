import React, { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AttendanceRedirect: React.FC = () => {
  useEffect(() => {
    const checkSession = async () => {
      // 1. Pega o token da URL (?t=XYZ)
      const params = new URLSearchParams(window.location.search);
      const token = params.get('t');

      if (token) {
        // Salva na memória do navegador para não perder
        sessionStorage.setItem('attendance_token', token);
      }

      // 2. Verifica se está logado
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        // Se logado, vai para o Check-in Facial
        // O FacialCheckinPage vai ler o sessionStorage
        window.location.href = '/checkin-facial'; 
      } else {
        // Se não logado, vai para login
        window.location.href = '/login';
      }
    };

    checkSession();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <p className="text-gray-500 animate-pulse">Verificando link de chamada...</p>
    </div>
  );
};

export default AttendanceRedirect;