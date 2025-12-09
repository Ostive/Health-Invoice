'use client'

import React from 'react';
import { Invoice, InvoiceStatus, InvoiceTemplateId, Folder } from '../types/index';
import { Select } from './ui/select';
import { PatientInput } from '../lib/schemas';
import { InvoiceVoiceAssistant } from './InvoiceVoiceAssistant';
import { InvoiceItems } from './InvoiceItems';
import { Modal } from './ui/modal';
import { Button } from './ui/button';

interface InvoiceEditorProps {
  invoice: Invoice;
  onChange: (invoice: Invoice) => void;
  folders?: Folder[];
  patients?: PatientInput[];
}

const templates: { id: InvoiceTemplateId; name: string; description: string }[] = [
  { id: 'modern', name: 'Moderne', description: 'Clean et professionnel' },
  { id: 'classic', name: 'Classique', description: 'Traditionnel avec serif' },
  { id: 'minimalist', name: 'Minimaliste', description: 'Épuré, focus contenu' },
  { id: 'elegant', name: 'Élégant', description: 'Accents dorés et raffiné' },
  { id: 'corporate', name: 'Corporatif', description: 'Style entreprise sombre' }
];

// Helper to get status icon/color
const getStatusIcon = (status: InvoiceStatus) => {
  switch (status) {
    case InvoiceStatus.PAID: return <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />;
    case InvoiceStatus.SENT: return <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]" />;
    case InvoiceStatus.DRAFT: return <div className="w-2 h-2 rounded-full bg-slate-400" />;
    case InvoiceStatus.LATE: return <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />;
    default: return <div className="w-2 h-2 rounded-full bg-slate-400" />;
  }
};

const getFolderTextColorClass = (color?: string) => {
  if (!color) return 'text-slate-500';
  return `text-${color}-500`;
};

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ invoice, onChange, folders = [], patients = [] }) => {

  const [showValidationModal, setShowValidationModal] = React.useState(false);
  const [pendingStatus, setPendingStatus] = React.useState<InvoiceStatus | null>(null);

  const isReadOnly = invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.PAID;

  const handleClientChange = (field: string, value: string) => {
    if (isReadOnly) return;
    onChange({
      ...invoice,
      client: { ...invoice.client, [field]: value }
    });
  };

  const handlePatientSelect = (patientId: string) => {
    if (patientId === 'none') {
      onChange({ ...invoice, patientId: null });
      return;
    }
    const patient = patients.find(p => p.id === patientId);
    if (patient && !isReadOnly) {
      onChange({
        ...invoice,
        patientId: patientId,
        client: {
          name: patient.name,
          address: patient.address || '',
          email: patient.email || '',
          ssn: patient.ssn || ''
        }
      });
    }
  };

  const handleStatusChange = (newStatus: InvoiceStatus) => {
    // Prevent reverting to Draft if already locked
    if (isReadOnly && newStatus === InvoiceStatus.DRAFT) {
      return;
    }

    // If changing TO Paid or Sent - trigger warning if not already finalized
    if ((newStatus === InvoiceStatus.PAID || newStatus === InvoiceStatus.SENT) && !isReadOnly) {
      setPendingStatus(newStatus);
      setShowValidationModal(true);
      return;
    }

    onChange({ ...invoice, status: newStatus });
  };

  const confirmStatusChange = () => {
    if (pendingStatus) {
      onChange({ ...invoice, status: pendingStatus });
      setShowValidationModal(false);
      setPendingStatus(null);
    }
  };

  const getStatusLabel = (s: InvoiceStatus | null) => {
    switch (s) {
      case InvoiceStatus.PAID: return 'Payée';
      case InvoiceStatus.SENT: return 'Envoyée';
      default: return '';
    }
  };

  // Prepare options for Select components
  const statusOptions = Object.values(InvoiceStatus).map(status => ({
    value: status,
    label: status,
    icon: getStatusIcon(status)
  }));

  const templateOptions = templates.map(t => ({
    value: t.id,
    label: t.name,
    description: t.description
  }));

  const folderOptions = [
    { value: 'none', label: 'Aucun dossier', icon: <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg> },
    ...folders.map(f => ({
      value: f.id,
      label: f.name,
      icon: <svg className={`w-4 h-4 ${getFolderTextColorClass(f.color)}`} fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
    }))
  ];

  const patientOptions = [
    { value: 'none', label: 'Patient', icon: <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    ...patients.map(p => ({
      value: p.id || '',
      label: p.name,
      icon: <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    }))
  ];

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 relative h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto flex flex-col gap-6 md:gap-8">

        {isReadOnly && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <div>
              <h4 className="text-sm font-bold text-amber-800">Facture verrouillée</h4>
              <p className="text-sm text-amber-700 mt-1">Cette facture a été finalisée. Pour des raisons légales, vous ne pouvez plus modifier son contenu. Seul le statut peut être mis à jour.</p>
            </div>
          </div>
        )}

        {/* Client Info & Invoice Details */}
        <div className="space-y-6 md:space-y-8">

          {/* Client Information Section */}
          <div className="bg-white md:bg-transparent rounded-xl p-1 md:p-0 relative z-30">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Informations Client
              </h3>
              {patients.length > 0 && (
                <div className="w-48">
                  <Select
                    value={invoice.patientId || 'none'}
                    onChange={handlePatientSelect}
                    options={patientOptions}
                    placeholder="Importer..."
                    disabled={isReadOnly}
                  />
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="client-name" className="block text-xs font-medium text-slate-600 mb-1.5">Nom complet</label>
                <input
                  id="client-name"
                  type="text"
                  value={invoice.client.name}
                  onChange={(e) => handleClientChange('name', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-3 md:py-2.5 text-base md:text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="Ex: Mme Dupont"
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <label htmlFor="client-address" className="block text-xs font-medium text-slate-600 mb-1.5">Adresse</label>
                <textarea
                  id="client-address"
                  value={invoice.client.address}
                  onChange={(e) => handleClientChange('address', e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-3 md:py-2.5 text-base md:text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="123 Rue de la Paix..."
                  disabled={isReadOnly}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="client-email" className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
                  <input
                    id="client-email"
                    type="email"
                    value={invoice.client.email}
                    onChange={(e) => handleClientChange('email', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-3 md:py-2.5 text-base md:text-sm shadow-sm disabled:bg-slate-50 disabled:text-slate-500"
                    placeholder="client@email.com"
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label htmlFor="client-ssn" className="block text-xs font-medium text-slate-600 mb-1.5">N° Sécu (SSN)</label>
                  <input
                    id="client-ssn"
                    type="text"
                    value={invoice.client.ssn || ''}
                    onChange={(e) => handleClientChange('ssn', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-3 md:py-2.5 text-base md:text-sm shadow-sm disabled:bg-slate-50 disabled:text-slate-500"
                    placeholder="1 85 ..."
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Details Section */}
          <div className="bg-white md:bg-transparent rounded-xl p-1 md:p-0 relative z-20">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Détails Facture
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="invoice-number" className="block text-xs font-medium text-slate-600 mb-1.5">N° Facture</label>
                <input id="invoice-number" type="text" value={invoice.number} onChange={(e) => onChange({ ...invoice, number: e.target.value })} className="w-full border border-slate-300 rounded-lg text-base md:text-sm px-3 py-3 md:py-2.5 shadow-sm bg-slate-50 text-slate-500" placeholder="Généré automatiquement" disabled={!invoice.id} />
              </div>
              <div>
                <label htmlFor="invoice-date" className="block text-xs font-medium text-slate-600 mb-1.5">Date</label>
                <input id="invoice-date" type="date" value={invoice.date} onChange={(e) => !isReadOnly && onChange({ ...invoice, date: e.target.value })} className="w-full border border-slate-300 rounded-lg text-base md:text-sm px-3 py-3 md:py-2.5 shadow-sm disabled:bg-slate-50 disabled:text-slate-500" disabled={isReadOnly} />
              </div>
              <div>
                <label htmlFor="invoice-due-date" className="block text-xs font-medium text-slate-600 mb-1.5">Date d'échéance</label>
                <input id="invoice-due-date" type="date" value={invoice.dueDate} onChange={(e) => !isReadOnly && onChange({ ...invoice, dueDate: e.target.value })} className="w-full border border-slate-300 rounded-lg text-base md:text-sm px-3 py-3 md:py-2.5 shadow-sm disabled:bg-slate-50 disabled:text-slate-500" disabled={isReadOnly} />
              </div>
              <div className="relative z-30">
                <Select
                  label="Dossier"
                  value={invoice.folderId || 'none'}
                  onChange={(val) => onChange({ ...invoice, folderId: val === 'none' ? null : val as string })}
                  options={folderOptions}
                  disabled={isReadOnly}
                />
              </div>
              <div className="relative z-20">
                <Select
                  label="Statut"
                  value={invoice.status}
                  onChange={(val) => handleStatusChange(val as InvoiceStatus)}
                  options={statusOptions.map(opt => ({
                    ...opt,
                    disabled: isReadOnly && opt.value === InvoiceStatus.DRAFT
                  }))}
                />
              </div>
              <div className="relative z-10 sm:col-span-2">
                <Select
                  label="Modèle"
                  value={invoice.template}
                  onChange={(val) => onChange({ ...invoice, template: val as InvoiceTemplateId })}
                  options={templateOptions}
                  disabled={isReadOnly}
                />
              </div>
              <div className="sm:col-span-2 z-0">
                <label htmlFor="invoice-notes" className="block text-xs font-medium text-slate-600 mb-1.5">Notes</label>
                <textarea
                  id="invoice-notes"
                  value={invoice.notes || ''}
                  onChange={(e) => onChange({ ...invoice, notes: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg text-base md:text-sm px-3 py-3 md:py-2.5 shadow-sm"
                  rows={2}
                  placeholder="Instructions de paiement, mentions légales..."
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* AI & Line Items */}
        <div className="space-y-6 md:space-y-8 relative z-0">

          <InvoiceVoiceAssistant
            invoice={invoice}
            onChange={onChange}
            isReadOnly={isReadOnly}
          />

          <InvoiceItems
            items={invoice.items}
            onChange={(newItems) => onChange({ ...invoice, items: newItems })}
            isReadOnly={isReadOnly}
          />

        </div>
      </div>

      <Modal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        title="Validation de la facture"
      >
        <div className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex gap-3">
            <svg className="w-6 h-6 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-900">
                Attention : Cette action est irréversible pour le contenu.
              </p>
              <p className="text-sm text-amber-800">
                Cette facture sera finalisée et marquée comme <strong>{getStatusLabel(pendingStatus)}</strong>.
                Pour des raisons légales, vous ne pourrez plus modifier son contenu. Seul le statut pourra être mis à jour ultérieurement.
                {pendingStatus === InvoiceStatus.PAID || pendingStatus === InvoiceStatus.SENT ? <span className="block mt-2 font-medium">Pour modifier une facture finalisée, vous devrez créer un Avoir.</span> : null}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowValidationModal(false)}>
              Annuler
            </Button>
            <Button onClick={confirmStatusChange} className="bg-primary-600 text-white hover:bg-primary-700">
              Confirmer et Verrouiller
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
