import React, { useState, useEffect } from 'react';
import { UserSession } from '../types';
import { USERS } from '../data/mockProjects';
import { Lock, User, AlertCircle, X, Shield } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserSession) => void;
  canClose?: boolean;
  logoUrl?: string | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  canClose = true,
  logoUrl
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Cada vez que se abre el modal, vaciar completamente los campos de usuario y contraseña
  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPassword('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const userKey = username.trim().toLowerCase();
    const account = USERS[userKey];

    if (account && account.password === password) {
      const session: UserSession = {
        username: account.username,
        role: account.role,
        permissions: account.permissions
      };
      // Limpiar antes de guardar
      setUsername('');
      setPassword('');
      onLoginSuccess(session);
      onClose();
    } else {
      setError('Usuario o contraseña incorrectos. Revisa los datos de acceso institucionales.');
      setPassword(''); // Vaciar contraseña al fallar
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={() => { if (canClose) onClose(); }}
    >
      <div 
        className="bg-slate-900 border border-purple-800/60 rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl relative space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar sólo si se permite cerrar */}
        {canClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Encabezado */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 p-2 bg-purple-950/50 border border-purple-800/40 rounded-2xl text-purple-400 items-center justify-center overflow-hidden shadow-lg shadow-purple-950/40 mx-auto">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo Institucional" className="w-full h-full object-contain" />
            ) : (
              <span className="text-3xl">🏛️</span>
            )}
          </div>
          <h2 className="text-xl font-bold text-purple-300 font-outfit uppercase tracking-wide">
            REPOSITORIO DIGITAL
          </h2>
          <p className="text-xs text-slate-400">
            E.T.R. Gran Colombia — Acceso Restringido
          </p>
        </div>

        {/* Alerta de Error */}
        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario con campos 100% en blanco sin placeholders */}
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Usuario
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                autoFocus
                autoComplete="off"
                spellCheck={false}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder=""
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-transparent focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-transparent focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-rose-950/50 cursor-pointer"
          >
            🔐 INICIAR SESIÓN
          </button>
        </form>

        {/* Niveles de acceso informativos */}
        <div className="p-3.5 bg-purple-950/20 border border-purple-800/30 rounded-xl text-[11px] text-slate-400 space-y-1.5">
          <div className="font-bold text-purple-300">Niveles de acceso institucionales:</div>
          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="px-2 py-0.5 bg-rose-950/40 border border-rose-700/40 rounded text-rose-300 font-medium">🔴 Director</span>
            <span className="px-2 py-0.5 bg-amber-950/40 border border-amber-700/40 rounded text-amber-300 font-medium">🟡 Coordinador</span>
            <span className="px-2 py-0.5 bg-emerald-950/40 border border-emerald-700/40 rounded text-emerald-300 font-medium">🟢 Profesor</span>
          </div>
        </div>

      </div>
    </div>
  );
};
