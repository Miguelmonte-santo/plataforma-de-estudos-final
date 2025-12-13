import React, { useState, useMemo } from 'react';
import AddEventModal from './AddEventModal';

export interface ScheduleEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

const getStartOfWeek = (date: Date): Date => {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff = newDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(newDate.setDate(diff));
};

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const SchedulePage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);

  const startOfWeek = useMemo(() => getStartOfWeek(currentDate), [currentDate]);
  
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      return date;
    });
  }, [startOfWeek]);

  const handleAddEvent = (event: Omit<ScheduleEvent, 'id'>) => {
    const newEvent: ScheduleEvent = {
      ...event,
      id: new Date().toISOString(),
    };
    setEvents([...events, newEvent]);
    setIsModalOpen(false);
  };
  
  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  const handlePrevWeek = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };
  
  const weekEvents = useMemo(() => {
    const weekMap = new Map<string, ScheduleEvent[]>();
    weekDates.forEach(date => {
        const dateString = formatDate(date);
        const dayEvents = events.filter(e => e.date === dateString).sort((a,b) => a.startTime.localeCompare(b.startTime));
        weekMap.set(dateString, dayEvents);
    });
    return weekMap;
  }, [events, weekDates]);

  const weekRangeString = `${weekDates[0].toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})} - ${weekDates[6].toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}`;

  return (
    <section aria-labelledby="schedule-title">
      <AddEventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddEvent={handleAddEvent}
        existingEvents={events}
      />
      <div className="text-center mb-8">
        <h1 id="schedule-title" className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100 flex items-center justify-center gap-3">
          <span className="material-icons-outlined text-indigo-500 !text-4xl" aria-hidden="true">date_range</span>
          Cronograma de Estudos
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Organize sua rotina de estudos semanal.</p>
      </div>

      <div className="bg-surface-light dark:bg-surface-dark rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <button onClick={handlePrevWeek} className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors">
            <span className="material-icons-outlined">chevron_left</span>
            Anterior
          </button>
          <div className="font-bold text-lg text-center">{weekRangeString}</div>
          <button onClick={handleNextWeek} className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors">
            Próxima
            <span className="material-icons-outlined">chevron_right</span>
          </button>
        </div>
        
        <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto mb-6 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors shadow">
          <span className="material-icons-outlined">add_circle_outline</span>
          Agendar Atividade
        </button>

        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 min-w-[800px]">
            {weekDates.map((date) => (
              <div key={date.toISOString()} className="px-1 text-center border-b-2 border-gray-200 dark:border-gray-700 pb-2">
                <div className="font-bold text-gray-700 dark:text-gray-300">{date.toLocaleDateString('pt-BR', { weekday: 'short' })}</div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">{date.toLocaleDateString('pt-BR', { day: '2-digit' })}</div>
              </div>
            ))}
            {weekDates.map(date => {
              const dateString = formatDate(date);
              const dayEvents = weekEvents.get(dateString) || [];
              return (
                 <div key={dateString} className="border-r border-gray-200 dark:border-gray-700 last:border-r-0 p-1 min-h-[400px]">
                   <div className="flex flex-col gap-2">
                      {dayEvents.map(event => (
                        <div key={event.id} className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg text-sm group relative">
                          <p className="font-bold text-indigo-800 dark:text-indigo-200">{event.title}</p>
                          <p className="text-indigo-600 dark:text-indigo-300">{event.startTime} - {event.endTime}</p>
                          <button onClick={() => handleDeleteEvent(event.id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 dark:hover:text-red-400" aria-label="Deletar evento">
                              <span className="material-icons-outlined !text-base">delete</span>
                          </button>
                        </div>
                      ))}
                   </div>
                 </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SchedulePage;