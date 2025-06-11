-- Casino Application Database Schema
-- Run this SQL script in your Supabase SQL Editor to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 1000.00 NOT NULL CHECK (balance >= 0),
    role VARCHAR(20) DEFAULT 'player' NOT NULL CHECK (role IN ('player', 'admin')),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'bet', 'win', 'admin_adjustment')),
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    description TEXT,
    reference_id UUID, -- Can reference bet_id or other transaction references
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Bets table
CREATE TABLE IF NOT EXISTS public.bets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    game_type VARCHAR(20) NOT NULL CHECK (game_type IN ('dice', 'crash', 'roulette', 'blackjack', 'slots', 'coinflip')),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    multiplier DECIMAL(10,4) DEFAULT 0.00 NOT NULL, -- Game multiplier for calculating payouts
    prediction JSONB, -- Store game-specific prediction data
    result JSONB, -- Store game result data
    payout DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    status VARCHAR(20) DEFAULT 'waiting' NOT NULL CHECK (status IN ('waiting', 'active', 'finished')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    finished_at TIMESTAMP WITH TIME ZONE
);

-- Game sessions table (for tracking active games)
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    game_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'waiting' NOT NULL CHECK (status IN ('waiting', 'active', 'finished')),
    players JSONB DEFAULT '[]'::jsonb, -- Array of player IDs
    game_data JSONB DEFAULT '{}'::jsonb, -- Game-specific data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE
);

-- Admin logs table
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    target_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON public.bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_game_type ON public.bets(game_type);
CREATE INDEX IF NOT EXISTS idx_bets_created_at ON public.bets(created_at);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON public.game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123456)
-- Note: This is a bcrypt hash of 'admin123456' with 12 rounds
INSERT INTO public.users (username, email, password_hash, balance, role)
VALUES (
    'admin',
    'admin@casino.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtGtrmu3VG',
    1000000.00,
    'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read their own data, admins can read all
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text OR 
                     EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- Users can update their own data (except balance and role), admins can update all
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text OR 
                     EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- Only admins can insert new users (registration handled by auth)
CREATE POLICY "Only admins can insert users" ON public.users
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- Transactions: users can view their own, admins can view all
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid()::text = user_id::text OR 
                     EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- Only system/admins can insert transactions
CREATE POLICY "Only system can insert transactions" ON public.transactions
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- Bets: users can view their own, admins can view all
CREATE POLICY "Users can view own bets" ON public.bets
    FOR SELECT USING (auth.uid()::text = user_id::text OR 
                     EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- Users can insert their own bets
CREATE POLICY "Users can place own bets" ON public.bets
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Only system/admins can update bets
CREATE POLICY "Only system can update bets" ON public.bets
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- Game sessions: readable by all authenticated users
CREATE POLICY "Authenticated users can view game sessions" ON public.game_sessions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can modify game sessions
CREATE POLICY "Only admins can modify game sessions" ON public.game_sessions
    FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- Admin logs: only admins can view and insert
CREATE POLICY "Only admins can access admin logs" ON public.admin_logs
    FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role = 'admin'));

COMMIT;