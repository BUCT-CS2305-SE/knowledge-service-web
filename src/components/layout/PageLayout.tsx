import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export const PageLayout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const handleMenuToggle = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleCloseMenu = (): void => {
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-museum-cream-light">
      <Header onMenuToggle={handleMenuToggle} isMenuOpen={isMenuOpen} />
      
      <main className="flex-1">
        <Outlet context={{ closeMenu: handleCloseMenu }} />
      </main>
      
      <Footer />
    </div>
  );
};
