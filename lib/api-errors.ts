import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
        public readonly code?: string,
        public readonly details?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// Messages reach the practitioner as they are: they say what happened and what to do about it
export const unauthorized = (message = 'Votre session a expiré. Reconnectez-vous.') => new ApiError(401, message, 'UNAUTHORIZED');
export const forbidden = (message = 'Action non autorisée.') => new ApiError(403, message, 'FORBIDDEN');
export const notFound = (message = 'Élément introuvable.') => new ApiError(404, message, 'NOT_FOUND');
export const badRequest = (message: string, details?: unknown) => new ApiError(400, message, 'BAD_REQUEST', details);
export const conflict = (message: string) => new ApiError(409, message, 'CONFLICT');
export const tooManyRequests = (message: string) => new ApiError(429, message, 'RATE_LIMITED');

/** Database errors that a practitioner can act on, rather than "Internal Server Error" */
const DATABASE_ERRORS: Record<string, { status: number; message: string }> = {
    '23503': { status: 409, message: 'Un élément lié (dossier ou patient) a été supprimé entre-temps. Rechargez la page, puis réessayez.' },
    '23505': { status: 409, message: 'Cette valeur est déjà utilisée (numéro de facture ou nom de dossier).' },
    '23502': { status: 400, message: 'Un champ obligatoire est vide.' },
    '23514': { status: 400, message: 'Une des valeurs saisies n’est pas acceptée.' },
    '22P02': { status: 400, message: 'Une des valeurs saisies est mal formée.' },
    '22001': { status: 400, message: 'Une des valeurs saisies est trop longue.' },
    '42501': { status: 403, message: 'Vous n’avez pas accès à cet élément.' },
    '42P01': { status: 503, message: 'La base de données n’est pas encore installée.' },
    'PGRST301': { status: 401, message: 'Votre session a expiré. Reconnectez-vous.' },
};

function uniqueMessages(err: ZodError): string[] {
    return Array.from(new Set(err.issues.map(i => i.message)));
}

export function validationErrorResponse(err: ZodError) {
    return NextResponse.json(
        { error: 'Le formulaire est incomplet', code: 'VALIDATION', errors: uniqueMessages(err) },
        { status: 400 }
    );
}

interface HandleOptions {
    route: string;
    userId?: string;
}

export function handleApiError(error: unknown, { route, userId }: HandleOptions) {
    const requestId = crypto.randomUUID();

    if (error instanceof ZodError) {
        console.warn(`[${route}] Validation failed`, { userId, requestId, issues: error.issues });
        return validationErrorResponse(error);
    }

    // request.json() on a body that isn't JSON
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Le contenu envoyé est illisible.', code: 'BAD_REQUEST', requestId }, { status: 400 });
    }

    if (error instanceof ApiError) {
        console.warn(`[${route}] ${error.code ?? error.status}: ${error.message}`, { userId, requestId });
        return NextResponse.json(
            { error: error.message, code: error.code, details: error.details, requestId },
            { status: error.status }
        );
    }

    const err = error as { code?: string; message?: string; stack?: string; details?: string; hint?: string };
    const known = err?.code ? DATABASE_ERRORS[err.code] : undefined;

    if (known) {
        console.warn(`[${route}] Database error ${err.code}`, { userId, requestId, message: err.message, details: err.details, hint: err.hint });
        return NextResponse.json({ error: known.message, code: err.code, requestId }, { status: known.status });
    }

    console.error(`[${route}] Unhandled error`, {
        userId,
        requestId,
        code: err?.code,
        message: err?.message,
        hint: err?.hint,
        details: err?.details,
        stack: err?.stack,
    });

    return NextResponse.json(
        {
            error: `Une erreur inattendue est survenue. Référence : ${requestId}`,
            code: 'INTERNAL',
            requestId,
            // The cause, for the developer running the app; never sent in production
            ...(process.env.NODE_ENV !== 'production' && { detail: err?.message }),
        },
        { status: 500 }
    );
}
