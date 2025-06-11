'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User } from '@shared/types';
import { useAuthStore } from '@/stores/authStore';
import { useSocketStore } from '@/stores/socketStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth Context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider
function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, setLoading, loading } = useAuthStore();
  const { connect, disconnect } = useSocketStore();

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        // First check if we have a stored token
        const { token: storedToken } = useAuthStore.getState();
        
        if (storedToken) {
          // Validate stored token with our API
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          });
          
          if (response.ok) {
            const { data } = await response.json();
            setUser(data.user, storedToken);
            connect(storedToken);
            setLoading(false);
            return;
          } else {
            // Token is invalid, clear it
            setUser(null, null);
          }
        }
        
        // Fallback to Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Get user profile from our API
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });
          
          if (response.ok) {
            const { data } = await response.json();
            setUser(data.user, session.access_token);
            connect(session.access_token);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
        setUser(null, null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null, null);
          disconnect();
        }
      }
    );

    // Set up periodic token validation
    const tokenValidationInterval = setInterval(async () => {
      const { token, user } = useAuthStore.getState();
      if (token && user) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (!response.ok) {
            // Token is invalid, sign out
            setUser(null, null);
            disconnect();
          }
        } catch (error) {
          console.error('Token validation error:', error);
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      subscription.unsubscribe();
      clearInterval(tokenValidationInterval);
    };
  }, [setUser, setLoading, connect, disconnect]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }

      setUser(result.data.user, result.data.token);
      connect(result.data.token);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      // Auto sign in after registration
      await signIn(email, password);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear local state
      setUser(null, null);
      disconnect();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const { user: currentUser, token } = useAuthStore.getState();
      
      if (!token) return;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const { data } = await response.json();
        setUser(data.user, token);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Socket Provider
function SocketProvider({ children }: { children: React.ReactNode }) {
  const { socket, isConnected } = useSocketStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (socket && user) {
      // Set up socket event listeners
      socket.on('balance-update', (newBalance: number) => {
        useAuthStore.getState().updateBalance(newBalance);
      });

      socket.on('error', (error: string) => {
        console.error('Socket error:', error);
      });

      return () => {
        socket.off('balance-update');
        socket.off('error');
      };
    }
  }, [socket, user]);

  return <>{children}</>;
}

// Main Providers component
export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <AuthProvider>
      <SocketProvider>
        {children}
      </SocketProvider>
    </AuthProvider>
  );
}