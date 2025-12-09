// Set the env var BEFORE import because the module reads it at top-level
process.env.ENCRYPTION_KEY = 'test-secret-key-very-secure-and-long-enough';

import { encrypt, decrypt } from '@/lib/encryption';

describe('Encryption Utility', () => {
    it('should encrypt and then decrypt to the original value', () => {
        const original = 'Hello World';
        const encrypted = encrypt(original);
        const decrypted = decrypt(encrypted);

        expect(decrypted).toBe(original);
        expect(encrypted).not.toBe(original);
        // Should be in format iv:tag:content
        expect(encrypted.split(':')).toHaveLength(3);
    });

    it('should produce different outputs for the same input (random IV)', () => {
        const text = 'Sensitive Data';
        const enc1 = encrypt(text);
        const enc2 = encrypt(text);

        expect(enc1).not.toBe(enc2);
        expect(decrypt(enc1)).toBe(text);
        expect(decrypt(enc2)).toBe(text);
    });

    it('should handle empty strings', () => {
        expect(encrypt('')).toBe('');
        expect(decrypt('')).toBe('');
    });

    it('should return empty string for malformed ciphertext', () => {
        expect(decrypt('invalid-format')).toBe('');
        expect(decrypt('bad:iv:tag')).toBe(''); // might fail inside crypto but should catch and return ''
    });

    it('should return empty string if decryption fails (wrong key scenario simulation)', () => {
        // We can't easily swap the key of the imported module, but we can try to decrypt something 
        // securely encrypted with another key (or just garbage data that looks correct structure).

        // 32 chars hex IV : 32 chars hex Tag : Data
        // This is "valid structure" but invalid AUTH tag
        const fakeIv = 'a'.repeat(32);
        const fakeTag = 'b'.repeat(32);
        const fakeData = 'c'.repeat(32);
        const malformedAuth = `${fakeIv}:${fakeTag}:${fakeData}`;

        // This should fail inside the decipher because auth tag won't match
        expect(decrypt(malformedAuth)).toBe('');
    });
});
