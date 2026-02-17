'use client';

import { useEffect, useRef } from 'react';

interface Bubble {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    opacity: number;
    color: string;
    life: number;
    maxLife: number;
}

const COLORS = [
    'rgba(224, 64, 251,',   // rose-pink
    'rgba(0, 229, 255,',     // electric blue
    'rgba(124, 77, 255,',    // purple
    'rgba(255, 215, 64,',    // gold
    'rgba(234, 128, 252,',   // light pink
];

export default function BubbleCursor() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bubblesRef = useRef<Bubble[]>([]);
    const mouseRef = useRef({ x: -100, y: -100 });
    const animationRef = useRef<number>(0);
    const lastSpawnRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove, { passive: true });

        const spawnBubble = () => {
            const color = COLORS[Math.floor(Math.random() * COLORS.length)];
            const radius = Math.random() * 12 + 4;
            const maxLife = Math.random() * 60 + 40;

            bubblesRef.current.push({
                x: mouseRef.current.x,
                y: mouseRef.current.y,
                vx: (Math.random() - 0.5) * 1.5,
                vy: -(Math.random() * 1.5 + 0.5),
                radius,
                opacity: Math.random() * 0.4 + 0.15,
                color,
                life: 0,
                maxLife,
            });
        };

        const animate = (timestamp: number) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Spawn new bubbles at cursor (throttled)
            if (timestamp - lastSpawnRef.current > 50 && mouseRef.current.x > 0) {
                spawnBubble();
                if (Math.random() > 0.5) spawnBubble(); // sometimes spawn 2
                lastSpawnRef.current = timestamp;
            }

            // Update & render bubbles
            bubblesRef.current = bubblesRef.current.filter(bubble => {
                bubble.life++;
                bubble.x += bubble.vx;
                bubble.y += bubble.vy;
                bubble.vx *= 0.99;
                bubble.vy *= 0.995;

                const progress = bubble.life / bubble.maxLife;
                const currentOpacity = bubble.opacity * (1 - progress);
                const currentRadius = bubble.radius * (1 - progress * 0.3);

                if (currentOpacity <= 0.01) return false;

                // Draw bubble
                ctx.beginPath();
                ctx.arc(bubble.x, bubble.y, currentRadius, 0, Math.PI * 2);
                ctx.fillStyle = `${bubble.color} ${currentOpacity})`;
                ctx.fill();

                // Inner highlight
                ctx.beginPath();
                ctx.arc(
                    bubble.x - currentRadius * 0.25,
                    bubble.y - currentRadius * 0.25,
                    currentRadius * 0.35,
                    0,
                    Math.PI * 2
                );
                ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.4})`;
                ctx.fill();

                return bubble.life < bubble.maxLife;
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-50 pointer-events-none"
            style={{ mixBlendMode: 'screen' }}
        />
    );
}
