import React from 'react';
import { Invoice, UserProfile } from '@/types';
import { ModernTemplate } from './ModernTemplate';
import { ClassicTemplate } from './ClassicTemplate';
import { MinimalistTemplate } from './MinimalistTemplate';
import { ElegantTemplate } from './ElegantTemplate';
import { CorporateTemplate } from './CorporateTemplate';

export interface InvoicePDFProps {
  invoice: Invoice;
  profile: Partial<UserProfile>;
}

// Helper function to get the appropriate template component (returns the Document element)
export const getInvoicePDFTemplate = (invoice: Invoice, profile: Partial<UserProfile>) => {
  const total = invoice.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const effectiveProfile = invoice.seller_snapshot || profile;
  const isVatApplicable = effectiveProfile.is_vat_applicable || false;
  const tva = isVatApplicable ? total * 0.20 : 0;

  const templateProps = {
    invoice,
    profile: effectiveProfile,
    total,
    tva,
  };

  // Each template component returns a Document, so we use React.createElement
  // Each template component returns a Document, so we use JSX
  switch (invoice.template) {
    case 'classic':
      return <ClassicTemplate {...templateProps} />;
    case 'minimalist':
      return <MinimalistTemplate {...templateProps} />;
    case 'elegant':
      return <ElegantTemplate {...templateProps} />;
    case 'corporate':
      return <CorporateTemplate {...templateProps} />;
    case 'modern':
    default:
      return <ModernTemplate {...templateProps} />;
  }
};

export * from './ModernTemplate';
export * from './ClassicTemplate';
export * from './MinimalistTemplate';
export * from './ElegantTemplate';
export * from './CorporateTemplate';
