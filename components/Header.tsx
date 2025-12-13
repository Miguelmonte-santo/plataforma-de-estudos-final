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
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhSDtHDpdeJXLcolK0EB8X3LfE3OSaQfvoTO6hRLkwrWhAe7NM_CYaBd0GaLe63u3-lobyhpay51bvrqpGjkjLdzPOV0JUAvxbAkcF-hAemDJorCtoLJEyh6Iss9qcVdPd5BWKnSZcHFeccAHhqSIaQ8b2zBURA8SrwxaPnOIs6i0qO9HslOdLVxtqu8KnmFpt7HPBmjE70RDBUIvvqEwJHTKLBTvztITae1Pd0q79Iu-jtb7N_I_6316AnVZ-DKhtTCqT8orfbQ"
          />
        </button>
      </div>
    </header>
  );
};

export default Header;