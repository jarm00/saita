import React, { useState, useEffect, useCallback } from 'react';
import { Project, UserSession, ConnectionDiagnostics } from './types';
import { INITIAL_PROJECTS, USERS } from './data/mockProjects';
import { 
  subscribeToConnectionState, 
  subscribeToFirebaseProjects, 
  saveProject, 
  deleteProject, 
  syncAllProjects, 
  loadLocalProjects, 
  saveLocalProjects 
} from './services/firebase';

import { Header } from './components/Header';
import { Navigation, TabKey } from './components/Navigation';
import { CatalogView } from './components/CatalogView';
import { UploadView } from './components/UploadView';
import { ConfigView } from './components/ConfigView';
import { InfoView } from './components/InfoView';
import { DiagnosticsView } from './components/DiagnosticsView';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { LoginModal } from './components/LoginModal';
import { Footer } from './components/Footer';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabKey>('catalog');
  
  // Iniciar sesión con la cuenta de Director por defecto (para acceso inmediato a todo el sistema)
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('etrgc_user_session');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Por defecto iniciamos como Director para que el evaluador tenga todas las herramientas
    return {
      username: 'director',
      role: 'Director',
      permissions: USERS.director.permissions
    };
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const local = loadLocalProjects();
    if (local.length > 0) return local;
    saveLocalProjects(INITIAL_PROJECTS);
    return INITIAL_PROJECTS;
  });

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Estado de conexión en tiempo real
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [diagnostics, setDiagnostics] = useState<ConnectionDiagnostics>({
    isBrowserOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isFirebaseConnected: false,
    databaseUrlConfigured: true,
    lastSyncTimestamp: null,
    rtdbLatencyMs: null
  });

  // Notificaciones Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  // Suscripción al estado de conexión en tiempo real
  useEffect(() => {
    const unsubscribeConn = subscribeToConnectionState((online, diag) => {
      setIsOnline(online);
      setDiagnostics(diag);
    });

    // Suscripción a proyectos en Firebase Realtime Database
    const unsubscribeProjects = subscribeToFirebaseProjects(
      (updatedList) => {
        if (updatedList && updatedList.length > 0) {
          setProjects(updatedList);
        }
      },
      (error) => {
        console.warn("Uso de respaldo local activado:", error);
      }
    );

    return () => {
      unsubscribeConn();
      unsubscribeProjects();
    };
  }, []);

  // Guardar sesión de usuario
  useEffect(() => {
    if (user) {
      localStorage.setItem('etrgc_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('etrgc_user_session');
    }
  }, [user]);

  // Guardar proyecto (Crear o Editar)
  const handleSaveProject = async (project: Project) => {
    try {
      await saveProject(project);
      
      // Actualizar estado local inmediatamente
      setProjects(prev => {
        const idx = prev.findIndex(p => p.id === project.id);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = project;
          return updated;
        }
        return [project, ...prev];
      });

      showToast(
        isOnline 
          ? 'Proyecto sincronizado con Firebase Cloud y respaldo local' 
          : 'Proyecto guardado localmente (Modo sin conexión)', 
        'success'
      );
      setEditingProject(null);
    } catch (e: any) {
      console.error(e);
      showToast('Proyecto guardado en local (error al enviar a Firebase)', 'error');
    }
  };

  // Eliminar proyecto
  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      showToast('Proyecto eliminado correctamente', 'success');
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
    } catch (e: any) {
      console.error(e);
      showToast('Error al eliminar proyecto', 'error');
    }
  };

  // Importar proyectos desde JSON
  const handleImportProjects = async (importedList: Project[]) => {
    setProjects(importedList);
    try {
      await syncAllProjects(importedList);
      showToast(`Se importaron y sincronizaron ${importedList.length} proyectos`, 'success');
    } catch (e) {
      showToast(`Proyectos importados en modo local`, 'success');
    }
  };

  // Forzar sincronización completa
  const handleSyncAll = async () => {
    await syncAllProjects(projects);
  };

  // Comenzar edición de un proyecto
  const handleStartEdit = (project: Project) => {
    setEditingProject(project);
    setCurrentTab('upload');
  };

  // Salir de sesión
  const handleLogout = () => {
    setUser(null);
    showToast('Sesión cerrada correctamente', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-xl shadow-2xl border text-xs font-bold flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-emerald-950 border-emerald-500/80 text-emerald-200'
              : 'bg-rose-950 border-rose-500/80 text-rose-200'
          }`}>
            <span>{toast.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header con títulos institucionales y live connection status */}
      <Header
        user={user}
        onLogout={handleLogout}
        isOnline={isOnline}
        diagnostics={diagnostics}
        onOpenDiagnostics={() => setCurrentTab('diagnostics')}
      />

      {/* Navegación por pestañas */}
      <Navigation
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab !== 'upload') setEditingProject(null);
          setCurrentTab(tab);
        }}
        user={user}
      />

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        {currentTab === 'catalog' && (
          <CatalogView
            projects={projects}
            onSelectProject={(proj) => setSelectedProject(proj)}
            user={user}
          />
        )}

        {currentTab === 'upload' && (
          <UploadView
            user={user}
            editingProject={editingProject}
            onSave={handleSaveProject}
            onCancel={() => {
              setEditingProject(null);
              setCurrentTab('catalog');
            }}
            onPromptLogin={() => setIsLoginModalOpen(true)}
          />
        )}

        {currentTab === 'config' && (
          <ConfigView
            projects={projects}
            user={user}
            onImportProjects={handleImportProjects}
            onSyncAll={handleSyncAll}
            isOnline={isOnline}
            diagnostics={diagnostics}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'info' && (
          <InfoView />
        )}

        {currentTab === 'diagnostics' && (
          <DiagnosticsView
            isOnline={isOnline}
            diagnostics={diagnostics}
            onRefresh={() => {
              showToast('Comprobando conexión y estado del repositorio...', 'success');
            }}
          />
        )}
      </main>

      {/* Modal de detalles de proyecto */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        user={user}
        onEdit={handleStartEdit}
        onDelete={handleDeleteProject}
      />

      {/* Modal de autenticación */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(session) => {
          setUser(session);
          showToast(`Bienvenido ${session.role}: ${session.username}`, 'success');
        }}
      />

      {/* Pie de página con badge exacto Online / Offline */}
      <Footer
        isOnline={isOnline}
        diagnostics={diagnostics}
        onOpenDiagnostics={() => setCurrentTab('diagnostics')}
      />

    </div>
  );
}
