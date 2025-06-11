import { create } from 'zustand';
import { Bet, GameType, DiceBet, CoinflipBet } from '@shared/types';
import { useAuthStore } from './authStore';
import { toast } from 'sonner';

interface GameState {
  // Current game state
  currentGame: GameType | null;
  isPlaying: boolean;
  isLoading: boolean;
  
  // Betting
  betAmount: number;
  lastBet: Bet | null;
  
  // Game history
  recentBets: Bet[];
  
  // Actions
  setCurrentGame: (game: GameType | null) => void;
  setBetAmount: (amount: number) => void;
  placeBet: (gameData: any) => Promise<boolean>;
  setIsPlaying: (playing: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  addRecentBet: (bet: Bet) => void;
  clearRecentBets: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentGame: null,
  isPlaying: false,
  isLoading: false,
  betAmount: 1,
  lastBet: null,
  recentBets: [],

  setCurrentGame: (game) => {
    set({ currentGame: game });
  },

  setBetAmount: (amount) => {
    set({ betAmount: Math.max(0.01, amount) });
  },

  setIsPlaying: (playing) => {
    set({ isPlaying: playing });
  },

  setIsLoading: (loading) => {
    set({ isLoading: loading });
  },

  addRecentBet: (bet) => {
    set((state) => ({
      recentBets: [bet, ...state.recentBets].slice(0, 10), // Keep only last 10 bets
    }));
  },

  clearRecentBets: () => {
    set({ recentBets: [] });
  },

  placeBet: async (gameData) => {
    const { betAmount, currentGame } = get();
    const { user, token, updateBalance } = useAuthStore.getState();

    if (!user || !token || !currentGame) {
      toast.error('Please log in to place bets');
      return false;
    }

    if (betAmount > user.balance) {
      toast.error('Insufficient balance');
      return false;
    }

    if (betAmount <= 0) {
      toast.error('Invalid bet amount');
      return false;
    }

    set({ isLoading: true, isPlaying: true });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games/bet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameType: currentGame,
          amount: betAmount,
          gameData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Bet failed');
      }

      const { bet, newBalance } = result.data;
      
      // Update user balance
      updateBalance(newBalance);
      
      // Add to recent bets
      get().addRecentBet(bet);
      
      // Set as last bet
      set({ lastBet: bet });
      
      // Show result
      if (bet.payout > 0) {
        toast.success(`You won $${bet.payout.toFixed(2)}!`);
      } else {
        toast.error('Better luck next time!');
      }

      return true;
    } catch (error) {
      console.error('Bet error:', error);
      toast.error(error instanceof Error ? error.message : 'Bet failed');
      return false;
    } finally {
      set({ isLoading: false, isPlaying: false });
    }
  },
}));

// Game-specific stores
interface DiceGameState {
  prediction: 'over' | 'under';
  targetNumber: number;
  rollResult: number | null;
  setPrediction: (prediction: 'over' | 'under') => void;
  setTargetNumber: (number: number) => void;
  setRollResult: (result: number | null) => void;
  calculateMultiplier: () => number;
  calculateWinChance: () => number;
}

export const useDiceStore = create<DiceGameState>((set, get) => ({
  prediction: 'over',
  targetNumber: 50,
  rollResult: null,

  setPrediction: (prediction) => {
    set({ prediction });
  },

  setTargetNumber: (number) => {
    set({ targetNumber: Math.max(1, Math.min(99, number)) });
  },

  setRollResult: (result) => {
    set({ rollResult: result });
  },

  calculateMultiplier: () => {
    const { prediction, targetNumber } = get();
    const winChance = get().calculateWinChance();
    return winChance > 0 ? (100 / winChance) * 0.99 : 0; // 1% house edge
  },

  calculateWinChance: () => {
    const { prediction, targetNumber } = get();
    if (prediction === 'over') {
      return Math.max(0, 99 - targetNumber);
    } else {
      return Math.max(0, targetNumber - 1);
    }
  },
}));

interface CoinflipGameState {
  selectedSide: 'heads' | 'tails';
  flipResult: 'heads' | 'tails' | null;
  isFlipping: boolean;
  setSelectedSide: (side: 'heads' | 'tails') => void;
  setFlipResult: (result: 'heads' | 'tails' | null) => void;
  setIsFlipping: (flipping: boolean) => void;
}

export const useCoinflipStore = create<CoinflipGameState>((set) => ({
  selectedSide: 'heads',
  flipResult: null,
  isFlipping: false,

  setSelectedSide: (side) => {
    set({ selectedSide: side });
  },

  setFlipResult: (result) => {
    set({ flipResult: result });
  },

  setIsFlipping: (flipping) => {
    set({ isFlipping: flipping });
  },
}));