'use client'

import React from 'react';
import { Invoice, InvoiceStatus, InvoiceTemplateId, Folder } from '../types/index';
import { Select } from './ui/select';
import { PatientInput } from '../lib/schemas';
import { InvoiceVoiceAssistant } from './InvoiceVoiceAssistant';
import { InvoiceItems } from './InvoiceItems';
import { Modal } from './ui/modal';
import { Button } from './ui/button';
import { Field, Input, Textarea, SectionLabel } from './ui/input';
import { Icon } from './ui/icon';
import { getFolderColorClass } from './dashboard/modals/FolderModal';
import { cn } from '@/lib/cn';

interface InvoiceEditorProps {
  invoice: Invoice;
  onChange: (invoice: Invoice) => void;
  folders?: Folder[];
  patients?: PatientInput[];
}

const templates: { id: InvoiceTemplateId; name: string; description: string }[] = [
  { id: 'modern', name: 'Moderne', description: 'Net et professionnel' },
  { id: 'classic', name: 'Classique', description: 'Traditionnel, avec empattements' },
  { id: 'minimalist', name: 'Minimaliste', description: 'Épuré, centré sur le contenu' },
  { id: 'elegant', name: 'Élégant', description: 'Accents dorés' },
  { id: 'corporate', name: 'Corporatif', description: 'En-tête sombre' }
];

const statusDot: Record<InvoiceStatus, string> = {
  [InvoiceStatus.PAID]: 'bg-vitale-500',
  [InvoiceStatus.SENT]: 'bg-sent-600',
  [InvoiceStatus.DRAFT]: 'bg-ink-faint',
  [InvoiceStatus.LATE]: 'bg-red-600',
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

    // Moving to Paid or Sent locks the content: ask for confirmation first
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

  const statusOptions = Object.values(InvoiceStatus).map(status => ({
    value: status,
    label: status,
    icon: <span className={cn('block size-2 rounded-full', statusDot[status])} />,
    disabled: isReadOnly && status === InvoiceStatus.DRAFT,
  }));

  const templateOptions = templates.map(t => ({
    value: t.id,
    label: t.name,
    description: t.description
  }));

  const folderOptions = [
    { value: 'none', label: 'Aucun dossier', icon: <Icon name="folder" className="text-ink-faint" /> },
    ...folders.map(f => ({
      value: f.id,
      label: f.name,
      icon: <svg className={cn('size-4', getFolderColorClass(f.color))} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
    }))
  ];

  const patientOptions = [
    { value: 'none', label: 'Choisir un patient', icon: <Icon name="user" className="text-ink-faint" /> },
    ...patients.map(p => ({
      value: p.id || '',
      label: p.name,
      icon: <Icon name="user" className="text-ink-soft" />
    }))
  ];

  return (
    <div className="relative h-full overflow-y-auto px-4 pb-24 pt-5 md:px-8 md:pb-10 md:pt-7">
      <div className="mx-auto flex max-w-2xl flex-col gap-9">

        {isReadOnly && (
          <div className="flex items-start gap-3 rounded-xl border border-primary-100 bg-primary-50 p-4">
            <Icon name="lock" className="mt-0.5 size-5 text-primary-600" />
            <div>
              <h4 className="text-sm font-semibold text-primary-900">Facture finalisée</h4>
              <p className="mt-1 text-sm leading-relaxed text-primary-800">Son contenu ne peut plus être modifié, conformément aux règles de facturation. Seul le statut peut encore changer.</p>
            </div>
          </div>
        )}

        {!isReadOnly && (
          <InvoiceVoiceAssistant
            invoice={invoice}
            onChange={onChange}
            isReadOnly={isReadOnly}
          />
        )}

        <section className="relative z-30">
          <SectionLabel
            action={patients.length > 0 && (
              <div className="w-52">
                <Select
                  value={invoice.patientId || 'none'}
                  onChange={handlePatientSelect}
                  options={patientOptions}
                  placeholder="Choisir un patient"
                  disabled={isReadOnly}
                />
              </div>
            )}
          >
            Patient
          </SectionLabel>

          <div className="space-y-4">
            <Field label="Nom complet" htmlFor="client-name">
              <Input
                id="client-name"
                type="text"
                value={invoice.client.name}
                onChange={(e) => handleClientChange('name', e.target.value)}
                placeholder="Mme Dupont"
                disabled={isReadOnly}
                autoComplete="off"
              />
            </Field>
            <Field label="Adresse" htmlFor="client-address">
              <Textarea
                id="client-address"
                value={invoice.client.address}
                onChange={(e) => handleClientChange('address', e.target.value)}
                rows={2}
                placeholder="12 rue de la Paix, 75002 Paris"
                disabled={isReadOnly}
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Email" htmlFor="client-email">
                <Input
                  id="client-email"
                  type="email"
                  value={invoice.client.email}
                  onChange={(e) => handleClientChange('email', e.target.value)}
                  placeholder="patient@email.fr"
                  disabled={isReadOnly}
                />
              </Field>
              <Field label="N° de sécurité sociale" htmlFor="client-ssn">
                <Input
                  id="client-ssn"
                  type="text"
                  inputMode="numeric"
                  value={invoice.client.ssn || ''}
                  onChange={(e) => handleClientChange('ssn', e.target.value)}
                  placeholder="1 85 05 75 123 456 78"
                  disabled={isReadOnly}
                  className="font-mono"
                />
              </Field>
            </div>
          </div>
        </section>

        <section className="relative z-20">
          <SectionLabel>Facture</SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="N° de facture" htmlFor="invoice-number" hint={!invoice.id ? 'Attribué à l’enregistrement' : undefined}>
              <Input
                id="invoice-number"
                type="text"
                value={invoice.number}
                onChange={(e) => onChange({ ...invoice, number: e.target.value })}
                placeholder="Automatique"
                disabled={!invoice.id}
                className="font-mono"
              />
            </Field>
            <Field label="Date" htmlFor="invoice-date">
              <Input id="invoice-date" type="date" value={invoice.date} onChange={(e) => !isReadOnly && onChange({ ...invoice, date: e.target.value })} disabled={isReadOnly} />
            </Field>
            <Field label="Échéance" htmlFor="invoice-due-date">
              <Input id="invoice-due-date" type="date" value={invoice.dueDate} onChange={(e) => !isReadOnly && onChange({ ...invoice, dueDate: e.target.value })} disabled={isReadOnly} />
            </Field>
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
                options={statusOptions}
              />
            </div>
            <div className="relative z-10">
              <Select
                label="Modèle"
                value={invoice.template}
                onChange={(val) => onChange({ ...invoice, template: val as InvoiceTemplateId })}
                options={templateOptions}
                disabled={isReadOnly}
              />
            </div>
          </div>
        </section>

        <InvoiceItems
          items={invoice.items}
          onChange={(newItems) => onChange({ ...invoice, items: newItems })}
          isReadOnly={isReadOnly}
        />

        <section>
          <Field label="Notes" htmlFor="invoice-notes" hint="Imprimées en bas de la facture.">
            <Textarea
              id="invoice-notes"
              value={invoice.notes || ''}
              onChange={(e) => onChange({ ...invoice, notes: e.target.value })}
              rows={2}
              placeholder="Conditions de paiement, mentions particulières…"
              disabled={isReadOnly}
            />
          </Field>
        </section>
      </div>

      <Modal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        title={`Marquer la facture comme « ${pendingStatus ?? ''} » ?`}
        className="max-w-md"
      >
        <p className="text-sm leading-relaxed text-ink-soft">
          La facture sera finalisée : son contenu ne pourra plus être modifié, seul son statut pourra encore changer.
        </p>
        <p className="mt-3 rounded-lg bg-paper p-3 text-sm leading-relaxed text-ink-soft">
          Pour corriger une facture finalisée, il faudra émettre un avoir.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setShowValidationModal(false)}>
            Annuler
          </Button>
          <Button onClick={confirmStatusChange}>
            <Icon name="lock" />Finaliser la facture
          </Button>
        </div>
      </Modal>
    </div>
  );
};
