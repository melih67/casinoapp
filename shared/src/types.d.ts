import { z } from 'zod';
export declare const UserRoleSchema: z.ZodEnum<["player", "admin"]>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    username: z.ZodString;
    balance: z.ZodNumber;
    role: z.ZodEnum<["player", "admin"]>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    email: string;
    created_at: string;
    username: string;
    balance: number;
    role: "player" | "admin";
    updated_at: string;
}, {
    id: string;
    email: string;
    created_at: string;
    username: string;
    balance: number;
    role: "player" | "admin";
    updated_at: string;
}>;
export type User = z.infer<typeof UserSchema>;
export declare const GameTypeSchema: z.ZodEnum<["dice", "crash", "roulette", "blackjack", "slots", "coinflip", "mines", "plinko"]>;
export type GameType = z.infer<typeof GameTypeSchema>;
export declare const GameStatusSchema: z.ZodEnum<["waiting", "active", "finished"]>;
export type GameStatus = z.infer<typeof GameStatusSchema>;
export declare const BetSchema: z.ZodObject<{
    id: z.ZodString;
    user_id: z.ZodString;
    game_type: z.ZodEnum<["dice", "crash", "roulette", "blackjack", "slots", "coinflip", "mines", "plinko"]>;
    amount: z.ZodNumber;
    multiplier: z.ZodOptional<z.ZodNumber>;
    prediction: z.ZodOptional<z.ZodAny>;
    result: z.ZodOptional<z.ZodAny>;
    payout: z.ZodNumber;
    status: z.ZodEnum<["waiting", "active", "finished"]>;
    created_at: z.ZodString;
    finished_at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    user_id: string;
    created_at: string;
    game_type: "dice" | "crash" | "roulette" | "blackjack" | "slots" | "coinflip" | "mines" | "plinko";
    status: "waiting" | "active" | "finished";
    amount: number;
    payout: number;
    multiplier?: number | undefined;
    prediction?: any;
    result?: any;
    finished_at?: string | undefined;
}, {
    id: string;
    user_id: string;
    created_at: string;
    game_type: "dice" | "crash" | "roulette" | "blackjack" | "slots" | "coinflip" | "mines" | "plinko";
    status: "waiting" | "active" | "finished";
    amount: number;
    payout: number;
    multiplier?: number | undefined;
    prediction?: any;
    result?: any;
    finished_at?: string | undefined;
}>;
export type Bet = z.infer<typeof BetSchema>;
export declare const TransactionTypeSchema: z.ZodEnum<["deposit", "withdrawal", "bet", "win", "admin_adjustment"]>;
export type TransactionType = z.infer<typeof TransactionTypeSchema>;
export declare const TransactionSchema: z.ZodObject<{
    id: z.ZodString;
    user_id: z.ZodString;
    type: z.ZodEnum<["deposit", "withdrawal", "bet", "win", "admin_adjustment"]>;
    amount: z.ZodNumber;
    balance_before: z.ZodNumber;
    balance_after: z.ZodNumber;
    description: z.ZodString;
    created_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "deposit" | "withdrawal" | "bet" | "win" | "admin_adjustment";
    id: string;
    user_id: string;
    created_at: string;
    amount: number;
    balance_before: number;
    balance_after: number;
    description: string;
}, {
    type: "deposit" | "withdrawal" | "bet" | "win" | "admin_adjustment";
    id: string;
    user_id: string;
    created_at: string;
    amount: number;
    balance_before: number;
    balance_after: number;
    description: string;
}>;
export type Transaction = z.infer<typeof TransactionSchema>;
export declare const DiceBetSchema: z.ZodObject<{
    prediction: z.ZodEnum<["over", "under"]>;
    target: z.ZodNumber;
    multiplier: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    multiplier: number;
    prediction: "over" | "under";
    target: number;
}, {
    multiplier: number;
    prediction: "over" | "under";
    target: number;
}>;
export type DiceBet = z.infer<typeof DiceBetSchema>;
export declare const DiceResultSchema: z.ZodObject<{
    roll: z.ZodNumber;
    win: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    win: boolean;
    roll: number;
}, {
    win: boolean;
    roll: number;
}>;
export type DiceResult = z.infer<typeof DiceResultSchema>;
export declare const CoinflipBetSchema: z.ZodObject<{
    prediction: z.ZodEnum<["heads", "tails"]>;
}, "strip", z.ZodTypeAny, {
    prediction: "heads" | "tails";
}, {
    prediction: "heads" | "tails";
}>;
export type CoinflipBet = z.infer<typeof CoinflipBetSchema>;
export declare const CoinflipResultSchema: z.ZodObject<{
    result: z.ZodEnum<["heads", "tails"]>;
    win: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    result: "heads" | "tails";
    win: boolean;
}, {
    result: "heads" | "tails";
    win: boolean;
}>;
export type CoinflipResult = z.infer<typeof CoinflipResultSchema>;
export declare const LoginRequestSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export declare const RegisterRequestSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    username: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    username: string;
    password: string;
}, {
    email: string;
    username: string;
    password: string;
}>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export declare const PlaceBetRequestSchema: z.ZodObject<{
    game_type: z.ZodEnum<["dice", "crash", "roulette", "blackjack", "slots", "coinflip", "mines", "plinko"]>;
    amount: z.ZodNumber;
    prediction: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    game_type: "dice" | "crash" | "roulette" | "blackjack" | "slots" | "coinflip" | "mines" | "plinko";
    amount: number;
    prediction?: any;
}, {
    game_type: "dice" | "crash" | "roulette" | "blackjack" | "slots" | "coinflip" | "mines" | "plinko";
    amount: number;
    prediction?: any;
}>;
export type PlaceBetRequest = z.infer<typeof PlaceBetRequestSchema>;
export declare const AdminAdjustBalanceRequestSchema: z.ZodObject<{
    user_id: z.ZodString;
    amount: z.ZodNumber;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    user_id: string;
    amount: number;
    description: string;
}, {
    user_id: string;
    amount: number;
    description: string;
}>;
export type AdminAdjustBalanceRequest = z.infer<typeof AdminAdjustBalanceRequestSchema>;
export declare const ApiResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    data?: any;
    error?: string | undefined;
    message?: string | undefined;
}, {
    success: boolean;
    data?: any;
    error?: string | undefined;
    message?: string | undefined;
}>;
export type ApiResponse<T = any> = {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
};
export interface SocketEvents {
    'join-game': (gameType: GameType) => void;
    'leave-game': (gameType: GameType) => void;
    'place-bet': (bet: PlaceBetRequest) => void;
    'bet-placed': (bet: Bet) => void;
    'bet-result': (bet: Bet) => void;
    'game-update': (data: any) => void;
    'balance-update': (balance: number) => void;
    'error': (error: string) => void;
}
export interface GameConfig {
    minBet: number;
    maxBet: number;
    houseEdge: number;
    maxPayout: number;
}
export declare const GameConfigSchema: z.ZodObject<{
    minBet: z.ZodNumber;
    maxBet: z.ZodNumber;
    houseEdge: z.ZodNumber;
    maxPayout: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    minBet: number;
    maxBet: number;
    houseEdge: number;
    maxPayout: number;
}, {
    minBet: number;
    maxBet: number;
    houseEdge: number;
    maxPayout: number;
}>;
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
    topPlayers: (User & {
        stats: UserStats;
    })[];
}
//# sourceMappingURL=types.d.ts.map