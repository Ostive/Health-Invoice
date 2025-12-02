'use client'

import React, { useEffect, useRef, useState } from 'react';
import { Invoice, InvoiceStatus, UserProfile, LineItem } from '../types/index';

interface InvoicePreviewProps {
  invoice: Invoice;
  userProfile?: UserProfile | null;
  isExporting?: boolean;
}

// Constants for A4 sizing (at 96 DPI, 1mm approx 3.78px)
// Width: 210mm ~ 794px
// Height: 297mm ~ 1123px
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MM_TO_PX = 3.78; // Conversion factor at 96 DPI
const ITEMS_PER_PAGE = 12; // Safe limit to prevent overflow before we implement complex height measurement

// Default profile data
const defaultProfile: Partial<UserProfile> = {
  full_name: 'Dr. Martin Dupont',
  specialty: "Infirmier Diplômé d'État",
  address: '123 Avenue de la République\n75011 Paris',
  adeli: '75 1 23456 7',
  siret: '123 456 789 00000'
};

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, userProfile, isExporting }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const profile = { ...defaultProfile, ...userProfile };

  // Calculate pagination
  const pages = [];
  const items = invoice.items;

  if (items.length === 0) {
    pages.push([]);
  } else {
    for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
      pages.push(items.slice(i, i + ITEMS_PER_PAGE));
    }
  }

  // Calculate Totals
  const total = invoice.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const tva = total * 0.0;

  // Handle Scaling for "Zoom to Fit" behavior on small screens
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.parentElement?.clientWidth || window.innerWidth;
        // 794px is roughly 210mm. We add some buffer for margins/shadows.
        const a4WidthPx = 794;
        const availableWidth = parentWidth - 32; // 32px padding

        let newScale = availableWidth / a4WidthPx;
        if (newScale > 1) newScale = 1; // Don't scale up, max 100%

        setScale(newScale);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderTemplate = (pageItems: LineItem[], pageIndex: number, totalPages: number) => {
    const isLastPage = pageIndex === totalPages - 1;
    const props = {
      invoice: { ...invoice, items: pageItems }, // Pass only current page items
      total,
      tva,
      profile,
      isLastPage,
      pageIndex: pageIndex + 1,
      totalPages
    };

    switch (invoice.template) {
      case 'classic': return <ClassicTemplate {...props} />;
      case 'minimalist': return <MinimalistTemplate {...props} />;
      case 'elegant': return <ElegantTemplate {...props} />;
      case 'corporate': return <CorporateTemplate {...props} />;
      case 'modern':
      default: return <ModernTemplate {...props} />;
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center w-full pt-4">
      {/* Scale Wrapper */}
      <div
        id="invoice-preview" // Target for HTML2PDF
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          width: '210mm', // Strictly force A4 width
          marginBottom: `${pages.length * A4_HEIGHT_MM * MM_TO_PX * (scale - 1)}px` // Compensate for scale shrinkage
        }}
        className="transition-transform duration-200 ease-out"
      >
        {pages.map((pageItems, index) => (
          <div
            key={index}
            className={`
                        bg-white mx-auto relative overflow-hidden
                        ${isExporting ? 'mb-0 shadow-none' : 'mb-1 shadow-xl'}
                        print:shadow-none print:mb-0 ${index < pages.length - 1 ? 'print:break-after-page' : ''}
                    `}
            style={{
              width: '210mm',
              height: '297mm', // Strictly force A4 height per page
              padding: '0', // Templates handle padding
            }}
          >
            {/* Page Content */}
            {renderTemplate(pageItems, index, pages.length)}

            {/* LATE Stamp (Only on first page) */}
            {index === 0 && invoice.status === InvoiceStatus.LATE && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 overflow-hidden">
                <div className="border-[8px] border-red-500/30 text-red-500/30 text-[120px] font-bold uppercase -rotate-45 p-10 rounded-3xl mix-blend-multiply select-none whitespace-nowrap">
                  EN RETARD
                </div>
              </div>
            )}

            {/* Page Number */}
            <div className="absolute bottom-4 right-8 text-[10px] text-slate-400 print:hidden">
              Page {index + 1} / {pages.length}
            </div>
          </div>
        ))}
      </div>


    </div>
  );
};

// --- TEMPLATES (Fixed Layouts - No Flex-Col) ---

interface TemplateProps {
  invoice: Invoice;
  total: number;
  tva: number;
  profile: Partial<UserProfile>;
  isLastPage: boolean;
  pageIndex: number;
  totalPages: number;
}

const ModernTemplate: React.FC<TemplateProps> = ({ invoice, total, tva, profile, isLastPage }) => (
  <div className="p-[40px] h-full flex flex-col relative text-sm">
    {/* Header */}
    <div className="flex flex-row justify-between items-start border-b border-slate-200 pb-6 mb-6">
      <div className="w-1/2">
        <h1 className="text-2xl font-bold text-primary-700 mb-2">FACTURIER SOIGNANT</h1>
        <p className="font-medium text-base text-slate-900">{profile.full_name}</p>
        <p className="text-slate-500 text-xs">{profile.specialty}</p>
        <p className="text-slate-500 text-xs whitespace-pre-line">{profile.address}</p>
        {profile.adeli && <p className="text-slate-500 text-xs">N° ADELI: {profile.adeli}</p>}
        {profile.siret && <p className="text-slate-500 text-[10px] mt-1">SIRET: {profile.siret}</p>}
      </div>
      <div className="w-1/2 text-right">
        <h2 className="text-3xl font-light text-slate-900 mb-2">FACTURE</h2>
        <p className="text-slate-500">N° {invoice.number}</p>
        <p className="text-slate-500">Date: {new Date(invoice.date).toLocaleDateString()}</p>
        <div className={`mt-4 inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
          ${invoice.status === InvoiceStatus.PAID ? 'bg-green-100 text-green-800' :
            invoice.status === InvoiceStatus.LATE ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>
          {invoice.status}
        </div>
      </div>
    </div>

    {/* Client Info */}
    <div className="mb-8 pl-4 border-l-4 border-primary-100">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Facturer à</h3>
      <div className="text-base font-medium text-slate-900">{invoice.client.name}</div>
      <div className="text-slate-600 text-sm whitespace-pre-line">{invoice.client.address}</div>
      {invoice.client.email && <div className="text-slate-600 text-sm">{invoice.client.email}</div>}
      {invoice.client.ssn && <div className="text-slate-600 text-sm mt-1">N° Sécu: {invoice.client.ssn}</div>}
    </div>

    {/* Items Table */}
    <div className="flex-grow">
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b border-slate-300">
            <th className="text-left py-2 font-semibold text-slate-600 text-xs">Description</th>
            <th className="text-right py-2 font-semibold text-slate-600 text-xs w-16">Qté</th>
            <th className="text-right py-2 font-semibold text-slate-600 text-xs w-24">Prix Unit.</th>
            <th className="text-right py-2 font-semibold text-slate-600 text-xs w-24">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id} className="border-b border-slate-100 last:border-0">
              <td className="py-3 text-slate-800">{item.description}</td>
              <td className="py-3 text-right text-slate-600">{item.quantity}</td>
              <td className="py-3 text-right text-slate-600">{item.unitPrice.toFixed(2)} €</td>
              <td className="py-3 text-right font-medium text-slate-900">{(item.quantity * item.unitPrice).toFixed(2)} €</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Totals (Only on last page) */}
    {isLastPage && (
      <div className="flex justify-end mb-12">
        <div className="w-1/2 md:w-5/12">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-600">Sous-total</span>
            <span className="font-medium">{total.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-600">TVA (0%)</span>
            <span className="font-medium">{tva.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between py-3 text-lg font-bold text-primary-800">
            <span>Total à payer</span>
            <span>{(total + tva).toFixed(2)} €</span>
          </div>
        </div>
      </div>
    )}

    {/* Footer */}
    <div className="mt-auto pt-6 border-t border-slate-200 text-[10px] text-slate-400 text-center">
      {isLastPage && invoice.notes && (
        <p className="mb-2 text-slate-600 italic">{invoice.notes}</p>
      )}
      <p>TVA non applicable, art. 293 B du CGI ou soins exonérés art. 261 du CGI.</p>
      {!profile.is_pro && <p>Généré par Facturier Soignant AI</p>}
    </div>
  </div>
);

const ClassicTemplate: React.FC<TemplateProps> = ({ invoice, total, tva, profile, isLastPage }) => (
  <div className="p-[50px] h-full flex flex-col font-serif text-slate-900 text-sm">
    <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
      <h1 className="text-3xl font-bold uppercase tracking-widest mb-2">Facture</h1>
      <div className="text-sm">
        <p className="font-bold text-base">{profile.full_name}</p>
        <p className="italic">{profile.specialty}</p>
        <p>{profile.address}</p>
      </div>
    </div>

    <div className="flex flex-row justify-between mb-8 gap-8">
      <div className="border border-slate-300 p-4 w-5/12">
        <h3 className="font-bold border-b border-slate-300 pb-1 mb-2 uppercase text-[10px]">Client</h3>
        <p className="font-bold">{invoice.client.name}</p>
        <p className="whitespace-pre-line text-xs">{invoice.client.address}</p>
      </div>
      <div className="text-right w-5/12 pt-2">
        <p><span className="font-bold">Numéro:</span> {invoice.number}</p>
        <p><span className="font-bold">Date:</span> {new Date(invoice.date).toLocaleDateString()}</p>
      </div>
    </div>

    <div className="flex-grow">
      <table className="w-full mb-8 border-collapse border border-slate-800">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-800 p-2 text-left font-bold uppercase text-[10px]">Description</th>
            <th className="border border-slate-800 p-2 text-center font-bold uppercase text-[10px] w-16">Qté</th>
            <th className="border border-slate-800 p-2 text-right font-bold uppercase text-[10px] w-24">Prix U.</th>
            <th className="border border-slate-800 p-2 text-right font-bold uppercase text-[10px] w-24">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id}>
              <td className="border border-slate-800 p-2">{item.description}</td>
              <td className="border border-slate-800 p-2 text-center">{item.quantity}</td>
              <td className="border border-slate-800 p-2 text-right">{item.unitPrice.toFixed(2)}</td>
              <td className="border border-slate-800 p-2 text-right">{(item.quantity * item.unitPrice).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {isLastPage && (
      <div className="flex justify-end mb-8">
        <div className="w-5/12 border border-slate-800">
          <div className="flex justify-between p-2 border-b border-slate-800 bg-slate-50">
            <span className="font-bold">Total HT</span>
            <span>{total.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between p-2 bg-slate-800 text-white font-bold text-base">
            <span>Net à Payer</span>
            <span>{(total + tva).toFixed(2)} €</span>
          </div>
        </div>
      </div>
    )}

    <div className="mt-auto text-center text-[10px] italic pt-4 border-t border-slate-300">
      {isLastPage && invoice.notes && <p className="mb-2 font-normal not-italic">{invoice.notes}</p>}
      <p>Dispensé d'immatriculation au registre du commerce et des sociétés (RCS) et au répertoire des métiers (RM).</p>
    </div>
  </div>
);

const MinimalistTemplate: React.FC<TemplateProps> = ({ invoice, total, tva, profile, isLastPage }) => (
  <div className="p-[60px] h-full flex flex-col font-sans text-slate-900 text-sm">
    <div className="flex flex-row justify-between items-baseline mb-16">
      <div className="text-5xl font-light tracking-tighter">Facture.</div>
      <div className="text-right text-xs text-slate-500">
        <p className="text-base text-slate-900">{invoice.number}</p>
        <p>{new Date(invoice.date).toLocaleDateString()}</p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-12 mb-16">
      <div>
        <h4 className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">Émetteur</h4>
        <p className="font-semibold text-base">{profile.full_name}</p>
        <p className="text-slate-600 whitespace-pre-line text-xs">{profile.address}</p>
      </div>
      <div>
        <h4 className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">Destinataire</h4>
        <p className="font-semibold text-base">{invoice.client.name}</p>
        <p className="text-slate-600 whitespace-pre-line text-xs">{invoice.client.address}</p>
      </div>
    </div>

    <div className="flex-grow">
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b border-black">
            <th className="text-left py-2 font-medium text-xs">Description</th>
            <th className="text-right py-2 font-medium text-xs w-16">Qté</th>
            <th className="text-right py-2 font-medium text-xs w-24">Prix</th>
            <th className="text-right py-2 font-medium text-xs w-24">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id} className="border-b border-slate-100">
              <td className="py-3">{item.description}</td>
              <td className="py-3 text-right text-slate-500">{item.quantity}</td>
              <td className="py-3 text-right text-slate-500">{item.unitPrice.toFixed(2)}</td>
              <td className="py-3 text-right">{(item.quantity * item.unitPrice).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {isLastPage && (
      <div className="flex justify-end mb-12">
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-1">Total (EUR)</p>
          <p className="text-4xl font-light">{(total + tva).toFixed(2)}</p>
        </div>
      </div>
    )}

    <div className="mt-auto pt-4">
      {isLastPage && invoice.notes && <p className="text-xs text-slate-500 mb-4">{invoice.notes}</p>}
      <div className="h-1 w-12 bg-black mb-2"></div>
      {!profile.is_pro && <p className="text-[10px] text-slate-400">Facturier Soignant AI</p>}
    </div>
  </div>
);

const ElegantTemplate: React.FC<TemplateProps> = ({ invoice, total, tva, profile, isLastPage }) => (
  <div className="p-[40px] h-full flex flex-col font-elegant text-slate-800 bg-[#fffdf9] text-sm">
    <div className="text-center mb-10">
      <div className="inline-block border-b-2 border-gold-400 pb-2 mb-2">
        <h1 className="text-4xl italic font-bold text-slate-900 tracking-wider">Facture</h1>
      </div>
      <p className="text-gold-600 text-[10px] uppercase tracking-[0.3em]">Professionnel de Santé</p>
    </div>

    <div className="text-center mb-10 text-slate-600 font-sans text-xs leading-relaxed">
      <p className="font-bold text-slate-900 text-base">{profile.full_name}</p>
      <p>{profile.specialty}</p>
      <p>{profile.address}</p>
    </div>

    <div className="flex flex-row justify-between items-end mb-8 pb-4 border-b border-slate-200 gap-6">
      <div className="w-1/2">
        <p className="text-[10px] text-gold-500 uppercase tracking-widest mb-1">Adressé à</p>
        <h3 className="text-xl font-serif italic">{invoice.client.name}</h3>
        <p className="text-xs text-slate-500 whitespace-pre-line mt-1 font-sans">{invoice.client.address}</p>
      </div>
      <div className="text-right font-sans w-1/2">
        <p><span className="text-gold-600 font-semibold">Réf:</span> {invoice.number}</p>
        <p><span className="text-gold-600 font-semibold">Date:</span> {new Date(invoice.date).toLocaleDateString()}</p>
      </div>
    </div>

    <div className="flex-grow">
      <table className="w-full mb-8">
        <thead>
          <tr>
            <th className="text-left py-2 font-normal text-gold-600 italic text-base border-b border-gold-200">Désignation</th>
            <th className="text-center py-2 font-sans font-bold text-[10px] text-slate-400 uppercase tracking-wider w-16 border-b border-gold-200">Qté</th>
            <th className="text-right py-2 font-sans font-bold text-[10px] text-slate-400 uppercase tracking-wider w-24 border-b border-gold-200">Prix</th>
            <th className="text-right py-2 font-sans font-bold text-[10px] text-slate-400 uppercase tracking-wider w-24 border-b border-gold-200">Montant</th>
          </tr>
        </thead>
        <tbody className="font-sans">
          {invoice.items.map((item) => (
            <tr key={item.id}>
              <td className="py-3 border-b border-slate-100 text-slate-700">{item.description}</td>
              <td className="py-3 border-b border-slate-100 text-center text-slate-500">{item.quantity}</td>
              <td className="py-3 border-b border-slate-100 text-right text-slate-500">{item.unitPrice.toFixed(2)}</td>
              <td className="py-3 border-b border-slate-100 text-right font-medium text-slate-800">{(item.quantity * item.unitPrice).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {isLastPage && (
      <div className="flex justify-end font-sans mb-12">
        <div className="w-64 bg-slate-50 p-4 rounded-lg border border-slate-100">
          <div className="flex justify-between mb-1 text-slate-600 text-xs">
            <span>Total HT</span>
            <span>{total.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
            <span className="text-gold-600 font-bold text-base font-serif italic">Total</span>
            <span className="text-lg font-bold text-slate-900">{(total + tva).toFixed(2)} €</span>
          </div>
        </div>
      </div>
    )}

    <div className="mt-auto pt-6 text-center">
      <div className="w-12 h-px bg-gold-400 mx-auto mb-2"></div>
      <p className="text-[10px] font-serif italic text-slate-500">Merci de votre confiance.</p>
    </div>
  </div>
);

const CorporateTemplate: React.FC<TemplateProps> = ({ invoice, total, tva, profile, isLastPage }) => (
  <div className="h-full flex flex-col font-corporate text-slate-800 bg-white text-sm">
    <div className="bg-slate-900 text-white p-[40px] flex flex-row justify-between items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">FACTURE</h1>
        <p className="text-slate-400 text-xs uppercase tracking-widest">N° {invoice.number}</p>
      </div>
      <div className="text-right">
        <p className="text-xl font-bold">{invoice.client.name}</p>
        <p className="text-slate-400 text-xs mt-1">{new Date().getFullYear()}</p>
      </div>
    </div>

    <div className="p-[40px] flex-grow flex flex-col">
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <h3 className="text-[10px] font-bold text-slate-900 uppercase mb-2 border-b-2 border-slate-900 pb-1 inline-block">Émetteur</h3>
          <p className="font-bold text-base">{profile.full_name}</p>
          <p className="text-slate-600 text-xs whitespace-pre-line">{profile.address}</p>
          {profile.siret && <p className="text-slate-600 text-[10px] mt-1">SIRET: {profile.siret}</p>}
        </div>
        <div>
          <h3 className="text-[10px] font-bold text-slate-900 uppercase mb-2 border-b-2 border-slate-900 pb-1 inline-block">Adressé à</h3>
          <p className="font-bold text-base">{invoice.client.name}</p>
          <p className="text-slate-600 text-xs whitespace-pre-line">{invoice.client.address}</p>
        </div>
      </div>

      <div className="flex-grow">
        <table className="w-full mb-8">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left py-2 px-3 font-bold text-slate-900 uppercase text-[10px] tracking-wider">Description</th>
              <th className="text-right py-2 px-3 font-bold text-slate-900 uppercase text-[10px] tracking-wider w-16">Qté</th>
              <th className="text-right py-2 px-3 font-bold text-slate-900 uppercase text-[10px] tracking-wider w-24">Prix Unit.</th>
              <th className="text-right py-2 px-3 font-bold text-slate-900 uppercase text-[10px] tracking-wider w-24">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.items.map((item, idx) => (
              <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                <td className="py-2 px-3 text-slate-800 font-medium">{item.description}</td>
                <td className="py-2 px-3 text-right text-slate-600">{item.quantity}</td>
                <td className="py-2 px-3 text-right text-slate-600">{item.unitPrice.toFixed(2)}</td>
                <td className="py-2 px-3 text-right font-bold text-slate-900">{(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isLastPage && (
        <div className="flex justify-end mt-auto">
          <div className="w-64">
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="font-medium text-slate-600">Total HT</span>
              <span className="font-bold text-slate-900">{total.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between py-3 bg-slate-900 text-white px-3 mt-2 rounded-sm shadow-lg">
              <span className="font-bold uppercase tracking-wider">Net à payer</span>
              <span className="font-bold text-lg">{(total + tva).toFixed(2)} €</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-400 flex flex-row justify-between gap-2">
        <p>Facture générée électroniquement.</p>
        <p>Date d'échéance: {new Date(invoice.dueDate).toLocaleDateString()}</p>
      </div>
    </div>
  </div>
);
