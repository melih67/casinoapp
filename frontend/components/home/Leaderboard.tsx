'use client';

import { useAuth } from '@/app/providers';
import { useSocketStore } from '@/stores/socketStore';
import { FormatUtils } from '@shared/utils';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface LeaderboardEntry {
  id: string;
  username: string;
  balance: number;
  totalWagered: number;
  totalWon: number;
  rank: number;
}

export function Leaderboard() {
  const { user } = useAuth();
  const { socket, emit } = useSocketStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'alltime'>('weekly');

  useEffect(() => {
    if (socket) {
      // Listen for leaderboard updates
      socket.on('leaderboard-update', (data: LeaderboardEntry[]) => {
        setLeaderboard(data);
        setLoading(false);
      });

      // Request initial leaderboard data
      emit('get-leaderboard', { timeframe, limit: 10 });

      return () => {
        socket.off('leaderboard-update');
      };
    }
  }, [socket, timeframe, emit]);

  const handleTimeframeChange = (newTimeframe: typeof timeframe) => {
    setTimeframe(newTimeframe);
    setLoading(true);
    if (socket) {
      emit('get-leaderboard', { timeframe: newTimeframe, limit: 10 });
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">2</span>
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">3</span>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <span className="text-muted-foreground font-bold text-sm">{rank}</span>
          </div>
        );
    }
  };

  const timeframeOptions = [
    { value: 'daily', label: 'Today' },
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'alltime', label: 'All Time' },
  ];

  return (
    <div className="casino-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <h2 className="text-xl font-bold text-white">Leaderboard</h2>
        </div>
        <a 
          href="/leaderboard" 
          className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
        >
          View All
        </a>
      </div>

      {/* Timeframe Selector */}
      <div className="flex space-x-1 mb-6 bg-background rounded-lg p-1">
        {timeframeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleTimeframeChange(option.value as typeof timeframe)}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
              timeframe === option.value
                ? 'bg-primary text-white'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-muted-foreground mb-2">No data available</p>
          <p className="text-sm text-muted-foreground">Start playing to appear on the leaderboard!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div 
              key={entry.id} 
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                user?.id === entry.id
                  ? 'bg-primary/10 border-primary/50'
                  : 'bg-background border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                {getRankIcon(entry.rank)}
                <div>
                  <div className={`font-medium ${
                    user?.id === entry.id ? 'text-primary' : 'text-white'
                  }`}>
                    {entry.username}
                    {user?.id === entry.id && (
                      <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Wagered: {FormatUtils.formatCurrency(entry.totalWagered)}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-white">
                  {FormatUtils.formatCurrency(entry.balance)}
                </div>
                <div className="text-xs text-green-400">
                  Won: {FormatUtils.formatCurrency(entry.totalWon)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}