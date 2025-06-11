// Shared types for the casino platform
import { z } from 'zod';

// User Types
export const UserRoleSchema = z.enum(['player', 'admin']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(3).max(20),
  balance: z.number().min(0),
  role: UserRoleSchema,
  created_at: z.string(),
  updated_at: z.string(),
});
export type User = z.infer<typeof UserSchema>;

// Game Types
export const GameTypeSchema = z.enum(['dice', 'crash', 'roulette', 'blackjack', 'slots', 'coinflip']);
export type GameType = z.infer<typeof GameTypeSchema>;

export const GameStatusSchema = z.enum(['waiting', 'active', 'finished']);
export type GameStatus = z.infer<typeof GameStatusSchema>;

// Bet Types
export const BetSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  game_type: GameTypeSchema,
  amount: z.number().positive(),
  multiplier: z.number().positive().optional(),
  prediction: z.any().optional(), // Game-specific prediction data
  result: z.any().optional(), // Game-specific result data
  payout: z.number().min(0),
  status: GameStatusSchema,
  created_at: z.string(),
  finished_at: z.string().optional(),
});
export type Bet = z.infer<typeof BetSchema>;

// Transaction Types
export const TransactionTypeSchema = z.enum(['deposit', 'withdrawal', 'bet', 'win', 'admin_adjustment']);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: TransactionTypeSchema,
  amount: z.number(),
  balance_before: z.number(),
  balance_after: z.number(),
  description: z.string(),
  created_at: z.string(),
});
export type Transaction = z.infer<typeof TransactionSchema>;

// Game-specific Types
export const DiceBetSchema = z.object({
  prediction: z.enum(['over', 'under']),
  target: z.number().min(2).max(98),
  multiplier: z.number().positive(),
});
export type DiceBet = z.infer<typeof DiceBetSchema>;

export const DiceResultSchema = z.object({
  roll: z.number().min(0).max(100),
  win: z.boolean(),
});
export type DiceResult = z.infer<typeof DiceResultSchema>;

export const CoinflipBetSchema = z.object({
  prediction: z.enum(['heads', 'tails']),
});
export type CoinflipBet = z.infer<typeof CoinflipBetSchema>;

export const CoinflipResultSchema = z.object({
  result: z.enum(['heads', 'tails']),
  win: z.boolean(),
});
export type CoinflipResult = z.infer<typeof CoinflipResultSchema>;

// API Request/Response Types
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3).max(20),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const PlaceBetRequestSchema = z.object({
  game_type: GameTypeSchema,
  amount: z.number().positive(),
  prediction: z.any(), // Game-specific prediction
});
export type PlaceBetRequest = z.infer<typeof PlaceBetRequestSchema>;

export const AdminAdjustBalanceRequestSchema = z.object({
  user_id: z.string().uuid(),
  amount: z.number(),
  description: z.string(),
});
export type AdminAdjustBalanceRequest = z.infer<typeof AdminAdjustBalanceRequestSchema>;

// API Response Types
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
});
export type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
};

// Socket Events
export interface SocketEvents {
  // Client to Server
  'join-game': (gameType: GameType) => void;
  'leave-game': (gameType: GameType) => void;
  'place-bet': (bet: PlaceBetRequest) => void;
  
  // Server to Client
  'bet-placed': (bet: Bet) => void;
  'bet-result': (bet: Bet) => void;
  'game-update': (data: any) => void;
  'balance-update': (balance: number) => void;
  'error': (error: string) => void;
}

// Game Configuration
export interface GameConfig {
  minBet: number;
  maxBet: number;
  houseEdge: number;
  maxPayout: number;
}

export const GameConfigSchema = z.object({
  minBet: z.number().positive(),
  maxBet: z.number().positive(),
  houseEdge: z.number().min(0).max(1),
  maxPayout: z.number().positive(),
});

// Statistics Types
export interface UserStats {
  totalBets: number;
  totalWagered: number;
  totalWon: number;
  netProfit: number;
  winRate: number;
  favoriteGame: GameType | null;
}

export interface GameStats {
  totalBets: number;
  totalVolume: number;
  totalPayout: number;
  houseProfit: number;
  averageBet: number;
}

export interface AdminDashboardData {
  totalUsers: number;
  activeUsers: number;
  totalBalance: number;
  todayStats: GameStats;
  weekStats: GameStats;
  monthStats: GameStats;
  recentTransactions: Transaction[];
  topPlayers: (User & { stats: UserStats })[];
}