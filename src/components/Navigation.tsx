import React from 'react';
import { UserSession } from '../types';
import { BookOpen, Upload, Settings, Info, Activity } from 'lucide-react';

export type TabKey = 'catalog' | 'upload' | 'config' | 'info' | 'diagnostics';

interface NavigationProps {
  currentTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  user: UserSession | null;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  user
}) => {
  const canConfig = user && user.permissions.includes('config');
  const canInfo = !user || user.permissions.includes('info');

  const navItems = [
    { key: 'catalog' as TabKey, label: 'CATÁLOGO', icon: BookOpen },
    { key: 'upload' as TabKey, label: 'CARGAR', icon: Upload },
    ...(canConfig ? [{ key: 'config' as TabKey, label: 'CONFIG', icon: Settings }] : []),
    ...(canInfo ? [{ key: 'info' as TabKey, label: 'INFO', icon: Info }] : []),
    { key: 'diagnostics' as TabKey, label: 'AUDITORÍA Y CONEXIÓN', icon: Activity },
  ];

  return (
    <nav className="bg-slate-900/90 border-b border-slate-800/80 px-4 md:px-8 py-3 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-wrap gap-2 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold tracking-wide transition-all uppercase cursor-pointer ${
                isActive
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
