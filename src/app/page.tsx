import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">

      {/* Hero */}
      <section className="flex-1 flex flex-col justify-center px-6 sm:px-10 py-24">

        {/* Eyebrow */}
        <p className="text-xs tracking-[0.3em] text-neutral-500 uppercase mb-10 animate-fade-in">
          AI-Powered Personal Styling
        </p>

        {/* Headline — editorial scale */}
        <h1 className="text-[clamp(3rem,10vw,8rem)] font-semibold text-white leading-[0.95] tracking-tight mb-10 animate-slide-up">
          Dress<br />
          <span className="text-neutral-600">smarter.</span>
        </h1>

        {/* Subline */}
        <p className="text-base sm:text-lg text-neutral-500 max-w-sm mb-12 leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Your entire wardrobe, digitized. AI outfit suggestions in seconds.
        </p>

        {/* CTA Row */}
        <div className="flex items-center gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Link
            href="/login?signup=true"
            className="inline-flex items-center gap-3 bg-white text-black text-sm font-medium px-7 py-3 hover:bg-neutral-100 transition-colors duration-200"
          >
            Start for free
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link href="#how" className="text-sm text-neutral-600 link-underline hover:text-white transition-colors duration-200">
            How it works
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-white/6 mx-6 sm:mx-10" />

      {/* How It Works */}
      <section id="how" className="px-6 sm:px-10 py-16">
        <div className="grid sm:grid-cols-3 gap-8 sm:gap-12">
          {[
            { n: '01', title: 'Scan', desc: 'Photograph your clothes. AI identifies colors, materials, and style in seconds.' },
            { n: '02', title: 'Organize', desc: 'Build your digital closet. Browse and filter across every category.' },
            { n: '03', title: 'Style', desc: 'Pick the occasion, get a curated outfit pulled from your actual wardrobe.' },
          ].map((step) => (
            <div key={step.n}>
              <p className="text-xs tracking-[0.2em] text-neutral-700 mb-3">{step.n}</p>
              <h3 className="text-lg font-medium text-white mb-2">{step.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA strip */}
      <div className="h-px bg-white/6 mx-6 sm:mx-10" />
      <section className="px-6 sm:px-10 py-12 flex items-center justify-between gap-6">
        <p className="text-sm text-neutral-600 max-w-xs">
          Ready to know what to wear-evry day?
        </p>
        <Link
          href="/login?signup=true"
          className="text-sm text-white border border-white/20 px-6 py-2.5 hover:border-white/60 hover:bg-white/5 transition-all duration-200 whitespace-nowrap"
        >
          Get started →
        </Link>
      </section>

      {/* Footer */}
      <div className="h-px bg-white/5" />
      <footer className="px-6 sm:px-10 py-5 flex items-center justify-between">
        <p className="text-xs text-neutral-800">© 2026 evryWear</p>
        <p className="text-xs text-neutral-800">Powered by Google Gemini</p>
      </footer>

    </div>
  );
}
