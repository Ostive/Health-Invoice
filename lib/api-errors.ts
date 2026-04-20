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

export const unauthorized = (message = 'Unauthorized') => new ApiError(401, message, 'UNAUTHORIZED');
export const forbidden = (message = 'Forbidden') => new ApiError(403, message, 'FORBIDDEN');
export const notFound = (message = 'Not Found') => new ApiError(404, message, 'NOT_FOUND');
export const badRequest = (message: string, details?: unknown) => new ApiError(400, message, 'BAD_REQUEST', details);
export const conflict = (message: string) => new ApiError(409, message, 'CONFLICT');
export const tooManyRequests = (message: string) => new ApiError(429, message, 'RATE_LIMITED');

function uniqueMessages(err: ZodError): string[] {
    return Array.from(new Set(err.issues.map(i => i.message)));
}

export function validationErrorResponse(err: ZodError) {
    return NextResponse.json(
        { error: 'Validation failed', errors: uniqueMessages(err) },
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

    if (error instanceof ApiError) {
        console.warn(`[${route}] ${error.code ?? error.status}: ${error.message}`, { userId, requestId });
        return NextResponse.json(
            { error: error.message, code: error.code, details: error.details, requestId },
            { status: error.status }
        );
    }

    const err = error as { code?: string; message?: string; stack?: string; details?: string; hint?: string };

    if (err?.code === '42P01') {
        console.error(`[${route}] Missing table`, { userId, requestId, details: err.details });
        return NextResponse.json(
            { error: 'Database not provisioned', code: 'TABLE_MISSING', requestId },
            { status: 503 }
        );
    }

    if (err?.code === '23505') {
        return NextResponse.json(
            { error: 'Duplicate entry', code: 'DUPLICATE', requestId },
            { status: 409 }
        );
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
        { error: 'Internal Server Error', requestId },
        { status: 500 }
    );
}
