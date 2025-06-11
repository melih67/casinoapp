import { GameType, DiceBet, CoinflipBet } from './types';

// Game Calculation Utilities
export class GameUtils {
  // Dice game calculations
  static calculateDiceMultiplier(target: number, prediction: 'over' | 'under'): number {
    const winChance = prediction === 'over' ? (100 - target) / 100 : target / 100;
    const houseEdge = 0.01; // 1% house edge
    return (1 - houseEdge) / winChance;
  }

  static rollDice(): number {
    return Math.floor(Math.random() * 10000) / 100; // 0.00 to 99.99
  }

  static checkDiceWin(roll: number, bet: DiceBet): boolean {
    if (bet.prediction === 'over') {
      return roll > bet.target;
    } else {
      return roll < bet.target;
    }
  }

  // Coinflip game calculations
  static flipCoin(): 'heads' | 'tails' {
    return Math.random() < 0.5 ? 'heads' : 'tails';
  }

  static checkCoinflipWin(result: 'heads' | 'tails', bet: CoinflipBet): boolean {
    return result === bet.prediction;
  }

  static getCoinflipMultiplier(): number {
    const houseEdge = 0.02; // 2% house edge
    return (1 - houseEdge) * 2; // 50% chance, so base multiplier is 2
  }

  // General game utilities
  static calculatePayout(betAmount: number, multiplier: number): number {
    return Math.floor(betAmount * multiplier * 100) / 100; // Round to 2 decimal places
  }

  static generateGameSeed(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  static validateBetAmount(amount: number, minBet: number, maxBet: number, userBalance: number): boolean {
    return amount >= minBet && amount <= maxBet && amount <= userBalance;
  }
}

// Formatting Utilities
export class FormatUtils {
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  static formatNumber(num: number, decimals: number = 2): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  }

  static formatPercentage(value: number): string {
    return `${(value * 100).toFixed(2)}%`;
  }

  static formatDate(date: string | Date): string {
    if (!date) return 'Invalid Date';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  }

  static formatRelativeTime(date: string | Date): string {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now.getTime() - target.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return FormatUtils.formatDate(date);
  }
}

// Validation Utilities
export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }

  static isValidPassword(password: string): boolean {
    return password.length >= 6;
  }

  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>"'&]/g, '');
  }
}

// Random Utilities
export class RandomUtils {
  static generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  static getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  static getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Error Utilities
export class ErrorUtils {
  static createError(message: string, code?: string): Error {
    const error = new Error(message);
    if (code) {
      (error as any).code = code;
    }
    return error;
  }

  static isNetworkError(error: any): boolean {
    return error?.code === 'NETWORK_ERROR' || error?.message?.includes('fetch');
  }

  static getErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    return 'An unexpected error occurred';
  }
}