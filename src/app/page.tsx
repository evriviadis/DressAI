'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import InteractiveHero from '@/components/effects/InteractiveHero';
import TiltCard from '@/components/effects/TiltCard';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import MobileNav from '@/components/layout/MobileNav';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in so we can show the mobile nav
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
      }
    };
    checkUser();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && window.location.hash === '#how') {
          // Removes the hash from the URL without triggering a scroll jump
          window.history.replaceState(null, '', window.location.pathname);
        }
      });
    }, { threshold: 0.4 });

    const hero = document.getElementById('hero');
    if (hero) observer.observe(hero);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">

      {/* Hero */}
      <section id="hero" className="relative flex-1 flex flex-col justify-center px-6 sm:px-10 py-24 overflow-hidden min-h-[90vh]">

        <InteractiveHero />

        {/* Content Container - z-10 ensures it sits above the liquid background */}
        <div className="relative z-10 flex flex-col items-center text-center mt-12">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-medium tracking-widest text-white/80 uppercase">The Future of Fashion</span>
          </motion.div>

          {/* Massive Brand Headline */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <h1 className="text-[clamp(4rem,15vw,12rem)] font-extrabold text-white leading-none tracking-tighter mix-blend-overlay opacity-90">
              evryWear
            </h1>
            {/* Glowing overlay text to make it pop against the liquid */}
            <h1 className="absolute inset-0 text-[clamp(4rem,15vw,12rem)] font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 leading-none tracking-tighter">
              evryWear
            </h1>
          </motion.div>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg sm:text-2xl text-neutral-400 max-w-2xl mt-8 mb-12 leading-relaxed font-light"
          >
            Digitize your closet. Get AI outfit suggestions in seconds. <br className="hidden sm:block" />
            <span className="text-white font-medium">Never worry about what to wear again.</span>
          </motion.p>

          {/* CTA Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            <Link
              href="/login?signup=true"
              className="group relative inline-flex items-center justify-center gap-3 bg-white text-black text-base font-semibold px-8 py-4 rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 duration-300"
            >
              {/* Button hover liquid effect */}
              <div className="absolute inset-0 bg-neutral-200 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1] rounded-full" />
              <span className="relative">Start for free</span>
              <svg className="relative w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link href="#how" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors duration-300 flex items-center gap-2">
              How it works
              <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-white/6 mx-6 sm:mx-10" />

      {/* How It Works */}
      <section id="how" className="px-6 sm:px-10 py-24 relative overflow-hidden">

        <div className="relative z-10 grid sm:grid-cols-3 gap-8 sm:gap-12">
          {[
            { n: '01', title: 'Scan', desc: 'Photograph your clothes. AI identifies colors, materials, and style in seconds.' },
            { n: '02', title: 'Organize', desc: 'Build your digital closet. Browse and filter across every category.' },
            { n: '03', title: 'Style', desc: 'Pick the occasion, get a curated outfit pulled from your actual wardrobe.' },
          ].map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <TiltCard>
                <p className="text-xs tracking-[0.2em] text-neutral-600 mb-6">{step.n}</p>
                <h3 className="text-xl font-medium text-white mb-3">{step.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{step.desc}</p>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom CTA strip */}
      <div className="h-px bg-white/6 mx-6 sm:mx-10" />
      <section className="px-6 sm:px-10 py-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 mb-16 md:mb-0">
        <p className="text-lg text-neutral-400 max-w-sm leading-relaxed">
          Ready to know exactly what to wear-evry day?
        </p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href={isAuthenticated ? "/dashboard" : "/login?signup=true"}
            className="inline-flex items-center gap-3 text-sm font-medium text-white border border-white/20 px-8 py-4 hover:border-white hover:bg-white hover:text-black transition-all duration-300"
          >
            {isAuthenticated ? "Go to closet" : "Get started"}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <div className="h-px bg-white/5" />
      <footer className="px-6 sm:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 pb-24 md:pb-6">
        <div className="flex items-center gap-6 text-xs text-neutral-600">
          <p className="text-neutral-500">© 2026 evryWear</p>
          <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
        </div>
        <p className="text-xs text-neutral-600">Powered by AI</p>
      </footer>

      {/* Conditionally render MobileNav if signed in */}
      {isAuthenticated && <MobileNav />}
    </div>
  );
}
