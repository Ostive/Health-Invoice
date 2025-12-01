import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ''; // Must be 32 chars
const IV_LENGTH = 16; // For AES, this is always 16

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    console.warn('⚠️ ENCRYPTION_KEY is missing or invalid (must be 32 characters). SSN encryption will fail or be insecure.');
}

export function encrypt(text: string): string {
    if (!text) return text;

    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
        throw new Error('CRITICAL SECURITY ERROR: ENCRYPTION_KEY is missing or invalid. Cannot encrypt sensitive data.');
    }

    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        console.error('Encryption failed:', error);
        throw new Error('Encryption failed');
    }
}

export function decrypt(text: string): string {
    if (!text) return text;
    if (!ENCRYPTION_KEY) return text;

    // Check if text is in encrypted format (iv:content)
    const textParts = text.split(':');
    if (textParts.length !== 2) return text; // Not encrypted or legacy data

    try {
        const iv = Buffer.from(textParts[0], 'hex');
        const encryptedText = Buffer.from(textParts[1], 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('Decryption failed:', error);
        return text; // Return original text if decryption fails (might be unencrypted data)
    }
}
