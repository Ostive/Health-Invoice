import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check Rate Limit (reuse the AI generation limit for now, or add a new one)
        const { success, message } = await checkRateLimit(user.id, 'GENERATE_INVOICE_AI');
        if (!success) {
            return NextResponse.json({ error: message }, { status: 429 });
        }

        const formData = await req.formData();
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            return NextResponse.json({ error: "Fichier audio manquant" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Configuration serveur manquante" }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });

        // Convert File to ArrayBuffer then Base64
        const arrayBuffer = await audioFile.arrayBuffer();
        const base64Audio = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = audioFile.type || 'audio/webm';

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Audio
                        }
                    },
                    { text: "Transcribe exactly what is said in this audio in French. Do not add any commentary." }
                ]
            }]
        });

        const text = response.text;
        if (!text) {
            throw new Error("Impossible de transcrire l'audio");
        }

        return NextResponse.json({ text });

    } catch (error: any) {
        console.error("Erreur Transcription:", error);
        return NextResponse.json(
            { error: error.message || "Erreur lors de la transcription" },
            { status: 500 }
        );
    }
}
