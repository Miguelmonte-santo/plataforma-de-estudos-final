import React, { useState, useMemo, FormEvent, useEffect, useRef } from 'react';
import { ScheduleEvent } from './SchedulePage';

// Declara a variável global flatpickr para o TypeScript
declare const flatpickr: any;

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: Omit<ScheduleEvent, 'id'>) => void;
  existingEvents: ScheduleEvent[];
}

const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2).toString().padStart(2, '0');
  const minutes = (i % 2 === 0 ? '00' : '30');
  return `${hours}:${minutes}`;
});

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onAddEvent, existingEvents }) => {
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');

  const dateInputRef = useRef<HTMLInputElement>(null);
  const fpInstanceRef = useRef<any>(null);

  const availableStartTimes = useMemo(() => {
    if (date < today) {
        return [];
    }
    if (date !== today) {
        return timeSlots;
    }
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return timeSlots.filter(time => time > currentTime);
  }, [date, today]);

  const availableEndTimes = useMemo(() => {
    if (!startTime) return [];
    const startIndex = timeSlots.indexOf(startTime);
    return timeSlots.slice(startIndex + 1);
  }, [startTime]);

  useEffect(() => {
    if (isOpen && dateInputRef.current) {
      fpInstanceRef.current = flatpickr(dateInputRef.current, {
        dateFormat: "d/m/Y", // Formato de exibição para o usuário
        minDate: "today",
        defaultDate: date,
        allowInput: false,
        locale: 'pt', // Garante que o calendário esteja em português
        onChange: (selectedDates: Date[]) => {
          if (selectedDates[0]) {
            // Formata a data para o formato YYYY-MM-DD para o estado
            setDate(selectedDates[0].toISOString().split('T')[0]);
          }
        },
      });
    }
    
    // Função de limpeza para destruir a instância ao fechar o modal
    return () => {
      if (fpInstanceRef.current) {
        fpInstanceRef.current.destroy();
        fpInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Effect to correct start time when the date changes
  useEffect(() => {
    if (isOpen) {
        if (availableStartTimes.length > 0) {
            if (!startTime || !availableStartTimes.includes(startTime)) {
                setStartTime(availableStartTimes[0]);
            }
        } else {
            setStartTime('');
        }
    }
  }, [isOpen, date, availableStartTimes]);

  // Effect to correct end time when the start time changes
  useEffect(() => {
      if (!startTime) {
          setEndTime('');
          return;
      }
      if (!endTime || !availableEndTimes.includes(endTime)) {
          setEndTime(availableEndTimes[0] || '');
      }
  }, [startTime, availableEndTimes]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('O título é obrigatório.');
      return;
    }

    if (!startTime || !endTime) {
      setError('Por favor, selecione um horário de início e fim válido.');
      return;
    }

    const newEventStart = new Date(`${date}T${startTime}`);
    const newEventEnd = new Date(`${date}T${endTime}`);

    const hasConflict = existingEvents.some(event => {
      if (event.date !== date) return false;
      const existingStart = new Date(`${event.date}T${event.startTime}`);
      const existingEnd = new Date(`${event.date}T${event.endTime}`);
      return newEventStart < existingEnd && newEventEnd > existingStart;
    });

    if (hasConflict) {
      setError('Horário em conflito com outro evento.');
      return;
    }

    onAddEvent({ title, date, startTime, endTime });
    setTitle('');
    setDate(today);
    setError('');
  };
  
  if (!isOpen) return null;
  
  const noTimesAvailableToday = date === today && availableStartTimes.length === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-surface-light dark:bg-surface-dark rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md m-4 transform transition-transform duration-300 scale-100">
        <div className="flex justify-between items-center mb-6">
          <h2 id="modal-title" className="text-2xl font-bold text-gray-800 dark:text-gray-100">Agendar Atividade</h2>
          <button onClick={onClose} aria-label="Fechar modal" className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300">
            <span className="material-icons-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
              <input 
                type="text" 
                id="title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-800"
                required
              />
            </div>
            <div>
              <label htmlFor="date" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data
                <button
                  type="button"
                  onClick={() => fpInstanceRef.current?.toggle()}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Abrir calendário"
                >
                  <span className="material-icons-outlined !text-xl align-middle">calendar_month</span>
                </button>
              </label>
              <input
                ref={dateInputRef} 
                type="text" 
                id="date"
                placeholder="Selecione a data..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-800"
                required
              />
            </div>
            {noTimesAvailableToday ? (
                <p className="text-orange-500 text-sm text-center py-4">
                    Não há mais horários disponíveis para agendamento hoje.
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="start-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Início</label>
                    <select 
                    id="start-time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-800"
                    >
                    {availableStartTimes.map(time => <option key={time} value={time}>{time}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="end-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fim</label>
                    <select 
                    id="end-time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-800"
                    >
                    {availableEndTimes.map(time => <option key={time} value={time}>{time}</option>)}
                    </select>
                </div>
                </div>
            )}
          </div>
          
          {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
          
          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:text-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
              Cancelar
            </button>
            <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={noTimesAvailableToday || !startTime || !endTime}>
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;