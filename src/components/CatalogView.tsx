import React, { useState, useMemo } from 'react';
import { Project, UserSession } from '../types';
import { TUTORES_DISPONIBLES, MENCIONES } from '../data/mockProjects';
import { Search, Filter, FolderCheck, Clock, Monitor, Box, Tag, User, Calendar } from 'lucide-react';

interface CatalogViewProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  user: UserSession | null;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  projects,
  onSelectProject,
  user
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [mentionFilter, setMentionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [tutorFilter, setTutorFilter] = useState('');
  const [keywordFilter, setKeywordFilter] = useState('');

  // Estadísticas globales
  const stats = useMemo(() => {
    const total = projects.length;
    const digitalApproved = projects.filter(p => p.physicalStatus === 'digital' && p.status === 'approved').length;
    const digitalPending = projects.filter(p => p.physicalStatus === 'digital' && p.status === 'pending').length;
    const physicalApproved = projects.filter(p => p.physicalStatus === 'physical' && p.status === 'approved').length;
    const physicalPending = projects.filter(p => p.physicalStatus === 'physical' && p.status === 'pending').length;

    return { total, digitalApproved, digitalPending, physicalApproved, physicalPending };
  }, [projects]);

  // Filtrado de proyectos
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchSearch = !searchTerm || 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.author.toLowerCase().includes(searchTerm.toLowerCase());

      const matchYear = !yearFilter || String(p.year) === yearFilter;
      const matchLevel = !levelFilter || String(p.studentYear) === levelFilter;
      const matchMention = !mentionFilter || p.mention === mentionFilter;
      const matchType = !typeFilter || p.physicalStatus === typeFilter;
      const matchTutor = !tutorFilter || p.tutor === tutorFilter;
      const matchKeyword = !keywordFilter || (p.keywords && p.keywords.toLowerCase().includes(keywordFilter.toLowerCase()));

      return matchSearch && matchYear && matchLevel && matchMention && matchType && matchTutor && matchKeyword;
    });
  }, [projects, searchTerm, yearFilter, levelFilter, mentionFilter, typeFilter, tutorFilter, keywordFilter]);

  // Agrupación por categoría
  const categorized = useMemo(() => {
    return {
      digitalApproved: filteredProjects.filter(p => p.physicalStatus === 'digital' && p.status === 'approved'),
      digitalPending: filteredProjects.filter(p => p.physicalStatus === 'digital' && p.status === 'pending'),
      physicalApproved: filteredProjects.filter(p => p.physicalStatus === 'physical' && p.status === 'approved'),
      physicalPending: filteredProjects.filter(p => p.physicalStatus === 'physical' && p.status === 'pending')
    };
  }, [filteredProjects]);

  const yearsList = Array.from({ length: 16 }, (_, i) => 2011 + i);

  return (
    <div className="space-y-8">
      {/* Título de sección */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-wide text-slate-100 uppercase font-outfit flex items-center gap-2">
            <span>📚</span> CATÁLOGO DE PROYECTOS
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Explora y consulta los proyectos socio-productivos de la E.T.R. Complejo Educativo Gran Colombia.
          </p>
        </div>
      </div>

      {/* Panel de Estadísticas Globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mega Tarjeta Total */}
        <div className="bg-gradient-to-br from-purple-900/60 via-slate-900 to-rose-950/60 border border-purple-800/40 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-lg">
          <div className="text-5xl md:text-6xl font-black text-rose-400 font-outfit">
            {stats.total}
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-300 mt-2">
            PROYECTOS TOTALES
          </div>
        </div>

        {/* Sitio Digital */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
          <div className="flex items-center gap-2 text-sm font-bold text-blue-300">
            <Monitor className="w-4 h-4 text-blue-400" />
            <span>Sitio Digital</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border-l-4 border-emerald-500 rounded-xl p-3">
              <div className="text-2xl font-black text-emerald-400">{stats.digitalApproved}</div>
              <div className="text-xs text-slate-400 font-medium">Aprobados</div>
            </div>
            <div className="bg-slate-950/80 border-l-4 border-amber-500 rounded-xl p-3">
              <div className="text-2xl font-black text-amber-400">{stats.digitalPending}</div>
              <div className="text-xs text-slate-400 font-medium">En Revisión</div>
            </div>
          </div>
        </div>

        {/* Sitio Físico */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
            <Box className="w-4 h-4 text-amber-400" />
            <span>Sitio Físico</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border-l-4 border-emerald-500 rounded-xl p-3">
              <div className="text-2xl font-black text-emerald-400">{stats.physicalApproved}</div>
              <div className="text-xs text-slate-400 font-medium">Aprobados</div>
            </div>
            <div className="bg-slate-950/80 border-l-4 border-amber-500 rounded-xl p-3">
              <div className="text-2xl font-black text-amber-400">{stats.physicalPending}</div>
              <div className="text-xs text-slate-400 font-medium">En Revisión</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Filtros y Búsqueda */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-base border-b border-slate-800 pb-3">
          <Search className="w-4 h-4" />
          <h3>Buscar y Filtrar Proyectos</h3>
        </div>

        {/* Barra de búsqueda principal */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
            Título o Autor
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título de proyecto o nombre de autor..."
              className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>
        </div>

        {/* Filtros en Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
              Año
            </label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="">Todos los años</option>
              {yearsList.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
              Nivel Académico
            </label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="">Todos los niveles</option>
              <option value="4to">Cuarto Año</option>
              <option value="5to">Quinto Año</option>
              <option value="6to">Sexto Año</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
              Mención
            </label>
            <select
              value={mentionFilter}
              onChange={(e) => setMentionFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="">Todas las menciones</option>
              {MENCIONES.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
              Tipo de Sitio
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="">Todos los tipos</option>
              <option value="digital">Sitio Digital</option>
              <option value="physical">Sitio Físico</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
              Tutor/a Responsable
            </label>
            <select
              value={tutorFilter}
              onChange={(e) => setTutorFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="">Todos los tutores</option>
              {TUTORES_DISPONIBLES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
              Palabras Clave
            </label>
            <input
              type="text"
              value={keywordFilter}
              onChange={(e) => setKeywordFilter(e.target.value)}
              placeholder="Ej: IoT, Arduino, Maqueta..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Limpiar filtros */}
        {(searchTerm || yearFilter || levelFilter || mentionFilter || typeFilter || tutorFilter || keywordFilter) && (
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setYearFilter('');
                setLevelFilter('');
                setMentionFilter('');
                setTypeFilter('');
                setTutorFilter('');
                setKeywordFilter('');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline cursor-pointer"
            >
              Restablecer todos los filtros
            </button>
          </div>
        )}
      </div>

      {/* Listado Categorizado de Proyectos */}
      <div className="space-y-8">
        {filteredProjects.length === 0 ? (
          <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
            <p className="text-lg text-purple-300 font-medium">
              No hay proyectos que coincidan con los criterios de búsqueda
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Prueba cambiando o limpiando los filtros seleccionados arriba.
            </p>
          </div>
        ) : (
          <>
            {/* 1. Digitales Aprobados */}
            {categorized.digitalApproved.length > 0 && (
              <CategorySection
                title="Sitio Digital Aprobados"
                badgeText="✅ APROBADO"
                color="emerald"
                count={categorized.digitalApproved.length}
                projects={categorized.digitalApproved}
                onSelectProject={onSelectProject}
              />
            )}

            {/* 2. Digitales En Revisión */}
            {categorized.digitalPending.length > 0 && (
              <CategorySection
                title="Sitio Digital en Revisión"
                badgeText="⏳ EN REVISIÓN"
                color="amber"
                count={categorized.digitalPending.length}
                projects={categorized.digitalPending}
                onSelectProject={onSelectProject}
              />
            )}

            {/* 3. Físicos Aprobados */}
            {categorized.physicalApproved.length > 0 && (
              <CategorySection
                title="Sitio Físico Aprobados"
                badgeText="✅ APROBADO"
                color="emerald"
                count={categorized.physicalApproved.length}
                projects={categorized.physicalApproved}
                onSelectProject={onSelectProject}
              />
            )}

            {/* 4. Físicos En Revisión */}
            {categorized.physicalPending.length > 0 && (
              <CategorySection
                title="Sitio Físico en Revisión"
                badgeText="⏳ EN REVISIÓN"
                color="amber"
                count={categorized.physicalPending.length}
                projects={categorized.physicalPending}
                onSelectProject={onSelectProject}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

interface CategorySectionProps {
  title: string;
  badgeText: string;
  color: 'emerald' | 'amber';
  count: number;
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  badgeText,
  color,
  count,
  projects,
  onSelectProject
}) => {
  const headerGradient = color === 'emerald'
    ? 'from-emerald-700 to-teal-800'
    : 'from-amber-600 to-orange-700';

  return (
    <div className="space-y-4">
      {/* Cabecera de Categoría */}
      <div className={`flex items-center justify-between px-5 py-3 rounded-xl bg-gradient-to-r ${headerGradient} shadow-md`}>
        <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
          <span>{badgeText.includes('APROBADO') ? '✅' : '⏳'}</span>
          <span>{title}</span>
        </h3>
        <span className="px-2.5 py-0.5 bg-black/30 rounded-full text-xs font-black text-white">
          {count}
        </span>
      </div>

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onSelect={() => onSelectProject(project)}
          />
        ))}
      </div>
    </div>
  );
};

interface ProjectCardProps {
  project: Project;
  onSelect: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  const isApproved = project.status === 'approved';
  const isDigital = project.physicalStatus === 'digital';

  return (
    <div
      onClick={onSelect}
      className={`group bg-slate-900/90 hover:bg-slate-800/90 border-l-4 rounded-xl p-5 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex flex-col justify-between ${
        isApproved ? 'border-emerald-500' : 'border-amber-500'
      }`}
    >
      <div className="space-y-3">
        {/* Título y Badge */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-base font-bold text-slate-100 group-hover:text-rose-400 transition-colors line-clamp-2">
            {project.title}
          </h4>
          <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            isApproved 
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40' 
              : 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
          }`}>
            {isApproved ? 'APROBADO' : 'EN REVISIÓN'}
          </span>
        </div>

        {/* Metadatos en Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-purple-950/20 border-l-2 border-purple-400 p-2 rounded">
            <span className="text-[10px] text-purple-300/80 block">📝 Autor/a</span>
            <span className="font-medium text-slate-200 truncate block">{project.author}</span>
          </div>

          <div className="bg-purple-950/20 border-l-2 border-purple-400 p-2 rounded">
            <span className="text-[10px] text-purple-300/80 block">📅 Año</span>
            <span className="font-medium text-slate-200">{project.year}</span>
          </div>

          <div className="bg-purple-950/20 border-l-2 border-purple-400 p-2 rounded">
            <span className="text-[10px] text-purple-300/80 block">🎓 Nivel</span>
            <span className="font-medium text-slate-200">{project.studentYear || 'N/A'}</span>
          </div>

          <div className="bg-purple-950/20 border-l-2 border-purple-400 p-2 rounded">
            <span className="text-[10px] text-purple-300/80 block">👨‍🏫 Tutor</span>
            <span className="font-medium text-slate-200 truncate block">
              {project.tutor.replace('Tutora ', '').replace('Profesor ', '').replace('Profesora ', '')}
            </span>
          </div>
        </div>

        {/* Tipo de Sitio */}
        <div className="p-2 bg-blue-950/20 border-l-2 border-blue-500 rounded text-xs flex items-center justify-between">
          <span className="text-blue-300 font-semibold">🌐 Tipo:</span>
          <span className="text-slate-300">{isDigital ? '💻 Sitio Digital' : '📦 Sitio Físico'}</span>
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-rose-300 transition-colors">
        <span>→ Haz clic para ver detalles</span>
        <span className="text-[10px] text-slate-400">{project.mention || ''}</span>
      </div>
    </div>
  );
};
