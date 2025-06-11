'use client';

interface HeroSectionProps {
  onGetStarted: () => void;
  isAuthenticated: boolean;
}

export function HeroSection({ onGetStarted, isAuthenticated }: HeroSectionProps) {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
          Welcome to the
          <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Ultimate Casino
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Experience the thrill of casino gaming with our secure, fair, and exciting platform. 
          Play with fake money and enjoy the ultimate gaming experience.
        </p>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <div className="flex items-center space-x-2 bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border">
            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-white font-medium">Provably Fair</span>
          </div>
          <div className="flex items-center space-x-2 bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border">
            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-white font-medium">100% Secure</span>
          </div>
          <div className="flex items-center space-x-2 bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border">
            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <span className="text-white font-medium">Instant Play</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {!isAuthenticated ? (
            <>
              <button
                onClick={onGetStarted}
                className="casino-button text-lg px-8 py-4 min-w-[200px]"
              >
                Get Started Free
              </button>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd" />
                </svg>
                <span>$1,000 Welcome Bonus</span>
              </div>
            </>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Welcome back! Ready to play?
              </h2>
              <a
                href="#games"
                className="casino-button text-lg px-8 py-4 inline-block"
              >
                Start Playing
              </a>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">10K+</div>
            <div className="text-muted-foreground">Active Players</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">$2M+</div>
            <div className="text-muted-foreground">Total Winnings</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">99.9%</div>
            <div className="text-muted-foreground">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
            <div className="text-muted-foreground">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}