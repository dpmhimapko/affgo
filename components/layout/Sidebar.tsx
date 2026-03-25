
import React from 'react';
import type { View } from '../../App';
import { TryOnIcon } from '../icons/TryOnIcon';
import { useLanguage } from '../../contexts/LanguageContext';
import { SparklesIcon } from '../icons/SparklesIcon';
import { X, Users, Smile, ShieldCheck, Eraser, ScanFace, Monitor, Info, Key, Settings as SettingsIcon, Clock } from '../icons/LucideIcons';
import { HomeIcon } from '../icons/HomeIcon';
import { MirrorIcon } from '../icons/MirrorIcon';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  isAdmin?: boolean;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center w-full px-4 py-3 text-sm font-black transition-all duration-200 rounded-2xl mb-2 border-2 border-cartoon-dark shadow-cartoon relative overflow-hidden ${
        isActive 
        ? 'bg-cartoon-blue text-white translate-x-[2px] translate-y-[2px] shadow-cartoon-hover' 
        : 'bg-white text-cartoon-dark hover:bg-cartoon-yellow hover:shadow-cartoon-hover'
      }`}
    >
      <span className={`mr-3 transition-transform ${isActive ? 'scale-110' : 'group-hover:rotate-12'}`}>
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { 
          className: `w-5 h-5 ${isActive ? 'text-white' : 'text-cartoon-dark'}`
        })}
      </span>
      <span className="truncate uppercase tracking-tight flex-grow text-left">{label}</span>
    </button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isMobileOpen, onMobileClose, isAdmin }) => {
    const { t } = useLanguage();
    
    const menuGroups = [
      ...(isAdmin ? [{
        title: "Admin",
        items: [
          { id: 'adminDashboard', label: "Admin Dashboard", icon: <ShieldCheck /> },
        ]
      }] : []),
      {
        title: "General",
        items: [
          { id: 'home', label: t('sidebar.home'), icon: <HomeIcon /> },
          { id: 'history', label: t('sidebar.history'), icon: <Clock /> },
          { id: 'featureGuide', label: "Panduan Fitur", icon: <Info /> },
          { id: 'settings', label: t('sidebar.settings'), icon: <Key /> },
        ]
      },
      {
        title: "Photoshoot",
        items: [
          { id: 'goModelVip', label: t('sidebar.goModelVip'), icon: <ShieldCheck /> },
          { id: 'goSelfieVip', label: t('sidebar.goSelfieVip'), icon: <ScanFace /> },
          { id: 'goSetup', label: t('sidebar.goSetup'), icon: <Monitor /> },
          { id: 'virtualTryOn', label: t('sidebar.virtualTryOn'), icon: <TryOnIcon /> },
          { id: 'goKids', label: t('sidebar.goKids'), icon: <Smile /> },
          { id: 'goFamily', label: t('sidebar.goFamily'), icon: <Users /> },
          { id: 'goAesthetic', label: t('sidebar.goAesthetic'), icon: <SparklesIcon /> },
          { id: 'goCermin', label: t('sidebar.goCermin'), icon: <MirrorIcon /> },
        ]
      },
      {
        title: "Editor",
        items: [
          { id: 'goClean', label: t('sidebar.goClean'), icon: <Eraser /> },
        ]
      }
    ];

    const handleNavItemClick = (view: View) => {
        setActiveView(view);
        onMobileClose();
    };

    return (
        <aside className={`
            fixed top-0 left-0 z-50 h-full w-[280px] transition-all duration-300
            md:sticky md:top-24 md:h-[calc(100vh-8rem)] md:w-64 md:z-30 md:translate-x-0
            ${isMobileOpen ? 'translate-x-0 p-4 bg-cartoon-yellow' : '-translate-x-full md:bg-transparent'}
        `}>
            <div className="h-full flex flex-col bg-white border-4 border-cartoon-dark rounded-[2.5rem] shadow-cartoon-lg overflow-hidden">
                <div className="p-5 border-b-4 border-cartoon-dark bg-cartoon-blue text-white flex items-center justify-between">
                     <span className="text-lg font-black italic">MENU GO</span>
                     <button onClick={onMobileClose} className="md:hidden">
                        <X className="w-6 h-6" />
                     </button>
                </div>

                <nav className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-slate-50">
                    {menuGroups.map((group) => (
                        <div key={group.title} className="mb-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">{group.title}</h3>
                            {group.items.map((item: any) => (
                                <NavItem
                                    key={item.id}
                                    icon={item.icon}
                                    label={item.label}
                                    isActive={activeView === item.id}
                                    onClick={() => handleNavItemClick(item.id as View)}
                                />
                            ))}
                        </div>
                    ))}
                </nav>
            </div>
        </aside>
    );
}
