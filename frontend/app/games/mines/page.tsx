'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface Tile {
  id: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
}

interface GameState {
  status: 'setup' | 'playing' | 'won' | 'lost';
  tiles: Tile[];
  mineCount: number;
  revealedCount: number;
  currentMultiplier: number;
  potentialWin: number;
}

const GRID_SIZE = 25; // 5x5 grid
const MINE_OPTIONS = [1, 3, 5, 10, 15];

export default function MinesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [betAmount, setBetAmount] = useState(10);
  const [selectedMines, setSelectedMines] = useState(3);
  const [gameState, setGameState] = useState<GameState>({
    status: 'setup',
    tiles: [],
    mineCount: 3,
    revealedCount: 0,
    currentMultiplier: 1,
    potentialWin: 0
  });
  const [gameHistory, setGameHistory] = useState<{bet: number, mines: number, revealed: number, win: number}[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/games');
    }
  }, [user, router]);

  const calculateMultiplier = (revealed: number, mines: number) => {
    if (revealed === 0) return 1;
    const safeTiles = GRID_SIZE - mines;
    const baseMultiplier = 1 + (revealed / safeTiles) * (mines / 2);
    return Math.pow(baseMultiplier, 1.1 + (mines * 0.1));
  };

  const initializeGame = () => {
    if (!user || betAmount <= 0 || betAmount > user.balance) {
      toast({
        title: "Invalid Bet",
        description: "Please check your bet amount and balance.",
        variant: "destructive"
      });
      return;
    }

    // Create empty tiles
    const tiles: Tile[] = Array.from({ length: GRID_SIZE }, (_, i) => ({
      id: i,
      isMine: false,
      isRevealed: false,
      isFlagged: false
    }));

    // Place mines randomly
    const minePositions = new Set<number>();
    while (minePositions.size < selectedMines) {
      const position = Math.floor(Math.random() * GRID_SIZE);
      minePositions.add(position);
    }

    minePositions.forEach(pos => {
      tiles[pos].isMine = true;
    });

    setGameState({
      status: 'playing',
      tiles,
      mineCount: selectedMines,
      revealedCount: 0,
      currentMultiplier: 1,
      potentialWin: betAmount
    });

    toast({
      title: "Game Started!",
      description: `Find gems while avoiding ${selectedMines} mines!`,
    });
  };

  const revealTile = (tileId: number) => {
    if (gameState.status !== 'playing') return;

    const tile = gameState.tiles[tileId];
    if (tile.isRevealed || tile.isFlagged) return;

    const newTiles = [...gameState.tiles];
    newTiles[tileId].isRevealed = true;

    if (tile.isMine) {
      // Game over - hit a mine
      setGameState(prev => ({
        ...prev,
        status: 'lost',
        tiles: newTiles.map(t => ({ ...t, isRevealed: true })) // Reveal all tiles
      }));

      setGameHistory(prev => [{
        bet: betAmount,
        mines: selectedMines,
        revealed: gameState.revealedCount,
        win: 0
      }, ...prev.slice(0, 9)]);

      toast({
        title: "💥 BOOM!",
        description: `You hit a mine! Lost $${betAmount}`,
        variant: "destructive"
      });
    } else {
      // Safe tile revealed
      const newRevealedCount = gameState.revealedCount + 1;
      const newMultiplier = calculateMultiplier(newRevealedCount, selectedMines);
      const newPotentialWin = betAmount * newMultiplier;
      
      const safeTilesRemaining = GRID_SIZE - selectedMines - newRevealedCount;
      
      if (safeTilesRemaining === 0) {
        // Won the game - all safe tiles revealed
        setGameState(prev => ({
          ...prev,
          status: 'won',
          tiles: newTiles,
          revealedCount: newRevealedCount,
          currentMultiplier: newMultiplier,
          potentialWin: newPotentialWin
        }));

        setGameHistory(prev => [{
          bet: betAmount,
          mines: selectedMines,
          revealed: newRevealedCount,
          win: newPotentialWin
        }, ...prev.slice(0, 9)]);

        toast({
          title: "🎉 Perfect Game!",
          description: `You found all gems! Won $${newPotentialWin.toFixed(2)}`,
        });
      } else {
        setGameState(prev => ({
          ...prev,
          tiles: newTiles,
          revealedCount: newRevealedCount,
          currentMultiplier: newMultiplier,
          potentialWin: newPotentialWin
        }));

        toast({
          title: "💎 Gem Found!",
          description: `Multiplier: ${newMultiplier.toFixed(2)}x`,
        });
      }
    }
  };

  const cashOut = () => {
    if (gameState.status !== 'playing' || gameState.revealedCount === 0) return;

    setGameState(prev => ({
      ...prev,
      status: 'won',
      tiles: prev.tiles.map(t => ({ ...t, isRevealed: true }))
    }));

    setGameHistory(prev => [{
      bet: betAmount,
      mines: selectedMines,
      revealed: gameState.revealedCount,
      win: gameState.potentialWin
    }, ...prev.slice(0, 9)]);

    toast({
      title: "💰 Cashed Out!",
      description: `You won $${gameState.potentialWin.toFixed(2)}!`,
    });
  };

  const resetGame = () => {
    setGameState({
      status: 'setup',
      tiles: [],
      mineCount: selectedMines,
      revealedCount: 0,
      currentMultiplier: 1,
      potentialWin: 0
    });
  };

  const toggleFlag = (tileId: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (gameState.status !== 'playing') return;

    const tile = gameState.tiles[tileId];
    if (tile.isRevealed) return;

    const newTiles = [...gameState.tiles];
    newTiles[tileId].isFlagged = !newTiles[tileId].isFlagged;
    
    setGameState(prev => ({
      ...prev,
      tiles: newTiles
    }));
  };

  const getTileContent = (tile: Tile) => {
    if (tile.isFlagged && !tile.isRevealed) return '🚩';
    if (!tile.isRevealed) return '';
    if (tile.isMine) return '💣';
    return '💎';
  };

  const getTileStyle = (tile: Tile) => {
    if (!tile.isRevealed) {
      return 'bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 border-gray-500 cursor-pointer transform hover:scale-105';
    }
    if (tile.isMine) {
      return 'bg-gradient-to-br from-red-600 to-red-700 border-red-500';
    }
    return 'bg-gradient-to-br from-green-500 to-green-600 border-green-400';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-transparent rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/10 to-transparent rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            💣 Mines
          </h1>
          <p className="text-xl text-gray-300">Find the gems, avoid the mines!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
              {/* Game Status */}
              <div className="text-center mb-6">
                {gameState.status === 'setup' && (
                  <div className="text-xl text-gray-300">Configure your game and click Start!</div>
                )}
                {gameState.status === 'playing' && (
                  <div className="space-y-2">
                    <div className="text-xl text-white">💎 Gems Found: {gameState.revealedCount}</div>
                    <div className="text-lg text-yellow-400">Multiplier: {gameState.currentMultiplier.toFixed(2)}x</div>
                    <div className="text-lg text-green-400">Potential Win: ${gameState.potentialWin.toFixed(2)}</div>
                  </div>
                )}
                {gameState.status === 'won' && (
                  <div className="text-2xl text-green-400 font-bold animate-bounce">
                    🎉 You Won ${gameState.potentialWin.toFixed(2)}! 🎉
                  </div>
                )}
                {gameState.status === 'lost' && (
                  <div className="text-2xl text-red-400 font-bold">
                    💥 Game Over! Lost ${betAmount} 💥
                  </div>
                )}
              </div>

              {/* Game Grid */}
              <div className="grid grid-cols-5 gap-2 max-w-md mx-auto mb-6">
                {Array.from({ length: GRID_SIZE }, (_, i) => {
                  const tile = gameState.tiles[i] || { id: i, isMine: false, isRevealed: false, isFlagged: false };
                  return (
                    <button
                      key={i}
                      onClick={() => revealTile(i)}
                      onContextMenu={(e) => toggleFlag(i, e)}
                      disabled={gameState.status === 'setup' || tile.isRevealed}
                      className={`w-16 h-16 border-2 rounded-lg font-bold text-2xl transition-all duration-200 ${getTileStyle(tile)}`}
                    >
                      {getTileContent(tile)}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                {gameState.status === 'setup' && (
                  <button
                    onClick={initializeGame}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    🚀 Start Game
                  </button>
                )}
                
                {gameState.status === 'playing' && gameState.revealedCount > 0 && (
                  <button
                    onClick={cashOut}
                    className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    💰 Cash Out (${gameState.potentialWin.toFixed(2)})
                  </button>
                )}
                
                {(gameState.status === 'won' || gameState.status === 'lost') && (
                  <button
                    onClick={resetGame}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    🔄 New Game
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Balance */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-400">Balance</div>
                <div className="text-2xl font-bold text-green-400">${user.balance.toFixed(2)}</div>
              </div>
            </div>

            {/* Game Settings */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Game Settings</h3>
              
              <div className="space-y-4">
                {/* Bet Amount */}
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
                    disabled={gameState.status === 'playing'}
                  />
                </div>
                
                {/* Quick Bet Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {[1, 5, 10, 25, 50, 100].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                      disabled={gameState.status === 'playing'}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>

                {/* Mine Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Number of Mines</label>
                  <select
                    value={selectedMines}
                    onChange={(e) => setSelectedMines(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={gameState.status === 'playing'}
                  >
                    {MINE_OPTIONS.map(count => (
                      <option key={count} value={count}>
                        {count} Mine{count !== 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Potential Multiplier Preview */}
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-sm text-gray-400 mb-1">Max Multiplier</div>
                  <div className="text-lg font-bold text-yellow-400">
                    {calculateMultiplier(GRID_SIZE - selectedMines, selectedMines).toFixed(2)}x
                  </div>
                </div>
              </div>
            </div>

            {/* Game History */}
            {gameHistory.length > 0 && (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Games</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {gameHistory.map((game, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">
                          ${game.bet} • {game.mines} mines • {game.revealed} gems
                        </span>
                        <span className={`font-bold ${game.win > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {game.win > 0 ? `+$${game.win.toFixed(2)}` : `-$${game.bet.toFixed(2)}`}
                        </span>
                      </div>
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
                <li>• Set your bet amount and number of mines</li>
                <li>• Click tiles to reveal gems 💎</li>
                <li>• Avoid mines 💣 or lose your bet</li>
                <li>• Each gem increases your multiplier</li>
                <li>• Cash out anytime to secure winnings</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Tips & Strategy:</h4>
              <ul className="space-y-1 text-sm">
                <li>• More mines = higher multipliers</li>
                <li>• Right-click to flag suspected mines 🚩</li>
                <li>• Cash out early for safer wins</li>
                <li>• Risk vs reward: find the balance</li>
                <li>• Each revealed gem compounds your winnings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}