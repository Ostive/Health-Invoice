import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedInvoiceData } from "@/types/index";

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json(
                { error: "Le texte de description est requis" },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("GEMINI_API_KEY is missing");
            return NextResponse.json(
                { error: "Configuration serveur manquante (Clé API Gemini)" },
                { status: 500 }
            );
        }

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `Tu es un assistant administratif pour un professionnel de santé (infirmier, kiné, médecin). 
      Analyse le texte suivant qui décrit une consultation ou un soin, et extrais les données structurées pour une facture.
      Si l'adresse n'est pas fournie, laisse vide. Estime des prix standards français si non spécifiés (ex: Consultation 25€, Soin domicile 35€).
      
      Texte: "${text}"`;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{
                parts: [{ text: prompt }]
            }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        clientName: { type: Type.STRING },
                        clientAddress: { type: Type.STRING },
                        notes: { type: Type.STRING },
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    description: { type: Type.STRING },
                                    quantity: { type: Type.NUMBER },
                                    unitPrice: { type: Type.NUMBER },
                                },
                                required: ["description", "quantity", "unitPrice"]
                            }
                        }
                    },
                    required: ["clientName", "items"]
                }
            }
        });

        const jsonText = response.text;
        if (!jsonText) {
            throw new Error("Réponse vide de l'IA");
        }

        const data = JSON.parse(jsonText) as GeneratedInvoiceData;
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Erreur Gemini API:", error);
        return NextResponse.json(
            { error: error.message || "Erreur lors de la génération IA" },
            { status: 500 }
        );
    }
}
