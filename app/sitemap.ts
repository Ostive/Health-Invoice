import { MetadataRoute } from 'next'

const PUBLIC_PAGES: { path: string; priority: number; changeFrequency: 'yearly' | 'monthly' }[] = [
    { path: '', priority: 1, changeFrequency: 'monthly' },
    { path: '/inscription', priority: 0.8, changeFrequency: 'yearly' },
    { path: '/connexion', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/cgu', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/confidentialite', priority: 0.3, changeFrequency: 'yearly' },
]

// The dashboard is private: it is excluded here and disallowed in robots.ts
export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://facturier-soignant-ai.vercel.app'

    return PUBLIC_PAGES.map(page => ({
        url: `${baseUrl}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
    }))
}
