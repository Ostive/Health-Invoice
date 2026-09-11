import { NextResponse } from 'next/server'
import { GoogleGenAI, Type } from "@google/genai"
import { GEMINI_MODEL } from "@/lib/gemini"
import { GeneratedInvoiceData } from "@/types/index"
import { apiRoute } from '@/lib/api-route'
import { checkRateLimit } from '@/lib/rate-limit'
import { logAuditAction } from '@/lib/audit'
import { AiInvoiceTextSchema } from '@/lib/schemas'
import { tooManyRequests, ApiError } from '@/lib/api-errors'

const ROUTE = 'api/generate-invoice-ai'

export const POST = apiRoute(ROUTE, async ({ user }, request) => {
    const { text } = AiInvoiceTextSchema.parse(await request.json())

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        console.error(`[${ROUTE}] GEMINI_API_KEY is missing`)
        throw new ApiError(500, 'Configuration serveur manquante (Clé API Gemini)', 'CONFIG_MISSING')
    }

    const { success, message } = await checkRateLimit(user.id, 'GENERATE_INVOICE_AI')
    if (!success) throw tooManyRequests(message ?? 'Rate limit exceeded')

    const ai = new GoogleGenAI({ apiKey })

    const prompt = `Tu es un assistant administratif pour un professionnel de santé (infirmier, kiné, médecin).
      Analyse le texte suivant qui décrit une consultation ou un soin, et extrais les données structurées pour une facture.
      Si l'adresse n'est pas fournie, laisse vide. Estime des prix standards français si non spécifiés (ex: Consultation 25€, Soin domicile 35€).

      Texte: "${text}"`

    const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ parts: [{ text: prompt }] }],
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
                            required: ["description", "quantity", "unitPrice"],
                        },
                    },
                },
                required: ["clientName", "items"],
            },
        },
    })

    const jsonText = response.text
    if (!jsonText) throw new ApiError(502, "Réponse vide de l'IA", 'AI_EMPTY_RESPONSE')

    const data = JSON.parse(jsonText) as GeneratedInvoiceData

    logAuditAction({
        action: 'GENERATE_INVOICE_AI',
        resourceType: 'invoice',
        userId: user.id,
        details: { promptLength: text.length },
    })

    return NextResponse.json(data)
})
