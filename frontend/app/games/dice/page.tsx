'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { FormatUtils } from '@shared/utils';
import { GAME_CONFIGS } from '@shared/constants';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';

interface DiceResult {
  roll: number;
  win: boolean;
}

interface BetResult {
  bet: any;
  newBalance: number;
  win: boolean;
}

export default function DicePage() {
  const { user, refreshUser } = useAuth();
  const { token } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [betAmount, setBetAmount] = useState(1);
  const [prediction, setPrediction] = useState<'over' | 'under'>('over');
  const [target, setTarget] = useState(50);
  const [isRolling, setIsRolling] = useState(false);
  const [lastResult, setLastResult] = useState<DiceResult | null>(null);
  const [multiplier, setMultiplier] = useState(2);
  
  const gameConfig = GAME_CONFIGS.dice;

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/games');
    }
  }, [user, router]);

  // Calculate multiplier when target or prediction changes
  useEffect(() => {
    const winChance = prediction === 'over' ? (100 - target) / 100 : target / 100;
    const houseEdge = 0.01;
    const newMultiplier = (1 - houseEdge) / winChance;
    setMultiplier(newMultiplier);
  }, [target, prediction]);

  const handleRoll = async () => {
    if (!user || isRolling) return;
    
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

    setIsRolling(true);
    setLastResult(null);

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
          game_type: 'dice',
          amount: betAmount,
          prediction: {
            prediction,
            target,
            multiplier,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        const result: BetResult = data.data;
        setLastResult(result.bet.result);
        
        // Update user balance
        await refreshUser();
        
        toast({
          title: result.win ? "You Won!" : "You Lost",
          description: result.win 
            ? `You won ${FormatUtils.formatCurrency(result.bet.payout)}!`
            : `Better luck next time!`,
          variant: result.win ? "default" : "destructive",
        });
      } else {
        throw new Error(data.error || 'Failed to place bet');
      }
    } catch (error) {
      console.error('Bet error:', error);
      toast({
        title: "Error",
        description: "Failed to place bet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRolling(false);
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
          <h1 className="text-4xl font-bold text-white mb-4">Dice Game</h1>
          <p className="text-muted-foreground">
            Roll the dice and predict if it will be over or under your target number!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Game Area */}
          <div className="space-y-6">
            {/* Dice Display */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-border rounded-lg p-8 relative overflow-hidden">
              {/* Animated background particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-1 h-1 bg-blue-400 rounded-full opacity-20 animate-pulse`}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${2 + Math.random() * 3}s`
                    }}
                  />
                ))}
              </div>
              
              <div className="text-center relative z-10">
                <div className={`w-32 h-32 mx-auto mb-4 rounded-xl flex items-center justify-center border-2 transition-all duration-500 ${
                  isRolling 
                    ? 'bg-yellow-500/30 border-yellow-400 shadow-lg shadow-yellow-400/50 animate-bounce'
                    : lastResult
                      ? lastResult.win
                        ? 'bg-green-500/30 border-green-400 shadow-lg shadow-green-400/50'
                        : 'bg-red-500/30 border-red-400 shadow-lg shadow-red-400/50'
                      : 'bg-primary/20 border-primary/30 hover:bg-primary/30 hover:border-primary/50'
                }`}>
                  {isRolling ? (
                    <div className="animate-spin">
                      <div className="text-4xl">🎲</div>
                    </div>
                  ) : lastResult ? (
                    <div className="text-center transform transition-all duration-300 hover:scale-110">
                      <div className={`text-4xl font-bold mb-2 ${
                        lastResult.win ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {lastResult.roll.toFixed(2)}
                      </div>
                      <div className={`text-sm font-medium animate-pulse ${
                        lastResult.win ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {lastResult.win ? '🎉 WIN!' : '💔 LOSE'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-2 animate-pulse">🎲</div>
                      <div className="text-sm text-muted-foreground">Ready to roll!</div>
                    </div>
                  )}
                </div>
                
                {/* Prediction indicator */}
                <div className="mt-4 p-3 bg-background/50 rounded-lg border border-border/50">
                  <div className="text-sm text-muted-foreground mb-1">Prediction</div>
                  <div className="text-lg font-bold text-primary">
                    {prediction.toUpperCase()} {target}
                  </div>
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
                  <div className="text-white font-medium text-lg">
                    {((prediction === 'over' ? (100 - target) : target)).toFixed(2)}%
                  </div>
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
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Your Balance</div>
                <div className="text-2xl font-bold text-white">
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
              </div>

              {/* Prediction */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <span className="text-lg">🎲</span>
                  Prediction
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPrediction('under')}
                    className={`px-4 py-2 rounded font-medium transition-all duration-200 transform hover:scale-105 ${
                      prediction === 'under'
                        ? 'bg-primary text-white shadow-lg shadow-primary/50'
                        : 'bg-background border border-border text-muted-foreground hover:text-white hover:border-primary/50'
                    }`}
                  >
                    Under
                  </button>
                  <button
                    onClick={() => setPrediction('over')}
                    className={`px-4 py-2 rounded font-medium transition-all duration-200 transform hover:scale-105 ${
                      prediction === 'over'
                        ? 'bg-primary text-white shadow-lg shadow-primary/50'
                        : 'bg-background border border-border text-muted-foreground hover:text-white hover:border-primary/50'
                    }`}
                  >
                    Over
                  </button>
                </div>
              </div>

              {/* Target */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  Target Number: <span className="text-primary font-bold text-lg">{target}</span>
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="2"
                    max="98"
                    value={target}
                    onChange={(e) => setTarget(parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-lg appearance-none cursor-pointer slider hover:shadow-lg transition-all duration-200"
                    style={{
                      background: `linear-gradient(to right, #ef4444 0%, #eab308 50%, #22c55e 100%)`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>2</span>
                  <span>98</span>
                </div>
              </div>

              {/* Roll Button */}
              <button
                onClick={handleRoll}
                disabled={isRolling || betAmount <= 0 || betAmount > user.balance}
                className={`w-full py-4 text-lg font-bold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                  isRolling 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white animate-pulse shadow-lg shadow-yellow-500/50' 
                    : 'bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-lg hover:shadow-primary/50'
                }`}
              >
                {isRolling ? (
                  <div className="flex items-center justify-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>🎲 Rolling...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-xl">🎲</span>
                    Roll Dice
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