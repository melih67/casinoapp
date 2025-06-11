import { Router, Request, Response } from 'express';
import { DatabaseService } from '../config/supabase';
import { asyncHandler, ValidationError, NotFoundError } from '../middleware/errorHandler';
import { adminMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/errorHandler';
import { AdminAdjustBalanceRequestSchema } from '../../../shared/src/types';
import { USER_CONSTANTS } from '../../../shared/src/constants';
import { v4 as uuidv4 } from 'uuid';
import { io } from '../index';

const router = Router();

// Apply admin middleware to all routes
router.use(adminMiddleware);

// Get all users
router.get('/users',
  asyncHandler(async (req, res) => {
    const { limit = 100, offset = 0 } = req.query;
    
    const users = await DatabaseService.getAllUsers(
      Number(limit),
      Number(offset)
    );

    res.json({
      success: true,
      data: {
        users,
        total: users.length,
      },
    });
  })
);

// Get user details
router.get('/users/:userId',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    const user = await DatabaseService.getUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Get user's bets
    const bets = await DatabaseService.getUserBets(userId, 50);
    
    // Get user's transactions
    const transactions = await DatabaseService.getUserTransactions(userId, 50);

    res.json({
      success: true,
      data: {
        user,
        bets,
        transactions,
      },
    });
  })
);

// Adjust user balance
router.post('/adjust-balance',
  validateRequest(AdminAdjustBalanceRequestSchema),
  asyncHandler(async (req, res) => {
    const admin = req.user!;
    const { user_id, amount, description } = req.body;
    
    // Get user
    const user = await DatabaseService.getUserById(user_id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Calculate new balance
    const newBalance = user.balance + amount;
    
    // Validate new balance
    if (newBalance < 0) {
      throw new ValidationError('Cannot reduce balance below zero');
    }

    if (newBalance > USER_CONSTANTS.MAX_BALANCE) {
      throw new ValidationError(`Cannot increase balance above ${USER_CONSTANTS.MAX_BALANCE}`);
    }

    // Update user balance
    await DatabaseService.updateUserBalance(user_id, newBalance);

    // Create transaction record
    const transaction = {
      id: uuidv4(),
      user_id,
      type: 'admin_adjustment' as const,
      amount,
      balance_before: user.balance,
      balance_after: newBalance,
      description: description || `Admin adjustment by ${admin.username}`,
      created_at: new Date().toISOString(),
    };

    await DatabaseService.createTransaction(transaction);

    // Create admin log
    await DatabaseService.createAdminLog({
      id: uuidv4(),
      admin_id: admin.id,
      action: 'adjust_balance',
      target_id: user_id,
      details: JSON.stringify({
        amount,
        balance_before: user.balance,
        balance_after: newBalance,
        description,
      }),
      created_at: new Date().toISOString(),
    });

    // Emit socket event to notify user
    io.to(`user:${user_id}`).emit('balance-update', newBalance);

    res.json({
      success: true,
      message: 'Balance adjusted successfully',
      data: {
        user_id,
        previous_balance: user.balance,
        new_balance: newBalance,
        adjustment: amount,
        transaction_id: transaction.id,
      },
    });
  })
);

// Get all transactions
router.get('/transactions',
  asyncHandler(async (req, res) => {
    const { limit = 100, offset = 0 } = req.query;
    
    const transactions = await DatabaseService.getAllTransactions(
      Number(limit),
      Number(offset)
    );

    res.json({
      success: true,
      data: {
        transactions,
        total: transactions.length,
      },
    });
  })
);

// Get dashboard data
router.get('/dashboard',
  asyncHandler(async (req, res) => {
    // Get all users
    const users = await DatabaseService.getAllUsers(1000);
    
    // Calculate total balance
    const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);
    
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get week start (7 days ago)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    
    // Get month start
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    // Get all bets
    const allBets = await DatabaseService.getGameStats();
    
    // Filter bets by time periods
    const todayBets = allBets.filter(bet => new Date(bet.created_at) >= today);
    const weekBets = allBets.filter(bet => new Date(bet.created_at) >= weekStart);
    const monthBets = allBets.filter(bet => new Date(bet.created_at) >= monthStart);
    
    // Calculate stats for each period
    const todayStats = calculateGameStats(todayBets);
    const weekStats = calculateGameStats(weekBets);
    const monthStats = calculateGameStats(monthBets);
    
    // Get recent transactions
    const recentTransactions = await DatabaseService.getAllTransactions(20);
    
    // Calculate top players
    const topPlayers = calculateTopPlayers(users, allBets);
    
    // Count active users (placed a bet in the last 24 hours)
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);
    const activeBetUsers = new Set(allBets
      .filter(bet => new Date(bet.created_at) >= last24Hours)
      .map(bet => bet.user_id)
    );
    const activeUsers = activeBetUsers.size;

    res.json({
      success: true,
      data: {
        totalUsers: users.length,
        activeUsers,
        totalBalance,
        todayStats,
        weekStats,
        monthStats,
        recentTransactions,
        topPlayers,
      },
    });
  })
);

// Helper function to calculate game statistics
function calculateGameStats(bets: any[]) {
  const totalBets = bets.length;
  const totalVolume = bets.reduce((sum, bet) => sum + bet.amount, 0);
  const totalPayout = bets.reduce((sum, bet) => sum + bet.payout, 0);
  const houseProfit = totalVolume - totalPayout;
  const averageBet = totalBets > 0 ? totalVolume / totalBets : 0;
  
  return {
    totalBets,
    totalVolume,
    totalPayout,
    houseProfit,
    averageBet,
  };
}

// Helper function to calculate top players
function calculateTopPlayers(users: any[], bets: any[], limit: number = 5) {
  // Group bets by user
  const userBets = bets.reduce((acc, bet) => {
    if (!acc[bet.user_id]) {
      acc[bet.user_id] = [];
    }
    acc[bet.user_id].push(bet);
    return acc;
  }, {});
  
  // Calculate stats for each user
  const usersWithStats = users.map(user => {
    const userBetList = userBets[user.id] || [];
    const totalBets = userBetList.length;
    const totalWagered = userBetList.reduce((sum, bet) => sum + bet.amount, 0);
    const totalWon = userBetList.reduce((sum, bet) => sum + bet.payout, 0);
    const netProfit = totalWon - totalWagered;
    const wins = userBetList.filter(bet => bet.payout > bet.amount).length;
    const winRate = totalBets > 0 ? wins / totalBets : 0;
    
    // Find favorite game
    const gameTypeCounts = userBetList.reduce((acc, bet) => {
      acc[bet.game_type] = (acc[bet.game_type] || 0) + 1;
      return acc;
    }, {});
    
    const favoriteGame = Object.keys(gameTypeCounts).length > 0 
      ? Object.keys(gameTypeCounts).reduce((a, b) => gameTypeCounts[a] > gameTypeCounts[b] ? a : b)
      : null;
    
    return {
      ...user,
      stats: {
        totalBets,
        totalWagered,
        totalWon,
        netProfit,
        winRate,
        favoriteGame,
      },
    };
  });
  
  // Sort by total wagered and return top players
  return usersWithStats
    .sort((a, b) => b.stats.totalWagered - a.stats.totalWagered)
    .slice(0, limit);
}

export default router;