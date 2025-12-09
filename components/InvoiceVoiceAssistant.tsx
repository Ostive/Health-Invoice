'use client'

import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Invoice } from '../types/index';

interface InvoiceVoiceAssistantProps {
    invoice: Invoice;
    onChange: (invoice: Invoice) => void;
    isReadOnly?: boolean;
}

export const InvoiceVoiceAssistant: React.FC<InvoiceVoiceAssistantProps> = ({ invoice, onChange, isReadOnly }) => {
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);

    const handleAiGeneration = async () => {
        if (!aiPrompt.trim()) return;

        setIsGenerating(true);
        setAiError(null);

        try {
            const response = await fetch('/api/generate-invoice-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: aiPrompt }),
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
                updatedInvoice.notes = data.notes;
            }

            onChange(updatedInvoice);
            setAiPrompt(''); // Clear prompt after generation

        } catch (err: any) {
            setAiError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleListening = async () => {
        if (isListening) {
            // Stop recording
            if (recognitionRef.current && recognitionRef.current.state !== 'inactive') {
                recognitionRef.current.stop();
                setIsListening(false);
            }
        } else {
            // Start recording
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setAiError("Votre navigateur ne supporte pas l'enregistrement audio.");
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                recognitionRef.current = mediaRecorder;
                const audioChunks: Blob[] = [];

                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

                    // Send to API
                    const formData = new FormData();
                    formData.append('audio', audioBlob);

                    try {
                        // Show loading state for transcription if needed, or just append text
                        const response = await fetch('/api/transcribe', {
                            method: 'POST',
                            body: formData,
                        });

                        if (!response.ok) {
                            throw new Error('Erreur de transcription');
                        }

                        const data = await response.json();
                        if (data.text) {
                            setAiPrompt(prev => (prev ? prev + ' ' : '') + data.text);
                        }
                    } catch (err) {
                        console.error("Transcription error:", err);
                        setAiError("Erreur lors de la transcription audio.");
                    } finally {
                        // Stop all tracks to release microphone
                        stream.getTracks().forEach(track => track.stop());
                    }
                };

                mediaRecorder.start();
                setIsListening(true);
                setAiError(null);

            } catch (err) {
                console.error("Microphone access error:", err);
                setAiError("Accès au microphone refusé.");
            }
        }
    };

    if (isReadOnly) return null;

    return (
        <>
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
        </>
    );
};
