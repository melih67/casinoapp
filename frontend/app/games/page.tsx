'use client';

import { GameGrid } from '@/components/games/GameGrid';
import { useAuth } from '@/app/providers';
import { AuthModal } from '@/components/auth/AuthModal';
import { useState } from 'react';

export default function GamesPage() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleGameClick = () => {
    if (!user) {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Casino Games
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose from our exciting collection of casino games. 
              Test your luck and skill with dice, coinflip, crash, and blackjack!
            </p>
          </div>

          {/* Games Grid */}
          <GameGrid preview={!user} onGameClick={handleGameClick} />

          {/* Info Section */}
          {!user && (
            <div className="mt-16 text-center">
              <div className="bg-card border border-border rounded-lg p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Ready to Play?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Sign up now to get started with $1,000 in free play money!
                </p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="casino-button px-8 py-3 text-lg"
                >
                  Sign Up & Play
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}