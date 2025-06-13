"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameConfigSchema = exports.ApiResponseSchema = exports.AdminAdjustBalanceRequestSchema = exports.PlaceBetRequestSchema = exports.RegisterRequestSchema = exports.LoginRequestSchema = exports.CoinflipResultSchema = exports.CoinflipBetSchema = exports.DiceResultSchema = exports.DiceBetSchema = exports.TransactionSchema = exports.TransactionTypeSchema = exports.BetSchema = exports.GameStatusSchema = exports.GameTypeSchema = exports.UserSchema = exports.UserRoleSchema = void 0;
const zod_1 = require("zod");
exports.UserRoleSchema = zod_1.z.enum(['player', 'admin']);
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    email: zod_1.z.string().email(),
    username: zod_1.z.string().min(3).max(20),
    balance: zod_1.z.number().min(0),
    role: exports.UserRoleSchema,
    created_at: zod_1.z.string(),
    updated_at: zod_1.z.string(),
});
exports.GameTypeSchema = zod_1.z.enum(['dice', 'crash', 'roulette', 'blackjack', 'slots', 'coinflip', 'mines', 'plinko']);
exports.GameStatusSchema = zod_1.z.enum(['waiting', 'active', 'finished']);
exports.BetSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    user_id: zod_1.z.string().uuid(),
    game_type: exports.GameTypeSchema,
    amount: zod_1.z.number().positive(),
    multiplier: zod_1.z.number().positive().optional(),
    prediction: zod_1.z.any().optional(),
    result: zod_1.z.any().optional(),
    payout: zod_1.z.number().min(0),
    status: exports.GameStatusSchema,
    created_at: zod_1.z.string(),
    finished_at: zod_1.z.string().optional(),
});
exports.TransactionTypeSchema = zod_1.z.enum(['deposit', 'withdrawal', 'bet', 'win', 'admin_adjustment']);
exports.TransactionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    user_id: zod_1.z.string().uuid(),
    type: exports.TransactionTypeSchema,
    amount: zod_1.z.number(),
    balance_before: zod_1.z.number(),
    balance_after: zod_1.z.number(),
    description: zod_1.z.string(),
    created_at: zod_1.z.string(),
});
exports.DiceBetSchema = zod_1.z.object({
    prediction: zod_1.z.enum(['over', 'under']),
    target: zod_1.z.number().min(2).max(98),
    multiplier: zod_1.z.number().positive(),
});
exports.DiceResultSchema = zod_1.z.object({
    roll: zod_1.z.number().min(0).max(100),
    win: zod_1.z.boolean(),
});
exports.CoinflipBetSchema = zod_1.z.object({
    prediction: zod_1.z.enum(['heads', 'tails']),
});
exports.CoinflipResultSchema = zod_1.z.object({
    result: zod_1.z.enum(['heads', 'tails']),
    win: zod_1.z.boolean(),
});
exports.LoginRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
exports.RegisterRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    username: zod_1.z.string().min(3).max(20),
});
exports.PlaceBetRequestSchema = zod_1.z.object({
    game_type: exports.GameTypeSchema,
    amount: zod_1.z.number().positive(),
    prediction: zod_1.z.any(),
});
exports.AdminAdjustBalanceRequestSchema = zod_1.z.object({
    user_id: zod_1.z.string().uuid(),
    amount: zod_1.z.number(),
    description: zod_1.z.string(),
});
exports.ApiResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    message: zod_1.z.string().optional(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional(),
});
exports.GameConfigSchema = zod_1.z.object({
    minBet: zod_1.z.number().positive(),
    maxBet: zod_1.z.number().positive(),
    houseEdge: zod_1.z.number().min(0).max(1),
    maxPayout: zod_1.z.number().positive(),
});
//# sourceMappingURL=types.js.map