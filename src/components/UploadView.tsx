import React, { useState, useEffect } from 'react';
import { Project, UserSession, SiteType, ProjectStatus, AcademicYear, Mention } from '../types';
import { TUTORES_DISPONIBLES, MENCIONES, NIVELES } from '../data/mockProjects';
import { Save, X, AlertTriangle, CheckCircle, FolderGit2 } from 'lucide-react';

interface UploadViewProps {
  user: UserSession | null;
  editingProject: Project | null;
  onSave: (project: Project) => Promise<void>;
  onCancel: () => void;
  onPromptLogin: () => void;
}

export const UploadView: React.FC<UploadViewProps> = ({
  user,
  editingProject,
  onSave,
  onCancel,
  onPromptLogin
}) => {
  if (!user) {
    return (
      <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
        <div className="text-4xl">🔐</div>
        <h2 className="text-xl font-bold text-slate-100">Acceso Restringido</h2>
        <p className="text-sm text-slate-400">
          Debes iniciar sesión con una cuenta autorizada (Director, Coordinador o Profesor) para cargar o editar proyectos.
        </p>
        <button
          onClick={onPromptLogin}
          className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-colors shadow-lg cursor-pointer"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  const isEditing = Boolean(editingProject);
  const canApprove = user.role === 'Director' || user.role === 'Coordinador Academico';

  const [title, setTitle] = useState(editingProject?.title || '');
  const [author, setAuthor] = useState(editingProject?.author || '');
  const [year, setYear] = useState<string>(String(editingProject?.year || '2026'));
  const [studentYear, setStudentYear] = useState<AcademicYear>(
    (editingProject?.studentYear as AcademicYear) || '5to'
  );
  const [mention, setMention] = useState<Mention>(
    (editingProject?.mention as Mention) || 'Telemática'
  );
  const [tutor, setTutor] = useState(editingProject?.tutor || TUTORES_DISPONIBLES[0]);
  const [physicalStatus, setPhysicalStatus] = useState<SiteType>(
    editingProject?.physicalStatus || 'digital'
  );
  const [status, setStatus] = useState<ProjectStatus>(
    editingProject?.status || (canApprove ? 'approved' : 'pending')
  );
  const [projectIndex, setProjectIndex] = useState(editingProject?.projectIndex || '');
  const [objective, setObjective] = useState(editingProject?.objective || '');
  const [keywords, setKeywords] = useState(editingProject?.keywords || '');
  const [fullDescription, setFullDescription] = useState(editingProject?.fullDescription || '');
  const [googleDriveUrl, setGoogleDriveUrl] = useState(editingProject?.googleDriveUrl || '');
  const [pdfUrl, setPdfUrl] = useState(editingProject?.pdfUrl || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingProject) {
      setTitle(editingProject.title);
      setAuthor(editingProject.author);
      setYear(String(editingProject.year));
      setStudentYear((editingProject.studentYear as AcademicYear) || '5to');
      setMention((editingProject.mention as Mention) || 'Telemática');
      setTutor(editingProject.tutor);
      setPhysicalStatus(editingProject.physicalStatus);
      setStatus(editingProject.status);
      setProjectIndex(editingProject.projectIndex);
      setObjective(editingProject.objective);
      setKeywords(editingProject.keywords);
      setFullDescription(editingProject.fullDescription || '');
      setGoogleDriveUrl(editingProject.googleDriveUrl || '');
      setPdfUrl(editingProject.pdfUrl || '');
    }
  }, [editingProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!title.trim() || !author.trim() || !objective.trim() || !projectIndex.trim() || !keywords.trim()) {
      setErrorMsg('Por favor completa todos los campos requeridos (*)');
      return;
    }

    setIsSubmitting(true);

    try {
      const newProject: Project = {
        id: editingProject ? editingProject.id : 'proj-' + Date.now(),
        title: title.trim(),
        author: author.trim(),
        year: year,
        studentYear: studentYear,
        mention: mention,
        tutor: tutor,
        physicalStatus: physicalStatus,
        status: canApprove ? status : 'pending',
        projectIndex: projectIndex.trim(),
        objective: objective.trim(),
        keywords: keywords.trim(),
        fullDescription: fullDescription.trim(),
        googleDriveUrl: physicalStatus === 'digital' ? googleDriveUrl.trim() : '',
        pdfUrl: pdfUrl.trim(),
        createdAt: editingProject?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onSave(newProject);
      setSuccessMsg(isEditing ? '¡Proyecto actualizado correctamente!' : '¡Proyecto guardado con éxito!');
      
      setTimeout(() => {
        onCancel(); // Volver al catálogo
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Ocurrió un error al guardar el proyecto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const yearsList = Array.from({ length: 16 }, (_, i) => 2011 + i);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-black text-slate-100 uppercase font-outfit flex items-center gap-2">
          <span>{isEditing ? '✏️' : '➕'}</span>
          <span>{isEditing ? 'EDITAR PROYECTO' : 'CARGAR NUEVO PROYECTO'}</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          {isEditing 
            ? 'Modifica los datos del proyecto y sincroniza los cambios en tiempo real.' 
            : 'Registra un nuevo proyecto socio-productivo en el repositorio digital.'}
        </p>
      </div>

      {/* Alertas */}
      {errorMsg && (
        <div className="p-4 bg-rose-950/80 border border-rose-500/60 rounded-xl text-rose-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
        
        {/* Fila 1: Título y Autor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Título del Proyecto *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Sistema de Monitoreo Ambiental con ESP32"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Autor(es) / Estudiante(s) *
            </label>
            <input
              type="text"
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Ej: Carlos Mendoza y Valeria Salazar"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>
        </div>

        {/* Fila 2: Año, Nivel y Mención */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Año Escolar *
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
            >
              {yearsList.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Nivel Académico *
            </label>
            <select
              value={studentYear}
              onChange={(e) => setStudentYear(e.target.value as AcademicYear)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
            >
              <option value="4to">Cuarto Año (4to)</option>
              <option value="5to">Quinto Año (5to)</option>
              <option value="6to">Sexto Año (6to)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Mención Técnica *
            </label>
            <select
              value={mention}
              onChange={(e) => setMention(e.target.value as Mention)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
            >
              {MENCIONES.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Fila 3: Tutor y Tipo de Sitio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Tutor/a Responsable *
            </label>
            <select
              value={tutor}
              onChange={(e) => setTutor(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
            >
              {TUTORES_DISPONIBLES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Tipo de Sitio *
            </label>
            <select
              value={physicalStatus}
              onChange={(e) => setPhysicalStatus(e.target.value as SiteType)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
            >
              <option value="digital">💻 Sitio Digital</option>
              <option value="physical">📦 Sitio Físico</option>
            </select>
          </div>
        </div>

        {/* Enlace opcional de Google Drive si es Digital */}
        {physicalStatus === 'digital' && (
          <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/40 space-y-1.5 transition-all">
            <label className="block text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <FolderGit2 className="w-4 h-4" />
              <span>Enlace de Carpeta Google Drive (Solo Proyectos Digitales)</span>
            </label>
            <input
              type="url"
              value={googleDriveUrl}
              onChange={(e) => setGoogleDriveUrl(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="w-full bg-slate-950 border border-blue-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-400"
            />
            <span className="text-[11px] text-blue-300/70">
              Permite a los usuarios acceder a planos, código fuente o presentaciones en la nube.
            </span>
          </div>
        )}

        {/* Estado de Aprobación */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Estado de Aprobación
          </label>
          {canApprove ? (
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
            >
              <option value="approved">✅ Aprobado</option>
              <option value="pending">⏳ En Revisión</option>
            </select>
          ) : (
            <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl text-xs text-amber-300 flex items-center justify-between">
              <span>Estado: <strong>⏳ En Revisión</strong></span>
              <span className="text-[11px] text-slate-400">Los profesores registran proyectos en revisión hasta su aprobación formal.</span>
            </div>
          )}
        </div>

        {/* Objetivo General */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Objetivo General del Proyecto *
          </label>
          <textarea
            required
            rows={3}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Propósito central y meta del proyecto socio-productivo..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Índice del Proyecto */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Índice del Proyecto *
          </label>
          <textarea
            required
            rows={4}
            value={projectIndex}
            onChange={(e) => setProjectIndex(e.target.value)}
            placeholder="Capítulo I: El Problema&#10;Capítulo II: Marco Teórico&#10;Capítulo III: Metodología..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono text-xs focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Palabras Clave */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Palabras Clave (Separadas por comas) *
          </label>
          <input
            type="text"
            required
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Ej: IoT, Arduino, Sensores, Sostenibilidad"
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Descripción Completa */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Descripción Detallada (Opcional)
          </label>
          <textarea
            rows={4}
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            placeholder="Detalles sobre metodología, impacto comunitario, beneficiarios y resultados..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Enlace PDF */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Enlace a Documento PDF (Opcional)
          </label>
          <input
            type="url"
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
            placeholder="https://ejemplo.com/informe-tecnico.pdf"
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-colors shadow-lg cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Guardando...' : (isEditing ? 'ACTUALIZAR PROYECTO' : 'GUARDAR PROYECTO')}</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>CANCELAR</span>
          </button>
        </div>

      </form>
    </div>
  );
};
