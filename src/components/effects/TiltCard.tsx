'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface TiltCardProps {
    children: ReactNode;
    className?: string;
}

export default function TiltCard({ children, className = '' }: TiltCardProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className={`relative group ${className}`}
        >
            {/* Dynamic glow effect that reveals on hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-white/0 via-white/10 to-white/0 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />

            <div className="relative h-full bg-neutral-900 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
                {children}
            </div>
        </motion.div>
    );
}
