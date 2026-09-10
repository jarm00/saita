import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, remove } from 'firebase/database';
import { Project, ConnectionDiagnostics } from '../types';

// Credenciales oficiales extraídas de la configuración del proyecto y de la consola Firebase Realtime Database
// NOTA IMPORTANTE: En el código original faltaba "databaseURL", lo que impedía la conexión con Firebase RTDB
export const firebaseConfig = {
  apiKey: "AIzaSyCU5Zm0vwW21FE2irdoFwOHd0pX2Q76OAE",
  authDomain: "saitama-1-cf1ba.firebaseapp.com",
  databaseURL: "https://saitama-1-cf1ba-default-rtdb.firebaseio.com", // <-- CLAVE CRÍTICA CORREGIDA
  projectId: "saitama-1-cf1ba",
  storageBucket: "saitama-1-cf1ba.firebasestorage.app",
  messagingSenderId: "296838614285",
  appId: "1:296838614285:web:27b939614496458c7f7444",
  measurementId: "G-3W50HD67S4"
};

// Inicialización segura del SDK de Firebase
let app: any = null;
let db: any = null;
let initError: string | null = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  db = getDatabase(app);
} catch (err: any) {
  console.error("Error al inicializar Firebase:", err);
  initError = err?.message || "Error al inicializar Firebase";
}

export const isFirebaseReady = () => !!db;

// Clave de almacenamiento local seguro
const LOCAL_STORAGE_KEY = 'etrgc_projects';

// Cargar proyectos desde LocalStorage
export function loadLocalProjects(): Project[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error al leer localStorage:", e);
    return [];
  }
}

// Guardar proyectos en LocalStorage
export function saveLocalProjects(projects: Project[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error("Error al guardar en localStorage:", e);
  }
}

/**
 * Suscribirse a la detección de conexión en tiempo real:
 * - Detecta el estado del navegador (navigator.onLine)
 * - Detecta el socket de Firebase Realtime Database (.info/connected)
 */
export function subscribeToConnectionState(
  onChange: (isOnline: boolean, diagnostics: ConnectionDiagnostics) => void
): () => void {
  let isBrowserOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  let isFirebaseConnected = false;
  let lastSync: number | null = null;
  let latency: number | null = null;
  let unsubscribeRtdb: (() => void) | null = null;

  const emit = () => {
    // Si el navegador no tiene internet, está 100% offline.
    // Si tiene internet y además Firebase está conectado, está online y sincronizado con la nube.
    // Si tiene internet pero Firebase se está reconectando o hay error de reglas, sigue teniendo red.
    const isOnline = isBrowserOnline && isFirebaseConnected;
    
    onChange(isOnline, {
      isBrowserOnline,
      isFirebaseConnected,
      databaseUrlConfigured: Boolean(firebaseConfig.databaseURL),
      lastSyncTimestamp: lastSync,
      rtdbLatencyMs: latency,
      errorMessage: initError
    });
  };

  const handleBrowserOnline = () => {
    isBrowserOnline = true;
    emit();
  };

  const handleBrowserOffline = () => {
    isBrowserOnline = false;
    isFirebaseConnected = false;
    emit();
  };

  window.addEventListener('online', handleBrowserOnline);
  window.addEventListener('offline', handleBrowserOffline);

  // Escuchar estado interno de conexión de Realtime Database (.info/connected)
  if (db) {
    try {
      const connectedRef = ref(db, '.info/connected');
      const startPing = Date.now();
      unsubscribeRtdb = onValue(connectedRef, (snap) => {
        const val = snap.val() === true;
        isFirebaseConnected = val;
        if (val) {
          latency = Date.now() - startPing;
          lastSync = Date.now();
        }
        emit();
      }, (error) => {
        console.warn("Advertencia en escucha de conexión Firebase:", error);
        isFirebaseConnected = false;
        emit();
      });
    } catch (e: any) {
      console.error("Error al suscribirse a .info/connected:", e);
      initError = e?.message || "Fallo en conexión RTDB";
      emit();
    }
  } else {
    emit();
  }

  return () => {
    window.removeEventListener('online', handleBrowserOnline);
    window.removeEventListener('offline', handleBrowserOffline);
    if (unsubscribeRtdb) unsubscribeRtdb();
  };
}

/**
 * Suscribirse a los proyectos en Firebase Realtime Database
 */
export function subscribeToFirebaseProjects(
  onProjectsUpdated: (projects: Project[]) => void,
  onError?: (err: any) => void
): () => void {
  if (!db) {
    const local = loadLocalProjects();
    onProjectsUpdated(local);
    return () => {};
  }

  const projectsRef = ref(db, 'proyectos');

  const unsubscribe = onValue(
    projectsRef,
    (snapshot) => {
      const data = snapshot.val();
      let list: Project[] = [];
      if (data) {
        if (Array.isArray(data)) {
          list = data.filter(Boolean);
        } else if (typeof data === 'object') {
          list = Object.values(data);
        }
      }
      
      // Sincronizar copia local como respaldo ante desconexión
      if (list.length > 0) {
        saveLocalProjects(list);
      } else {
        // Si la base de datos está vacía pero hay datos locales, usar locales
        const local = loadLocalProjects();
        if (local.length > 0) {
          list = local;
        }
      }
      
      onProjectsUpdated(list);
    },
    (err) => {
      console.warn("Error leyendo de Firebase, usando respaldo local:", err);
      const local = loadLocalProjects();
      onProjectsUpdated(local);
      if (onError) onError(err);
    }
  );

  return () => unsubscribe();
}

/**
 * Guardar o actualizar un proyecto
 */
export async function saveProject(project: Project): Promise<void> {
  // 1. Guardar siempre en local storage primero
  const current = loadLocalProjects();
  const existingIdx = current.findIndex(p => p.id === project.id);
  let updatedList: Project[];
  if (existingIdx !== -1) {
    updatedList = [...current];
    updatedList[existingIdx] = project;
  } else {
    updatedList = [project, ...current];
  }
  saveLocalProjects(updatedList);

  // 2. Si Firebase está disponible, guardar en la nube
  if (db && navigator.onLine) {
    try {
      const projectRef = ref(db, `proyectos/${project.id}`);
      await set(projectRef, project);
    } catch (error) {
      console.error("Error al persistir en Firebase RTDB:", error);
      throw error;
    }
  }
}

/**
 * Eliminar proyecto
 */
export async function deleteProject(projectId: string): Promise<void> {
  // 1. Eliminar de local storage
  const current = loadLocalProjects();
  const filtered = current.filter(p => p.id !== projectId);
  saveLocalProjects(filtered);

  // 2. Eliminar de Firebase RTDB si está disponible
  if (db && navigator.onLine) {
    try {
      const projectRef = ref(db, `proyectos/${projectId}`);
      await remove(projectRef);
    } catch (error) {
      console.error("Error eliminando de Firebase:", error);
      throw error;
    }
  }
}

/**
 * Sincronizar todos los proyectos locales a Firebase RTDB
 */
export async function syncAllProjects(projects: Project[]): Promise<void> {
  saveLocalProjects(projects);
  if (!db || !navigator.onLine) return;

  const dataObj: Record<string, Project> = {};
  projects.forEach(p => {
    dataObj[p.id] = p;
  });

  const projectsRef = ref(db, 'proyectos');
  await set(projectsRef, dataObj);
}
