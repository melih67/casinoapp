import { DiceBet, CoinflipBet } from './types';
export declare class GameUtils {
    static calculateDiceMultiplier(target: number, prediction: 'over' | 'under'): number;
    static rollDice(): number;
    static checkDiceWin(roll: number, bet: DiceBet): boolean;
    static flipCoin(): 'heads' | 'tails';
    static checkCoinflipWin(result: 'heads' | 'tails', bet: CoinflipBet): boolean;
    static getCoinflipMultiplier(): number;
    static calculatePayout(betAmount: number, multiplier: number): number;
    static generateGameSeed(): string;
    static validateBetAmount(amount: number, minBet: number, maxBet: number, userBalance: number): boolean;
}
export declare class FormatUtils {
    static formatCurrency(amount: number): string;
    static formatNumber(num: number, decimals?: number): string;
    static formatPercentage(value: number): string;
    static formatDate(date: string | Date): string;
    static formatRelativeTime(date: string | Date): string;
}
export declare class ValidationUtils {
    static isValidEmail(email: string): boolean;
    static isValidUsername(username: string): boolean;
    static isValidPassword(password: string): boolean;
    static sanitizeInput(input: string): string;
}
export declare class RandomUtils {
    static generateId(): string;
    static getRandomElement<T>(array: T[]): T;
    static getRandomNumber(min: number, max: number): number;
    static shuffleArray<T>(array: T[]): T[];
}
export declare class ErrorUtils {
    static createError(message: string, code?: string): Error;
    static isNetworkError(error: any): boolean;
    static getErrorMessage(error: any): string;
}
//# sourceMappingURL=utils.d.ts.map