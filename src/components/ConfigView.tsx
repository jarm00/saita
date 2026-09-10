import React, { useRef } from 'react';
import { Project, UserSession, ConnectionDiagnostics } from '../types';
import { Download, Upload, Database, ShieldAlert, CheckCircle, RefreshCw, FileText } from 'lucide-react';

interface ConfigViewProps {
  projects: Project[];
  user: UserSession | null;
  onImportProjects: (imported: Project[]) => void;
  onSyncAll: () => Promise<void>;
  isOnline: boolean;
  diagnostics: ConnectionDiagnostics;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const ConfigView: React.FC<ConfigViewProps> = ({
  projects,
  user,
  onImportProjects,
  onSyncAll,
  isOnline,
  diagnostics,
  onShowToast
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const total = projects.length;
  const approved = projects.filter(p => p.status === 'approved').length;
  const pending = projects.filter(p => p.status === 'pending').length;
  const digitalApproved = projects.filter(p => p.physicalStatus === 'digital' && p.status === 'approved').length;
  const digitalPending = projects.filter(p => p.physicalStatus === 'digital' && p.status === 'pending').length;
  const physicalApproved = projects.filter(p => p.physicalStatus === 'physical' && p.status === 'approved').length;
  const physicalPending = projects.filter(p => p.physicalStatus === 'physical' && p.status === 'pending').length;

  const handleExportJson = () => {
    if (projects.length === 0) {
      onShowToast('No hay proyectos para exportar', 'error');
      return;
    }

    try {
      const exportData = {
        fecha_creacion: new Date().toISOString(),
        total_proyectos: projects.length,
        proyectos: projects
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `repositorio_etrgc_backup_${timestamp}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      onShowToast(`Exportados ${projects.length} proyectos exitosamente`, 'success');
    } catch (e: any) {
      console.error(e);
      onShowToast('Error al exportar archivo JSON', 'error');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        let importedList: Project[] = [];
        if (Array.isArray(parsed)) {
          importedList = parsed;
        } else if (parsed && Array.isArray(parsed.proyectos)) {
          importedList = parsed.proyectos;
        } else {
          throw new Error('Formato JSON no válido');
        }

        const validList = importedList.filter(p => p.title && p.author);
        if (validList.length === 0) {
          throw new Error('No se encontraron proyectos válidos en el archivo');
        }

        if (confirm(`¿Deseas sincronizar los ${validList.length} proyectos importados con el repositorio?`)) {
          onImportProjects(validList);
          onShowToast(`Se importaron ${validList.length} proyectos correctamente`, 'success');
        }
      } catch (err: any) {
        console.error(err);
        onShowToast(err?.message || 'Error al procesar el archivo JSON', 'error');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-black text-slate-100 uppercase font-outfit flex items-center gap-2">
          <span>⚙️</span> CONFIGURACIÓN DEL REPOSITORIO
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Administración de base de datos, copias de seguridad e instrucciones de permisos institucionales.
        </p>
      </div>

      {/* Instrucciones de Acceso */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-purple-300 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-purple-400" />
          <span>INSTRUCCIONES DE NIVELES DE ACCESO</span>
        </h3>
        <p className="text-sm text-slate-300">
          El sistema cuenta con tres niveles de roles con privilegios diferenciados:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-rose-950/20 border-l-4 border-rose-500 space-y-1">
            <div className="font-bold text-rose-300 text-sm">🔴 Director</div>
            <p className="text-slate-300">Acceso total a todas las funciones: cargar, editar, eliminar, aprobar proyectos y gestión de copias de seguridad.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-950/20 border-l-4 border-amber-500 space-y-1">
            <div className="font-bold text-amber-300 text-sm">🟡 Coordinador</div>
            <p className="text-slate-300">Crear, editar y aprobar proyectos socio-productivos de todas las menciones.</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-950/20 border-l-4 border-emerald-500 space-y-1">
            <div className="font-bold text-emerald-300 text-sm">🟢 Profesor</div>
            <p className="text-slate-300">Crear proyectos de tutoría. Los proyectos quedan en revisión hasta aprobación del Director o Coordinador.</p>
          </div>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
          <Database className="w-5 h-5" />
          <span>ESTADÍSTICAS GENERALES DE PROYECTOS</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-950/30 border-l-4 border-blue-500 p-4 rounded-xl text-center">
            <div className="text-3xl font-black text-blue-400 font-outfit">{total}</div>
            <div className="text-xs text-slate-300 font-medium mt-1">Proyectos Totales</div>
          </div>
          <div className="bg-emerald-950/30 border-l-4 border-emerald-500 p-4 rounded-xl text-center">
            <div className="text-3xl font-black text-emerald-400 font-outfit">{approved}</div>
            <div className="text-xs text-slate-300 font-medium mt-1">Total Aprobados</div>
          </div>
          <div className="bg-amber-950/30 border-l-4 border-amber-500 p-4 rounded-xl text-center">
            <div className="text-3xl font-black text-amber-400 font-outfit">{pending}</div>
            <div className="text-xs text-slate-300 font-medium mt-1">En Revisión</div>
          </div>
        </div>

        {/* Desglose por Tipo */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Desglose por Tipo de Sitio
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-3">
              <div className="font-bold text-slate-200 text-sm">🌐 Sitios Digitales</div>
              <div className="flex gap-3">
                <div className="flex-1 bg-emerald-950/40 p-2.5 rounded-lg text-center">
                  <span className="text-lg font-bold text-emerald-400">{digitalApproved}</span>
                  <span className="text-[11px] text-slate-400 block">Aprobados</span>
                </div>
                <div className="flex-1 bg-amber-950/40 p-2.5 rounded-lg text-center">
                  <span className="text-lg font-bold text-amber-400">{digitalPending}</span>
                  <span className="text-[11px] text-slate-400 block">En Revisión</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-3">
              <div className="font-bold text-slate-200 text-sm">📦 Sitios Físicos</div>
              <div className="flex gap-3">
                <div className="flex-1 bg-emerald-950/40 p-2.5 rounded-lg text-center">
                  <span className="text-lg font-bold text-emerald-400">{physicalApproved}</span>
                  <span className="text-[11px] text-slate-400 block">Aprobados</span>
                </div>
                <div className="flex-1 bg-amber-950/40 p-2.5 rounded-lg text-center">
                  <span className="text-lg font-bold text-amber-400">{physicalPending}</span>
                  <span className="text-[11px] text-slate-400 block">En Revisión</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gestión de Datos y Copias de Seguridad */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <FileText className="w-5 h-5 text-rose-500" />
          <span>GESTIÓN DE DATOS Y RESPALDO</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Los proyectos se respaldan automáticamente en la nube (Firebase Realtime Database) y en el almacenamiento local de tu navegador (localStorage). Si no tienes conexión a internet, puedes seguir trabajando y exportar o importar tus datos en formato JSON en cualquier momento.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button
            onClick={handleExportJson}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>DESCARGAR ARCHIVO JSON</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>IMPORTAR DESDE ARCHIVO JSON</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>

        {/* Botón de Sincronización Manual con Firebase Cloud */}
        <div className="pt-2">
          <button
            onClick={async () => {
              try {
                await onSyncAll();
                onShowToast('Sincronización completa con Firebase Cloud', 'success');
              } catch (e: any) {
                onShowToast('Error al sincronizar con Firebase', 'error');
              }
            }}
            disabled={!isOnline}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Forzar Sincronización Completa con Firebase Cloud</span>
          </button>
        </div>

        {/* Resumen del Almacenamiento */}
        <div className="p-3 bg-blue-950/20 border border-blue-800/40 rounded-xl text-xs text-blue-300 flex items-center justify-between">
          <span>💾 {total} proyectos guardados en memoria y base de datos</span>
          <span className="font-semibold text-emerald-400">{isOnline ? '🟢 En línea y sincronizado' : '🔴 Modo Local offline'}</span>
        </div>
      </div>
    </div>
  );
};
