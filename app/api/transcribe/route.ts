import { NextResponse } from 'next/server'
import { GoogleGenAI } from "@google/genai"
import { GEMINI_MODEL } from "@/lib/gemini"
import { apiRoute } from '@/lib/api-route'
import { checkRateLimit } from '@/lib/rate-limit'
import { badRequest, tooManyRequests, ApiError } from '@/lib/api-errors'

const ROUTE = 'api/transcribe'

const MAX_AUDIO_BYTES = 25 * 1024 * 1024
const ALLOWED_AUDIO_TYPES = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav']

export const POST = apiRoute(ROUTE, async ({ user }, request) => {
    const { success, message } = await checkRateLimit(user.id, 'GENERATE_INVOICE_AI')
    if (!success) throw tooManyRequests(message ?? 'Trop de demandes. Patientez un instant.')

    const formData = await request.formData()
    const audioFile = formData.get('audio')

    if (!(audioFile instanceof File)) throw badRequest('Fichier audio manquant')
    if (audioFile.size === 0) throw badRequest('Fichier audio vide')
    if (audioFile.size > MAX_AUDIO_BYTES) throw badRequest('Fichier audio trop volumineux (max 25 Mo)')
    if (!ALLOWED_AUDIO_TYPES.some(t => audioFile.type?.startsWith(t))) {
        throw badRequest('Format audio non supporté')
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new ApiError(500, 'La dictée n’est pas configurée sur ce serveur (clé API manquante).', 'CONFIG_MISSING')

    const ai = new GoogleGenAI({ apiKey })

    const arrayBuffer = await audioFile.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString('base64')
    const mimeType = audioFile.type || 'audio/webm'

    const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{
            parts: [
                { inlineData: { mimeType, data: base64Audio } },
                { text: "Transcribe exactly what is said in this audio in French. Do not add any commentary." },
            ],
        }],
    })

    const text = response.text
    if (!text) throw new ApiError(502, "Impossible de transcrire l'audio", 'AI_EMPTY_RESPONSE')

    return NextResponse.json({ text })
})
