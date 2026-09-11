'use client'

import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Icon } from './ui/icon';
import { fieldClass } from './ui/input';
import { Invoice } from '../types/index';
import { cn } from '@/lib/cn';
import { errorMessage } from '@/lib/errors';
import { generateUUID } from '@/lib/uuid';

interface InvoiceVoiceAssistantProps {
    invoice: Invoice;
    onChange: (invoice: Invoice) => void;
    isReadOnly?: boolean;
}

export const InvoiceVoiceAssistant: React.FC<InvoiceVoiceAssistantProps> = ({ invoice, onChange, isReadOnly }) => {
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const discardRecordingRef = useRef(false);

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
                const newItems = data.items.map((item: { description?: string; quantity?: number; unitPrice?: number }) => ({
                    id: generateUUID(),
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
            setAiPrompt('');
        } catch (err) {
            setAiError(errorMessage(err));
        } finally {
            setIsGenerating(false);
        }
    };

    const stopRecording = (discard: boolean) => {
        discardRecordingRef.current = discard;
        if (recorderRef.current && recorderRef.current.state !== 'inactive') {
            recorderRef.current.stop();
        }
        setIsListening(false);
    };

    const startRecording = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setAiError("Ce navigateur ne permet pas l'enregistrement audio. Saisissez vos actes au clavier.");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            recorderRef.current = mediaRecorder;
            discardRecordingRef.current = false;
            const audioChunks: Blob[] = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                // Release the microphone as soon as recording ends
                stream.getTracks().forEach(track => track.stop());
                if (discardRecordingRef.current) return;

                const formData = new FormData();
                formData.append('audio', new Blob(audioChunks, { type: 'audio/webm' }));

                setIsTranscribing(true);
                try {
                    const response = await fetch('/api/transcribe', {
                        method: 'POST',
                        body: formData,
                    });
                    if (!response.ok) throw new Error('Erreur de transcription');

                    const data = await response.json();
                    if (data.text) {
                        setAiPrompt(prev => (prev ? prev + ' ' : '') + data.text);
                    }
                } catch (err) {
                    console.error("Transcription error:", err);
                    setAiError("La dictée n'a pas pu être transcrite. Réessayez ou saisissez vos actes au clavier.");
                } finally {
                    setIsTranscribing(false);
                }
            };

            mediaRecorder.start();
            setIsListening(true);
            setAiError(null);
        } catch (err) {
            console.error("Microphone access error:", err);
            setAiError("Le micro n'est pas accessible. Autorisez-le dans les réglages du navigateur.");
        }
    };

    if (isReadOnly) return null;

    return (
        <>
            <section className="rounded-2xl border border-primary-100 bg-primary-50/60 p-4 sm:p-5" aria-labelledby="voice-assistant-title">
                <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-600 text-white">
                        <Icon name="mic" className="size-[18px]" strokeWidth={2} />
                    </span>
                    <div>
                        <h3 id="voice-assistant-title" className="font-display text-[15px] font-semibold text-ink">Dictez vos actes</h3>
                        <p className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">Le patient et les prestations sont reportés sur la facture.</p>
                    </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <div className="relative flex-1">
                        <label htmlFor="ai-prompt" className="sr-only">Description des soins</label>
                        <input
                            id="ai-prompt"
                            type="text"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="Visite Mme Michu, deux pansements simples…"
                            className={cn(fieldClass, 'border-primary-200 pr-12')}
                            onKeyDown={(e) => e.key === 'Enter' && handleAiGeneration()}
                            disabled={isTranscribing}
                        />
                        <button
                            onClick={startRecording}
                            disabled={isTranscribing || isGenerating}
                            aria-label="Dicter au micro"
                            className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-primary-600 transition-colors hover:bg-primary-50 disabled:text-ink-faint"
                        >
                            <Icon name="mic" className="size-5" />
                        </button>
                    </div>
                    <Button onClick={handleAiGeneration} isLoading={isGenerating} disabled={!aiPrompt.trim() || isTranscribing} className="sm:w-auto">
                        Remplir la facture
                    </Button>
                </div>

                {isTranscribing && (
                    <p role="status" className="mt-2 text-[13px] text-primary-700">Transcription de votre dictée…</p>
                )}
                {aiError && (
                    <p role="alert" className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800">{aiError}</p>
                )}
            </section>

            {isListening && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-4 backdrop-blur-[2px] animate-in fade-in duration-200 sm:items-center">
                    <div role="dialog" aria-modal="true" aria-labelledby="recording-title" className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-pop animate-in zoom-in-95 slide-in-from-bottom-2 duration-200">
                        <div className="relative mx-auto mb-7 grid size-24 place-items-center">
                            <span className="absolute inset-0 animate-ping rounded-full bg-primary-200 opacity-40 [animation-duration:1.8s]" aria-hidden="true" />
                            <span className="absolute inset-3 rounded-full bg-primary-100" aria-hidden="true" />
                            <span className="relative grid size-16 place-items-center rounded-full bg-primary-600 text-white shadow-pop">
                                <Icon name="mic" className="size-7" strokeWidth={2} />
                            </span>
                        </div>

                        <h3 id="recording-title" className="font-display text-xl font-semibold text-ink">Enregistrement en cours</h3>
                        <p className="mt-2 text-sm text-ink-soft">Décrivez le patient et les soins réalisés, puis appuyez sur Terminer.</p>

                        <div className="mt-7 flex gap-2">
                            <Button onClick={() => stopRecording(true)} variant="ghost" className="flex-1">
                                Annuler
                            </Button>
                            <Button onClick={() => stopRecording(false)} className="flex-1">
                                Terminer
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
