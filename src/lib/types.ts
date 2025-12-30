import type { User as FirebaseUser } from 'firebase/auth';

export interface User extends FirebaseUser {}

export type BudgetStatus = 'rascunho' | 'enviado' | 'aprovado' | 'recusado';

export interface Client {
  id: string;
  name: string;
  company?: string;
  phone?: string;
  email: string;
}

export interface BudgetItem {
  id: string;
  title: string;
  description: string;
  features: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
}

export interface BudgetOption {
  id: string;
  title: string;
  items: BudgetItem[];
  observations?: string;
  total: number;
}

export interface Budget {
  id: string;
  userId: string;
  budgetNumber: string;
  title: string;
  issueDate: string; // ISO 8601 format
  client: Client;
  responsible: string; // User's name or ID
  generalObservations?: string;
  options: BudgetOption[];
  status: BudgetStatus;
  quickLinks?: {
    whatsapp?: string;
    website?: string;
    signature?: string;
    payment?: string;
  };
  publicLink?: string;
  isPublic: boolean;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format;
}

export interface VisualSettings {
  userId: string;
  companyLogoUrl?: string;
  companyName?: string;
  primaryColor: string;
  backgroundColor: string;
  accentColor: string;
  fontFamily: string;
  customFooter?: string;
}
