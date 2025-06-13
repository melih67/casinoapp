'use client';

import Link from 'next/link';
import { GAME_CONFIGS } from '@shared/constants';
import { GameType } from '@shared/types';

interface GameGridProps {
  preview?: boolean;
  onGameClick?: () => void;
}

interface GameCardProps {
  gameType: GameType;
  title: string;
  description: string;
  icon: React.ReactNode;
  minBet: number;
  maxBet: number;
  houseEdge: number;
  preview?: boolean;
  onGameClick?: () => void;
}

function GameCard({ 
  gameType, 
  title, 
  description, 
  icon, 
  minBet, 
  maxBet, 
  houseEdge, 
  preview = false, 
  onGameClick 
}: GameCardProps) {
  const handleClick = () => {
    if (preview && onGameClick) {
      onGameClick();
    }
  };

  const CardContent = (
    <div 
      className={`game-tile group cursor-pointer ${
        preview ? 'opacity-75 hover:opacity-90' : 'hover:scale-105'
      } transition-all duration-300`}
      onClick={preview ? handleClick : undefined}
    >
      {/* Game Icon */}
      <div className="flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4 group-hover:bg-primary/30 transition-colors">
        {icon}
      </div>

      {/* Game Info */}
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-4">{description}</p>

      {/* Game Stats */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Min Bet:</span>
          <span className="text-white font-medium">${minBet}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Max Bet:</span>
          <span className="text-white font-medium">${maxBet}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">House Edge:</span>
          <span className="text-white font-medium">{houseEdge}%</span>
        </div>
      </div>

      {/* Play Button */}
      <div className="mt-6">
        <div className="casino-button w-full text-center py-2 text-sm">
          {preview ? 'Sign Up to Play' : 'Play Now'}
        </div>
      </div>


    </div>
  );

  if (preview) {
    return CardContent;
  }

  return (
    <Link href={`/games/${gameType}`}>
      {CardContent}
    </Link>
  );
}

export function GameGrid({ preview = false, onGameClick }: GameGridProps) {
  const games = [
    {
      type: 'dice' as GameType,
      title: 'Dice',
      description: 'Roll the dice and predict the outcome. Simple yet thrilling!',
      icon: (
        <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h14v14H5V5zm2 2a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2zM7 12a1 1 0 100 2 1 1 0 000-2zm5 0a1 1 0 100 2 1 1 0 000-2zm5 0a1 1 0 100 2 1 1 0 000-2zM7 17a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z" />
        </svg>
      ),
    },
    {
      type: 'coinflip' as GameType,
      title: 'Coinflip',
      description: 'Classic heads or tails. 50/50 chance to double your money!',
      icon: (
        <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      type: 'crash' as GameType,
      title: 'Crash',
      description: 'Watch the multiplier rise and cash out before it crashes!',
      icon: (
        <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 17l6-6 4 4 8-8M21 7l-4 4-4-4-4 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      type: 'roulette' as GameType,
      title: 'Roulette',
      description: 'Spin the wheel and bet on your lucky numbers!',
      icon: (
        <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1" fill="none" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      ),
    },
    {
      type: 'blackjack' as GameType,
      title: 'Blackjack',
      description: 'Beat the dealer and get as close to 21 as possible!',
      icon: (
        <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M7 8h2v8M13 8h2l2 4-2 4h-2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      type: 'slots' as GameType,
      title: 'Slots',
      description: 'Spin the reels and hit the jackpot!',
      icon: (
        <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
          <rect x="7" y="6" width="2" height="2" fill="currentColor" />
          <rect x="11" y="6" width="2" height="2" fill="currentColor" />
          <rect x="15" y="6" width="2" height="2" fill="currentColor" />
          <rect x="7" y="10" width="2" height="2" fill="currentColor" />
          <rect x="11" y="10" width="2" height="2" fill="currentColor" />
          <rect x="15" y="10" width="2" height="2" fill="currentColor" />
          <rect x="7" y="14" width="2" height="2" fill="currentColor" />
          <rect x="11" y="14" width="2" height="2" fill="currentColor" />
          <rect x="15" y="14" width="2" height="2" fill="currentColor" />
        </svg>
      ),
    },
    {
      type: 'mines' as GameType,
      title: 'Mines',
      description: 'Find the gems while avoiding the mines!',
      icon: (
        <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M12 4v4M12 16v4M4 12h4M16 12h4M6.34 6.34l2.83 2.83M14.83 14.83l2.83 2.83M6.34 17.66l2.83-2.83M14.83 9.17l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      ),
    },
    {
      type: 'plinko' as GameType,
      title: 'Plinko',
      description: 'Drop the ball and watch it bounce to fortune!',
      icon: (
        <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="4" r="2" fill="currentColor" />
          <circle cx="8" cy="8" r="1" fill="currentColor" />
          <circle cx="16" cy="8" r="1" fill="currentColor" />
          <circle cx="6" cy="12" r="1" fill="currentColor" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
          <circle cx="18" cy="12" r="1" fill="currentColor" />
          <circle cx="4" cy="16" r="1" fill="currentColor" />
          <circle cx="10" cy="16" r="1" fill="currentColor" />
          <circle cx="14" cy="16" r="1" fill="currentColor" />
          <circle cx="20" cy="16" r="1" fill="currentColor" />
          <rect x="2" y="20" width="20" height="2" fill="currentColor" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {games.map((game) => {
        const config = GAME_CONFIGS[game.type];
        return (
          <GameCard
            key={game.type}
            gameType={game.type}
            title={game.title}
            description={game.description}
            icon={game.icon}
            minBet={config.minBet}
            maxBet={config.maxBet}
            houseEdge={config.houseEdge}
            preview={preview}
            onGameClick={onGameClick}
          />
        );
      })}
    </div>
  );
}