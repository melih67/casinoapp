import { Router, Request, Response } from 'express';
import { supabase, DatabaseService } from '../config/supabase';
import { asyncHandler, ValidationError, AuthenticationError } from '../middleware/errorHandler';
import { loginRateLimit, registerRateLimit, authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/errorHandler';
import { LoginRequestSchema, RegisterRequestSchema } from '../../../shared/src/types';
import { USER_CONSTANTS } from '../../../shared/src/constants';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Register new user
router.post('/register', 
  registerRateLimit,
  validateRequest(RegisterRequestSchema),
  asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;

    // CHANGED: We will now directly attempt to create the user
    // and handle the error if they already exist.
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for demo purposes
    });

    // Error handling: Check for the specific duplicate user error
    if (authError) {
      if (authError.message.includes('User already exists')) {
        throw new ValidationError('An account with this email already exists.');
      }
      // For any other auth error, throw it as well
      throw new ValidationError(authError.message);
    }

    if (!authData.user) {
      throw new Error('Failed to create user in authentication system.');
    }

    // Create user profile in our public.users database
    const userData = {
      id: authData.user.id,
      username,
      balance: USER_CONSTANTS.DEFAULT_BALANCE,
      role: 'player' as const,
    };

    const user = await DatabaseService.createUser(userData);

    // Create initial transaction for starting balance
    await DatabaseService.createTransaction({
      id: uuidv4(),
      user_id: user.id,
      type: 'deposit',
      amount: USER_CONSTANTS.DEFAULT_BALANCE,
      balance_before: 0,
      balance_after: USER_CONSTANTS.DEFAULT_BALANCE,
      description: 'Welcome bonus',
      created_at: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: email, // Email from the request
          username: user.username,
          balance: user.balance,
          role: user.role,
        },
      },
    });
  })
);

// Login user
router.post('/login',
  loginRateLimit,
  validateRequest(LoginRequestSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (!authData.user || !authData.session) {
      throw new AuthenticationError('Authentication failed');
    }

    const user = await DatabaseService.getUserById(authData.user.id);
    if (!user) {
      throw new AuthenticationError('User profile not found');
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: authData.user.email,
          username: user.username,
          balance: user.balance,
          role: user.role,
        },
        token: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
      },
    });
  })
);

// Get current user profile
router.get('/profile',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const { data: authUser, error } = await supabase.auth.admin.getUserById(user.id);

    if (error || !authUser.user) {
        throw new AuthenticationError('Could not retrieve authenticated user details.');
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: authUser.user.email,
          username: user.username,
          balance: user.balance,
          role: user.role,
          created_at: user.created_at,
        },
      },
    });
  })
);

// Refresh token
router.post('/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError('Refresh token required');
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw new AuthenticationError('Invalid refresh token');
    }

    if (!data.session) {
      throw new AuthenticationError('Failed to refresh session');
    }

    res.json({
      success: true,
      data: {
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
      },
    });
  })
);

// Logout
router.post('/logout',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.substring(7);

    if (token) {
      await supabase.auth.admin.signOut(token);
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  })
);

// Update profile
router.put('/profile',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const { username } = req.body;

    if (!username || username.length < 3 || username.length > 20) {
      throw new ValidationError('Username must be between 3 and 20 characters');
    }

    const { data, error } = await supabase
      .from('users')
      .update({ username, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    
    const { data: authUser } = await supabase.auth.admin.getUserById(user.id);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: data.id,
          email: authUser?.user?.email,
          username: data.username,
          balance: data.balance,
          role: data.role,
        },
      },
    });
  })
);

export default router;