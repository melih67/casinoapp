'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface RouletteNumber {
  number: number;
  color: 'red' | 'black' | 'green';
  position: number;
}

interface Bet {
  type: 'number' | 'red' | 'black' | 'odd' | 'even' | 'low' | 'high' | 'dozen1' | 'dozen2' | 'dozen3' | 'column1' | 'column2' | 'column3';
  value: number | string;
  amount: number;
  payout: number;
}

const ROULETTE_NUMBERS: RouletteNumber[] = [
  { number: 0, color: 'green', position: 0 },
  { number: 32, color: 'red', position: 1 },
  { number: 15, color: 'black', position: 2 },
  { number: 19, color: 'red', position: 3 },
  { number: 4, color: 'black', position: 4 },
  { number: 21, color: 'red', position: 5 },
  { number: 2, color: 'black', position: 6 },
  { number: 25, color: 'red', position: 7 },
  { number: 17, color: 'black', position: 8 },
  { number: 34, color: 'red', position: 9 },
  { number: 6, color: 'black', position: 10 },
  { number: 27, color: 'red', position: 11 },
  { number: 13, color: 'black', position: 12 },
  { number: 36, color: 'red', position: 13 },
  { number: 11, color: 'black', position: 14 },
  { number: 30, color: 'red', position: 15 },
  { number: 8, color: 'black', position: 16 },
  { number: 23, color: 'red', position: 17 },
  { number: 10, color: 'black', position: 18 },
  { number: 5, color: 'red', position: 19 },
  { number: 24, color: 'black', position: 20 },
  { number: 16, color: 'red', position: 21 },
  { number: 33, color: 'black', position: 22 },
  { number: 1, color: 'red', position: 23 },
  { number: 20, color: 'black', position: 24 },
  { number: 14, color: 'red', position: 25 },
  { number: 31, color: 'black', position: 26 },
  { number: 9, color: 'red', position: 27 },
  { number: 22, color: 'black', position: 28 },
  { number: 18, color: 'red', position: 29 },
  { number: 29, color: 'black', position: 30 },
  { number: 7, color: 'red', position: 31 },
  { number: 28, color: 'black', position: 32 },
  { number: 12, color: 'red', position: 33 },
  { number: 35, color: 'black', position: 34 },
  { number: 3, color: 'red', position: 35 },
  { number: 26, color: 'black', position: 36 }
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

export default function RoulettePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [betAmount, setBetAmount] = useState(10);
  const [bets, setBets] = useState<Bet[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [lastResults, setLastResults] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'spinning' | 'result'>('betting');

  useEffect(() => {
    if (!user) {
      router.push('/games');
    }
  }, [user, router]);

  const placeBet = (type: Bet['type'], value: number | string, payout: number) => {
    if (!user || betAmount <= 0 || betAmount > user.balance) {
      toast({
        title: "Invalid Bet",
        description: "Please check your bet amount and balance.",
        variant: "destructive"
      });
      return;
    }

    const existingBetIndex = bets.findIndex(bet => bet.type === type && bet.value === value);
    
    if (existingBetIndex >= 0) {
      const newBets = [...bets];
      newBets[existingBetIndex].amount += betAmount;
      setBets(newBets);
    } else {
      setBets([...bets, { type, value, amount: betAmount, payout }]);
    }

    toast({
      title: "Bet Placed",
      description: `$${betAmount} on ${value}`,
    });
  };

  const clearBets = () => {
    setBets([]);
  };

  const getTotalBetAmount = () => {
    return bets.reduce((total, bet) => total + bet.amount, 0);
  };

  const spinWheel = async () => {
    if (bets.length === 0) {
      toast({
        title: "No Bets Placed",
        description: "Please place at least one bet before spinning.",
        variant: "destructive"
      });
      return;
    }

    const totalBet = getTotalBetAmount();
    if (totalBet > user!.balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for these bets.",
        variant: "destructive"
      });
      return;
    }

    setIsSpinning(true);
    setGameState('spinning');

    // Generate random winning number
    const randomIndex = Math.floor(Math.random() * ROULETTE_NUMBERS.length);
    const winning = ROULETTE_NUMBERS[randomIndex];
    
    // Calculate wheel rotation
    const baseRotation = wheelRotation;
    const spins = 5 + Math.random() * 3; // 5-8 full spins
    const finalPosition = (winning.position / ROULETTE_NUMBERS.length) * 360;
    const newRotation = baseRotation + (spins * 360) + (360 - finalPosition);
    
    setWheelRotation(newRotation);
    
    // Wait for animation
    setTimeout(() => {
      setWinningNumber(winning.number);
      setLastResults(prev => [winning.number, ...prev.slice(0, 9)]);
      calculateWinnings(winning.number);
      setIsSpinning(false);
      setGameState('result');
      
      setTimeout(() => {
        setGameState('betting');
        setBets([]);
      }, 3000);
    }, 4000);
  };

  const calculateWinnings = (winningNum: number) => {
    let totalWinnings = 0;
    let totalLoss = 0;

    bets.forEach(bet => {
      let isWin = false;
      
      switch (bet.type) {
        case 'number':
          isWin = bet.value === winningNum;
          break;
        case 'red':
          isWin = RED_NUMBERS.includes(winningNum);
          break;
        case 'black':
          isWin = BLACK_NUMBERS.includes(winningNum);
          break;
        case 'odd':
          isWin = winningNum !== 0 && winningNum % 2 === 1;
          break;
        case 'even':
          isWin = winningNum !== 0 && winningNum % 2 === 0;
          break;
        case 'low':
          isWin = winningNum >= 1 && winningNum <= 18;
          break;
        case 'high':
          isWin = winningNum >= 19 && winningNum <= 36;
          break;
        case 'dozen1':
          isWin = winningNum >= 1 && winningNum <= 12;
          break;
        case 'dozen2':
          isWin = winningNum >= 13 && winningNum <= 24;
          break;
        case 'dozen3':
          isWin = winningNum >= 25 && winningNum <= 36;
          break;
        case 'column1':
          isWin = winningNum % 3 === 1 && winningNum !== 0;
          break;
        case 'column2':
          isWin = winningNum % 3 === 2 && winningNum !== 0;
          break;
        case 'column3':
          isWin = winningNum % 3 === 0 && winningNum !== 0;
          break;
      }

      if (isWin) {
        totalWinnings += bet.amount * bet.payout;
      } else {
        totalLoss += bet.amount;
      }
    });

    const netResult = totalWinnings - totalLoss;
    
    if (netResult > 0) {
      toast({
        title: "🎉 You Won!",
        description: `You won $${netResult.toFixed(2)}!`,
      });
    } else if (netResult < 0) {
      toast({
        title: "Better Luck Next Time",
        description: `You lost $${Math.abs(netResult).toFixed(2)}`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Break Even",
        description: "No money won or lost this round.",
      });
    }
  };

  const getNumberColor = (num: number) => {
    if (num === 0) return 'bg-green-600';
    return RED_NUMBERS.includes(num) ? 'bg-red-600' : 'bg-gray-800';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/10 to-transparent rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            🎰 Roulette
          </h1>
          <p className="text-xl text-gray-300">Place your bets and spin the wheel!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Roulette Wheel */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700">
              <div className="flex flex-col items-center">
                {/* Wheel Container */}
                <div className="relative mb-8">
                  <div className="w-80 h-80 relative">
                    {/* Wheel */}
                    <div 
                      className={`w-full h-full rounded-full border-8 border-yellow-500 relative overflow-hidden transition-transform duration-4000 ease-out`}
                      style={{ transform: `rotate(${wheelRotation}deg)` }}
                    >
                      {ROULETTE_NUMBERS.map((item, index) => {
                        const angle = (index / ROULETTE_NUMBERS.length) * 360;
                        const color = item.color === 'red' ? 'bg-red-600' : item.color === 'black' ? 'bg-gray-800' : 'bg-green-600';
                        
                        return (
                          <div
                            key={item.number}
                            className={`absolute w-full h-full ${color}`}
                            style={{
                              transform: `rotate(${angle}deg)`,
                              clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((360/ROULETTE_NUMBERS.length) * Math.PI / 180)}% ${50 - 50 * Math.sin((360/ROULETTE_NUMBERS.length) * Math.PI / 180)}%)`
                            }}
                          >
                            <div 
                              className="absolute text-white font-bold text-sm"
                              style={{
                                top: '15px',
                                left: '50%',
                                transform: 'translateX(-50%)'
                              }}
                            >
                              {item.number}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Center Circle */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-yellow-500 rounded-full border-4 border-yellow-600 flex items-center justify-center">
                      <div className="w-8 h-8 bg-yellow-600 rounded-full"></div>
                    </div>
                    
                    {/* Pointer */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-500"></div>
                    </div>
                  </div>
                </div>

                {/* Winning Number Display */}
                {winningNumber !== null && (
                  <div className="text-center mb-6">
                    <div className="text-2xl text-gray-300 mb-2">Winning Number</div>
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-white font-bold text-2xl ${getNumberColor(winningNumber)}`}>
                      {winningNumber}
                    </div>
                  </div>
                )}

                {/* Recent Results */}
                <div className="w-full">
                  <h3 className="text-lg font-semibold text-white mb-3">Recent Results</h3>
                  <div className="flex gap-2 flex-wrap">
                    {lastResults.map((num, index) => (
                      <div key={index} className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${getNumberColor(num)}`}>
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Betting Panel */}
          <div className="space-y-6">
            {/* Balance & Bet Amount */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-400">Balance</div>
                <div className="text-2xl font-bold text-green-400">${user.balance.toFixed(2)}</div>
              </div>
              
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
                    disabled={gameState !== 'betting'}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {[1, 5, 10, 25, 50, 100].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                      disabled={gameState !== 'betting'}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Bets */}
            {bets.length > 0 && (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">Current Bets</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {bets.map((bet, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">{bet.value}</span>
                      <span className="text-white font-medium">${bet.amount}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-600 mt-3 pt-3">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-gray-300">Total:</span>
                    <span className="text-white">${getTotalBetAmount()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={spinWheel}
                disabled={gameState !== 'betting' || bets.length === 0}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg"
              >
                {gameState === 'spinning' ? '🎰 Spinning...' : '🎰 Spin Wheel'}
              </button>
              
              <button
                onClick={clearBets}
                disabled={gameState !== 'betting' || bets.length === 0}
                className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-xl transition-all duration-300"
              >
                Clear Bets
              </button>
            </div>
          </div>
        </div>

        {/* Betting Table */}
        <div className="mt-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-6 text-center">Betting Table</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Numbers Grid */}
            <div>
              <h4 className="text-lg font-medium text-white mb-4">Numbers (35:1)</h4>
              <div className="grid grid-cols-6 gap-2">
                {/* Zero */}
                <button
                  onClick={() => placeBet('number', 0, 35)}
                  disabled={gameState !== 'betting'}
                  className="col-span-6 h-12 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors"
                >
                  0
                </button>
                
                {/* Numbers 1-36 */}
                {Array.from({ length: 36 }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => placeBet('number', num, 35)}
                    disabled={gameState !== 'betting'}
                    className={`h-12 ${getNumberColor(num)} hover:opacity-80 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Outside Bets */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white mb-4">Outside Bets</h4>
              
              {/* Color Bets */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => placeBet('red', 'Red', 1)}
                  disabled={gameState !== 'betting'}
                  className="h-12 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors"
                >
                  Red (1:1)
                </button>
                <button
                  onClick={() => placeBet('black', 'Black', 1)}
                  disabled={gameState !== 'betting'}
                  className="h-12 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors border border-gray-600"
                >
                  Black (1:1)
                </button>
              </div>

              {/* Odd/Even */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => placeBet('odd', 'Odd', 1)}
                  disabled={gameState !== 'betting'}
                  className="h-12 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors"
                >
                  Odd (1:1)
                </button>
                <button
                  onClick={() => placeBet('even', 'Even', 1)}
                  disabled={gameState !== 'betting'}
                  className="h-12 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors"
                >
                  Even (1:1)
                </button>
              </div>

              {/* High/Low */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => placeBet('low', '1-18', 1)}
                  disabled={gameState !== 'betting'}
                  className="h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors"
                >
                  1-18 (1:1)
                </button>
                <button
                  onClick={() => placeBet('high', '19-36', 1)}
                  disabled={gameState !== 'betting'}
                  className="h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors"
                >
                  19-36 (1:1)
                </button>
              </div>

              {/* Dozens */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => placeBet('dozen1', '1st 12', 2)}
                  disabled={gameState !== 'betting'}
                  className="h-12 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors text-sm"
                >
                  1st 12 (2:1)
                </button>
                <button
                  onClick={() => placeBet('dozen2', '2nd 12', 2)}
                  disabled={gameState !== 'betting'}
                  className="h-12 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors text-sm"
                >
                  2nd 12 (2:1)
                </button>
                <button
                  onClick={() => placeBet('dozen3', '3rd 12', 2)}
                  disabled={gameState !== 'betting'}
                  className="h-12 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors text-sm"
                >
                  3rd 12 (2:1)
                </button>
              </div>

              {/* Columns */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => placeBet('column1', 'Col 1', 2)}
                  disabled={gameState !== 'betting'}
                  className="h-12 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors text-sm"
                >
                  Col 1 (2:1)
                </button>
                <button
                  onClick={() => placeBet('column2', 'Col 2', 2)}
                  disabled={gameState !== 'betting'}
                  className="h-12 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors text-sm"
                >
                  Col 2 (2:1)
                </button>
                <button
                  onClick={() => placeBet('column3', 'Col 3', 2)}
                  disabled={gameState !== 'betting'}
                  className="h-12 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors text-sm"
                >
                  Col 3 (2:1)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Game Rules */}
        <div className="mt-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">🎯 Game Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-2">How to Play:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Place bets on numbers, colors, or combinations</li>
                <li>• Click "Spin Wheel" to start the round</li>
                <li>• Watch the ball land on the winning number</li>
                <li>• Collect winnings based on your bets</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Payout Rates:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Single Number: 35:1</li>
                <li>• Red/Black, Odd/Even, High/Low: 1:1</li>
                <li>• Dozens, Columns: 2:1</li>
                <li>• House Edge: 2.7%</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}