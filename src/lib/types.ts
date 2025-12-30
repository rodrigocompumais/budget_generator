export interface User {
  id: string;
  email: string;
  displayName: string | null;
}

export type BudgetStatus = 'rascunho' | 'enviado' | 'aprovado' | 'recusado';
export type BillingCycle = 'mensal' | 'anual' | 'unico';

export interface ItemPrice {
  id: string;
  billingCycle: BillingCycle;
  value: number;
}

export interface Client {
  id: string;
  name: string;
  company?: string;
  phone?: string;
  email: string;
  userId?: string;
}

export interface BudgetItem {
  id: string;
  title: string;
  description: string;
  features: string;
  presentationLink?: string;
  quantity: number;
  prices: ItemPrice[]; // Multiple price points
  item_order?: number;
}

export interface BudgetOption {
  id: string;
  title: string;
  items: BudgetItem[];
  observations?: string;
  total: number;
  totalMensal?: number;
  totalAnual?: number;
  option_order?: number;
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
  qrCodeLink?: string; // Link específico que o usuário queira converter em QR Code (se vazio, usa o publicLink)
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
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
  showQrCode?: boolean; // Se deve mostrar o QR Code da proposta
}

// Quotation Module Types
export type QuotationStatus = 'aberta' | 'finalizada' | 'cancelada';

export interface QuotationItem {
  id: string;
  quotationId: string;
  title: string;
  description?: string;
  quantity: number;
  unit: string; // ex: un, kg, m
}

export interface Quotation {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: QuotationStatus;
  items: QuotationItem[];
  createdAt: string;
  updatedAt: string;
  publicLink: string;
}

export interface QuotationResponseItem {
  id: string;
  responseId: string;
  itemId: string;
  unitValue: number;
  observations?: string;
}

export interface QuotationResponse {
  id: string;
  quotationId: string;
  supplierName: string;
  supplierContact: string; // email or phone
  items: QuotationResponseItem[];
  createdAt: string;
}
