'use client';

import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'glass';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className = '', variant = 'default', padding = 'md', hover = false, children, ...props }, ref) => {
        const baseStyles = 'rounded-2xl transition-all duration-200';

        const variants = {
            default: 'bg-card border border-border',
            elevated: 'bg-card shadow-lg shadow-black/5',
            glass: 'glass',
        };

        const paddings = {
            none: '',
            sm: 'p-3',
            md: 'p-5',
            lg: 'p-7',
        };

        const hoverStyles = hover ? 'hover:bg-card-hover hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';

        return (
            <div
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${hoverStyles} ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export default Card;
