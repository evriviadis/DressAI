'use client';

import { useState, useEffect } from 'react';

const FUNNY_MESSAGES = [
    "Sneaking into your closet...",
    "Consulting with the fashion police...",
    "Checking if it's raining cats and dogs...",
    "Trying to find matching socks...",
    "Analyzing 4,000 possibilities...",
    "Asking ChatGPT for style advice... just kidding.",
    "Ironing out the details...",
    "Making sure you don't look like a potato...",
    "Loading high-fashion algorithms...",
    "Measuring the vibe...",
    "Calling your mom to ask what you should wear...",
    "Calculating the optimal swag levels...",
    "Looking for that one shirt you haven't washed yet..."
];

interface FunnyLoaderProps {
    className?: string;
}

export default function FunnyLoader({ className = '' }: FunnyLoaderProps) {
    const [messageIndex, setMessageIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsFading(true);
            setTimeout(() => {
                setMessageIndex((prev) => (prev + 1) % FUNNY_MESSAGES.length);
                setIsFading(false);
            }, 300);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`flex flex-col items-center justify-center gap-6 py-16 ${className}`}>
            {/* Pulsing Spinner */}
            <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-border-light border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl animate-pulse-soft">👗</span>
                </div>
            </div>

            {/* Rotating Message */}
            <p
                className={`text-muted text-center text-sm sm:text-base font-medium max-w-xs transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'
                    }`}
            >
                {FUNNY_MESSAGES[messageIndex]}
            </p>

            {/* Progress dots */}
            <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-primary/40 animate-pulse-soft"
                        style={{ animationDelay: `${i * 0.3}s` }}
                    />
                ))}
            </div>
        </div>
    );
}
