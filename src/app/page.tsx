import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 animate-fade-in neon-border">
              <span className="w-2 h-2 bg-secondary rounded-full animate-pulse-soft shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
              <span className="text-sm font-medium text-secondary">Powered by AI</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold mb-6 animate-slide-up tracking-tight">
              <span className="text-foreground">Your Personal</span>
              <span className="block gradient-text mt-2">
                AI Stylist
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted mb-10 animate-slide-up max-w-2xl mx-auto" style={{ animationDelay: '0.1s' }}>
              Digitize your wardrobe and get perfect outfit suggestions for any occasion.
              Let AI be your personal fashion consultant.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link href="/login?signup=true">
                <Button size="lg" className="w-full sm:w-auto">
                  Start For Free
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              Three simple steps to transform your wardrobe experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center group glass-card rounded-2xl p-8 hover:shadow-[0_0_40px_rgba(224,64,251,0.1)] transition-all duration-300">
              <div className="w-20 h-20 mx-auto mb-6 gradient-hero rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 group-hover:shadow-primary/50 transition-all duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Scan Your Clothes</h3>
              <p className="text-muted">
                Take photos of your clothing items. Our AI analyzes colors, materials, and style to create a digital twin.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center group glass-card rounded-2xl p-8 hover:shadow-[0_0_40px_rgba(0,229,255,0.1)] transition-all duration-300">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-secondary to-[#18ffff] rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/30 group-hover:scale-110 group-hover:shadow-secondary/50 transition-all duration-300">
                <svg className="w-10 h-10 text-[#06071b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Build Your Closet</h3>
              <p className="text-muted">
                All your items are stored in a beautiful digital closet. Browse, filter, and organize your wardrobe.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center group glass-card rounded-2xl p-8 hover:shadow-[0_0_40px_rgba(255,215,64,0.1)] transition-all duration-300">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-accent to-[#ffab00] rounded-2xl flex items-center justify-center shadow-lg shadow-accent/30 group-hover:scale-110 group-hover:shadow-accent/50 transition-all duration-300">
                <svg className="w-10 h-10 text-[#06071b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Get AI Suggestions</h3>
              <p className="text-muted">
                Tell us the occasion and our AI stylist will pick the perfect outfit from your wardrobe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card rounded-3xl p-10 sm:p-16 neon-border animate-border-shimmer">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ready to upgrade your style?
            </h2>
            <p className="text-muted mb-8 max-w-xl mx-auto">
              Join thousands of fashion-forward users who have transformed their wardrobe experience with AI.
            </p>
            <Link href="/login?signup=true">
              <Button size="lg">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted text-sm">
          <p>© 2025 DressAI. Powered by Google Gemini AI.</p>
        </div>
      </footer>
    </div>
  );
}
