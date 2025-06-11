import { GameType, GameConfig } from './types';

// Application Constants
export const APP_CONFIG = {
  NAME: 'Casino Platform',
  VERSION: '1.0.0',
  DESCRIPTION: 'A modern casino gaming platform with fake money',
} as const;

// Game Configuration
export const GAME_CONFIGS: Record<GameType, GameConfig> = {
  dice: {
    minBet: 0.01,
    maxBet: 1000,
    houseEdge: 0.01, // 1%
    maxPayout: 9900, // 99x multiplier
  },
  coinflip: {
    minBet: 0.01,
    maxBet: 1000,
    houseEdge: 0.02, // 2%
    maxPayout: 1960, // 1.96x multiplier
  },
  crash: {
    minBet: 0.01,
    maxBet: 1000,
    houseEdge: 0.01, // 1%
    maxPayout: 10000, // 100x multiplier
  },
  roulette: {
    minBet: 0.01,
    maxBet: 500,
    houseEdge: 0.027, // 2.7% (European roulette)
    maxPayout: 3500, // 35x multiplier for single number
  },
  blackjack: {
    minBet: 0.01,
    maxBet: 500,
    houseEdge: 0.005, // 0.5% (with basic strategy)
    maxPayout: 150, // 1.5x for blackjack
  },
  slots: {
    minBet: 0.01,
    maxBet: 100,
    houseEdge: 0.05, // 5%
    maxPayout: 10000, // 100x multiplier
  },
} as const;

// User Constants
export const USER_CONSTANTS = {
  DEFAULT_BALANCE: 1000, // Starting balance for new users
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 20,
  MIN_PASSWORD_LENGTH: 6,
  MAX_BALANCE: 1000000, // Maximum balance limit
} as const;

// API Constants
export const API_CONSTANTS = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-api-domain.com' 
    : 'http://localhost:3001',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      PROFILE: '/api/auth/profile',
    },
    GAMES: {
      PLACE_BET: '/api/games/bet',
      HISTORY: '/api/games/history',
      STATS: '/api/games/stats',
    },
    ADMIN: {
      USERS: '/api/admin/users',
      TRANSACTIONS: '/api/admin/transactions',
      ADJUST_BALANCE: '/api/admin/adjust-balance',
      DASHBOARD: '/api/admin/dashboard',
    },
  },
  RATE_LIMITS: {
    LOGIN: 5, // 5 attempts per 15 minutes
    REGISTER: 3, // 3 attempts per hour
    BET: 60, // 60 bets per minute
    GENERAL: 100, // 100 requests per 15 minutes
  },
} as const;

// Socket Constants
export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  JOIN_GAME: 'join-game',
  LEAVE_GAME: 'leave-game',
  PLACE_BET: 'place-bet',
  BET_PLACED: 'bet-placed',
  BET_RESULT: 'bet-result',
  GAME_UPDATE: 'game-update',
  BALANCE_UPDATE: 'balance-update',
  ERROR: 'error',
} as const;

// Game Specific Constants
export const DICE_CONSTANTS = {
  MIN_TARGET: 2,
  MAX_TARGET: 98,
  PRECISION: 2, // Decimal places
} as const;

export const ROULETTE_CONSTANTS = {
  NUMBERS: Array.from({ length: 37 }, (_, i) => i), // 0-36
  RED_NUMBERS: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
  BLACK_NUMBERS: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
  PAYOUTS: {
    STRAIGHT: 35, // Single number
    SPLIT: 17, // Two numbers
    STREET: 11, // Three numbers
    CORNER: 8, // Four numbers
    LINE: 5, // Six numbers
    DOZEN: 2, // 12 numbers
    COLUMN: 2, // 12 numbers
    EVEN_ODD: 1, // 18 numbers
    RED_BLACK: 1, // 18 numbers
    HIGH_LOW: 1, // 18 numbers
  },
} as const;

export const BLACKJACK_CONSTANTS = {
  DECK_SIZE: 52,
  BLACKJACK_VALUE: 21,
  DEALER_STAND: 17,
  ACE_HIGH: 11,
  ACE_LOW: 1,
  FACE_CARD_VALUE: 10,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'User already exists with this email',
  INSUFFICIENT_BALANCE: 'Insufficient balance for this bet',
  INVALID_BET_AMOUNT: 'Invalid bet amount',
  GAME_NOT_FOUND: 'Game not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  SERVER_ERROR: 'Internal server error',
  VALIDATION_ERROR: 'Validation error',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  USER_NOT_FOUND: 'User not found',
  INVALID_TOKEN: 'Invalid or expired token',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  USER_REGISTERED: 'User registered successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  BET_PLACED: 'Bet placed successfully',
  BALANCE_UPDATED: 'Balance updated successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
} as const;

// UI Constants
export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
  PAGINATION_SIZE: 20,
  MAX_RECENT_BETS: 10,
} as const;

// Theme Constants
export const THEME_COLORS = {
  PRIMARY: '#10b981', // Green
  SECONDARY: '#6366f1', // Indigo
  SUCCESS: '#22c55e', // Green
  WARNING: '#f59e0b', // Amber
  ERROR: '#ef4444', // Red
  INFO: '#3b82f6', // Blue
  BACKGROUND: '#0f172a', // Dark slate
  SURFACE: '#1e293b', // Slate
  TEXT_PRIMARY: '#f8fafc', // Light
  TEXT_SECONDARY: '#94a3b8', // Slate gray
} as const;