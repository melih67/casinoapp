import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with service role key for backend operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Database table names
export const TABLES = {
  USERS: 'users',
  BETS: 'bets',
  TRANSACTIONS: 'transactions',
  GAME_SESSIONS: 'game_sessions',
  ADMIN_LOGS: 'admin_logs',
} as const;

// Database functions
export class DatabaseService {
  // User operations
  static async getUserById(userId: string) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  }

  static async createUser(userData: any) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateUserBalance(userId: string, newBalance: number) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Transaction operations
  static async createTransaction(transactionData: any) {
    const { data, error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .insert(transactionData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getUserTransactions(userId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  // Bet operations
  static async createBet(betData: any, userToken?: string) {
    // For RLS compliance, we need to use a client that respects user authentication
    if (userToken) {
      // Create a client with the anon key and set the auth header
      const userClient = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${userToken}`,
              apikey: process.env.SUPABASE_ANON_KEY!
            }
          }
        }
      );
      
      const { data, error } = await userClient
        .from(TABLES.BETS)
        .insert(betData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Fallback to admin client (bypasses RLS)
      const { data, error } = await supabase
        .from(TABLES.BETS)
        .insert(betData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  }

  static async updateBet(betId: string, updateData: any) {
    const { data, error } = await supabase
      .from(TABLES.BETS)
      .update(updateData)
      .eq('id', betId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getUserBets(userId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from(TABLES.BETS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  // Admin operations
  static async getAllUsers(limit: number = 100, offset: number = 0) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  }

  static async getAllTransactions(limit: number = 100, offset: number = 0) {
    const { data, error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .select(`
        *,
        users!inner(username, email)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  }

  static async getGameStats(gameType?: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from(TABLES.BETS)
      .select('*');
    
    if (gameType) {
      query = query.eq('game_type', gameType);
    }
    
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  static async createAdminLog(logData: any) {
    const { data, error } = await supabase
      .from(TABLES.ADMIN_LOGS)
      .insert(logData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}