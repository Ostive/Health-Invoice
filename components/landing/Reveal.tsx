'use client'

import React from 'react'
import { useInView } from './useInView'

interface RevealProps {
    children: React.ReactNode
    delay?: number
    direction?: 'up' | 'down' | 'left' | 'right' | 'none'
    className?: string
    as?: keyof React.JSX.IntrinsicElements
}

export const Reveal: React.FC<RevealProps> = ({
    children,
    delay = 0,
    direction = 'up',
    className = '',
    as: Tag = 'div',
}) => {
    const { ref, inView } = useInView<HTMLDivElement>()

    const hiddenTransform =
        direction === 'up' ? 'translate3d(0, 24px, 0)' :
        direction === 'down' ? 'translate3d(0, -24px, 0)' :
        direction === 'left' ? 'translate3d(24px, 0, 0)' :
        direction === 'right' ? 'translate3d(-24px, 0, 0)' :
        'translate3d(0, 0, 0)'

    const style: React.CSSProperties = {
        opacity: inView ? 1 : 0,
        transform: inView ? 'translate3d(0, 0, 0)' : hiddenTransform,
        transition: `opacity 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        willChange: 'opacity, transform',
    }

    return React.createElement(
        Tag,
        { ref, className, style },
        children
    )
}
