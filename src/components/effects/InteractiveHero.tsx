'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';

const clothes = [
    { src: '/images/clothes/jacket-placeholder', alt: 'Leather Jacket', yOffset: 20 },
    { src: '/images/clothes/shirt-placeholder', alt: 'White Shirt', yOffset: -50 },
    { src: '/images/clothes/pants-placeholder', alt: 'Jeans', yOffset: 40 },
    { src: '/images/clothes/dress-placeholder', alt: 'Black Dress', yOffset: -20 },
    { src: '/images/clothes/sneaker-placeholder', alt: 'Sneakers', yOffset: 60 },
];

export default function InteractiveHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start'],
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
    const y3 = useTransform(scrollYProgress, [0, 1], [0, 300]);

    const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 45]);
    const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -30]);

    return (
        <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* SVG Filter for Gooey Water Effect */}
            <svg width="0" height="0" className="absolute hidden">
                <filter id="goo">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur" />
                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 60 -30" result="goo" />
                    <feBlend in="SourceGraphic" in2="goo" />
                </filter>
            </svg>

            {/* We will use placeholder divs with nice gradients until we have actual images */}
            <motion.div
                style={{ y: y1, rotate: rotate1 }}
                className="absolute top-[10%] left-[5%] w-32 h-40 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 shadow-2xl flex items-center justify-center -rotate-12 backdrop-blur-sm"
            >
                <span className="text-4xl">🧥</span>
            </motion.div>

            <motion.div
                style={{ y: y2, rotate: rotate2 }}
                className="absolute top-[40%] right-[10%] w-28 h-36 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 shadow-2xl flex items-center justify-center rotate-6 backdrop-blur-sm"
            >
                <span className="text-4xl">👟</span>
            </motion.div>

            <motion.div
                style={{ y: y3, rotate: rotate1 }}
                className="absolute bottom-[20%] left-[20%] w-40 h-48 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 shadow-2xl flex items-center justify-center rotate-12 backdrop-blur-sm"
            >
                <span className="text-5xl">👗</span>
            </motion.div>

            <motion.div
                style={{ y: y1, rotate: rotate2 }}
                className="absolute top-[15%] right-[25%] w-24 h-24 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 shadow-2xl flex items-center justify-center -rotate-6 backdrop-blur-sm opacity-50"
            >
                <span className="text-3xl">🧦</span>
            </motion.div>

            {/* Dynamic Liquid Water Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none mix-blend-screen opacity-50" style={{ filter: 'url(#goo)' }}>
                <motion.div
                    animate={{
                        x: ['-20%', '30%', '-10%', '-20%'],
                        y: ['-10%', '30%', '10%', '-10%'],
                        scale: [1, 1.3, 0.8, 1],
                        rotate: [0, 90, 180, 360],
                    }}
                    transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-0 left-[20%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-white rounded-full blur-xl"
                />
                <motion.div
                    animate={{
                        x: ['30%', '-20%', '20%', '30%'],
                        y: ['30%', '-10%', '-30%', '30%'],
                        scale: [0.8, 1.2, 1.4, 0.8],
                        rotate: [360, 180, 90, 0],
                    }}
                    transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                    className="absolute bottom-0 right-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-neutral-400 rounded-full blur-xl"
                />
                <motion.div
                    animate={{
                        x: ['0%', '40%', '-40%', '0%'],
                        y: ['0%', '-40%', '40%', '0%'],
                        scale: [1, 0.7, 1.3, 1],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-white/60 rounded-full blur-2xl"
                />
            </div>
        </div>
    );
}
