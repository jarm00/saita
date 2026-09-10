import React from 'react';
import { ConnectionDiagnostics } from '../types';
import { Wifi, WifiOff } from 'lucide-react';

interface FooterProps {
  isOnline: boolean;
  diagnostics: ConnectionDiagnostics;
  onOpenDiagnostics: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  isOnline,
  diagnostics,
  onOpenDiagnostics
}) => {
  return (
    <footer id="footer" className="mt-auto border-t border-slate-800/80 bg-slate-950/95 py-5 px-4 md:px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Identificador institucional */}
        <div className="flex items-center gap-1.5 font-bold text-slate-300 text-sm tracking-wide">
          <span>🏛️</span>
          <span>E.T.R. G.C</span>
        </div>

        {/* Badge Dinámico de Conexión (Online / Offline ajustado con estado real) */}
        <button
          onClick={onOpenDiagnostics}
          title="Haz clic para ver diagnóstico de conexión y auditoría"
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-105 ${
            isOnline
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-900/40 border border-emerald-400/40'
              : 'bg-gradient-to-r from-rose-700 to-amber-700 text-white shadow-rose-900/40 border border-rose-400/40'
          }`}
        >
          <span className="text-sm">📡</span>
          <span>{isOnline ? 'Online' : 'Offline'}</span>
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-200 animate-pulse' : 'bg-rose-200'}`}></span>
        </button>

        {/* Créditos y año */}
        <div className="text-slate-400 text-xs">
          A partir de 2026 | En Progreso ✨
        </div>

      </div>
    </footer>
  );
};
