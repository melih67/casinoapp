'use client';

import { useAuth } from './providers';
import { GameGrid } from '@/components/games/GameGrid';
import { HeroSection } from '@/components/home/HeroSection';
import { StatsSection } from '@/components/home/StatsSection';
import { RecentBets } from '@/components/home/RecentBets';
import { Leaderboard } from '@/components/home/Leaderboard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AuthModal } from '@/components/auth/AuthModal';
import { useState } from 'react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <HeroSection 
        onGetStarted={() => setShowAuthModal(true)}
        isAuthenticated={!!user}
      />

      {user ? (
        // Authenticated user view
        <>
          {/* User Stats */}
          <StatsSection />
          
          {/* Games Grid */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Choose Your Game
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Select from our exciting collection of casino games. Each game offers 
                unique thrills and opportunities to win big!
              </p>
            </div>
            <GameGrid />
          </section>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RecentBets />
            <Leaderboard />
          </div>
        </>
      ) : (
        // Guest user view
        <>
          {/* Games Preview */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Our Casino Games
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experience the thrill of our premium casino games. Sign up now to start playing!
              </p>
            </div>
            <GameGrid preview={true} onGameClick={() => setShowAuthModal(true)} />
          </section>

          {/* Features Section */}
          <section className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Why Choose Our Casino?
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="casino-card text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Secure & Safe</h3>
                <p className="text-muted-foreground">
                  Your account and transactions are protected with enterprise-grade security.
                </p>
              </div>
              
              <div className="casino-card text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Instant Play</h3>
                <p className="text-muted-foreground">
                  No downloads required. Start playing immediately in your browser.
                </p>
              </div>
              
              <div className="casino-card text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Fair Gaming</h3>
                <p className="text-muted-foreground">
                  Provably fair games with transparent algorithms and honest payouts.
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center py-16">
            <div className="casino-card max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Start Playing?
              </h2>
              <p className="text-muted-foreground mb-8">
                Join thousands of players and start your casino journey today. 
                Get $1,000 in free play money when you sign up!
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="casino-button text-lg px-8 py-3"
              >
                Sign Up Now
              </button>
            </div>
          </section>
        </>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}