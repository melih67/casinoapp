'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { FormatUtils } from '@shared/utils';
import { GAME_CONFIGS } from '@shared/constants';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';

interface CoinflipResult {
  result: 'heads' | 'tails';
  win: boolean;
}

interface BetResult {
  bet: any;
  newBalance: number;
  win: boolean;
}

export default function CoinflipPage() {
  const { user, refreshUser } = useAuth();
  const { token } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [betAmount, setBetAmount] = useState(1);
  const [prediction, setPrediction] = useState<'heads' | 'tails'>('heads');
  const [isFlipping, setIsFlipping] = useState(false);
  const [lastResult, setLastResult] = useState<CoinflipResult | null>(null);
  const [coinAnimation, setCoinAnimation] = useState('');
  
  const gameConfig = GAME_CONFIGS.coinflip;
  const multiplier = 1.96; // 2x with 2% house edge

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/games');
    }
  }, [user, router]);

  const handleFlip = async () => {
    if (!user || isFlipping) return;
    
    if (betAmount > user.balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this bet.",
        variant: "destructive",
      });
      return;
    }

    if (betAmount < gameConfig.minBet || betAmount > gameConfig.maxBet) {
      toast({
        title: "Invalid Bet Amount",
        description: `Bet must be between ${FormatUtils.formatCurrency(gameConfig.minBet)} and ${FormatUtils.formatCurrency(gameConfig.maxBet)}.`,
        variant: "destructive",
      });
      return;
    }

    setIsFlipping(true);
    setLastResult(null);
    setCoinAnimation('animate-spin');

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/games/bet', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          game_type: 'coinflip',
          amount: betAmount,
          prediction: {
            prediction,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        const result: BetResult = data.data;
        
        // Simulate coin flip animation
        setTimeout(() => {
          setCoinAnimation('');
          setLastResult(result.bet.result);
          
          // Update user balance
          refreshUser();
          
          toast({
            title: result.win ? "You Won!" : "You Lost",
            description: result.win 
              ? `You won ${FormatUtils.formatCurrency(result.bet.payout)}!`
              : `Better luck next time!`,
            variant: result.win ? "default" : "destructive",
          });
        }, 2000); // 2 second animation
      } else {
        throw new Error(data.error || 'Failed to place bet');
      }
    } catch (error) {
      console.error('Bet error:', error);
      setCoinAnimation('');
      toast({
        title: "Error",
        description: "Failed to place bet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setIsFlipping(false), 2000);
    }
  };

  const potentialWin = betAmount * multiplier;

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <span className="text-5xl">🪙</span>
            Coinflip
          </h1>
          <p className="text-muted-foreground text-lg">
            Classic heads or tails! 50/50 chance to double your money!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Game Area */}
          <div className="space-y-6">
            {/* Coin Display */}
            <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-lg p-8 shadow-lg">
              {/* Animated Background */}
              <div className="absolute inset-0 overflow-hidden rounded-lg">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-400/20 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                <div className="absolute top-1/4 -right-4 w-6 h-6 bg-blue-400/20 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
                <div className="absolute -bottom-4 left-1/3 w-10 h-10 bg-green-400/20 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
              </div>
              
              <div className="text-center relative z-10">
                <div className="w-48 h-48 mx-auto mb-6 relative">
                  <div className={`w-full h-full rounded-full border-4 border-primary/50 flex items-center justify-center transition-all duration-500 transform hover:scale-105 ${
                    coinAnimation
                  } ${
                    isFlipping ? 'animate-spin' : ''
                  } ${
                    lastResult?.win ? 'animate-pulse' : ''
                  }`}
                       style={{
                         background: lastResult 
                           ? (lastResult.result === 'heads' 
                               ? 'linear-gradient(45deg, #ffd700, #ffed4e, #ffd700)' 
                               : 'linear-gradient(45deg, #c0c0c0, #e5e5e5, #c0c0c0)')
                           : 'linear-gradient(45deg, #ffd700, #ffed4e, #ffd700)',
                         boxShadow: isFlipping 
                           ? '0 0 40px rgba(255, 215, 0, 0.6)' 
                           : lastResult?.win 
                             ? '0 0 30px rgba(34, 197, 94, 0.5)'
                             : '0 8px 32px rgba(0,0,0,0.3)'
                       }}>
                    {isFlipping ? (
                      <div className="text-4xl font-bold text-black animate-pulse">?</div>
                    ) : lastResult ? (
                      <div className="text-center">
                        <div className="text-4xl font-bold text-black mb-2">
                          {lastResult.result === 'heads' ? '👑' : '⚡'}
                        </div>
                        <div className="text-sm font-bold text-black">
                          {lastResult.result.toUpperCase()}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-4xl font-bold text-black mb-2">👑</div>
                        <div className="text-sm font-bold text-black">HEADS</div>
                      </div>
                    )}
                  </div>
                  
                  {lastResult && (
                    <div className={`absolute -bottom-10 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-lg font-bold animate-bounce ${
                      lastResult.win ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/50' : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/50'
                    }`}>
                      {lastResult.win ? '🎉 WIN!' : '💔 LOSE'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Game Stats */}
            <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Game Info
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-background/30 rounded-lg border border-border/50">
                  <span className="text-muted-foreground">Win Chance:</span>
                  <div className="text-white font-medium text-lg">50.00%</div>
                </div>
                <div className="p-3 bg-background/30 rounded-lg border border-border/50">
                  <span className="text-muted-foreground">Multiplier:</span>
                  <div className="text-primary font-bold text-lg">{multiplier.toFixed(2)}x</div>
                </div>
                <div className="p-3 bg-background/30 rounded-lg border border-border/50">
                  <span className="text-muted-foreground">House Edge:</span>
                  <div className="text-white font-medium">{(gameConfig.houseEdge * 100).toFixed(1)}%</div>
                </div>
                <div className="p-3 bg-background/30 rounded-lg border border-border/50">
                  <span className="text-muted-foreground">Potential Win:</span>
                  <div className="text-green-400 font-bold text-lg">
                    {FormatUtils.formatCurrency(potentialWin)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Betting Panel */}
          <div className="space-y-6">
            {/* Balance */}
            <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-lg p-6 shadow-lg">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1 flex items-center justify-center gap-2">
                  <span className="text-lg">💰</span>
                  Your Balance
                </div>
                <div className="text-3xl font-bold text-primary">
                  {FormatUtils.formatCurrency(user.balance)}
                </div>
              </div>
            </div>

            {/* Bet Controls */}
            <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-lg p-6 space-y-6 shadow-lg">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Place Your Bet
              </h3>
              
              {/* Bet Amount */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Bet Amount
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setBetAmount(Math.max(gameConfig.minBet, betAmount / 2))}
                    className="px-3 py-2 bg-background border border-border rounded text-white hover:bg-muted hover:scale-105 transition-all duration-200"
                  >
                    ½
                  </button>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    min={gameConfig.minBet}
                    max={Math.min(gameConfig.maxBet, user.balance)}
                    step="0.01"
                    className="flex-1 px-3 py-2 bg-background border border-border rounded text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  />
                  <button
                    onClick={() => setBetAmount(Math.min(gameConfig.maxBet, user.balance, betAmount * 2))}
                    className="px-3 py-2 bg-background border border-border rounded text-white hover:bg-muted hover:scale-105 transition-all duration-200"
                  >
                    2×
                  </button>
                </div>
                <div className="flex justify-between mt-2">
                  <button
                    onClick={() => setBetAmount(gameConfig.minBet)}
                    className="text-xs text-muted-foreground hover:text-white transition-colors"
                  >
                    Min: {FormatUtils.formatCurrency(gameConfig.minBet)}
                  </button>
                  <button
                    onClick={() => setBetAmount(Math.min(gameConfig.maxBet, user.balance))}
                    className="text-xs text-muted-foreground hover:text-white transition-colors"
                  >
                    Max: {FormatUtils.formatCurrency(Math.min(gameConfig.maxBet, user.balance))}
                  </button>
                </div>
              </div>

              {/* Prediction */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <span className="text-lg">🪙</span>
                  Choose Your Side
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPrediction('heads')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 ${
                      prediction === 'heads'
                        ? 'border-primary bg-primary/20 text-white shadow-lg shadow-primary/50'
                        : 'border-border bg-background text-muted-foreground hover:text-white hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center shadow-lg"
                           style={{ background: 'linear-gradient(45deg, #ffd700, #ffed4e, #ffd700)' }}>
                        <span className="text-black font-bold text-2xl">👑</span>
                      </div>
                      <div className="font-bold text-lg">Heads</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setPrediction('tails')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 ${
                      prediction === 'tails'
                        ? 'border-primary bg-primary/20 text-white shadow-lg shadow-primary/50'
                        : 'border-border bg-background text-muted-foreground hover:text-white hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center shadow-lg"
                           style={{ background: 'linear-gradient(45deg, #c0c0c0, #e5e5e5, #c0c0c0)' }}>
                        <span className="text-black font-bold text-2xl">⚡</span>
                      </div>
                      <div className="font-bold text-lg">Tails</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Flip Button */}
              <button
                onClick={handleFlip}
                disabled={isFlipping || betAmount <= 0 || betAmount > user.balance}
                className={`w-full py-4 text-lg font-bold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                  isFlipping 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white animate-pulse shadow-lg shadow-yellow-500/50' 
                    : 'bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-lg hover:shadow-primary/50'
                }`}
              >
                {isFlipping ? (
                  <div className="flex items-center justify-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>🪙 Flipping...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-xl">🪙</span>
                    Flip Coin
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}