import { Project, UserRole, UserPermission } from '../types';

export interface UserAccount {
  username: string;
  password: string;
  role: UserRole;
  permissions: UserPermission[];
}

export const USERS: Record<string, UserAccount> = {
  director: {
    username: 'director',
    password: 'ETRGC*Caracas#2026',
    role: 'Director',
    permissions: ['upload', 'edit', 'delete', 'config', 'info']
  },
  coordinador: {
    username: 'coordinador',
    password: 'ETRGC2026',
    role: 'Coordinador Academico',
    permissions: ['upload', 'edit', 'info']
  },
  profesor: {
    username: 'profesor',
    password: 'Profe2026',
    role: 'Profesor',
    permissions: ['upload']
  }
};

export const TUTORES_DISPONIBLES = [
  'Tutora Nubia González',
  'Profesora Yajaira Bolwine',
  'Profesor Gustavo Rodríguez'
];

export const MENCIONES = [
  'Administración',
  'Comercio',
  'Telemática',
  'Construcción Civil'
];

export const NIVELES = ['4to', '5to', '6to'];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Sistema Telemático de Monitorización Ambiental con Microcontrolador ESP32',
    author: 'Carlos Alberto Mendoza & Valeria Salazar',
    year: '2026',
    studentYear: '6to',
    mention: 'Telemática',
    tutor: 'Tutora Nubia González',
    physicalStatus: 'digital',
    status: 'approved',
    objective: 'Diseñar e implementar un prototipo telemático para la monitorización en tiempo real de temperatura, humedad y calidad de aire en aulas del Complejo Educativo Gran Colombia.',
    projectIndex: 'Capítulo I: El Problema.\nCapítulo II: Marco Teórico y Antecedentes.\nCapítulo III: Metodología y Selección de Sensores.\nCapítulo IV: Desarrollo del Circuito e Interfaz Web.\nCapítulo V: Conclusiones y Recomendaciones.',
    fullDescription: 'El proyecto aborda la necesidad de supervisar las condiciones microclimáticas en laboratorios de informática mediante nodos IoT de bajo consumo con protocolo MQTT y almacenamiento en la nube.',
    keywords: 'IoT, Arduino, ESP32, Sensores, Telemática, Telemetría, Automatización',
    googleDriveUrl: 'https://drive.google.com/drive/folders/ejemplo-proyecto-telematica',
    pdfUrl: 'https://ejemplo.com/informe-telematica-2026.pdf',
    createdAt: new Date().toISOString()
  },
  {
    id: 'proj-2',
    title: 'Plataforma Contable Digital para Gestión de Inventario en Pequeñas Empresas Comunales',
    author: 'Mariana Duque & Jorge Ramírez',
    year: '2025',
    studentYear: '5to',
    mention: 'Administración',
    tutor: 'Profesora Yajaira Bolwine',
    physicalStatus: 'digital',
    status: 'approved',
    objective: 'Desarrollar un sistema informatizado de control de entradas, salidas y valuación de inventario bajo normativa tributaria vigente para microempresas del circuito Santa Rosalía.',
    projectIndex: 'I. Diagnóstico de Necesidades Administrativas.\nII. Fundamentación Legal y Tributaria.\nIII. Diseño del Flujo Documental.\nIV. Implementación de Libros y Balances.\nV. Evaluación de Impacto.',
    fullDescription: 'Herramienta administrativa para simplificar el asiento contable y elaboración de estados financieros periódicos para emprendimientos comunitarios.',
    keywords: 'Administración, Contabilidad, Inventarios, Auditoría, Gestión',
    googleDriveUrl: 'https://drive.google.com/drive/folders/ejemplo-proyecto-administracion',
    createdAt: new Date().toISOString()
  },
  {
    id: 'proj-3',
    title: 'Maqueta Estructural Sismorresistente para Módulos Escolares E.T.R. G.C.',
    author: 'Andrés Eloy Blanco & Dayana Castillo',
    year: '2026',
    studentYear: '6to',
    mention: 'Construcción Civil',
    tutor: 'Profesor Gustavo Rodríguez',
    physicalStatus: 'physical',
    status: 'pending',
    objective: 'Construir un prototipo a escala 1:50 de estructura pórtico de concreto armado con disipadores de energía para optimizar la seguridad sísmica en edificaciones escolares.',
    projectIndex: '1. Introducción y Planteamiento Sísmico.\n2. Ensayos de Materiales y Cargas.\n3. Modelado y Planos Estructurales.\n4. Proceso de Encofrado y Vaciado a Escala.\n5. Pruebas de Vibración Libre.',
    fullDescription: 'Prototipo físico elaborado en taller de construcción civil con materiales compuestos que reproduce la respuesta mecánica ante eventos telúricos moderados en Caracas.',
    keywords: 'Construcción Civil, Sismorresistencia, Concreto Armado, Planos, Maqueta',
    createdAt: new Date().toISOString()
  }
];
