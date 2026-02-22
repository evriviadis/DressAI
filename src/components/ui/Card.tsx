'use client';

import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'glass';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className = '', padding = 'md', hover = false, children, ...props }, ref) => {
        const paddings = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-7' };
        const hoverStyles = hover ? 'hover:-translate-y-0.5 transition-transform cursor-pointer' : '';

        return (
            <div
                ref={ref}
                className={`bg-[#0f0f0f] border border-white/8 ${paddings[padding]} ${hoverStyles} ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';
export default Card;
