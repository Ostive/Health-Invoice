import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
    ...nextVitals,
    ...nextTs,
    {
        rules: {
            'react/no-unescaped-entities': 'off',
            '@next/next/no-html-link-for-pages': 'off',
            '@next/next/no-img-element': 'off',
            'react-hooks/exhaustive-deps': 'warn',
            // Newly enforced by eslint-config-next 16 — kept as warnings until the backlog is paid down
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/ban-ts-comment': 'warn',
            'react-hooks/set-state-in-effect': 'warn',
        },
    },
    {
        files: ['*.config.js'],
        rules: { '@typescript-eslint/no-require-imports': 'off' },
    },
    globalIgnores([
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
        'playwright-report/**',
        'test-results/**',
        'supabase/**',
    ]),
])
