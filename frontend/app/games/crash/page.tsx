'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { FormatUtils } from '@shared/utils';
import { GAME_CONFIGS } from '@shared/constants';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';

interface CrashResult {
  crashPoint: number;
  cashoutMultiplier?: number;
  win: boolean;
}

interface BetResult {
  bet: any;
  newBalance: number;
  win: boolean;
}

type GamePhase = 'waiting' | 'flying' | 'crashed';

export default function CrashPage() {
  const { user, refreshUser } = useAuth();
  const { token } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [betAmount, setBetAmount] = useState(1);
  const [autoCashout, setAutoCashout] = useState(2);
  const [gamePhase, setGamePhase] = useState<GamePhase>('waiting');
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [hasBet, setHasBet] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [lastResult, setLastResult] = useState<CrashResult | null>(null);
  const [timeUntilNext, setTimeUntilNext] = useState(5);
  
  const gameConfig = GAME_CONFIGS.crash;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/games');
    }
  }, [user, router]);

  // Generate crash point using house edge
  const generateCrashPoint = (): number => {
    const houseEdge = gameConfig.houseEdge;
    const random = Math.random();
    
    // Use exponential distribution with house edge
    const crashPoint = Math.max(1, Math.floor((Math.log(1 - random) / Math.log(1 - houseEdge)) * 100) / 100);
    return Math.min(crashPoint, 100); // Cap at 100x
  };

  // Start new game
  const startNewGame = () => {
    const newCrashPoint = generateCrashPoint();
    setCrashPoint(newCrashPoint);
    setGamePhase('flying');
    setCurrentMultiplier(1);
    setHasCashedOut(false);
    
    // Enhanced animation with acceleration
    let multiplier = 1;
    const startTime = Date.now();
    let animationSpeed = 16; // Start with 16ms intervals for 60fps
    
    const updateMultiplier = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      
      // Exponential acceleration - gets faster as multiplier increases
      const baseSpeed = 0.08; // Base speed
      const acceleration = Math.pow(multiplier - 1, 1.2) * 0.02; // Exponential acceleration
      const speedMultiplier = baseSpeed + acceleration;
      
      multiplier = 1 + (elapsed * speedMultiplier);
      
      // Dynamic animation speed - gets faster as multiplier increases
      if (multiplier > 2) {
        animationSpeed = Math.max(8, 16 - (multiplier - 2) * 2); // Speed up animation
      }
      
      setCurrentMultiplier(multiplier);
      
      // Auto cashout check
      if (hasBet && !hasCashedOut && multiplier >= autoCashout) {
        cashOut();
      }
      
      // Check if we've reached crash point
      if (multiplier >= newCrashPoint) {
        setGamePhase('crashed');
        setCurrentMultiplier(newCrashPoint);
        
        if (gameIntervalRef.current) {
          clearInterval(gameIntervalRef.current);
        }
        
        // Enhanced crash animation
        const crashElement = document.getElementById('crash-multiplier');
        if (crashElement) {
          crashElement.classList.add('animate-pulse', 'text-red-500');
          setTimeout(() => {
            crashElement.classList.remove('animate-pulse');
          }, 2000);
        }
        
        // Start countdown for next game
        setTimeout(() => {
          setTimeUntilNext(5);
          const countdownInterval = setInterval(() => {
            setTimeUntilNext(prev => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                setGamePhase('waiting');
                setHasBet(false);
                setLastResult(null);
                setTimeout(startNewGame, 1000);
                return 5;
              }
              return prev - 1;
            });
          }, 1000);
        }, 2000);
        return;
      }
      
      // Schedule next update with dynamic speed
      gameIntervalRef.current = setTimeout(updateMultiplier, animationSpeed);
    };
    
    updateMultiplier();
  };

  // Initialize game
  useEffect(() => {
    const timer = setTimeout(() => {
      startNewGame();
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    };
  }, []);

  const placeBet = async () => {
    if (!user || hasBet || gamePhase !== 'waiting') return;
    
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

    setHasBet(true);
    
    toast({
      title: "Bet Placed",
      description: `Bet of ${FormatUtils.formatCurrency(betAmount)} placed. Good luck!`,
    });
  };

  const cashOut = async () => {
    if (!hasBet || hasCashedOut || gamePhase !== 'flying') return;
    
    setHasCashedOut(true);
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Simulate API call for crash game
      const response = await fetch('/api/games/bet', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          game_type: 'crash',
          amount: betAmount,
          prediction: {
            cashoutMultiplier: currentMultiplier,
            autoCashout,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        const payout = betAmount * currentMultiplier;
        
        setLastResult({
          crashPoint: crashPoint!,
          cashoutMultiplier: currentMultiplier,
          win: true,
        });
        
        // Update user balance
        await refreshUser();
        
        toast({
          title: "Cashed Out!",
          description: `You won ${FormatUtils.formatCurrency(payout)} at ${currentMultiplier.toFixed(2)}x!`,
        });
      }
    } catch (error) {
      console.error('Cashout error:', error);
      toast({
        title: "Error",
        description: "Failed to cash out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Auto cashout
  useEffect(() => {
    if (hasBet && !hasCashedOut && gamePhase === 'flying' && currentMultiplier >= autoCashout) {
      cashOut();
    }
  }, [currentMultiplier, autoCashout, hasBet, hasCashedOut, gamePhase]);

  // Handle crash
  useEffect(() => {
    if (gamePhase === 'crashed' && hasBet && !hasCashedOut) {
      setLastResult({
        crashPoint: crashPoint!,
        win: false,
      });
      
      toast({
        title: "Crashed!",
        description: `The rocket crashed at ${crashPoint?.toFixed(2)}x. Better luck next time!`,
        variant: "destructive",
      });
    }
  }, [gamePhase, hasBet, hasCashedOut, crashPoint]);

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Crash</h1>
          <p className="text-muted-foreground">
            Watch the multiplier rise and cash out before it crashes!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Display */}
          <div className="lg:col-span-2 space-y-6">
            {/* Multiplier Display */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-border rounded-lg p-8 h-80 flex items-center justify-center relative overflow-hidden">
              {/* Animated background particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-1 h-1 bg-blue-400 rounded-full opacity-30 animate-pulse`}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${2 + Math.random() * 3}s`
                    }}
                  />
                ))}
              </div>
              
              {gamePhase === 'waiting' ? (
                <div className="text-center z-10">
                  <div className="text-6xl font-bold text-white mb-4 animate-bounce">🚀</div>
                  <div className="text-xl text-muted-foreground mb-2">Next round starting in</div>
                  <div className="text-3xl font-bold text-primary animate-pulse">{timeUntilNext}s</div>
                </div>
              ) : (
                <div className="text-center z-10">
                  <div 
                    id="crash-multiplier"
                    className={`text-8xl font-bold mb-4 transition-all duration-75 transform ${
                      gamePhase === 'crashed' 
                        ? 'text-red-500 scale-110 animate-pulse' 
                        : currentMultiplier > 5 
                          ? 'text-yellow-400 scale-105 animate-pulse'
                          : currentMultiplier > 2
                            ? 'text-green-400 scale-102'
                            : 'text-green-400'
                    }`}
                    style={{
                      textShadow: gamePhase === 'flying' 
                        ? `0 0 ${Math.min(currentMultiplier * 2, 20)}px currentColor`
                        : 'none',
                      filter: currentMultiplier > 3 ? 'brightness(1.2)' : 'none'
                    }}
                  >
                    {currentMultiplier.toFixed(2)}x
                  </div>
                  <div className={`text-2xl font-semibold transition-colors duration-200 ${
                    gamePhase === 'crashed' ? 'text-red-400' : 'text-white'
                  }`}>
                    {gamePhase === 'crashed' ? '💥 CRASHED!' : '🚀 FLYING'}
                  </div>
                  
                  {hasBet && !hasCashedOut && gamePhase === 'flying' && (
                    <div className="mt-4">
                      <div className="text-lg text-muted-foreground">Potential Win:</div>
                      <div className="text-2xl font-bold text-green-400">
                        {FormatUtils.formatCurrency(betAmount * currentMultiplier)}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Animated background */}
              <div className={`absolute inset-0 opacity-10 ${
                gamePhase === 'flying' ? 'animate-pulse' : ''
              }`}>
                <div className="w-full h-full bg-gradient-to-r from-primary/20 to-transparent"></div>
              </div>
            </div>

            {/* Game History */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Crashes</h3>
              <div className="flex flex-wrap gap-2">
                {[2.34, 1.56, 8.92, 1.23, 15.67, 1.89, 3.45, 1.12, 6.78, 2.11].map((crash, index) => (
                  <div
                    key={index}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      crash >= 2 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {crash.toFixed(2)}x
                  </div>
                ))}
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
                    disabled={hasBet}
                    className="px-3 py-2 bg-background border border-border rounded text-white hover:bg-muted hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    ½
                  </button>
                  <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  disabled={hasBet}
                  min={gameConfig.minBet}
                  max={Math.min(gameConfig.maxBet, user.balance)}
                  step="0.01"
                  className="flex-1 px-3 py-2 bg-background border border-border rounded text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 disabled:opacity-50"
                />
                  <button
                    onClick={() => setBetAmount(Math.min(gameConfig.maxBet, user.balance, betAmount * 2))}
                    disabled={hasBet}
                    className="px-3 py-2 bg-background border border-border rounded text-white hover:bg-muted hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    2×
                  </button>
                </div>
              </div>

              {/* Auto Cashout */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  Auto Cashout at <span className="text-primary font-bold">{autoCashout.toFixed(2)}x</span>
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="1.01"
                    max="10"
                    step="0.01"
                    value={autoCashout}
                    onChange={(e) => setAutoCashout(parseFloat(e.target.value))}
                    disabled={hasBet}
                    className="w-full h-3 bg-background rounded-lg appearance-none cursor-pointer slider disabled:opacity-50 transition-all duration-200"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((autoCashout - 1.01) / (10 - 1.01)) * 100}%, #374151 ${((autoCashout - 1.01) / (10 - 1.01)) * 100}%, #374151 100%)`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1.01x</span>
                  <span>10.00x</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {!hasBet ? (
                  <button
                    onClick={placeBet}
                    disabled={gamePhase !== 'waiting' || betAmount <= 0 || betAmount > user.balance}
                    className="w-full casino-button py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 disabled:hover:scale-100 shadow-lg"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-xl">🚀</span>
                      {gamePhase === 'waiting' ? 'Place Bet' : 'Round in Progress'}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={cashOut}
                    disabled={hasCashedOut || gamePhase !== 'flying'}
                    className={`w-full py-3 text-lg font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 shadow-lg ${
                      hasCashedOut 
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-xl">{hasCashedOut ? '✅' : '💰'}</span>
                      {hasCashedOut ? 'Cashed Out!' : 'Cash Out'}
                    </span>
                  </button>
                )}
                
                {hasBet && (
                  <div className="text-center text-sm text-muted-foreground">
                    {hasCashedOut 
                      ? `Cashed out at ${currentMultiplier.toFixed(2)}x`
                      : `Bet: ${FormatUtils.formatCurrency(betAmount)} | Auto: ${autoCashout.toFixed(2)}x`
                    }
                  </div>
                )}
              </div>
            </div>

            {/* Last Result */}
            {lastResult && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Last Round</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Crashed at:</span>
                    <span className="text-white font-medium">{lastResult.crashPoint.toFixed(2)}x</span>
                  </div>
                  {lastResult.cashoutMultiplier && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cashed out at:</span>
                      <span className="text-green-400 font-medium">{lastResult.cashoutMultiplier.toFixed(2)}x</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Result:</span>
                    <span className={`font-medium ${
                      lastResult.win ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {lastResult.win ? 'WIN' : 'LOSE'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}