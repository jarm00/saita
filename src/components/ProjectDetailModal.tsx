import React from 'react';
import { Project, UserSession } from '../types';
import { X, ExternalLink, Download, Edit2, Trash2, Calendar, User, GraduationCap, Award, Globe, FolderGit2 } from 'lucide-react';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  user: UserSession | null;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  user,
  onEdit,
  onDelete
}) => {
  if (!project) return null;

  const canEdit = user && user.permissions.includes('edit');
  const canDelete = user && user.permissions.includes('delete');

  const isApproved = project.status === 'approved';
  const isDigital = project.physicalStatus === 'digital';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 md:p-8 my-8 shadow-2xl relative space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Modal */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isApproved 
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40' 
                : 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
            }`}>
              {isApproved ? '✅ APROBADO' : '⏳ EN REVISIÓN'}
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 leading-snug">
              {project.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ficha técnica del proyecto */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-purple-950/20 border border-purple-800/40">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-purple-300/80 flex items-center gap-1">
              <User className="w-3 h-3" /> Autor/a
            </span>
            <p className="text-sm font-medium text-slate-200">{project.author}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-purple-300/80 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Año
            </span>
            <p className="text-sm font-medium text-slate-200">{project.year}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-purple-300/80 flex items-center gap-1">
              <GraduationCap className="w-3 h-3" /> Nivel Académico
            </span>
            <p className="text-sm font-medium text-slate-200">{project.studentYear || 'N/A'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-purple-300/80 flex items-center gap-1">
              <Award className="w-3 h-3" /> Mención
            </span>
            <p className="text-sm font-medium text-slate-200">{project.mention || 'General'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-purple-300/80 flex items-center gap-1">
              👨‍🏫 Tutor/a
            </span>
            <p className="text-sm font-medium text-slate-200">{project.tutor}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-purple-300/80 flex items-center gap-1">
              <Globe className="w-3 h-3" /> Tipo de Sitio
            </span>
            <p className="text-sm font-medium text-blue-300">
              {isDigital ? '💻 Sitio Digital' : '📦 Sitio Físico'}
            </p>
          </div>
        </div>

        {/* Objetivo General */}
        <div className="p-4 rounded-xl bg-emerald-950/20 border-l-4 border-emerald-500 space-y-1">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            🎯 Objetivo General
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            {project.objective}
          </p>
        </div>

        {/* Índice del Proyecto */}
        {project.projectIndex && (
          <div className="p-4 rounded-xl bg-amber-950/20 border-l-4 border-amber-500 space-y-1">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              📑 Índice del Proyecto
            </h3>
            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-mono text-xs">
              {project.projectIndex}
            </p>
          </div>
        )}

        {/* Descripción Completa */}
        {project.fullDescription && (
          <div className="p-4 rounded-xl bg-pink-950/20 border-l-4 border-pink-500 space-y-1">
            <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider">
              📖 Descripción Completa
            </h3>
            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
              {project.fullDescription}
            </p>
          </div>
        )}

        {/* Palabras Clave */}
        {project.keywords && (
          <div className="p-4 rounded-xl bg-purple-950/20 border-l-4 border-purple-500 space-y-2">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              🏷️ Palabras Clave
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {project.keywords.split(',').map((kw, i) => (
                <span 
                  key={i} 
                  className="px-2.5 py-1 bg-purple-900/40 border border-purple-700/50 rounded-md text-xs text-purple-200"
                >
                  {kw.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Enlaces y Recursos Externos */}
        <div className="space-y-2">
          {project.googleDriveUrl && (
            <a
              href={project.googleDriveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md"
            >
              <FolderGit2 className="w-4 h-4" />
              <span>📁 ACCEDER A GOOGLE DRIVE</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {project.pdfUrl && (
            <a
              href={project.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>📥 DESCARGAR ARCHIVO PDF</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Botones de acción según rol */}
        {(canEdit || canDelete) && (
          <div className="flex gap-3 pt-2 border-t border-slate-800">
            {canEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(project);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span>✏️ EDITAR</span>
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => {
                  if (confirm(`¿Estás seguro de eliminar el proyecto "${project.title}"?`)) {
                    onDelete(project.id);
                    onClose();
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-700 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>🗑️ ELIMINAR</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
