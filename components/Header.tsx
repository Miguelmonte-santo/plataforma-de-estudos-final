import React from 'react';

interface HeaderProps {
  onNavigateToHome: () => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigateToHome, onToggleSidebar }) => {
  return (
    <header className="bg-header-light dark:bg-header-dark shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-center items-center relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <button onClick={onToggleSidebar} className="text-white" aria-label="Open menu">
              <span className="material-icons-outlined text-3xl">menu</span>
            </button>
        </div>
        <button onClick={onNavigateToHome} aria-label="Go to home page">
          <img 
            alt="Cursinho Comunitário Bonsucesso logo" 
            className="h-10 w-auto"
            src="https://fnfybutkvsozbvvacomo.supabase.co/storage/v1/object/public/imagens%20para%20plataforma/logo.png"
          />
        </button>
      </div>
    </header>
  );
};

export default Header;