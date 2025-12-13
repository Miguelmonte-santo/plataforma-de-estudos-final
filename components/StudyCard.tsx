import React from 'react';

interface StudyCardProps {
  bgColor: 'indigo' | 'orange' | 'green' | 'red';
  icon: string;
  title: string;
  onClick: () => void;
}

const StudyCard: React.FC<StudyCardProps> = ({ bgColor, icon, title, onClick }) => {
  const colorVariants = {
    indigo: 'bg-indigo-500',
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
  };

  return (
    <button
      onClick={onClick}
      className={`${colorVariants[bgColor]} rounded-lg p-6 flex flex-col items-center justify-center text-white font-bold text-xl h-40 transform hover:scale-105 transition-transform duration-200 shadow-lg text-center w-full`}
    >
      <span className="material-icons-outlined mb-2">{icon}</span>
      <span>{title}</span>
    </button>
  );
};

export default StudyCard;
