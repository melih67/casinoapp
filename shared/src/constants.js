"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.THEME_COLORS = exports.UI_CONSTANTS = exports.SUCCESS_MESSAGES = exports.ERROR_MESSAGES = exports.BLACKJACK_CONSTANTS = exports.ROULETTE_CONSTANTS = exports.DICE_CONSTANTS = exports.SOCKET_EVENTS = exports.API_CONSTANTS = exports.USER_CONSTANTS = exports.GAME_CONFIGS = exports.APP_CONFIG = void 0;
exports.APP_CONFIG = {
    NAME: 'Casino Platform',
    VERSION: '1.0.0',
    DESCRIPTION: 'A modern casino gaming platform with fake money',
};
exports.GAME_CONFIGS = {
    dice: {
        minBet: 0.01,
        maxBet: 1000,
        houseEdge: 0.01,
        maxPayout: 9900,
    },
    coinflip: {
        minBet: 0.01,
        maxBet: 1000,
        houseEdge: 0.02,
        maxPayout: 1960,
    },
    crash: {
        minBet: 0.01,
        maxBet: 1000,
        houseEdge: 0.01,
        maxPayout: 10000,
    },
    roulette: {
        minBet: 0.01,
        maxBet: 500,
        houseEdge: 0.027,
        maxPayout: 3500,
    },
    blackjack: {
        minBet: 0.01,
        maxBet: 500,
        houseEdge: 0.005,
        maxPayout: 150,
    },
    slots: {
        minBet: 0.01,
        maxBet: 100,
        houseEdge: 0.05,
        maxPayout: 10000,
    },
    mines: {
        minBet: 0.01,
        maxBet: 1000,
        houseEdge: 0.01,
        maxPayout: 24000,
    },
    plinko: {
        minBet: 0.01,
        maxBet: 1000,
        houseEdge: 0.01,
        maxPayout: 100000,
    },
};
exports.USER_CONSTANTS = {
    DEFAULT_BALANCE: 1000,
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 20,
    MIN_PASSWORD_LENGTH: 6,
    MAX_BALANCE: 1000000,
};
exports.API_CONSTANTS = {
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
        LOGIN: 5,
        REGISTER: 3,
        BET: 60,
        GENERAL: 100,
    },
};
exports.SOCKET_EVENTS = {
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
};
exports.DICE_CONSTANTS = {
    MIN_TARGET: 2,
    MAX_TARGET: 98,
    PRECISION: 2,
};
exports.ROULETTE_CONSTANTS = {
    NUMBERS: Array.from({ length: 37 }, (_, i) => i),
    RED_NUMBERS: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
    BLACK_NUMBERS: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
    PAYOUTS: {
        STRAIGHT: 35,
        SPLIT: 17,
        STREET: 11,
        CORNER: 8,
        LINE: 5,
        DOZEN: 2,
        COLUMN: 2,
        EVEN_ODD: 1,
        RED_BLACK: 1,
        HIGH_LOW: 1,
    },
};
exports.BLACKJACK_CONSTANTS = {
    DECK_SIZE: 52,
    BLACKJACK_VALUE: 21,
    DEALER_STAND: 17,
    ACE_HIGH: 11,
    ACE_LOW: 1,
    FACE_CARD_VALUE: 10,
};
exports.ERROR_MESSAGES = {
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
};
exports.SUCCESS_MESSAGES = {
    USER_REGISTERED: 'User registered successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    BET_PLACED: 'Bet placed successfully',
    BALANCE_UPDATED: 'Balance updated successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
};
exports.UI_CONSTANTS = {
    ANIMATION_DURATION: 300,
    TOAST_DURATION: 5000,
    DEBOUNCE_DELAY: 300,
    PAGINATION_SIZE: 20,
    MAX_RECENT_BETS: 10,
};
exports.THEME_COLORS = {
    PRIMARY: '#10b981',
    SECONDARY: '#6366f1',
    SUCCESS: '#22c55e',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#3b82f6',
    BACKGROUND: '#0f172a',
    SURFACE: '#1e293b',
    TEXT_PRIMARY: '#f8fafc',
    TEXT_SECONDARY: '#94a3b8',
};
//# sourceMappingURL=constants.js.map