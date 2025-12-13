import React from 'react';
// FIX: Import the Color type from SubjectCard to ensure type safety.
import SubjectCard, { type Color } from './SubjectCard';

// FIX: Explicitly type the subjects array to ensure color properties match the Color type.
const subjects: { title: string; topics: number; color: Color }[] = [
  { title: 'Matemática', topics: 24, color: 'blue' },
  { title: 'Português', topics: 18, color: 'purple' },
  { title: 'História', topics: 20, color: 'orange' },
  { title: 'Geografia', topics: 16, color: 'green' },
  { title: 'Física', topics: 22, color: 'teal' },
  { title: 'Química', topics: 19, color: 'pink' },
  { title: 'Biologia', topics: 21, color: 'emerald' },
  { title: 'Literatura', topics: 15, color: 'indigo' },
];

const StudyMaterialsPage: React.FC = () => {
  return (
    <section aria-labelledby="study-materials-title">
      <div className="text-center mb-12">
        <h1 id="study-materials-title" className="text-3xl sm:text-4xl font-bold text-gray-800 flex items-center justify-center gap-3">
          <span className="material-icons-outlined text-orange-500 !text-4xl" aria-hidden="true">menu_book</span>
          Matérias de Estudo
        </h1>
        <p className="text-gray-500 mt-2">Acesse conteúdos organizados por disciplina</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {subjects.map((subject, index) => (
          <SubjectCard 
            key={index}
            title={subject.title}
            topics={subject.topics}
            color={subject.color}
          />
        ))}
      </div>
    </section>
  );
};

export default StudyMaterialsPage;
