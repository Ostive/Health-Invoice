import 'server-only'
import { handleApiError } from '@/lib/api-errors'
import { requireSession, type Session } from '@/lib/dal/session'

/**
 * Wraps a Route Handler: the caller must be signed in (401 otherwise), and anything thrown
 * (ApiError, ZodError, database error) becomes a JSON error response logged with the route and user.
 */
export function apiRoute<Context = unknown>(
    route: string,
    handler: (session: Session, request: Request, context: Context) => Promise<Response>,
) {
    return async (request: Request, context: Context): Promise<Response> => {
        let userId: string | undefined
        try {
            const session = await requireSession()
            userId = session.user.id
            return await handler(session, request, context)
        } catch (error) {
            return handleApiError(error, { route, userId })
        }
    }
}

/** Second argument of the handlers of a dynamic `[id]` route */
export type IdRouteContext = { params: Promise<{ id: string }> }
