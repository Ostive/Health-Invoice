import CryptoJS from 'crypto-js';
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';

let cachedKey: Buffer | null = null;

function getSecretKey(): string {
    const secret = process.env.ENCRYPTION_KEY;
    if (!secret) {
        throw new Error('ENCRYPTION_KEY environment variable is not set. Set it in .env.local before encrypting or decrypting sensitive data.');
    }
    return secret;
}

function getKey(): Buffer {
    if (!cachedKey) {
        cachedKey = crypto.createHash('sha256').update(getSecretKey()).digest();
    }
    return cachedKey;
}

/**
 * Encrypts a sensitive string using AES-256-GCM (Node.js crypto).
 * @param text The plain text to encrypt
 * @returns The encrypted string in format "iv:authTag:ciphertext"
 */
export const encrypt = (text: string): string => {
    if (!text) return '';
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, getKey(), iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag().toString('hex');
        return `${iv.toString('hex')}:${tag}:${encrypted}`;
    } catch (error) {
        console.error('Encryption failed:', error);
        throw error;
    }
};

/**
 * Decrypts an encrypted string. Supports both new (Node.js crypto) and legacy (CryptoJS) formats.
 * @param cipherText The encrypted string
 * @returns The decrypted plain text
 */
export const decrypt = (cipherText: string): string => {
    if (!cipherText) return '';

    // Legacy support for CryptoJS (starts with "Salted__" in Base64 -> "U2FsdGVkX1")
    if (cipherText.startsWith('U2FsdGVkX1')) {
        try {
            const bytes = CryptoJS.AES.decrypt(cipherText, getSecretKey());
            const originalText = bytes.toString(CryptoJS.enc.Utf8);
            if (originalText) return originalText;
        } catch {
            // Fall through to try new format or return empty
        }
    }

    // Try Node.js crypto decryption
    try {
        const parts = cipherText.split(':');
        if (parts.length !== 3) return '';

        const [ivHex, tagHex, encryptedHex] = parts;
        const iv = Buffer.from(ivHex, 'hex');
        const tag = Buffer.from(tagHex, 'hex');

        const decipher = crypto.createDecipheriv(algorithm, getKey(), iv);
        decipher.setAuthTag(tag);

        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error);
        return '';
    }
};

// Export aliases for backward compatibility
export const encryptData = encrypt;
export const decryptData = decrypt;

