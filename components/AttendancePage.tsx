import React, { useState } from 'react';

// Interface para os registros (preparada para uso futuro)
interface AttendanceRecord {
  id: string;
  date: string;
  subject: string;
  status: 'Presente' | 'Ausente';
}

interface AttendancePageProps {
  onNavigateToFacialCheckin: () => void;
}

const AttendancePage: React.FC<AttendancePageProps> = ({ onNavigateToFacialCheckin }) => {
  // Inicializa vazio para corresponder ao estado "Não há presenças registradas"
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);

  const totalClasses = attendanceData.length;
  const presentClasses = attendanceData.filter(a => a.status === 'Presente').length;
  const absences = totalClasses - presentClasses;
  
  // Se não houver aulas, a frequência é 0 (conforme imagem), caso contrário calcula a porcentagem
  const percentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

  return (
    <section aria-labelledby="attendance-title" className="flex flex-col items-center w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8 mt-4">
        <h1 id="attendance-title" className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-3">
          <span className="material-icons-outlined text-green-500 !text-4xl" aria-hidden="true">check_circle_outline</span>
          Presença
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base">Acompanhe sua frequência nas aulas.</p>
      </div>

      {/* Action Button */}
      <button 
        className="mb-10 bg-[#374f98] hover:bg-opacity-90 text-white text-lg font-medium py-3 px-16 rounded-2xl shadow-md transition-transform hover:scale-105 uppercase tracking-wide"
        onClick={onNavigateToFacialCheckin}
      >
        REGISTRAR PRESENÇA
      </button>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm text-center border border-gray-100 dark:border-gray-700">
            <h3 className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">FREQUÊNCIA TOTAL</h3>
            <p className="text-4xl font-normal text-gray-800 dark:text-white">{percentage}</p>
        </div>
         <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm text-center border border-gray-100 dark:border-gray-700">
            <h3 className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">AULAS PRESENTES</h3>
            <p className="text-4xl font-normal text-gray-800 dark:text-white">{presentClasses}</p>
        </div>
         <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm text-center border border-gray-100 dark:border-gray-700">
            <h3 className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">FALTAS</h3>
            <p className="text-4xl font-normal text-gray-800 dark:text-white">{absences}</p>
        </div>
      </div>

      {/* List / Empty State */}
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden min-h-[300px] flex flex-col border border-gray-100 dark:border-gray-700">
        {/* Table Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 grid grid-cols-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <div className="pl-4 text-left">DATA</div>
            <div className="text-center">MATÉRIA</div>
            <div className="text-right pr-4">STATUS</div>
        </div>

        {/* Content */}
        <div className="flex-grow flex items-center justify-center p-8 bg-white dark:bg-gray-800">
            {attendanceData.length === 0 ? (
                <p className="text-gray-400 text-lg sm:text-xl font-light text-center uppercase tracking-wide">
                    NÃO HÁ PRESENÇAS REGISTRADAS NO MOMENTO.
                </p>
            ) : (
                <div className="w-full self-start">
                     {attendanceData.map((record) => (
                        <div key={record.id} className="grid grid-cols-3 p-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors items-center">
                            <div className="pl-4 text-gray-800 dark:text-gray-200 font-medium">{record.date}</div>
                            <div className="text-center text-gray-600 dark:text-gray-300">{record.subject}</div>
                            <div className="text-right pr-4">
                                <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase ${record.status === 'Presente' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    {record.status}
                                </span>
                            </div>
                        </div>
                     ))}
                </div>
            )}
        </div>
      </div>
    </section>
  );
};

export default AttendancePage;