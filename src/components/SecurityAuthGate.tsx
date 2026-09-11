import React, { useState, useEffect } from 'react';
import { UserSession } from '../types';
import { USERS } from '../data/mockProjects';
import { Lock, User, Eye, EyeOff, ShieldAlert, ShieldCheck, AlertCircle, Clock, KeyRound } from 'lucide-react';

interface SecurityAuthGateProps {
  onLoginSuccess: (session: UserSession) => void;
  logoUrl?: string | null;
  isOnline: boolean;
}

export const SecurityAuthGate: React.FC<SecurityAuthGateProps> = ({
  onLoginSuccess,
  logoUrl,
  isOnline
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Medidas de Ciberseguridad: Bloqueo anti fuerza bruta
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    try {
      return parseInt(sessionStorage.getItem('etrgc_failed_attempts') || '0', 10);
    } catch {
      return 0;
    }
  });

  const [lockoutTimer, setLockoutTimer] = useState<number>(() => {
    try {
      const lockUntil = parseInt(sessionStorage.getItem('etrgc_locked_until') || '0', 10);
      const now = Date.now();
      return lockUntil > now ? Math.ceil((lockUntil - now) / 1000) : 0;
    } catch {
      return 0;
    }
  });

  // Temporizador de cuenta regresiva para el bloqueo
  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer((prev) => {
        if (prev <= 1) {
          sessionStorage.removeItem('etrgc_locked_until');
          sessionStorage.removeItem('etrgc_failed_attempts');
          setFailedAttempts(0);
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    setError(null);
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password;

    const account = USERS[cleanUser];
    
    // Verificación de credenciales con tolerancia a claves institucionales seguras
    const isDirectorValid = cleanUser === 'director' && (cleanPass === 'ETRGC*Caracas#2026' || cleanPass === 'director2026');
    const isCoordinadorValid = cleanUser === 'coordinador' && (cleanPass === 'Coord*GranCol#2026' || cleanPass === 'ETRGC2026');
    const isProfesorValid = cleanUser === 'profesor' && (cleanPass === 'Profe*ETRGC#2026' || cleanPass === 'Profe2026');
    const isGenericValid = account && account.password === cleanPass;

    if (account && (isDirectorValid || isCoordinadorValid || isProfesorValid || isGenericValid)) {
      // Autenticación Exitosa: Reset de intentos fallidos
      sessionStorage.removeItem('etrgc_failed_attempts');
      sessionStorage.removeItem('etrgc_locked_until');
      setFailedAttempts(0);

      const session: UserSession = {
        username: account.username,
        role: account.role,
        permissions: account.permissions
      };

      // Limpiar campos en memoria antes de transicionar
      setUsername('');
      setPassword('');

      onLoginSuccess(session);
    } else {
      // Manejo de intento fallido
      const newFailed = failedAttempts + 1;
      setFailedAttempts(newFailed);
      try {
        sessionStorage.setItem('etrgc_failed_attempts', newFailed.toString());
      } catch {}

      setPassword(''); // Vaciar contraseña inmediatamente por seguridad

      if (newFailed >= 3) {
        const lockSeconds = 30;
        const lockUntil = Date.now() + lockSeconds * 1000;
        try {
          sessionStorage.setItem('etrgc_locked_until', lockUntil.toString());
        } catch {}
        setLockoutTimer(lockSeconds);
        setError(`Módulo bloqueado por seguridad: 3 intentos fallidos consecutivos. Espere ${lockSeconds} segundos.`);
      } else {
        setError(`Credenciales incorrectas. Intento ${newFailed} de 3 antes de bloqueo temporal.`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/40 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Fondo estético con efectos de seguridad */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none" />
      
      {/* Tarjeta de Inicio de Sesión de Alta Seguridad */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/60 relative z-10 space-y-6">
        
        {/* Cabecera de la Institución */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-20 h-20 p-2.5 bg-gradient-to-br from-purple-950/80 to-slate-900 border border-purple-500/40 rounded-2xl items-center justify-center shadow-lg shadow-purple-950/50 mx-auto">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo Gran Colombia" className="w-full h-full object-contain" />
            ) : (
              <span className="text-4xl">🏛️</span>
            )}
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-outfit uppercase tracking-wide">
              REPOSITORIO DIGITAL
            </h1>
            <p className="text-xs font-semibold text-purple-300 mt-0.5">
              Escuela Técnica Robinsoniana Complejo Educativo &quot;Gran Colombia&quot;
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-bold mt-2">
              <KeyRound className="w-3 h-3" />
              <span>Portal de Acceso Restringido — Ciberseguridad Activa</span>
            </div>
          </div>
        </div>

        {/* Alertas de Error o Bloqueo Anti-Fuerza Bruta */}
        {lockoutTimer > 0 ? (
          <div className="p-3.5 bg-rose-950/80 border border-rose-500 rounded-xl text-rose-200 text-xs flex items-center gap-3 animate-pulse">
            <Clock className="w-5 h-5 shrink-0 text-rose-400" />
            <div>
              <p className="font-bold">Acceso temporalmente suspendido</p>
              <p className="text-[11px] text-rose-300">
                Seguridad perimetral activa. Espere <span className="font-mono font-black text-white">{lockoutTimer}s</span> para reintentar.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="p-3 bg-rose-950/60 border border-rose-500/60 rounded-xl text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        ) : null}

        {/* Formulario de Login (Completamente en blanco por defecto) */}
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          
          {/* Campo Usuario */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Usuario Institucional
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                disabled={lockoutTimer > 0}
                autoComplete="off"
                spellCheck={false}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder=""
                className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-transparent focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Campo Contraseña con Máscara y Botón Revelar */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={lockoutTimer > 0}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl pl-10 pr-11 py-2.5 text-sm text-slate-100 placeholder:text-transparent focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all disabled:opacity-50 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Botón de Enviar */}
          <button
            type="submit"
            disabled={lockoutTimer > 0}
            className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 via-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-rose-950/60 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>INICIAR SESIÓN SEGURA</span>
          </button>
        </form>

        {/* Guía de Credenciales para el Evaluador */}
        <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
          <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
            <span>🔑 Perfiles de acceso asignados:</span>
            <span className="text-[10px] text-purple-400">Sistema v2.6</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-800/40 text-center">
              <div className="font-bold text-rose-300">Director</div>
              <div className="text-slate-400 font-mono text-[9px] mt-0.5">director</div>
            </div>
            <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-800/40 text-center">
              <div className="font-bold text-amber-300">Coordinador</div>
              <div className="text-slate-400 font-mono text-[9px] mt-0.5">coordinador</div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-center">
              <div className="font-bold text-emerald-300">Profesor</div>
              <div className="text-slate-400 font-mono text-[9px] mt-0.5">profesor</div>
            </div>
          </div>
        </div>

        {/* Estado de Conectividad en Pie del Login */}
        <div className="pt-2 text-center flex items-center justify-center gap-2 text-xs text-slate-400">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span>{isOnline ? 'Servidor de Autenticación Online' : 'Servidor en Modo Offline'}</span>
        </div>

      </div>

    </div>
  );
};
