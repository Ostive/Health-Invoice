'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Invoice, LineItem, InvoiceStatus, InvoiceTemplateId, Folder } from '../types/index';
import { Button } from './ui/button';
import { Select } from './ui/select';

interface InvoiceEditorProps {
  invoice: Invoice;
  onChange: (invoice: Invoice) => void;
  folders?: Folder[];
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

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ invoice, onChange, folders = [] }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const handleClientChange = (field: string, value: string) => {
    onChange({
      ...invoice,
      client: { ...invoice.client, [field]: value }
    });
  };

  const handleItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    const newItems = invoice.items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange({ ...invoice, items: newItems });
  };

  const addItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0
    };
    onChange({ ...invoice, items: [...invoice.items, newItem] });
  };

  const removeItem = (id: string) => {
    onChange({ ...invoice, items: invoice.items.filter(i => i.id !== id) });
  };

  const handleAiGeneration = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    setAiError(null);

    try {
      const response = await fetch('/api/generate-invoice-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate invoice');
      }

      const data = await response.json();

      const updatedInvoice = { ...invoice };

      if (data.client) {
        updatedInvoice.client = { ...updatedInvoice.client, ...data.client };
      }

      if (data.items && Array.isArray(data.items)) {
        const newItems = data.items.map((item: any) => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          description: item.description || '',
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0
        }));
        updatedInvoice.items = [...updatedInvoice.items, ...newItems];
      }

      if (data.notes) {
        updatedInvoice.notes = (updatedInvoice.notes ? updatedInvoice.notes + '\n' : '') + data.notes;
      }

      onChange(updatedInvoice);
      setAiPrompt('');

    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setAiError("Votre navigateur ne supporte pas la reconnaissance vocale.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setAiPrompt(prev => (prev ? prev + ' ' : '') + transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        setAiError("Erreur de reconnaissance vocale.");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
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

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 relative h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto flex flex-col gap-6 md:gap-8">

        {/* Client Info & Invoice Details */}
        <div className="space-y-6 md:space-y-8">

          {/* Client Information Section */}
          <div className="bg-white md:bg-transparent rounded-xl p-1 md:p-0 relative z-30">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Informations Client
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Nom complet</label>
                <input
                  type="text"
                  value={invoice.client.name}
                  onChange={(e) => handleClientChange('name', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-3 md:py-2.5 text-base md:text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
                  placeholder="Ex: Mme Dupont"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Adresse</label>
                <textarea
                  value={invoice.client.address}
                  onChange={(e) => handleClientChange('address', e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-3 md:py-2.5 text-base md:text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
                  placeholder="123 Rue de la Paix..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={invoice.client.email}
                    onChange={(e) => handleClientChange('email', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-3 md:py-2.5 text-base md:text-sm shadow-sm"
                    placeholder="client@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">N° Sécu (SSN)</label>
                  <input
                    type="text"
                    value={invoice.client.ssn || ''}
                    onChange={(e) => handleClientChange('ssn', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-3 md:py-2.5 text-base md:text-sm shadow-sm"
                    placeholder="1 85 ..."
                  />
                </div>
              </div>
            </div>
          </div >

          {/* Invoice Details Section */}
          < div className="bg-white md:bg-transparent rounded-xl p-1 md:p-0 relative z-20" >
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Détails Facture
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">N° Facture</label>
                <input type="text" value={invoice.number} onChange={(e) => onChange({ ...invoice, number: e.target.value })} className="w-full border border-slate-300 rounded-lg text-base md:text-sm px-3 py-3 md:py-2.5 shadow-sm" placeholder="Généré automatiquement" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Date</label>
                <input type="date" value={invoice.date} onChange={(e) => onChange({ ...invoice, date: e.target.value })} className="w-full border border-slate-300 rounded-lg text-base md:text-sm px-3 py-3 md:py-2.5 shadow-sm" />
              </div>
              <div className="relative z-30">
                <Select
                  label="Dossier"
                  value={invoice.folderId || 'none'}
                  onChange={(val) => onChange({ ...invoice, folderId: val === 'none' ? null : val as string })}
                  options={folderOptions}
                />
              </div>
              <div className="relative z-20">
                <Select
                  label="Statut"
                  value={invoice.status}
                  onChange={(val) => onChange({ ...invoice, status: val as InvoiceStatus })}
                  options={statusOptions}
                />
              </div>
              <div className="relative z-10 sm:col-span-2">
                <Select
                  label="Modèle"
                  value={invoice.template}
                  onChange={(val) => onChange({ ...invoice, template: val as InvoiceTemplateId })}
                  options={templateOptions}
                />
              </div>
              <div className="sm:col-span-2 z-0">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Notes</label>
                <textarea
                  value={invoice.notes || ''}
                  onChange={(e) => onChange({ ...invoice, notes: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg text-base md:text-sm px-3 py-3 md:py-2.5 shadow-sm"
                  rows={2}
                  placeholder="Instructions de paiement, mentions légales..."
                />
              </div>
            </div>
          </div >
        </div >

        <hr className="border-slate-100" />

        {/* AI & Line Items */}
        <div className="space-y-6 md:space-y-8 relative z-0">

          {/* AI Assistant - Reverted to Blue Theme */}
          <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border border-primary-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary-200/20 rounded-bl-full -mr-4 -mt-4"></div>

            <h3 className="text-sm font-bold text-primary-800 mb-2 flex items-center gap-2 relative z-10">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              Assistant IA
            </h3>
            <p className="text-xs text-primary-700 mb-4 leading-relaxed relative z-10">
              Décrivez les soins pour remplir la facture automatiquement.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 relative z-10">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ex: Visite Mme Michu, 2 pansements..."
                  className="w-full text-base md:text-sm border border-primary-200 rounded-lg pl-3 pr-10 py-3 md:py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white shadow-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleAiGeneration()}
                />
                <button
                  onClick={toggleListening}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-400 hover:text-primary-600 hover:bg-slate-100'}`}
                  title="Dicter"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </button>
              </div>
              <Button onClick={handleAiGeneration} isLoading={isGenerating} size="md" className="w-full sm:w-auto h-12 sm:h-auto">Générer</Button>
            </div>
            {aiError && <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded border border-red-100">{aiError}</p>}
          </div>

          {/* Line Items */}
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                Prestations
              </h3>
              <Button size="sm" onClick={addItem} variant="outline" className="text-xs py-1.5 h-8">
                + Ajouter
              </Button>
            </div>

            <div className="space-y-3">
              {invoice.items.length === 0 && (
                <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-sm text-slate-500">Aucune prestation.</p>
                  <button onClick={addItem} className="text-primary-600 text-sm font-medium mt-1 hover:underline">Ajouter la première ligne</button>
                </div>
              )}

              {invoice.items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-3 items-start bg-slate-50 p-3 rounded-xl border border-slate-200 group hover:border-primary-200 transition-colors shadow-sm">
                  <div className="flex-1 w-full">
                    <label className="block sm:hidden text-[10px] uppercase text-slate-400 font-bold mb-1">Description</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      placeholder="Description du soin"
                      className="w-full bg-white border border-slate-200 rounded-md px-3 py-2.5 md:py-2 text-base md:text-sm focus:ring-1 focus:ring-primary-500 font-medium"
                    />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="w-24 sm:w-20 shrink-0">
                      <label className="block sm:hidden text-[10px] uppercase text-slate-400 font-bold mb-1">Qté</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-md px-3 py-2.5 md:py-2 text-base md:text-sm text-right focus:ring-1 focus:ring-primary-500"
                        placeholder="Qté"
                      />
                    </div>
                    <div className="flex-1 sm:w-24">
                      <label className="block sm:hidden text-[10px] uppercase text-slate-400 font-bold mb-1">Prix</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-md pl-3 pr-6 py-2.5 md:py-2 text-base md:text-sm text-right focus:ring-1 focus:ring-primary-500"
                          placeholder="0.00"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">€</span>
                      </div>
                    </div>
                    <div className="w-20 sm:w-24 shrink-0">
                      <label className="block sm:hidden text-[10px] uppercase text-slate-400 font-bold mb-1">Total</label>
                      <div className="w-full bg-slate-100 border border-slate-200 rounded-md px-3 py-2.5 md:py-2 text-base md:text-sm text-right text-slate-600 font-medium">
                        {(item.quantity * item.unitPrice).toFixed(2)}€
                      </div>
                    </div>
                    <div className="flex items-end pb-1">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 w-full sm:w-64">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-500">Sous-total</span>
                  <span className="text-sm font-medium text-slate-700">
                    {invoice.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0).toFixed(2)} €
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-base font-bold text-slate-900">Total</span>
                  <span className="text-base font-bold text-primary-600">
                    {invoice.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0).toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Recording Modal Overlay */}
      {isListening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative overflow-hidden">

            {/* Background Ripple Effect */}
            <div className="mb-8 relative flex justify-center items-center py-4">
              <div className="absolute flex items-center justify-center w-full h-full">
                <div className="absolute w-48 h-48 bg-primary-100 rounded-full animate-ping opacity-20 duration-1000"></div>
                <div className="absolute w-32 h-32 bg-primary-200 rounded-full animate-ping opacity-40 delay-150 duration-[1500ms]"></div>
                <div className="absolute w-24 h-24 bg-primary-300 rounded-full animate-pulse opacity-30"></div>
              </div>

              {/* Main Icon */}
              <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-xl shadow-primary-500/40 transform transition-transform hover:scale-105">
                <svg className="w-10 h-10 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">Je vous écoute...</h3>
            <p className="text-slate-500 text-sm mb-6">Dictez vos soins, je m'occupe de la saisie.</p>

            <div className="bg-slate-50 rounded-xl p-4 mb-6 min-h-[100px] flex items-center justify-center border border-slate-100">
              <p className="text-slate-700 italic text-lg leading-relaxed">
                {aiPrompt || <span className="text-slate-400">En attente de parole...</span>}
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={toggleListening}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              >
                Annuler
              </Button>
              <Button
                onClick={toggleListening}
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 shadow-lg shadow-primary-500/20"
              >
                Terminer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};