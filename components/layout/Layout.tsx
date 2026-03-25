
import React, { useState } from 'react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { Sidebar } from './Sidebar';
import type { View } from '../../App';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  setActiveView: (view: View) => void;
  isAdmin?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView, isAdmin }) => {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 dark:text-slate-100">
      <Header 
        onMenuClick={() => setMobileSidebarOpen(true)} 
      />
      
      <div className="flex flex-grow w-full max-w-[1380px] mx-auto relative pt-6 px-4 sm:px-6 lg:px-8 gap-6 lg:gap-8">
        {/* Overlay for mobile */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          ></div>
        )}
        
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
          isAdmin={isAdmin}
        />
        
        <main className="flex-1 min-w-0 pb-12 animate-fade-in">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};
