'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { FormatUtils } from '@shared/utils';
import { GAME_CONFIGS } from '@shared/constants';

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isActive: boolean;
  finalSlot?: number;
  trail: { x: number; y: number }[];
}

interface GameResult {
  bet: number;
  multiplier: number;
  win: number;
  slot: number;
}

const BOARD_WIDTH = 600;
const BOARD_HEIGHT = 500;
const PEG_ROWS = 16;
const SLOTS = 17;
const BALL_RADIUS = 6;
const PEG_RADIUS = 3;
const GRAVITY = 0.15;
const BOUNCE_DAMPING = 0.7;
const FRICTION = 0.99;

// Risk-based multipliers - more balanced for actual casino gameplay
const MULTIPLIERS = {
  low: [110, 41, 10, 5, 3, 1.5, 1.4, 1.4, 1.2, 1.4, 1.4, 1.5, 3, 5, 10, 41, 110],
  medium: [1000, 130, 26, 9, 4, 2, 1.5, 1.2, 1, 1.2, 1.5, 2, 4, 9, 26, 130, 1000],
  high: [1000, 130, 26, 9, 4, 2, 1.5, 1.2, 0.2, 1.2, 1.5, 2, 4, 9, 26, 130, 1000]
};

export default function PlinkoPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [betAmount, setBetAmount] = useState(10);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [isDropping, setIsDropping] = useState(false);
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [ballCount, setBallCount] = useState(0);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [autoMode, setAutoMode] = useState(false);
  const [autoBalls, setAutoBalls] = useState(10);

  useEffect(() => {
    if (!user) {
      router.push('/games');
    }
  }, [user, router]);

  // Generate peg positions for better distribution
  const generatePegs = () => {
    const pegs: { x: number; y: number }[] = [];
    for (let row = 0; row < PEG_ROWS; row++) {
      const pegsInRow = row + 3;
      const spacing = BOARD_WIDTH / (pegsInRow + 1);
      const y = 60 + (row * 25);
      const offset = row % 2 === 0 ? 0 : spacing / 2;
      
      for (let peg = 0; peg < pegsInRow; peg++) {
        const x = spacing * (peg + 1) + offset;
        if (x > PEG_RADIUS && x < BOARD_WIDTH - PEG_RADIUS) {
          pegs.push({ x, y });
        }
      }
    }
    return pegs;
  };

  const pegs = generatePegs();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
      
      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, BOARD_HEIGHT);
      gradient.addColorStop(0, '#1f2937');
      gradient.addColorStop(1, '#111827');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
      
      // Draw pegs with glow effect
      pegs.forEach(peg => {
        // Glow effect
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, PEG_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner highlight
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(peg.x - 1, peg.y - 1, PEG_RADIUS * 0.6, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw slot dividers
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2;
      const slotWidth = BOARD_WIDTH / SLOTS;
      for (let i = 0; i <= SLOTS; i++) {
        const x = i * slotWidth;
        ctx.beginPath();
        ctx.moveTo(x, BOARD_HEIGHT - 60);
        ctx.lineTo(x, BOARD_HEIGHT);
        ctx.stroke();
      }
      
      // Draw slot multipliers with colors
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      for (let i = 0; i < SLOTS; i++) {
        const x = (i + 0.5) * slotWidth;
        const multiplier = getMultiplierForRisk(i, riskLevel);
        const color = getSlotColor(multiplier);
        
        // Draw slot background
        ctx.fillStyle = color;
        ctx.fillRect(i * slotWidth + 1, BOARD_HEIGHT - 60, slotWidth - 2, 60);
        
        // Draw multiplier text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${multiplier}x`, x, BOARD_HEIGHT - 35);
      }
      
      // Update and draw balls
      setBalls(prevBalls => {
        const updatedBalls = prevBalls.map(ball => {
          if (!ball.isActive) return ball;
          
          // Apply gravity
          ball.vy += 0.3;
          
          // Update position
          ball.x += ball.vx;
          ball.y += ball.vy;
          
          // Bounce off walls
          if (ball.x <= BALL_RADIUS || ball.x >= BOARD_WIDTH - BALL_RADIUS) {
            ball.vx *= -0.8;
            ball.x = Math.max(BALL_RADIUS, Math.min(BOARD_WIDTH - BALL_RADIUS, ball.x));
          }
          
          // Check collision with pegs
          for (let row = 0; row < PEG_ROWS; row++) {
            const pegsInRow = row + 3;
            const spacing = BOARD_WIDTH / (pegsInRow + 1);
            const pegY = 80 + (row * 30);
            
            for (let peg = 0; peg < pegsInRow; peg++) {
              const pegX = spacing * (peg + 1);
              const distance = Math.sqrt((ball.x - pegX) ** 2 + (ball.y - pegY) ** 2);
              
              if (distance < BALL_RADIUS + PEG_RADIUS) {
                // Collision with peg
                const angle = Math.atan2(ball.y - pegY, ball.x - pegX);
                ball.vx = Math.cos(angle) * 3 + (Math.random() - 0.5) * 2;
                ball.vy = Math.abs(Math.sin(angle) * 3) + 1;
                
                // Move ball away from peg
                const overlap = (BALL_RADIUS + PEG_RADIUS) - distance;
                ball.x += Math.cos(angle) * overlap;
                ball.y += Math.sin(angle) * overlap;
              }
            }
          }
          
          // Guide ball towards predetermined slot if it exists
          if (ball.finalSlot !== undefined && ball.y > BOARD_HEIGHT * 0.7) {
            const slotWidth = BOARD_WIDTH / SLOTS;
            const targetX = (ball.finalSlot + 0.5) * slotWidth;
            const diff = targetX - ball.x;
            ball.vx += diff * 0.01; // Gentle guidance
          }
          
          // Check if ball reached bottom
          if (ball.y >= BOARD_HEIGHT - 60) {
            ball.isActive = false;
            
            // Use predetermined slot if available, otherwise calculate
            if (ball.finalSlot === undefined) {
              const slotWidth = BOARD_WIDTH / SLOTS;
              const slot = Math.floor(ball.x / slotWidth);
              ball.finalSlot = Math.max(0, Math.min(SLOTS - 1, slot));
            }
          }
          
          return ball;
        });
        
        // Remove inactive balls after a delay
        return updatedBalls.filter(ball => ball.isActive || ball.y < BOARD_HEIGHT + 100);
      });
      
      // Draw balls
      balls.forEach(ball => {
        const gradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, BALL_RADIUS);
        gradient.addColorStop(0, '#fbbf24');
        gradient.addColorStop(1, '#f59e0b');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        
        // Add shine effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(ball.x - 2, ball.y - 2, BALL_RADIUS / 2, 0, Math.PI * 2);
        ctx.fill();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [balls, betAmount, riskLevel]);

  const getMultiplierForRisk = (slot: number, risk: 'low' | 'medium' | 'high') => {
    return MULTIPLIERS[risk][slot];
  };

  const getSlotColor = (multiplier: number) => {
    if (multiplier >= 100) return '#dc2626'; // Red for highest
    if (multiplier >= 10) return '#ea580c'; // Orange for high
    if (multiplier >= 5) return '#d97706'; // Amber for medium-high
    if (multiplier >= 2) return '#65a30d'; // Green for medium
    return '#374151'; // Gray for low
  };

  const dropBall = async () => {
    if (!user || betAmount <= 0 || betAmount > user.balance) {
      toast({
        title: "Invalid Bet",
        description: "Please check your bet amount and balance.",
        variant: "destructive"
      });
      return;
    }

    const gameConfig = GAME_CONFIGS.plinko;
    if (betAmount < gameConfig.minBet || betAmount > gameConfig.maxBet) {
      toast({
        title: "Invalid Bet Amount",
        description: `Bet must be between ${FormatUtils.formatCurrency(gameConfig.minBet)} and ${FormatUtils.formatCurrency(gameConfig.maxBet)}.`,
        variant: "destructive",
      });
      return;
    }

    setIsDropping(true);

    try {
      const { token } = useAuthStore.getState();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Create ball with predetermined result slot
      const slot = Math.floor(Math.random() * SLOTS);
      const multiplier = getMultiplierForRisk(slot, riskLevel);
      
      const response = await fetch('/api/games/bet', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          game_type: 'plinko',
          amount: betAmount,
          prediction: {
            riskLevel,
            slot,
            multiplier,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        const result = data.data;
        
        // Create ball that will land in the predetermined slot
        const newBall: Ball = {
          id: Date.now() + Math.random(),
          x: BOARD_WIDTH / 2 + (Math.random() - 0.5) * 40,
          y: 20,
          vx: (Math.random() - 0.5) * 2,
          vy: 1,
          isActive: true,
          trail: [],
          finalSlot: result.bet.result.slot
        };

        setBalls(prev => [...prev, newBall]);
        setBallCount(prev => prev + 1);
        
        // Update user balance
        await refreshUser();
        
        // Show result after ball animation
        setTimeout(() => {
          setGameResults(prev => [{
            bet: betAmount,
            multiplier: result.bet.result.multiplier,
            win: result.bet.payout,
            slot: result.bet.result.slot
          }, ...prev.slice(0, 19)]);
          
          if (result.win) {
            toast({
              title: "Winner!",
              description: `You won ${FormatUtils.formatCurrency(result.bet.payout)}! (${result.bet.result.multiplier}x multiplier)`,
            });
          } else {
            toast({
              title: "No luck this time",
              description: "Better luck next time!",
              variant: "destructive"
            });
          }
        }, 3000);
        
      } else {
        throw new Error(data.error || 'Failed to place bet');
      }
    } catch (error) {
      console.error('Error placing bet:', error);
      toast({
        title: "Error",
        description: "Failed to place bet. Please try again.",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => setIsDropping(false), 500);
    }
  };

  const startAutoMode = () => {
    if (!user || betAmount * autoBalls > user.balance) {
      toast({
        title: "Insufficient Balance",
        description: "Not enough balance for auto mode.",
        variant: "destructive"
      });
      return;
    }

    setAutoMode(true);
    
    let ballsDropped = 0;
    const interval = setInterval(() => {
      if (ballsDropped >= autoBalls) {
        clearInterval(interval);
        setAutoMode(false);
        return;
      }
      
      dropBall();
      ballsDropped++;
    }, 300);
  };

  const stopAutoMode = () => {
    setAutoMode(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-pink-500/10 to-transparent rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            🎯 Plinko
          </h1>
          <p className="text-xl text-gray-300">Drop the ball and watch it bounce to fortune!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
              <div className="text-center mb-4">
                <div className="text-lg text-white mb-2">Risk Level: 
                  <span className={`font-bold ml-2 ${
                    riskLevel === 'low' ? 'text-green-400' :
                    riskLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {riskLevel.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={BOARD_WIDTH}
                  height={BOARD_HEIGHT}
                  className="border-2 border-gray-600 rounded-lg mx-auto block"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
                
                {/* Drop Zone Indicator */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-white text-sm font-bold bg-black bg-opacity-50 px-2 py-1 rounded">
                  DROP ZONE
                </div>
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
                  <div className="text-sm text-gray-400">Balls Dropped</div>
                  <div className="text-lg font-bold text-blue-400">{ballCount}</div>
                </div>
              </div>
            </div>

            {/* Bet Controls */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Bet Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bet Amount</label>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    min="0.01"
                    max={user.balance}
                    step="0.01"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={autoMode}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {[1, 5, 10, 25, 50, 100].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                      disabled={autoMode}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>

                {/* Risk Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Risk Level</label>
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={autoMode}
                  >
                    <option value="low">Low (0.5x multipliers)</option>
                    <option value="medium">Medium (1x multipliers)</option>
                    <option value="high">High (2x multipliers)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={dropBall}
                disabled={isDropping || autoMode}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg"
              >
                {isDropping ? '🎯 Dropping...' : '🎯 Drop Ball'}
              </button>
              
              {/* Auto Mode Controls */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={autoBalls}
                    onChange={(e) => setAutoBalls(Number(e.target.value))}
                    min="1"
                    max="100"
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                    disabled={autoMode}
                  />
                  <span className="text-gray-300 text-sm">balls</span>
                </div>
                
                {!autoMode ? (
                  <button
                    onClick={startAutoMode}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-300"
                  >
                    🤖 Auto Drop
                  </button>
                ) : (
                  <button
                    onClick={stopAutoMode}
                    className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl transition-all duration-300"
                  >
                    ⏹️ Stop Auto
                  </button>
                )}
              </div>
            </div>

            {/* Recent Results */}
            {gameResults.length > 0 && (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Results</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {gameResults.slice(0, 10).map((result, index) => (
                    <div key={index} className="flex justify-between items-center text-sm bg-gray-700 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300">Slot {result.slot + 1}</span>
                        <span className={`font-bold ${
                          result.multiplier >= 10 ? 'text-red-400' :
                          result.multiplier >= 2 ? 'text-yellow-400' : 'text-gray-400'
                        }`}>
                          {result.multiplier}x
                        </span>
                      </div>
                      <span className={`font-bold ${result.win >= result.bet ? 'text-green-400' : 'text-red-400'}`}>
                        ${result.win.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Game Rules */}
        <div className="mt-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">🎯 How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-2">Basic Rules:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Set your bet amount and risk level</li>
                <li>• Drop balls from the top of the board</li>
                <li>• Balls bounce off pegs randomly</li>
                <li>• Land in slots with different multipliers</li>
                <li>• Center slots typically have higher payouts</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Risk Levels:</h4>
              <ul className="space-y-1 text-sm">
                <li>• <span className="text-green-400">Low Risk:</span> 0.5x multipliers, safer bets</li>
                <li>• <span className="text-yellow-400">Medium Risk:</span> 1x multipliers, balanced</li>
                <li>• <span className="text-red-400">High Risk:</span> 2x multipliers, higher variance</li>
                <li>• Use auto mode to drop multiple balls</li>
                <li>• Physics simulation makes each drop unique</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}