'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface SlotSymbol {
  symbol: string;
  value: number;
  color: string;
}

interface SpinResult {
  reels: string[];
  winAmount: number;
  winType: string;
}

const SLOT_SYMBOLS: SlotSymbol[] = [
  { symbol: '🍒', value: 2, color: 'text-red-500' },
  { symbol: '🍋', value: 3, color: 'text-yellow-500' },
  { symbol: '🍊', value: 4, color: 'text-orange-500' },
  { symbol: '🍇', value: 5, color: 'text-purple-500' },
  { symbol: '🔔', value: 8, color: 'text-yellow-400' },
  { symbol: '⭐', value: 10, color: 'text-yellow-300' },
  { symbol: '💎', value: 15, color: 'text-blue-400' },
  { symbol: '🎰', value: 25, color: 'text-green-400' },
  { symbol: '💰', value: 50, color: 'text-yellow-200' },
  { symbol: '👑', value: 100, color: 'text-purple-300' }
];

const REEL_SYMBOLS = [
  '🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '💎', '🎰', '💰', '👑',
  '🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '💎',
  '🍒', '🍋', '🍊', '🍇', '🔔',
  '🍒', '🍋', '🍊'
];

export default function SlotsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [betAmount, setBetAmount] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState(['🍒', '🍒', '🍒']);
  const [lastWin, setLastWin] = useState<SpinResult | null>(null);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [spinCount, setSpinCount] = useState(0);
  const [reelAnimations, setReelAnimations] = useState([false, false, false]);
  const [jackpotAmount, setJackpotAmount] = useState(10000);
  const [recentWins, setRecentWins] = useState<SpinResult[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/games');
    }
  }, [user, router]);

  useEffect(() => {
    // Simulate jackpot growing
    const interval = setInterval(() => {
      setJackpotAmount(prev => prev + Math.random() * 10);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getRandomSymbol = () => {
    return REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)];
  };

  const calculateWinnings = (spinReels: string[]): SpinResult => {
    const [reel1, reel2, reel3] = spinReels;
    let winAmount = 0;
    let winType = '';

    // Check for jackpot (three crowns)
    if (reel1 === '👑' && reel2 === '👑' && reel3 === '👑') {
      winAmount = jackpotAmount;
      winType = 'JACKPOT! 👑👑👑';
      setJackpotAmount(10000); // Reset jackpot
    }
    // Check for three of a kind
    else if (reel1 === reel2 && reel2 === reel3) {
      const symbol = SLOT_SYMBOLS.find(s => s.symbol === reel1);
      if (symbol) {
        winAmount = betAmount * symbol.value;
        winType = `Three ${symbol.symbol}s!`;
      }
    }
    // Check for two of a kind
    else if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
      const matchingSymbol = reel1 === reel2 ? reel1 : reel2 === reel3 ? reel2 : reel1;
      const symbol = SLOT_SYMBOLS.find(s => s.symbol === matchingSymbol);
      if (symbol) {
        winAmount = betAmount * Math.max(1, Math.floor(symbol.value / 3));
        winType = `Two ${symbol.symbol}s!`;
      }
    }
    // Special combinations
    else if (spinReels.includes('🍒') && spinReels.includes('🍋') && spinReels.includes('🍊')) {
      winAmount = betAmount * 3;
      winType = 'Fruit Combo! 🍒🍋🍊';
    }
    else if (spinReels.includes('💎') && spinReels.includes('⭐')) {
      winAmount = betAmount * 2;
      winType = 'Lucky Stars! 💎⭐';
    }

    return { reels: spinReels, winAmount, winType };
  };

  const spin = async () => {
    if (!user || betAmount <= 0 || betAmount > user.balance) {
      toast({
        title: "Invalid Bet",
        description: "Please check your bet amount and balance.",
        variant: "destructive"
      });
      return;
    }

    setIsSpinning(true);
    setReelAnimations([true, true, true]);
    setLastWin(null);

    // Animate reels spinning
    const spinDuration = 2000;
    const reelStopDelays = [0, 300, 600];
    
    // Generate final result
    const finalReels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    
    // Stop reels one by one
    reelStopDelays.forEach((delay, index) => {
      setTimeout(() => {
        setReelAnimations(prev => {
          const newAnimations = [...prev];
          newAnimations[index] = false;
          return newAnimations;
        });
        
        setReels(prev => {
          const newReels = [...prev];
          newReels[index] = finalReels[index];
          return newReels;
        });
      }, spinDuration + delay);
    });

    // Calculate results after all reels stop
    setTimeout(() => {
      const result = calculateWinnings(finalReels);
      setLastWin(result);
      setSpinCount(prev => prev + 1);
      
      if (result.winAmount > 0) {
        setTotalWinnings(prev => prev + result.winAmount);
        setRecentWins(prev => [result, ...prev.slice(0, 4)]);
        
        if (result.winType.includes('JACKPOT')) {
          toast({
            title: "🎉 JACKPOT! 🎉",
            description: `You won $${result.winAmount.toFixed(2)}!`,
            duration: 5000
          });
        } else {
          toast({
            title: "🎰 Winner!",
            description: `${result.winType} - $${result.winAmount.toFixed(2)}`,
          });
        }
      } else {
        toast({
          title: "Try Again!",
          description: "Better luck next spin!",
          variant: "destructive"
        });
      }
      
      setIsSpinning(false);
    }, spinDuration + 800);
  };

  const getSymbolInfo = (symbol: string) => {
    return SLOT_SYMBOLS.find(s => s.symbol === symbol) || { symbol, value: 1, color: 'text-gray-400' };
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 p-4">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-pink-500/10 to-transparent rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            🎰 Slot Machine
          </h1>
          <p className="text-xl text-gray-300">Spin to win big!</p>
        </div>

        {/* Jackpot Display */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold text-2xl md:text-4xl py-4 px-8 rounded-2xl shadow-2xl border-4 border-yellow-300 animate-pulse">
            💰 JACKPOT: ${jackpotAmount.toFixed(2)} 💰
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Slot Machine */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border-4 border-yellow-500">
              {/* Machine Header */}
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-xl py-2 px-6 rounded-full inline-block">
                  🎰 LUCKY SLOTS 🎰
                </div>
              </div>

              {/* Reels Container */}
              <div className="bg-black rounded-2xl p-6 mb-6 border-4 border-gray-600">
                <div className="grid grid-cols-3 gap-4">
                  {reels.map((symbol, index) => {
                    const symbolInfo = getSymbolInfo(symbol);
                    return (
                      <div key={index} className="relative">
                        <div className="bg-white rounded-xl h-32 flex items-center justify-center border-4 border-gray-300 overflow-hidden">
                          {reelAnimations[index] ? (
                            <div className="animate-spin text-6xl">🎰</div>
                          ) : (
                            <div className={`text-6xl ${symbolInfo.color} transition-all duration-500 transform hover:scale-110`}>
                              {symbol}
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                          Reel {index + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Win Display */}
              {lastWin && lastWin.winAmount > 0 && (
                <div className="text-center mb-6">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-xl py-3 px-6 rounded-xl animate-bounce">
                    🎉 {lastWin.winType} - ${lastWin.winAmount.toFixed(2)} 🎉
                  </div>
                </div>
              )}

              {/* Spin Button */}
              <div className="text-center">
                <button
                  onClick={spin}
                  disabled={isSpinning || betAmount > user.balance}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold text-2xl py-4 px-12 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg border-4 border-red-400"
                >
                  {isSpinning ? '🎰 SPINNING...' : '🎰 SPIN'}
                </button>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Balance & Stats */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-400">Balance</div>
                <div className="text-2xl font-bold text-green-400">${user.balance.toFixed(2)}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-400">Total Winnings</div>
                  <div className="text-lg font-bold text-yellow-400">${totalWinnings.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Spins</div>
                  <div className="text-lg font-bold text-blue-400">{spinCount}</div>
                </div>
              </div>
            </div>

            {/* Bet Controls */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Bet Amount</h3>
              
              <div className="space-y-4">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  min="0.01"
                  max={user.balance}
                  step="0.01"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isSpinning}
                />
                
                <div className="grid grid-cols-3 gap-2">
                  {[1, 5, 10, 25, 50, 100].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                      disabled={isSpinning}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setBetAmount(user.balance)}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  disabled={isSpinning}
                >
                  Max Bet
                </button>
              </div>
            </div>

            {/* Recent Wins */}
            {recentWins.length > 0 && (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Wins</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {recentWins.map((win, index) => (
                    <div key={index} className="flex justify-between items-center text-sm bg-gray-700 rounded-lg p-2">
                      <div className="flex gap-1">
                        {win.reels.map((symbol, i) => (
                          <span key={i} className="text-lg">{symbol}</span>
                        ))}
                      </div>
                      <span className="text-green-400 font-bold">${win.winAmount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Paytable */}
        <div className="mt-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-6 text-center">💰 Paytable</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {SLOT_SYMBOLS.map((symbol, index) => (
              <div key={index} className="text-center bg-gray-700 rounded-lg p-4">
                <div className={`text-3xl mb-2 ${symbol.color}`}>{symbol.symbol}</div>
                <div className="text-white font-semibold">3x = {symbol.value}:1</div>
                <div className="text-gray-400 text-sm">2x = {Math.max(1, Math.floor(symbol.value / 3))}:1</div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-3 px-6 rounded-xl inline-block">
              👑👑👑 = JACKPOT!
            </div>
          </div>
        </div>

        {/* Game Rules */}
        <div className="mt-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">🎯 How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-2">Basic Rules:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Set your bet amount</li>
                <li>• Click SPIN to start</li>
                <li>• Match symbols to win</li>
                <li>• Three of a kind pays the most</li>
                <li>• Special combinations give bonus wins</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Special Features:</h4>
              <ul className="space-y-1 text-sm">
                <li>• 👑👑👑 = Progressive Jackpot</li>
                <li>• 🍒🍋🍊 = Fruit Combo (3x bet)</li>
                <li>• 💎⭐ = Lucky Stars (2x bet)</li>
                <li>• Higher value symbols = bigger wins</li>
                <li>• Jackpot grows over time</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}