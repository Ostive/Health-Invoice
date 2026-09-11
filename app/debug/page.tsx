import { notFound } from 'next/navigation'
import { DebugProfile } from './DebugProfile'

// Developer tool: never exposed in production builds
export default function DebugPage() {
    if (process.env.NODE_ENV === 'production') notFound()
    return <DebugProfile />
}
