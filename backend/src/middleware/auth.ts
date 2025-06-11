import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase, DatabaseService } from '../config/supabase';
import { User } from '../../../shared/src/types';

// Extend Express Request type to include user and token
declare global {
  namespace Express {
    interface Request {
      user?: User;
      userToken?: string;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    // Get user data from our database
    const userData = await DatabaseService.getUserById(user.id);
    
    if (!userData) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    // Attach user and token to request object
    req.user = userData;
    req.userToken = token;
    return next(); // CHANGED: Added 'return' here
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
    });
  }
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
    });
  }

  return next(); // CHANGED: Added 'return' here
};

// Optional auth middleware (doesn't fail if no token)
export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // This was already correct
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (!error && user) {
      const userData = await DatabaseService.getUserById(user.id);
      if (userData) {
        req.user = userData;
      }
    }

    return next(); // CHANGED: Added 'return' here
  } catch (error) {
    // Continue without user if there's an error
    return next(); // CHANGED: Added 'return' here
  }
};

// Rate limiting middleware for sensitive operations
export const createRateLimitMiddleware = (windowMs: number, max: number, message: string) => {
  const requests = new Map();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    
    if (!requests.has(key)) {
      requests.set(key, []);
    }
    
    const userRequests = requests.get(key);
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter((time: number) => now - time < windowMs);
    
    if (validRequests.length >= max) {
      return res.status(429).json({
        success: false,
        error: message,
      });
    }
    
    validRequests.push(now);
    requests.set(key, validRequests);
    
    return next(); // CHANGED: Added 'return' here
  };
};

// Specific rate limiters
export const loginRateLimit = createRateLimitMiddleware(
  5 * 60 * 1000, // 5 minutes (reduced window)
  10, // 10 attempts (increased limit)
  'Too many login attempts, please try again later'
);

export const betRateLimit = createRateLimitMiddleware(
  60 * 1000, // 1 minute
  60, // 60 bets
  'Too many bets, please slow down'
);

export const registerRateLimit = createRateLimitMiddleware(
  60 * 60 * 1000, // 1 hour
  3, // 3 attempts
  'Too many registration attempts, please try again later'
);