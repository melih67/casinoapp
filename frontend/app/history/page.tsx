'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win';
  amount: number;
  game_type?: string;
  description: string;
  created_at: string;
  balance_after: number;
}

interface BetHistory {
  id: string;
  game_type: string;
  amount: number;
  multiplier?: number;
  payout: number;
  result: any;
  created_at: string;
  profit: number;
}

interface Stats {
  totalBets: number;
  totalWagered: number;
  totalWon: number;
  netProfit: number;
  biggestWin: number;
  favoriteGame: string;
  winRate: number;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'transactions' | 'bets' | 'stats'>('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bets, setBets] = useState<BetHistory[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  const [gameFilter, setGameFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      router.push('/games');
      return;
    }
    loadData();
  }, [user, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulate API calls - replace with actual API endpoints
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock transaction data
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'deposit',
          amount: 1000,
          description: 'Initial deposit',
          created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
          balance_after: 1000
        },
        {
          id: '2',
          type: 'bet',
          amount: -50,
          game_type: 'roulette',
          description: 'Roulette bet',
          created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
          balance_after: 950
        },
        {
          id: '3',
          type: 'win',
          amount: 175,
          game_type: 'roulette',
          description: 'Roulette win (3.5x)',
          created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
          balance_after: 1125
        },
        {
          id: '4',
          type: 'bet',
          amount: -25,
          game_type: 'slots',
          description: 'Slots bet',
          created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
          balance_after: 1100
        },
        {
          id: '5',
          type: 'bet',
          amount: -100,
          game_type: 'crash',
          description: 'Crash bet',
          created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
          balance_after: 1000
        },
        {
          id: '6',
          type: 'win',
          amount: 250,
          game_type: 'crash',
          description: 'Crash win (2.5x)',
          created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
          balance_after: 1250
        }
      ];

      // Mock bet history
      const mockBets: BetHistory[] = [
        {
          id: '1',
          game_type: 'roulette',
          amount: 50,
          multiplier: 3.5,
          payout: 175,
          result: { number: 17, color: 'black' },
          created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
          profit: 125
        },
        {
          id: '2',
          game_type: 'slots',
          amount: 25,
          payout: 0,
          result: { reels: ['🍒', '🍋', '🍊'] },
          created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
          profit: -25
        },
        {
          id: '3',
          game_type: 'crash',
          amount: 100,
          multiplier: 2.5,
          payout: 250,
          result: { crashPoint: 2.5, cashedOut: true },
          created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
          profit: 150
        },
        {
          id: '4',
          game_type: 'dice',
          amount: 30,
          payout: 0,
          result: { roll: 45, prediction: 'over', target: 50 },
          created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
          profit: -30
        },
        {
          id: '5',
          game_type: 'mines',
          amount: 20,
          multiplier: 1.8,
          payout: 36,
          result: { mines: 3, revealed: 2, cashedOut: true },
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          profit: 16
        }
      ];

      // Calculate stats
      const totalBets = mockBets.length;
      const totalWagered = mockBets.reduce((sum, bet) => sum + bet.amount, 0);
      const totalWon = mockBets.reduce((sum, bet) => sum + bet.payout, 0);
      const netProfit = totalWon - totalWagered;
      const biggestWin = Math.max(...mockBets.map(bet => bet.payout));
      const winningBets = mockBets.filter(bet => bet.payout > bet.amount);
      const winRate = totalBets > 0 ? (winningBets.length / totalBets) * 100 : 0;
      
      // Find favorite game
      const gameCount: Record<string, number> = {};
      mockBets.forEach(bet => {
        gameCount[bet.game_type] = (gameCount[bet.game_type] || 0) + 1;
      });
      const favoriteGame = Object.keys(gameCount).reduce((a, b) => 
        gameCount[a] > gameCount[b] ? a : b, 'none'
      );

      const mockStats: Stats = {
        totalBets,
        totalWagered,
        totalWon,
        netProfit,
        biggestWin,
        favoriteGame,
        winRate
      };

      setTransactions(mockTransactions);
      setBets(mockBets);
      setStats(mockStats);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load history data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return '💰';
      case 'withdrawal': return '🏦';
      case 'bet': return '🎲';
      case 'win': return '🎉';
      default: return '📊';
    }
  };

  const getGameIcon = (gameType: string) => {
    switch (gameType) {
      case 'roulette': return '🎰';
      case 'slots': return '🎰';
      case 'crash': return '📈';
      case 'dice': return '🎲';
      case 'mines': return '💣';
      case 'plinko': return '🎯';
      case 'blackjack': return '🃏';
      case 'coinflip': return '🪙';
      default: return '🎮';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (dateFilter !== 'all') {
      const transactionDate = new Date(transaction.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case '7d': return daysDiff <= 7;
        case '30d': return daysDiff <= 30;
        case '90d': return daysDiff <= 90;
        default: return true;
      }
    }
    return true;
  });

  const filteredBets = bets.filter(bet => {
    let passesGameFilter = gameFilter === 'all' || bet.game_type === gameFilter;
    let passesDateFilter = true;
    
    if (dateFilter !== 'all') {
      const betDate = new Date(bet.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - betDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case '7d': passesDateFilter = daysDiff <= 7; break;
        case '30d': passesDateFilter = daysDiff <= 30; break;
        case '90d': passesDateFilter = daysDiff <= 90; break;
      }
    }
    
    return passesGameFilter && passesDateFilter;
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-transparent rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/10 to-transparent rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            📊 Portfolio History
          </h1>
          <p className="text-xl text-gray-300">Track your gaming journey and performance</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-2xl p-2 flex gap-2">
            {[
              { key: 'transactions', label: '💰 Transactions', icon: '💰' },
              { key: 'bets', label: '🎲 Bet History', icon: '🎲' },
              { key: 'stats', label: '📊 Statistics', icon: '📊' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <div className="flex gap-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            
            {activeTab === 'bets' && (
              <select
                value={gameFilter}
                onChange={(e) => setGameFilter(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Games</option>
                <option value="roulette">Roulette</option>
                <option value="slots">Slots</option>
                <option value="crash">Crash</option>
                <option value="dice">Dice</option>
                <option value="mines">Mines</option>
                <option value="plinko">Plinko</option>
                <option value="blackjack">Blackjack</option>
                <option value="coinflip">Coinflip</option>
              </select>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading your history...</p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700">
            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">💰 Transaction History</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredTransactions.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No transactions found</p>
                  ) : (
                    filteredTransactions.map(transaction => (
                      <div key={transaction.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{getTransactionIcon(transaction.type)}</div>
                          <div>
                            <div className="text-white font-medium">{transaction.description}</div>
                            <div className="text-gray-400 text-sm">{formatDate(transaction.created_at)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold text-lg ${
                            transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}${transaction.amount.toFixed(2)}
                          </div>
                          <div className="text-gray-400 text-sm">
                            Balance: ${transaction.balance_after.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Bets Tab */}
            {activeTab === 'bets' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">🎲 Betting History</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredBets.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No bets found</p>
                  ) : (
                    filteredBets.map(bet => (
                      <div key={bet.id} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{getGameIcon(bet.game_type)}</div>
                            <div>
                              <div className="text-white font-medium capitalize">{bet.game_type}</div>
                              <div className="text-gray-400 text-sm">{formatDate(bet.created_at)}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-medium">Bet: ${bet.amount.toFixed(2)}</div>
                            <div className={`font-bold ${
                              bet.profit > 0 ? 'text-green-400' : bet.profit < 0 ? 'text-red-400' : 'text-gray-400'
                            }`}>
                              {bet.profit > 0 ? '+' : ''}${bet.profit.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <div className="text-gray-400">
                            {bet.multiplier && `${bet.multiplier}x multiplier • `}
                            Payout: ${bet.payout.toFixed(2)}
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            bet.payout > bet.amount ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          }`}>
                            {bet.payout > bet.amount ? 'WIN' : 'LOSS'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && stats && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">📊 Gaming Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">🎲</div>
                    <div className="text-2xl font-bold text-white">{stats.totalBets}</div>
                    <div className="text-gray-400">Total Bets</div>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">💸</div>
                    <div className="text-2xl font-bold text-white">${stats.totalWagered.toFixed(2)}</div>
                    <div className="text-gray-400">Total Wagered</div>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">💰</div>
                    <div className="text-2xl font-bold text-white">${stats.totalWon.toFixed(2)}</div>
                    <div className="text-gray-400">Total Won</div>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">{stats.netProfit >= 0 ? '📈' : '📉'}</div>
                    <div className={`text-2xl font-bold ${
                      stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {stats.netProfit >= 0 ? '+' : ''}${stats.netProfit.toFixed(2)}
                    </div>
                    <div className="text-gray-400">Net Profit</div>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">🏆</div>
                    <div className="text-2xl font-bold text-yellow-400">${stats.biggestWin.toFixed(2)}</div>
                    <div className="text-gray-400">Biggest Win</div>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">🎯</div>
                    <div className="text-2xl font-bold text-blue-400">{stats.winRate.toFixed(1)}%</div>
                    <div className="text-gray-400">Win Rate</div>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4 text-center md:col-span-2 lg:col-span-3">
                    <div className="text-3xl mb-2">🎮</div>
                    <div className="text-2xl font-bold text-purple-400 capitalize">{stats.favoriteGame}</div>
                    <div className="text-gray-400">Favorite Game</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/games')}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            🎮 Back to Games
          </button>
        </div>
      </div>
    </div>
  );
}