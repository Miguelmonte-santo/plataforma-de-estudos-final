import React from 'react';

type Page = 'home' | 'study_materials' | 'schedule' | 'profile' | 'attendance';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const menuItems: { icon: string; label: string; page?: Page; url?: string; action?: 'logout' }[] = [
  { icon: 'date_range', label: 'Cronograma de Estudos', page: 'schedule' },
  { icon: 'check_circle', label: 'Presença', page: 'attendance' },
  { icon: 'person', label: 'Perfil', page: 'profile' },
  { icon: 'history', label: 'Histórico' },
  { icon: 'leaderboard', label: 'Desempenho' },
  { icon: 'notifications', label: 'Avisos' },
  { icon: 'article', label: 'Blog', url: 'https://cursocomunitariobonsucesso.com.br/site/' },
  { icon: 'logout', label: 'Sair', action: 'logout' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate, onLogout }) => {
  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isOpen}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-60"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Sidebar Panel */}
      <aside
        className={`relative flex flex-col h-full w-72 bg-surface-dark text-gray-200 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
      >
        <div className="relative flex items-center justify-center p-4 border-b border-gray-700 h-16">
          <button onClick={onClose} aria-label="Close menu" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
            <span className="material-icons-outlined">close</span>
          </button>
           <div id="sidebar-title">
             <img 
              alt="Cursinho Comunitário Bonsucesso logo" 
              className="h-8 w-auto"
              src="https://fnfybutkvsozbvvacomo.supabase.co/storage/v1/object/public/imagens%20para%20plataforma/logo.png"
            />
          </div>
        </div>

        <nav className="flex-grow p-2">
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                <a
                  href={item.url || '#'}
                  target={item.url ? '_blank' : undefined}
                  rel={item.url ? 'noopener noreferrer' : undefined}
                  onClick={(e) => {
                    if (item.url) {
                      onClose();
                      return;
                    }
                    e.preventDefault();

                    if (item.action === 'logout') {
                        onLogout();
                        return;
                    }

                    if (item.page) {
                      onNavigate(item.page);
                    } else {
                      onClose();
                      alert(`${item.label} não implementado`);
                    }
                  }}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  <span className="material-icons-outlined mr-4 text-gray-400">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;