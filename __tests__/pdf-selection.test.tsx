import { getInvoicePDFTemplate } from '@/lib/pdf-templates';
import { InvoiceStatus } from '@/types';

// We mock the template components. 
// We return a simple string or object we can equality check, 
// OR we just check the 'type.name' of the returned element if not mocked fully.
// But mocking is safer to avoid importing heavy PDF libs.

jest.mock('@/lib/pdf-templates/ModernTemplate', () => ({
    ModernTemplate: () => 'ModernTemplateResult'
}));
jest.mock('@/lib/pdf-templates/ClassicTemplate', () => ({
    ClassicTemplate: () => 'ClassicTemplateResult'
}));
jest.mock('@/lib/pdf-templates/MinimalistTemplate', () => ({
    MinimalistTemplate: () => 'MinimalistTemplateResult'
}));
jest.mock('@/lib/pdf-templates/ElegantTemplate', () => ({
    ElegantTemplate: () => 'ElegantTemplateResult'
}));
jest.mock('@/lib/pdf-templates/CorporateTemplate', () => ({
    CorporateTemplate: () => 'CorporateTemplateResult'
}));

const mockInvoiceBase = {
    id: '123',
    date: '2023-01-01',
    dueDate: '2023-01-31',
    status: InvoiceStatus.DRAFT,
    items: [{ description: 'Test', quantity: 1, unitPrice: 100 }],
    client: { name: 'Client' },
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    userId: 'user1'
};

const mockProfile = {
    full_name: 'Dr Test'
};

describe('getInvoicePDFTemplate', () => {
    it('returns Modern template by default', () => {
        const invoice = { ...mockInvoiceBase };
        // @ts-ignore - template might be optional or string in some contexts
        delete invoice.template;

        const result = getInvoicePDFTemplate(invoice as any, mockProfile);
        // The result is a React Element. 
        // Because of the mock, the 'type' of the element will be the function we exported.
        // We can inspect result.type
        expect((result as any).type()).toBe('ModernTemplateResult');
    });

    it('returns Classic template when requested', () => {
        const invoice = { ...mockInvoiceBase, template: 'classic' };
        // @ts-ignore
        const result = getInvoicePDFTemplate(invoice, mockProfile);
        expect((result as any).type()).toBe('ClassicTemplateResult');
    });

    it('returns Minimalist template when requested', () => {
        const invoice = { ...mockInvoiceBase, template: 'minimalist' };
        // @ts-ignore
        const result = getInvoicePDFTemplate(invoice, mockProfile);
        expect((result as any).type()).toBe('MinimalistTemplateResult');
    });

    it('returns Elegant template when requested', () => {
        const invoice = { ...mockInvoiceBase, template: 'elegant' };
        // @ts-ignore
        const result = getInvoicePDFTemplate(invoice, mockProfile);
        expect((result as any).type()).toBe('ElegantTemplateResult');
    });

    it('returns Corporate template when requested', () => {
        const invoice = { ...mockInvoiceBase, template: 'corporate' };
        // @ts-ignore
        const result = getInvoicePDFTemplate(invoice, mockProfile);
        expect((result as any).type()).toBe('CorporateTemplateResult');
    });
});
