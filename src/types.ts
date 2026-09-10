export type SiteType = 'digital' | 'physical';
export type ProjectStatus = 'approved' | 'pending';
export type AcademicYear = '4to' | '5to' | '6to';
export type Mention = 'Administración' | 'Comercio' | 'Telemática' | 'Construcción Civil';

export interface Project {
  id: string;
  title: string;
  author: string;
  year: string | number;
  studentYear: AcademicYear | string;
  mention: Mention | string;
  tutor: string;
  projectIndex: string;
  objective: string;
  keywords: string;
  physicalStatus: SiteType;
  fullDescription?: string;
  pdfUrl?: string;
  status: ProjectStatus;
  googleDriveUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UserRole = 'Director' | 'Coordinador Academico' | 'Profesor';

export type UserPermission = 'upload' | 'edit' | 'delete' | 'config' | 'info';

export interface UserSession {
  username: string;
  role: UserRole;
  permissions: UserPermission[];
}

export type ConnectionState = 'online' | 'offline' | 'connecting';

export interface ConnectionDiagnostics {
  isBrowserOnline: boolean;
  isFirebaseConnected: boolean;
  databaseUrlConfigured: boolean;
  lastSyncTimestamp: number | null;
  rtdbLatencyMs: number | null;
  errorMessage?: string | null;
}
