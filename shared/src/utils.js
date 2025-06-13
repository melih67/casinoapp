"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorUtils = exports.RandomUtils = exports.ValidationUtils = exports.FormatUtils = exports.GameUtils = void 0;
class GameUtils {
    static calculateDiceMultiplier(target, prediction) {
        const winChance = prediction === 'over' ? (100 - target) / 100 : target / 100;
        const houseEdge = 0.01;
        return (1 - houseEdge) / winChance;
    }
    static rollDice() {
        return Math.floor(Math.random() * 10000) / 100;
    }
    static checkDiceWin(roll, bet) {
        if (bet.prediction === 'over') {
            return roll > bet.target;
        }
        else {
            return roll < bet.target;
        }
    }
    static flipCoin() {
        return Math.random() < 0.5 ? 'heads' : 'tails';
    }
    static checkCoinflipWin(result, bet) {
        return result === bet.prediction;
    }
    static getCoinflipMultiplier() {
        const houseEdge = 0.02;
        return (1 - houseEdge) * 2;
    }
    static calculatePayout(betAmount, multiplier) {
        return Math.floor(betAmount * multiplier * 100) / 100;
    }
    static generateGameSeed() {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }
    static validateBetAmount(amount, minBet, maxBet, userBalance) {
        return amount >= minBet && amount <= maxBet && amount <= userBalance;
    }
}
exports.GameUtils = GameUtils;
class FormatUtils {
    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    }
    static formatNumber(num, decimals = 2) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(num);
    }
    static formatPercentage(value) {
        return `${(value * 100).toFixed(2)}%`;
    }
    static formatDate(date) {
        if (!date)
            return 'Invalid Date';
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime()))
            return 'Invalid Date';
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(dateObj);
    }
    static formatRelativeTime(date) {
        const now = new Date();
        const target = new Date(date);
        const diffMs = now.getTime() - target.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffMins < 1)
            return 'Just now';
        if (diffMins < 60)
            return `${diffMins}m ago`;
        if (diffHours < 24)
            return `${diffHours}h ago`;
        if (diffDays < 7)
            return `${diffDays}d ago`;
        return FormatUtils.formatDate(date);
    }
}
exports.FormatUtils = FormatUtils;
class ValidationUtils {
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    static isValidUsername(username) {
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return usernameRegex.test(username);
    }
    static isValidPassword(password) {
        return password.length >= 6;
    }
    static sanitizeInput(input) {
        return input.trim().replace(/[<>"'&]/g, '');
    }
}
exports.ValidationUtils = ValidationUtils;
class RandomUtils {
    static generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    static getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    static getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    static shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}
exports.RandomUtils = RandomUtils;
class ErrorUtils {
    static createError(message, code) {
        const error = new Error(message);
        if (code) {
            error.code = code;
        }
        return error;
    }
    static isNetworkError(error) {
        var _a;
        return (error === null || error === void 0 ? void 0 : error.code) === 'NETWORK_ERROR' || ((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0 ? void 0 : _a.includes('fetch'));
    }
    static getErrorMessage(error) {
        if (typeof error === 'string')
            return error;
        if (error === null || error === void 0 ? void 0 : error.message)
            return error.message;
        if (error === null || error === void 0 ? void 0 : error.error)
            return error.error;
        return 'An unexpected error occurred';
    }
}
exports.ErrorUtils = ErrorUtils;
//# sourceMappingURL=utils.js.map