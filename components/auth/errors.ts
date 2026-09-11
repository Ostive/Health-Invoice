export type AuthErrorKind = 'unconfirmed' | 'generic'

export interface AuthError {
    text: string
    kind: AuthErrorKind
}

/** Turns Supabase / API messages into French copy that says what to do next */
export function translateAuthError(message: string): AuthError {
    if (message.includes('Invalid login credentials')) {
        return { text: 'Email ou mot de passe incorrect.', kind: 'generic' }
    }
    if (message.includes('Email not confirmed')) {
        return { text: 'Votre email n’est pas encore confirmé. Cliquez sur le lien reçu, ou demandez-en un nouveau.', kind: 'unconfirmed' }
    }
    if (message.includes('User already registered')) {
        return { text: 'Un compte existe déjà avec cet email. Connectez-vous.', kind: 'generic' }
    }
    if (message.includes('Password should be at least')) {
        return { text: 'Le mot de passe doit contenir au moins 8 caractères.', kind: 'generic' }
    }
    if (message.includes('New password should be different')) {
        return { text: 'Choisissez un mot de passe différent de l’ancien.', kind: 'generic' }
    }
    if (message.startsWith('Trop de tentatives')) {
        return { text: message, kind: 'generic' }
    }
    if (/rate limit/i.test(message)) {
        return { text: 'Trop de tentatives. Réessayez dans quelques minutes.', kind: 'generic' }
    }
    if (message.startsWith('Le mot de passe') || message.startsWith('Les mots de passe')) {
        return { text: message, kind: 'generic' }
    }
    return { text: 'Le service n’a pas répondu. Vérifiez votre connexion internet et réessayez.', kind: 'generic' }
}
