import CryptoJS from 'crypto-js';
import crypto from 'crypto';

const SECRET_KEY = process.env.ENCRYPTION_KEY;

if (!SECRET_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is not set. This is required for securing sensitive data.');
}

// Derive a 32-byte key from the secret
const key = crypto.createHash('sha256').update(String(SECRET_KEY)).digest();
const algorithm = 'aes-256-gcm';

/**
 * Encrypts a sensitive string using AES-256-GCM (Node.js crypto).
 * @param text The plain text to encrypt
 * @returns The encrypted string in format "iv:authTag:ciphertext"
 */
export const encrypt = (text: string): string => {
    if (!text) return '';
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag().toString('hex');
        return `${iv.toString('hex')}:${tag}:${encrypted}`;
    } catch (error) {
        console.error('Encryption failed:', error);
        return '';
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
            const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY!);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);
            if (originalText) return originalText;
        } catch (e) {
            // Fall through to try new format or return empty
        }
    }

    // Try Node.js crypto decryption
    try {
        const parts = cipherText.split(':');
        if (parts.length !== 3) {
            // If it's not our format and failed legacy check, it might be invalid or legacy that failed check
            return '';
        }

        const [ivHex, tagHex, encryptedHex] = parts;
        const iv = Buffer.from(ivHex, 'hex');
        const tag = Buffer.from(tagHex, 'hex');

        const decipher = crypto.createDecipheriv(algorithm, key, iv);
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

