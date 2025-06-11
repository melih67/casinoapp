'use client';

import { useAuth } from '@/app/providers';
import { useAuthStore } from '@/stores/authStore';
import { FormatUtils } from '@shared/utils'; // <-- CHANGED
import { Bet } from '@shared/types';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function RecentBets() {
  const { user } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentBets = async () => {
      if (!user) return;

      try {
        const { token } = useAuthStore.getState();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games/history?limit=5`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const { data } = await response.json();
          setBets(data.bets || []);
        }
      } catch (error) {
        console.error('Failed to fetch recent bets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentBets();
  }, [user]);

  if (!user) return null;

  const getGameIcon = (gameType: string) => {
    if (!gameType) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    }
    
    switch (gameType) {
      case 'dice':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h14v14H5V5zm2 2a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2zM7 12a1 1 0 100 2 1 1 0 000-2zm5 0a1 1 0 100 2 1 1 0 000-2zm5 0a1 1 0 100 2 1 1 0 000-2zM7 17a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z" />
          </svg>
        );
      case 'coinflip':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
    }
  };

  const getGameDisplayName = (gameType: string) => {
    if (!gameType) return 'Unknown Game';
    
    switch (gameType) {
      case 'dice':
        return 'Dice';
      case 'coinflip':
        return 'Coin Flip';
      case 'crash':
        return 'Crash';
      case 'roulette':
        return 'Roulette';
      case 'blackjack':
        return 'Blackjack';
      case 'slots':
        return 'Slots';
      default:
        return gameType.charAt(0).toUpperCase() + gameType.slice(1);
    }
  };

  return (
    <div className="casino-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <h2 className="text-xl font-bold text-white">Recent Bets</h2>
        </div>
        <a 
          href="/history" 
          className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
        >
          View All
        </a>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      ) : bets.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-muted-foreground mb-2">No bets yet</p>
          <p className="text-sm text-muted-foreground">Start playing to see your betting history here!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bets.map((bet) => (
            <div 
              key={bet.id} 
              className="flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  bet.payout > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {getGameIcon(bet.game_type)}
                </div>
                <div>
                  <div className="font-medium text-white">
                    {getGameDisplayName(bet.game_type)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {FormatUtils.formatDate(bet.created_at)} {/* <-- CHANGED */}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium text-white">
                  {FormatUtils.formatCurrency(bet.amount)}
                </div>
                <div className={`text-xs font-medium ${
                  bet.payout > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {bet.payout > 0 ? '+' : ''}{FormatUtils.formatCurrency(bet.payout - bet.amount)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}