import React from 'react';

// FIX: Export the Color type for use in other components.
export type Color = 'blue' | 'purple' | 'orange' | 'green' | 'teal' | 'pink' | 'emerald' | 'indigo';

interface SubjectCardProps {
  title: string;
  topics: number;
  color: Color;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ title, topics, color }) => {
  const colorVariants: Record<Color, string> = {
    blue: 'bg-blue-400',
    purple: 'bg-purple-400',
    orange: 'bg-amber-400',
    green: 'bg-green-400',
    teal: 'bg-teal-400',
    pink: 'bg-pink-400',
    emerald: 'bg-emerald-400',
    indigo: 'bg-indigo-400',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col items-center text-center">
      <div className={`rounded-lg p-3 ${colorVariants[color]}`}>
        <span className="material-icons-outlined text-white !text-3xl" aria-hidden="true">library_books</span>
      </div>
      <h3 className="font-bold text-lg mt-4 text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{topics} tópicos disponíveis</p>
      <button className="bg-orange-200 hover:bg-orange-400 text-orange-900 hover:text-white font-semibold py-2 px-10 rounded-lg mt-4 transition-colors duration-300">
        Acessar
      </button>
    </div>
  );
};

export default SubjectCard;
