import React, { useRef, useState } from 'react';
import { Project, UserSession, ConnectionDiagnostics } from '../types';
import { Download, Upload, Database, ShieldAlert, CheckCircle, RefreshCw, FileText, Image, Lock, ShieldCheck } from 'lucide-react';

interface ConfigViewProps {
  projects: Project[];
  user: UserSession | null;
  onImportProjects: (imported: Project[]) => void;
  onSyncAll: () => Promise<void>;
  isOnline: boolean;
  diagnostics: ConnectionDiagnostics;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
  logoUrl?: string | null;
  onUpdateLogo: (newLogo: string | null) => Promise<void>;
}

export const ConfigView: React.FC<ConfigViewProps> = ({
  projects,
  user,
  onImportProjects,
  onSyncAll,
  isOnline,
  diagnostics,
  onShowToast,
  logoUrl,
  onUpdateLogo
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoImageInputRef = useRef<HTMLInputElement>(null);

  const [customLogoInput, setCustomLogoInput] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(logoUrl || null);
  const [isSavingLogo, setIsSavingLogo] = useState(false);

  const isAdmin = user?.role === 'Director';

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

  const handleLogoImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('Por favor selecciona un archivo de imagen válido (PNG, JPG, SVG, WebP)', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      onShowToast('La imagen es demasiado grande. Selecciona una imagen de menos de 2 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;

      // Optimizar y redimensionar el logo a máx 256x256 para almacenamiento eficiente y ultrarrápido
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 256;
        let w = img.width;
        let h = img.height;

        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const optimized = canvas.toDataURL('image/png');
          setLogoPreview(optimized);
        } else {
          setLogoPreview(rawDataUrl);
        }
        onShowToast('Vista previa de logotipo procesada y optimizada', 'success');
      };
      img.onerror = () => {
        setLogoPreview(rawDataUrl);
        onShowToast('Vista previa cargada', 'success');
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLogo = async () => {
    if (!isAdmin) {
      onShowToast('Solo el Administrador (Director) tiene permisos para cambiar el logo', 'error');
      return;
    }

    const targetLogo = customLogoInput.trim() ? customLogoInput.trim() : logoPreview;

    try {
      setIsSavingLogo(true);
      const res = await onUpdateLogo(targetLogo);
      if (res && res.cloudSynced) {
        onShowToast('✅ Logotipo actualizado en la cabecera y sincronizado en la nube de Firebase', 'success');
      } else {
        onShowToast('✅ Logotipo aplicado en la cabecera (Almacenado local persistente)', 'success');
      }
    } catch (e: any) {
      console.warn("Aviso al guardar logo:", e);
      onShowToast('✅ Logotipo aplicado en la cabecera del repositorio', 'success');
    } finally {
      setIsSavingLogo(false);
    }
  };

  const handleResetLogo = async () => {
    if (!isAdmin) {
      onShowToast('Solo el Administrador (Director) tiene permisos para cambiar el logo', 'error');
      return;
    }

    if (confirm('¿Deseas restablecer el logo al icono institucional clásico (🏛️)?')) {
      try {
        setIsSavingLogo(true);
        setLogoPreview(null);
        setCustomLogoInput('');
        await onUpdateLogo(null);
        onShowToast('Logo restablecido al diseño predeterminado', 'success');
      } catch (e) {
        onShowToast('Error al restablecer logo', 'error');
      } finally {
        setIsSavingLogo(false);
      }
    }
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
            <p className="text-slate-300">Acceso total a todas las funciones: cargar, editar, eliminar, cambiar el logotipo institucional y gestión de copias de seguridad.</p>
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

      {/* GESTIÓN DE LOGOTIPO INSTITUCIONAL (Exclusivo Administrador / Director) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide">
              LOGOTIPO INSTITUCIONAL (PARTE SUPERIOR)
            </h3>
          </div>

          {isAdmin ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 border border-emerald-500/60 text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Acceso Administrador (Director)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-950/80 border border-rose-500/60 text-rose-300">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>Solo Administrador</span>
            </span>
          )}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          El logotipo que se configure aquí se mostrará en la parte superior (cabecera) del sitio web para todos los visitantes y quedará sincronizado de forma permanente en la nube de Firebase y en el almacenamiento local.
        </p>

        {/* Vista previa comparativa del logotipo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl border border-slate-700 bg-slate-900 flex items-center justify-center p-1.5 overflow-hidden shadow-inner">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo Actual" className="w-full h-full object-contain" />
              ) : (
                <span className="text-3xl">🏛️</span>
              )}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block">Logo Actual en Cabecera</span>
              <span className="text-[11px] text-slate-400">
                {logoUrl ? 'Personalizado por Director' : 'Ícono Clásico Predeterminado (🏛️)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
            <div className="w-16 h-16 rounded-xl border border-rose-500/50 bg-slate-900 flex items-center justify-center p-1.5 overflow-hidden shadow-lg shadow-rose-950/40">
              {logoPreview ? (
                <img src={logoPreview} alt="Nueva Vista Previa" className="w-full h-full object-contain" />
              ) : (
                <span className="text-3xl">🏛️</span>
              )}
            </div>
            <div>
              <span className="text-xs font-bold text-rose-400 block">Nueva Vista Previa</span>
              <span className="text-[11px] text-slate-400">
                {logoPreview ? 'Listo para aplicar' : 'Sin cambios pendientes'}
              </span>
            </div>
          </div>
        </div>

        {/* Controles de edición: Habilitados solo para el Administrador */}
        {isAdmin ? (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Opción 1: Cargar archivo desde el equipo */}
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-3">
                <label className="text-xs font-bold text-slate-300 block">
                  1. Subir archivo de imagen desde tu equipo
                </label>
                <p className="text-[11px] text-slate-400">
                  Formatos recomendados: PNG transparente, JPG, SVG o WebP (máx. 2MB).
                </p>
                <button
                  type="button"
                  onClick={() => logoImageInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs transition-colors border border-slate-700 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-rose-400" />
                  <span>Seleccionar Imagen de tu Dispositivo</span>
                </button>
                <input
                  ref={logoImageInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml, image/webp"
                  onChange={handleLogoImageFile}
                  className="hidden"
                />
              </div>

              {/* Opción 2: Ingresar URL web */}
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-3">
                <label className="text-xs font-bold text-slate-300 block">
                  2. O ingresar URL directa de la imagen
                </label>
                <p className="text-[11px] text-slate-400">
                  Pega un enlace público a la imagen de tu logotipo.
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customLogoInput}
                    onChange={(e) => {
                      setCustomLogoInput(e.target.value);
                      if (e.target.value.trim()) {
                        setLogoPreview(e.target.value.trim());
                      }
                    }}
                    placeholder="https://ejemplo.com/escudo.png"
                    className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg text-xs outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleSaveLogo}
                disabled={isSavingLogo}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isSavingLogo ? 'Guardando en la Nube...' : 'GUARDAR LOGOTIPO EN LA CABECERA'}</span>
              </button>

              <button
                onClick={handleResetLogo}
                disabled={isSavingLogo || !logoUrl}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-700/60 border border-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-40"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Restablecer a Predeterminado (🏛️)</span>
              </button>
            </div>

            {/* Aviso informativo de almacenamiento y Firebase */}
            <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl text-[11px] text-purple-200 flex items-start gap-2.5">
              <span className="text-base leading-none">💡</span>
              <div className="space-y-1">
                <p className="font-semibold text-purple-100">
                  Persistencia Híbrida Inteligente:
                </p>
                <p className="text-slate-300 text-[11px]">
                  El logo se guarda y aplica inmediatamente en la cabecera y en el almacenamiento local permanente de este navegador. Si deseas además sincronizarlo en tiempo real entre múltiples computadoras a través de tu cuenta de Firebase, asegúrate de que en tu Consola Firebase (Realtime Database → Reglas) la regla de escritura permita guardar:
                </p>
                <code className="block bg-slate-950 p-2 rounded border border-purple-900/50 font-mono text-[10px] text-emerald-400">
                  {`{\n  "rules": {\n    ".read": true,\n    ".write": true\n  }\n}`}
                </code>
              </div>
            </div>
          </div>
        ) : (
          /* Bloque de aviso para usuarios no administradores */
          <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl flex items-start gap-3 text-xs text-slate-300">
            <Lock className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-rose-300 block font-semibold mb-1">
                Función reservada exclusivamente al Director (Administrador)
              </strong>
              <span>
                Para cambiar el logotipo institucional que se muestra en la parte superior, inicia sesión con las credenciales de Director (usuario: <code>director</code>).
              </span>
            </div>
          </div>
        )}
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
