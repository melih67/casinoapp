import { Router, Request, Response } from 'express';
import { DatabaseService } from '../config/supabase';
import { asyncHandler, ValidationError, InsufficientFundsError } from '../middleware/errorHandler';
import { betRateLimit } from '../middleware/auth';
import { validateRequest } from '../middleware/errorHandler';
import { PlaceBetRequestSchema, DiceBetSchema, CoinflipBetSchema } from '../../../shared/src/types';
import { GAME_CONFIGS } from '../../../shared/src/constants';
import { GameUtils } from '../../../shared/src/utils';
import { v4 as uuidv4 } from 'uuid';
import { io } from '../index';

const router = Router();

// Place a bet
router.post('/bet',
  betRateLimit,
  validateRequest(PlaceBetRequestSchema),
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const { game_type, amount, prediction } = req.body;

    // Get game configuration
    const gameConfig = GAME_CONFIGS[game_type];
    if (!gameConfig) {
      throw new ValidationError('Invalid game type');
    }

    // Validate bet amount
    if (!GameUtils.validateBetAmount(amount, gameConfig.minBet, gameConfig.maxBet, user.balance)) {
      if (amount > user.balance) {
        throw new InsufficientFundsError('Insufficient balance for this bet');
      }
      throw new ValidationError(`Bet amount must be between ${gameConfig.minBet} and ${gameConfig.maxBet}`);
    }

    // Process game-specific logic
    let gameResult: any;
    let multiplier: number;
    let payout: number;
    let win: boolean;

    switch (game_type) {
      case 'dice':
        gameResult = await processDiceBet(prediction, amount);
        break;
      case 'coinflip':
        gameResult = await processCoinflipBet(prediction, amount);
        break;
      case 'crash':
        gameResult = await processCrashBet(prediction, amount);
        break;
      case 'blackjack':
        gameResult = await processBlackjackBet(prediction, amount);
        break;
      default:
        throw new ValidationError('Game type not implemented yet');
    }

    multiplier = gameResult.multiplier;
    payout = gameResult.payout;
    win = gameResult.win;

    // Create bet record
    const betData = {
      id: uuidv4(),
      user_id: user.id,
      game_type,
      amount,
      multiplier,
      prediction,
      result: gameResult.result,
      payout,
      status: 'finished' as const,
      created_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
    };

    const bet = await DatabaseService.createBet(betData, req.userToken);

    // Update user balance
    const newBalance = user.balance - amount + payout;
    await DatabaseService.updateUserBalance(user.id, newBalance);

    // Create transaction records
    const betTransaction = {
      id: uuidv4(),
      user_id: user.id,
      type: 'bet' as const,
      amount: -amount,
      balance_before: user.balance,
      balance_after: user.balance - amount,
      description: `${game_type} bet`,
      created_at: new Date().toISOString(),
    };

    await DatabaseService.createTransaction(betTransaction);

    if (win && payout > 0) {
      const winTransaction = {
        id: uuidv4(),
        user_id: user.id,
        type: 'win' as const,
        amount: payout,
        balance_before: user.balance - amount,
        balance_after: newBalance,
        description: `${game_type} win`,
        created_at: new Date().toISOString(),
      };

      await DatabaseService.createTransaction(winTransaction);
    }

    // Emit socket events
    io.to(`user:${user.id}`).emit('bet-result', bet);
    io.to(`user:${user.id}`).emit('balance-update', newBalance);

    res.json({
      success: true,
      message: win ? 'Congratulations! You won!' : 'Better luck next time!',
      data: {
        bet,
        newBalance,
        win,
      },
    });
  })
);

// Get user's bet history
router.get('/history',
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const { limit = 50, offset = 0 } = req.query;

    const bets = await DatabaseService.getUserBets(user.id, Number(limit));

    res.json({
      success: true,
      data: {
        bets,
        total: bets.length,
      },
    });
  })
);

// Get user's game statistics
router.get('/stats',
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const { game_type } = req.query;

    let bets;
    if (game_type) {
      bets = await DatabaseService.getGameStats(game_type as string);
      bets = bets.filter(bet => bet.user_id === user.id);
    } else {
      bets = await DatabaseService.getUserBets(user.id, 1000); // Get more for stats
    }

    const stats = calculateUserStats(bets);

    res.json({
      success: true,
      data: {
        stats,
        gameType: game_type || 'all',
      },
    });
  })
);

// Game-specific processing functions
async function processCrashBet(prediction: any, amount: number) {
  // Generate crash point using house edge
  const houseEdge = GAME_CONFIGS.crash.houseEdge;
  const random = Math.random();
  const crashPoint = Math.max(1, Math.floor((Math.log(1 - random) / Math.log(1 - houseEdge)) * 100) / 100);
  
  const cashoutMultiplier = prediction.cashoutMultiplier || 2;
  const win = cashoutMultiplier <= crashPoint;
  const multiplier = win ? cashoutMultiplier : 0;
  const payout = win ? GameUtils.calculatePayout(amount, multiplier) : 0;
  
  return {
    multiplier,
    payout,
    win,
    result: {
      crashPoint,
      cashoutMultiplier: win ? cashoutMultiplier : null,
      win,
    },
  };
}

async function processBlackjackBet(prediction: any, amount: number) {
  // For blackjack, the game logic is handled on the frontend
  // The backend just processes the final result
  const { result } = prediction;
  
  let multiplier = 0;
  let win = false;
  
  if (result === 'win') {
    // Check if it's a blackjack (21 with 2 cards)
    const playerHand = prediction.playerHand || [];
    const isBlackjack = playerHand.length === 2 && 
      playerHand.reduce((sum: number, card: any) => {
        let value = card.value;
        if (card.rank === 'A') value = 11;
        else if (['J', 'Q', 'K'].includes(card.rank)) value = 10;
        return sum + value;
      }, 0) === 21;
    
    multiplier = isBlackjack ? 2.5 : 2; // Blackjack pays 3:2, regular win pays 1:1
    win = true;
  } else if (result === 'push') {
    multiplier = 1; // Return bet
    win = false; // Not a win, but not a loss either
  } else {
    multiplier = 0;
    win = false;
  }
  
  const payout = GameUtils.calculatePayout(amount, multiplier);
  
  return {
    multiplier,
    payout,
    win: result === 'win',
    result: {
      playerHand: prediction.playerHand,
      dealerHand: prediction.dealerHand,
      result,
      win: result === 'win',
    },
  };
}

async function processDiceBet(prediction: any, amount: number) {
  // Validate dice prediction
  const diceBet = DiceBetSchema.parse(prediction);
  
  // Calculate multiplier
  const multiplier = GameUtils.calculateDiceMultiplier(diceBet.target, diceBet.prediction);
  
  // Roll dice
  const roll = GameUtils.rollDice();
  
  // Check if win
  const win = GameUtils.checkDiceWin(roll, diceBet);
  
  // Calculate payout
  const payout = win ? GameUtils.calculatePayout(amount, multiplier) : 0;
  
  return {
    multiplier,
    payout,
    win,
    result: {
      roll,
      win,
    },
  };
}

async function processCoinflipBet(prediction: any, amount: number) {
  // Validate coinflip prediction
  const coinflipBet = CoinflipBetSchema.parse(prediction);
  
  // Get multiplier
  const multiplier = GameUtils.getCoinflipMultiplier();
  
  // Flip coin
  const result = GameUtils.flipCoin();
  
  // Check if win
  const win = GameUtils.checkCoinflipWin(result, coinflipBet);
  
  // Calculate payout
  const payout = win ? GameUtils.calculatePayout(amount, multiplier) : 0;
  
  return {
    multiplier,
    payout,
    win,
    result: {
      result,
      win,
    },
  };
}

// Helper function to calculate user statistics
function calculateUserStats(bets: any[]) {
  const totalBets = bets.length;
  const totalWagered = bets.reduce((sum, bet) => sum + bet.amount, 0);
  const totalWon = bets.reduce((sum, bet) => sum + bet.payout, 0);
  const netProfit = totalWon - totalWagered;
  const wins = bets.filter(bet => bet.payout > bet.amount).length;
  const winRate = totalBets > 0 ? wins / totalBets : 0;
  
  // Find favorite game
  const gameTypeCounts = bets.reduce((acc, bet) => {
    acc[bet.game_type] = (acc[bet.game_type] || 0) + 1;
    return acc;
  }, {});
  
  const favoriteGame = Object.keys(gameTypeCounts).length > 0 
    ? Object.keys(gameTypeCounts).reduce((a, b) => gameTypeCounts[a] > gameTypeCounts[b] ? a : b)
    : null;
  
  return {
    totalBets,
    totalWagered,
    totalWon,
    netProfit,
    winRate,
    favoriteGame,
  };
}

export default router;