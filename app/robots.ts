import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://facturier-soignant-ai.vercel.app'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/api/', '/nouveau-mot-de-passe', '/debug'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
