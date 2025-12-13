import React from 'react';
import StudyCard from './StudyCard';

interface HomePageProps {
  onNavigateToStudyMaterials: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigateToStudyMaterials }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <StudyCard 
        bgColor="indigo" 
        icon="description" 
        title="SIMULADOS" 
        onClick={() => alert('Not implemented')} 
      />
      <StudyCard 
        bgColor="orange" 
        icon="menu_book" 
        title="MATÉRIAS DE ESTUDO" 
        onClick={onNavigateToStudyMaterials} 
      />
      <StudyCard 
        bgColor="green" 
        icon="draw" 
        title="REDAÇÃO" 
        onClick={() => alert('Not implemented')} 
      />
      <StudyCard 
        bgColor="red" 
        icon="check_box" 
        title="ATIVIDADES" 
        onClick={() => alert('Not implemented')}
      />
    </div>
  );
};

export default HomePage;
