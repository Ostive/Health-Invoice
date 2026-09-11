import { twMerge } from 'tailwind-merge'

// Joins class names; when two Tailwind utilities conflict the later one wins
// (e.g. a `hidden` passed by the caller overrides a component's base `inline-flex`)
export function cn(...classes: Array<string | false | null | undefined>) {
    return twMerge(...classes)
}
