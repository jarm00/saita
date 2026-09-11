import React from 'react';
import { UserSession, ConnectionDiagnostics } from '../types';
import { Wifi, WifiOff, LogOut, Shield, RefreshCw } from 'lucide-react';

interface HeaderProps {
  user: UserSession | null;
  onLogout: () => void;
  isOnline: boolean;
  diagnostics: ConnectionDiagnostics;
  onOpenDiagnostics: () => void;
  logoUrl?: string | null;
  onOpenLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  isOnline,
  diagnostics,
  onOpenDiagnostics,
  logoUrl,
  onOpenLogin
}) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Director':
        return { color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', icon: '🔴' };
      case 'Coordinador Academico':
        return { color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: '🟡' };
      case 'Profesor':
        return { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: '🟢' };
      default:
        return { color: 'bg-slate-500/20 text-slate-300 border-slate-500/40', icon: '⚪' };
    }
  };

  const badgeInfo = user ? getRoleBadge(user.role) : null;

  return (
    <header className="border-b border-rose-950/40 bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950/40 px-4 py-6 md:px-8 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Institución y títulos */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo Institucional"
                className="w-12 h-12 md:w-14 md:h-14 object-contain rounded-xl border border-rose-500/40 bg-slate-900/80 p-1 shadow-lg shadow-rose-950/50 flex-shrink-0"
              />
            ) : (
              <span className="text-3xl flex-shrink-0">🏛️</span>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-wide text-rose-500 uppercase font-outfit leading-tight">
                ESCUELA TÉCNICA ROBINSONIANA
              </h1>
              <p className="text-sm font-semibold tracking-wider text-slate-200 uppercase">
                COMPLEJO EDUCATIVO "GRAN COLOMBIA"
              </p>
            </div>
          </div>
          <p className="text-xs text-rose-300/80 italic pl-1">
            Honrando la memoria de Antonio José de Sucre
          </p>
        </div>

        {/* Barra de Estado y Sesión de Usuario */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Badge de Conexión en tiempo real con diagnóstico */}
          <button
            onClick={onOpenDiagnostics}
            title="Haz clic para ver diagnóstico de conexión y auditoría del repositorio"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-sm hover:scale-105 ${
              isOnline
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-emerald-950/50'
                : 'bg-rose-950/70 border-rose-500/50 text-rose-300 shadow-rose-950/50'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isOnline ? 'bg-emerald-400' : 'bg-rose-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isOnline ? 'bg-emerald-500' : 'bg-rose-500'
              }`}></span>
            </span>
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Online (Firebase Cloud)</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span>Offline (Local)</span>
              </>
            )}
            <span className="text-[10px] opacity-70 underline ml-1">Ver estado</span>
          </button>

          {/* Estado de usuario autenticado o botón de inicio de sesión */}
          {user && badgeInfo ? (
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/60 rounded-lg p-1.5 pl-3 shadow-md">
              <span className="text-xs">{badgeInfo.icon}</span>
              <span className="text-xs font-semibold text-slate-200">
                {user.role}
              </span>
              <span className="text-xs text-slate-400">| {user.username}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onLogout();
                }}
                className="ml-2 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-95 text-white rounded-md text-xs font-bold transition-all shadow-md shadow-rose-950/50 cursor-pointer"
                title="Cerrar sesión de forma segura y bloquear pantalla"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-rose-950/40 cursor-pointer"
            >
              <span>🔐</span>
              <span>Iniciar Sesión</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
