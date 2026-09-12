/**
 * Calls one of the app's Route Handlers from the browser. The session cookie authenticates the
 * request; an error response ({ error, errors? }) is rethrown with the server's message.
 */
export async function api<T>(url: string, { json, ...init }: RequestInit & { json?: unknown } = {}): Promise<T> {
    const response = await fetch(url, json === undefined ? init : {
        ...init,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
    });
    if (!response.ok) throw new Error(await errorMessageFrom(response));
    return response.json() as Promise<T>;
}

async function errorMessageFrom(response: Response): Promise<string> {
    const body = (await response.json().catch(() => ({}))) as { error?: string; errors?: string[] };
    const message = body.error || response.statusText || `Erreur ${response.status}`;
    return body.errors?.length ? `${message} : ${body.errors.join(', ')}` : message;
}
