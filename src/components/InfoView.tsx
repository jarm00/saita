import React from 'react';
import { Award, BookOpen, Clock, Users, ShieldCheck, Layers, CheckCircle2 } from 'lucide-react';

export const InfoView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-black text-slate-100 uppercase font-outfit flex items-center gap-2">
          <span>ℹ️</span> INFORMACIÓN INSTITUCIONAL
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Identidad, coordinación y especificaciones técnicas del repositorio digital.
        </p>
      </div>

      {/* Institución */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl">
        <h3 className="text-lg font-bold text-rose-500 uppercase flex items-center gap-2">
          <span>🏛️</span>
          <span>ESCUELA TÉCNICA ROBINSONIANA</span>
        </h3>
        <p className="text-sm text-slate-200 font-semibold uppercase tracking-wide">
          COMPLEJO EDUCATIVO "GRAN COLOMBIA"
        </p>
        <p className="text-xs text-rose-300 italic">
          Honrando la memoria de Antonio José de Sucre
        </p>
        <p className="text-xs text-slate-400 pt-2 border-t border-slate-800/80 leading-relaxed">
          Formando profesionales técnicos de excelencia con vocación productiva, compromiso ético y capacidades de innovación tecnológica desde 1983.
        </p>
      </div>

      {/* Sobre este repositorio */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl">
        <h3 className="text-base font-bold text-purple-300 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-400" />
          <span>SOBRE ESTE REPOSITORIO DIGITAL</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Plataforma centralizada diseñada para catalogar, preservar, consultar y gestionar los proyectos socio-productivos desarrollados por estudiantes y docentes tutores de la institución. Cuenta con sincronización bidireccional en la nube a través de Firebase Realtime Database y capacidad de operación sin conexión mediante almacenamiento local persistente.
        </p>
      </div>

      {/* Coordinación */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl">
        <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
          <Users className="w-5 h-5" />
          <span>COORDINACIÓN GENERAL</span>
        </h3>
        <div className="p-4 rounded-xl bg-rose-950/30 border-l-4 border-rose-500 space-y-1">
          <div className="text-base font-bold text-rose-300">
            Tutora Nubia González
          </div>
          <p className="text-xs text-slate-300">
            Coordinadora del Programa de Proyectos Socio-Productivos de la E.T.R. Complejo Educativo Gran Colombia
          </p>
        </div>
      </div>

      {/* Características del Sistema */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          <span>CARACTERÍSTICAS TÉCNICAS Y OPERATIVAS</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center gap-2.5 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Sincronización en la nube con Firebase Cloud</span>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center gap-2.5 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Detección de conexión en tiempo real (Online/Offline)</span>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center gap-2.5 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Operación continua sin conexión a internet (Modo Local)</span>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center gap-2.5 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Gestión completa (crear, editar, eliminar, aprobar)</span>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center gap-2.5 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Filtros avanzados por año, tutor, mención y palabras clave</span>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center gap-2.5 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Exportación e importación segura de copias de seguridad en JSON</span>
          </div>
        </div>
      </div>

      {/* Menciones Disponibles */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
          <Layers className="w-5 h-5" />
          <span>MENCIONES TÉCNICAS DISPONIBLES</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-center font-bold text-purple-200">
            📌 Administración
          </div>
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-center font-bold text-purple-200">
            📌 Comercio
          </div>
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-center font-bold text-purple-200">
            📌 Telemática
          </div>
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-center font-bold text-purple-200">
            📌 Construcción Civil
          </div>
        </div>
      </div>

      {/* Período de Operación */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
        Período de Operación: <strong className="text-blue-400">A partir de 2026</strong> | En Progreso ✨
      </div>
    </div>
  );
};
