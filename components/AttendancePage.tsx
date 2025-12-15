import React, { useState, useEffect } from 'react';
import { QrCode, History, Calendar, Clock, MapPin } from 'lucide-react';
import FacialCheckinPage from './FacialCheckinPage';
import { supabase } from '../lib/supabaseClient';

interface Presenca {
  id: string;
  created_at: string;
  localizacao: string;
  dispositivo: string;
}

const AttendancePage: React.FC = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca o histórico ao abrir a página
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('presencas')
          .select('*')
          .eq('aluno_id', user.id)
          .order('created_at', { ascending: false }); // Mais recentes primeiro

        if (error) throw error;
        if (data) setPresencas(data);
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função chamada quando o aluno volta da câmera (para atualizar a lista)
  const handleBackFromCamera = () => {
    setShowCamera(false);
    fetchHistory(); // <--- Recarrega a tabela para mostrar a presença nova!
  };

  // Se a câmera estiver ativa, mostra o componente da câmera
  if (showCamera) {
    return <FacialCheckinPage onBack={handleBackFromCamera} />;
  }

  // Se não, mostra o Botão + Tabela
  return (
    <div className="space-y-8 animate-fade-in p-2 md:p-4">
      
      {/* SEÇÃO 1: Botão de Registrar */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm text-center border border-gray-100 dark:border-gray-700">
        <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4">
          <QrCode size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Registrar Presença
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
          Utilize a câmera do seu dispositivo para ler o QR Code projetado em sala de aula e confirmar sua presença.
        </p>
        <button
          onClick={() => setShowCamera(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2 mx-auto"
        >
          <QrCode size={20} />
          Abrir Câmera
        </button>
      </div>

      {/* SEÇÃO 2: Tabela de Histórico */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <History className="text-gray-400" size={24} />
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            Histórico de Frequência
          </h3>
          <span className="ml-auto text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-3 py-1 rounded-full">
            {presencas.length} registros
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Carregando histórico...</div>
        ) : presencas.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            Nenhuma presença registrada ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase text-gray-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Horário</th>
                  <th className="px-6 py-4">Dispositivo</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                {presencas.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-200">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(item.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        {new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400" />
                        {item.localizacao === 'Desconhecido' ? 'Sala de Aula' : item.localizacao}
                      </div>
                      <div className="text-xs text-gray-400 ml-6">{item.dispositivo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Confirmado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;