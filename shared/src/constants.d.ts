import { GameType, GameConfig } from './types';
export declare const APP_CONFIG: {
    readonly NAME: "Casino Platform";
    readonly VERSION: "1.0.0";
    readonly DESCRIPTION: "A modern casino gaming platform with fake money";
};
export declare const GAME_CONFIGS: Record<GameType, GameConfig>;
export declare const USER_CONSTANTS: {
    readonly DEFAULT_BALANCE: 1000;
    readonly MIN_USERNAME_LENGTH: 3;
    readonly MAX_USERNAME_LENGTH: 20;
    readonly MIN_PASSWORD_LENGTH: 6;
    readonly MAX_BALANCE: 1000000;
};
export declare const API_CONSTANTS: {
    readonly BASE_URL: "https://your-api-domain.com" | "http://localhost:3001";
    readonly ENDPOINTS: {
        readonly AUTH: {
            readonly LOGIN: "/api/auth/login";
            readonly REGISTER: "/api/auth/register";
            readonly LOGOUT: "/api/auth/logout";
            readonly PROFILE: "/api/auth/profile";
        };
        readonly GAMES: {
            readonly PLACE_BET: "/api/games/bet";
            readonly HISTORY: "/api/games/history";
            readonly STATS: "/api/games/stats";
        };
        readonly ADMIN: {
            readonly USERS: "/api/admin/users";
            readonly TRANSACTIONS: "/api/admin/transactions";
            readonly ADJUST_BALANCE: "/api/admin/adjust-balance";
            readonly DASHBOARD: "/api/admin/dashboard";
        };
    };
    readonly RATE_LIMITS: {
        readonly LOGIN: 5;
        readonly REGISTER: 3;
        readonly BET: 60;
        readonly GENERAL: 100;
    };
};
export declare const SOCKET_EVENTS: {
    readonly CONNECTION: "connection";
    readonly DISCONNECT: "disconnect";
    readonly JOIN_GAME: "join-game";
    readonly LEAVE_GAME: "leave-game";
    readonly PLACE_BET: "place-bet";
    readonly BET_PLACED: "bet-placed";
    readonly BET_RESULT: "bet-result";
    readonly GAME_UPDATE: "game-update";
    readonly BALANCE_UPDATE: "balance-update";
    readonly ERROR: "error";
};
export declare const DICE_CONSTANTS: {
    readonly MIN_TARGET: 2;
    readonly MAX_TARGET: 98;
    readonly PRECISION: 2;
};
export declare const ROULETTE_CONSTANTS: {
    readonly NUMBERS: number[];
    readonly RED_NUMBERS: readonly [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    readonly BLACK_NUMBERS: readonly [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
    readonly PAYOUTS: {
        readonly STRAIGHT: 35;
        readonly SPLIT: 17;
        readonly STREET: 11;
        readonly CORNER: 8;
        readonly LINE: 5;
        readonly DOZEN: 2;
        readonly COLUMN: 2;
        readonly EVEN_ODD: 1;
        readonly RED_BLACK: 1;
        readonly HIGH_LOW: 1;
    };
};
export declare const BLACKJACK_CONSTANTS: {
    readonly DECK_SIZE: 52;
    readonly BLACKJACK_VALUE: 21;
    readonly DEALER_STAND: 17;
    readonly ACE_HIGH: 11;
    readonly ACE_LOW: 1;
    readonly FACE_CARD_VALUE: 10;
};
export declare const ERROR_MESSAGES: {
    readonly INVALID_CREDENTIALS: "Invalid email or password";
    readonly USER_EXISTS: "User already exists with this email";
    readonly INSUFFICIENT_BALANCE: "Insufficient balance for this bet";
    readonly INVALID_BET_AMOUNT: "Invalid bet amount";
    readonly GAME_NOT_FOUND: "Game not found";
    readonly UNAUTHORIZED: "Unauthorized access";
    readonly FORBIDDEN: "Access forbidden";
    readonly SERVER_ERROR: "Internal server error";
    readonly VALIDATION_ERROR: "Validation error";
    readonly RATE_LIMIT_EXCEEDED: "Rate limit exceeded";
    readonly USER_NOT_FOUND: "User not found";
    readonly INVALID_TOKEN: "Invalid or expired token";
};
export declare const SUCCESS_MESSAGES: {
    readonly USER_REGISTERED: "User registered successfully";
    readonly LOGIN_SUCCESS: "Login successful";
    readonly LOGOUT_SUCCESS: "Logout successful";
    readonly BET_PLACED: "Bet placed successfully";
    readonly BALANCE_UPDATED: "Balance updated successfully";
    readonly PROFILE_UPDATED: "Profile updated successfully";
};
export declare const UI_CONSTANTS: {
    readonly ANIMATION_DURATION: 300;
    readonly TOAST_DURATION: 5000;
    readonly DEBOUNCE_DELAY: 300;
    readonly PAGINATION_SIZE: 20;
    readonly MAX_RECENT_BETS: 10;
};
export declare const THEME_COLORS: {
    readonly PRIMARY: "#10b981";
    readonly SECONDARY: "#6366f1";
    readonly SUCCESS: "#22c55e";
    readonly WARNING: "#f59e0b";
    readonly ERROR: "#ef4444";
    readonly INFO: "#3b82f6";
    readonly BACKGROUND: "#0f172a";
    readonly SURFACE: "#1e293b";
    readonly TEXT_PRIMARY: "#f8fafc";
    readonly TEXT_SECONDARY: "#94a3b8";
};
//# sourceMappingURL=constants.d.ts.map