import { Server, Socket } from 'socket.io';
import { supabase, DatabaseService } from '../config/supabase';
import { User } from '../../../shared/src/types';

interface AuthenticatedSocket extends Socket {
  user?: User;
}

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware for socket connections
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify token with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return next(new Error('Invalid authentication token'));
      }

      // Get user data from database
      const userData = await DatabaseService.getUserById(user.id);
      
      if (!userData) {
        return next(new Error('User not found'));
      }

      socket.user = userData;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.user?.username} connected (${socket.id})`);
    
    // Join user-specific room for personal notifications
    socket.join(`user:${socket.user?.id}`);
    
    // Handle joining game rooms
    socket.on('join-game', (gameType: string) => {
      try {
        socket.join(`game:${gameType}`);
        console.log(`User ${socket.user?.username} joined ${gameType} game room`);
        
        // Notify others in the game room
        socket.to(`game:${gameType}`).emit('user-joined', {
          userId: socket.user?.id,
          username: socket.user?.username,
        });
        
        // Send current game state or statistics
        socket.emit('game-joined', {
          gameType,
          message: `Joined ${gameType} game room`,
        });
      } catch (error) {
        console.error('Error joining game room:', error);
        socket.emit('error', 'Failed to join game room');
      }
    });

    // Handle leaving game rooms
    socket.on('leave-game', (gameType: string) => {
      try {
        socket.leave(`game:${gameType}`);
        console.log(`User ${socket.user?.username} left ${gameType} game room`);
        
        // Notify others in the game room
        socket.to(`game:${gameType}`).emit('user-left', {
          userId: socket.user?.id,
          username: socket.user?.username,
        });
      } catch (error) {
        console.error('Error leaving game room:', error);
        socket.emit('error', 'Failed to leave game room');
      }
    });

    // Handle live bet notifications (for spectators)
    socket.on('watch-bets', (gameType?: string) => {
      try {
        const room = gameType ? `bets:${gameType}` : 'bets:all';
        socket.join(room);
        console.log(`User ${socket.user?.username} watching bets in ${room}`);
      } catch (error) {
        console.error('Error joining bet watch room:', error);
        socket.emit('error', 'Failed to watch bets');
      }
    });

    // Handle stopping bet watching
    socket.on('stop-watching-bets', (gameType?: string) => {
      try {
        const room = gameType ? `bets:${gameType}` : 'bets:all';
        socket.leave(room);
        console.log(`User ${socket.user?.username} stopped watching bets in ${room}`);
      } catch (error) {
        console.error('Error leaving bet watch room:', error);
      }
    });

    // Handle chat messages (if implementing chat)
    socket.on('chat-message', (data: { gameType: string; message: string }): void => {
      try {
        if (!data.message || data.message.trim().length === 0) {
          socket.emit('error', 'Message cannot be empty');
          return; // <-- CHANGED
        }

        if (data.message.length > 200) {
          socket.emit('error', 'Message too long');
          return; // <-- CHANGED
        }

        const chatMessage = {
          id: Date.now().toString(),
          userId: socket.user?.id,
          username: socket.user?.username,
          message: data.message.trim(),
          timestamp: new Date().toISOString(),
        };

        // Broadcast to game room
        io.to(`game:${data.gameType}`).emit('chat-message', chatMessage);
        
        console.log(`Chat message from ${socket.user?.username} in ${data.gameType}: ${data.message}`);
      } catch (error) {
        console.error('Error handling chat message:', error);
        socket.emit('error', 'Failed to send message');
      }
    });

    // Handle requesting user stats
    socket.on('get-stats', async (): Promise<void> => {
      try {
        if (!socket.user) {
          socket.emit('error', 'User not authenticated');
          return; // <-- CHANGED
        }

        const bets = await DatabaseService.getUserBets(socket.user.id, 100);
        const transactions = await DatabaseService.getUserTransactions(socket.user.id, 20);
        
        // Calculate basic stats
        const totalBets = bets.length;
        const totalWagered = bets.reduce((sum, bet) => sum + bet.amount, 0);
        const totalWon = bets.reduce((sum, bet) => sum + bet.payout, 0);
        const netProfit = totalWon - totalWagered;
        
        socket.emit('user-stats', {
          totalBets,
          totalWagered,
          totalWon,
          netProfit,
          currentBalance: socket.user.balance,
          recentBets: bets.slice(0, 10),
          recentTransactions: transactions.slice(0, 10),
        });
      } catch (error) {
        console.error('Error getting user stats:', error);
        socket.emit('error', 'Failed to get statistics');
      }
    });

    // Handle requesting leaderboard
    socket.on('get-leaderboard', async (gameType?: string) => {
      try {
        // Get recent bets for leaderboard
        const bets = await DatabaseService.getGameStats(gameType);
        
        // Calculate leaderboard (top winners in last 24 hours)
        const last24Hours = new Date();
        last24Hours.setHours(last24Hours.getHours() - 24);
        
        const recentBets = bets.filter(bet => new Date(bet.created_at) >= last24Hours);
        
        // Group by user and calculate profits
        const userProfits = recentBets.reduce((acc, bet) => {
          if (!acc[bet.user_id]) {
            acc[bet.user_id] = {
              userId: bet.user_id,
              totalWagered: 0,
              totalWon: 0,
              netProfit: 0,
              bets: 0,
            };
          }
          
          acc[bet.user_id].totalWagered += bet.amount;
          acc[bet.user_id].totalWon += bet.payout;
          acc[bet.user_id].netProfit = acc[bet.user_id].totalWon - acc[bet.user_id].totalWagered;
          acc[bet.user_id].bets += 1;
          
          return acc;
        }, {} as any); // Added 'as any' to simplify the reduce type, can be improved with a proper type
        
        // Sort by net profit and get top 10
        const leaderboard = Object.values(userProfits)
          .sort((a: any, b: any) => b.netProfit - a.netProfit)
          .slice(0, 10);
        
        socket.emit('leaderboard', {
          gameType: gameType || 'all',
          period: '24h',
          leaders: leaderboard,
        });
      } catch (error) {
        console.error('Error getting leaderboard:', error);
        socket.emit('error', 'Failed to get leaderboard');
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`User ${socket.user?.username} disconnected (${socket.id}): ${reason}`);
      
      // Leave all rooms
      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          socket.to(room).emit('user-disconnected', {
            userId: socket.user?.id,
            username: socket.user?.username,
          });
        }
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.user?.username}:`, error);
    });
  });

  // Utility function to broadcast bet results to watchers
  const broadcastBetResult = (bet: any) => {
    // Broadcast to all bet watchers
    io.to('bets:all').emit('live-bet', {
      gameType: bet.game_type,
      amount: bet.amount,
      multiplier: bet.multiplier,
      payout: bet.payout,
      win: bet.payout > bet.amount,
      timestamp: bet.created_at,
    });
    
    // Broadcast to game-specific watchers
    io.to(`bets:${bet.game_type}`).emit('live-bet', {
      gameType: bet.game_type,
      amount: bet.amount,
      multiplier: bet.multiplier,
      payout: bet.payout,
      win: bet.payout > bet.amount,
      timestamp: bet.created_at,
    });
  };

  // Export utility functions for use in other parts of the app
  return {
    broadcastBetResult,
    io,
  };
};