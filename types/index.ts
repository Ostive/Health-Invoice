
export enum InvoiceStatus {
    DRAFT = 'Brouillon',
    SENT = 'Envoyée',
    PAID = 'Payée',
    LATE = 'En retard'
}

export type InvoiceTemplateId = 'modern' | 'classic' | 'minimalist' | 'elegant' | 'corporate';

export interface LineItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface Client {
    name: string;
    address: string;
    email: string;
    ssn?: string; // Numéro de sécurité sociale
}

export interface Folder {
    id: string;
    name: string;
    color?: string;
}

export interface Invoice {
    id: string;
    number: string;
    date: string;
    dueDate: string;
    client: Client;
    items: LineItem[];
    notes?: string;
    status: InvoiceStatus;
    template: InvoiceTemplateId;
    folderId?: string | null; // Link to a folder
}

// User Profile for Subscription and Invoice Customization
export interface UserProfile {
    id: string;
    email: string;
    is_pro: boolean;
    stripe_customer_id?: string;
    full_name?: string;
    specialty?: string;
    address?: string;
    phone?: string;
    siret?: string;
    adeli?: string;
    cancel_at_period_end?: boolean;
    current_period_end?: string;
}

// For Gemini Generation
export interface GeneratedInvoiceData {
    clientName: string;
    clientAddress?: string;
    items: {
        description: string;
        quantity: number;
        unitPrice: number;
    }[];
    notes?: string;
}
