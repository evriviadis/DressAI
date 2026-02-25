'use client';

import React from 'react';

// SVGs for the clothes
const ShirtIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-white/20">
        <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
    </svg>
);

const PantsIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-white/20">
        <path d="M3 14V5a2 2 0 012-2h14a2 2 0 012 2v9" />
        <path d="M5 21v-7a2 2 0 012-2h10a2 2 0 012 2v7" />
        <path d="M12 21v-9" />
    </svg>
);

const DressIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-white/20">
        <path d="M9.5 22h5a1 1 0 001-.84l.58-3.47a2 2 0 011.34-1.63L21 15.11a1 1 0 00.58-1.28l-1-2.5a1 1 0 00-1-.6L16.22 11h-8.44L4.42 10.73a1 1 0 00-1 .6l-1 2.5a1 1 0 00.58 1.28l3.58.95a2 2 0 011.34 1.63l.58 3.47A1 1 0 009.5 22z" />
        <path d="M16 11V6a4 4 0 00-8 0v5" />
    </svg>
);

export default function FloatingClothes() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Left side clothes */}
            <div className="absolute top-[10%] left-[8%] w-16 h-16 animate-float-1 opacity-70">
                <ShirtIcon />
            </div>
            <div className="absolute top-[50%] left-[15%] w-12 h-12 animate-float-2 opacity-50" style={{ animationDelay: '1s' }}>
                <PantsIcon />
            </div>

            {/* Right side clothes */}
            <div className="absolute top-[20%] right-[12%] w-20 h-20 animate-float-3 opacity-60" style={{ animationDelay: '0.5s' }}>
                <DressIcon />
            </div>
            <div className="absolute top-[60%] right-[8%] w-16 h-16 animate-float-1 opacity-50" style={{ animationDelay: '2s' }}>
                <ShirtIcon />
            </div>

            {/* Subtle background glow blobs to make items pop */}
            <div className="absolute top-[15%] left-[5%] w-32 h-32 bg-white/5 blur-3xl rounded-full" />
            <div className="absolute top-[25%] right-[10%] w-40 h-40 bg-white/5 blur-3xl rounded-full" />
        </div>
    );
}
