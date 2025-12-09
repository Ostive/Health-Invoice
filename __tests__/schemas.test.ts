import { SignUpSchema, ClientSchema, OnboardingSchema } from '@/lib/schemas';

describe('Schema Validation', () => {
    describe('SignUpSchema', () => {
        it('should validate a correct email and password', () => {
            const validData = {
                email: 'doctor@example.com',
                password: 'StrongPassword123!',
            };
            const result = SignUpSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should reject a password without special characters', () => {
            const invalidData = {
                email: 'doctor@example.com',
                password: 'StrongPassword123',
            };
            const result = SignUpSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('caractère spécial');
            }
        });

        it('should reject a password that is too short', () => {
            const invalidData = {
                email: 'doctor@example.com',
                password: 'Short1!',
            };
            const result = SignUpSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe('ClientSchema', () => {
        it('should validate a client with all required fields', () => {
            const validData = {
                name: 'Jean Dupont',
                email: 'jean@example.com',
                address: '123 Rue de la Paix',
            };
            const result = ClientSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should require a name', () => {
            const invalidData = {
                email: 'jean@example.com',
            };
            const result = ClientSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should allow optional email to be empty string', () => {
            const validData = {
                name: 'Jean Dupont',
                email: '',
            };
            const result = ClientSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });
    });

    describe('OnboardingSchema', () => {
        it('should validate correct SIRET strings', () => {
            const validData = {
                full_name: "Dr House",
                siret: "12345678901234"
            };
            const result = OnboardingSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail invalid SIRET length', () => {
            const invalidData = {
                full_name: "Dr House",
                siret: "123"
            };
            const result = OnboardingSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    })
});
