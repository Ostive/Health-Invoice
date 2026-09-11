import { Hero } from '@/components/landing/Hero'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Features } from '@/components/landing/Features'
import { TargetAudience } from '@/components/landing/TargetAudience'
import { Stats } from '@/components/landing/Stats'
import { Testimonials } from '@/components/landing/Testimonials'
import { Pricing } from '@/components/landing/Pricing'
import { TrustBadges } from '@/components/landing/TrustBadges'
import { FAQ } from '@/components/landing/FAQ'
import { FinalCta } from '@/components/landing/FinalCta'

// Signed-in visitors are redirected to /dashboard by the proxy, so this page stays static
export default function HomePage() {
    return (
        <>
            <Hero />
            <HowItWorks />
            <Features />
            <TargetAudience />
            <Stats />
            <Testimonials />
            <Pricing />
            <TrustBadges />
            <FAQ />
            <FinalCta />
        </>
    )
}
