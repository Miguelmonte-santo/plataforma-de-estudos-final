import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-footer-light dark:bg-footer-dark text-white text-center py-4">
      <div className="container mx-auto text-sm">
        <p>Cursinho Comunitário Bonsucesso</p>
        <p className="opacity-75">© Todos os direitos reservados 2025.</p>
      </div>
    </footer>
  );
};

export default Footer;