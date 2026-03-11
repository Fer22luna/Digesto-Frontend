export type RegulationType =
  | 'DECREE'
  | 'RESOLUTION'
  | 'ORDINANCE'
  | 'TRIBUNAL_RESOLUTION'
  | 'BID';

export type WorkflowState = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';

export type LegalStatus = 'VIGENTE' | 'PARCIAL' | 'SIN_ESTADO';

export interface Regulation {
  id: string;
  type: RegulationType;
  specialNumber: string;
  publicationDate: Date;
  reference: string;
  title?: string;
  content: string;
  keywords: string[];
  pdfUrl?: string;
  fileUrl?: string;
  state: WorkflowState;
  legalStatus?: LegalStatus;
  stateHistory: StateTransition[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StateTransition {
  fromState: WorkflowState | null;
  toState: WorkflowState;
  timestamp: Date;
  userId: string;
  userRole: string;
  notes?: string;
}

export interface RegulationFilter {
  type?: RegulationType;
  dateFrom?: Date;
  dateTo?: Date;
  keywords?: string;
  searchText?: string;
  state?: WorkflowState;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'REVIEWER' | 'DIRECTOR' | 'VIEWER';
}

export interface BulletinDocument {
  id: string;
  // Removed municipality, department, location - now omitted from metadata
  issueDate: Date;
  regulationType: RegulationType;
  documentNumber: string;
  reference: string;
  title: string;
  subject: string;
  openingDetails: string;
  infoDetails: string;
  extraNotes?: string;
  signerName: string;
  signerRole: string;
  footerNote?: string;
  state: WorkflowState;
  stateHistory?: StateTransition[];
}
