'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { FormatUtils } from '@shared/utils';
import { GAME_CONFIGS } from '@shared/constants';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';

interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
  value: number;
}

interface BlackjackResult {
  playerHand: Card[];
  dealerHand: Card[];
  playerScore: number;
  dealerScore: number;
  result: 'win' | 'lose' | 'push';
  reason: string;
}

type GameState = 'betting' | 'dealing' | 'playing' | 'dealer-turn' | 'finished';

export default function BlackjackPage() {
  const { user, refreshUser } = useAuth();
  const { token } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [betAmount, setBetAmount] = useState(1);
  const [gameState, setGameState] = useState<GameState>('betting');
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [lastResult, setLastResult] = useState<BlackjackResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const gameConfig = GAME_CONFIGS.blackjack;

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/games');
    }
  }, [user, router]);

  // Create a new deck
  const createDeck = (): Card[] => {
    const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks: Card['rank'][] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck: Card[] = [];

    for (const suit of suits) {
      for (const rank of ranks) {
        let value: number;
        if (rank === 'A') {
          value = 11; // Ace starts as 11, will be adjusted if needed
        } else if (['J', 'Q', 'K'].includes(rank)) {
          value = 10;
        } else {
          value = parseInt(rank);
        }
        
        deck.push({ suit, rank, value });
      }
    }

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
  };

  // Calculate hand value
  const calculateHandValue = (hand: Card[]): number => {
    let value = 0;
    let aces = 0;

    for (const card of hand) {
      if (card.rank === 'A') {
        aces++;
        value += 11;
      } else {
        value += card.value;
      }
    }

    // Adjust for aces
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    return value;
  };

  // Deal a card
  const dealCard = (currentDeck: Card[]): { card: Card; newDeck: Card[] } => {
    const newDeck = [...currentDeck];
    const card = newDeck.pop()!;
    return { card, newDeck };
  };

  // Start new game
  const startNewGame = async () => {
    if (!user || betAmount > user.balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this bet.",
        variant: "destructive",
      });
      return;
    }

    if (betAmount < gameConfig.minBet || betAmount > gameConfig.maxBet) {
      toast({
        title: "Invalid Bet Amount",
        description: `Bet must be between ${FormatUtils.formatCurrency(gameConfig.minBet)} and ${FormatUtils.formatCurrency(gameConfig.maxBet)}.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGameState('dealing');
    
    // Create new deck and deal initial cards
    let newDeck = createDeck();
    const newPlayerHand: Card[] = [];
    const newDealerHand: Card[] = [];

    // Deal 2 cards to player
    for (let i = 0; i < 2; i++) {
      const { card, newDeck: updatedDeck } = dealCard(newDeck);
      newPlayerHand.push(card);
      newDeck = updatedDeck;
    }

    // Deal 2 cards to dealer (one face down)
    for (let i = 0; i < 2; i++) {
      const { card, newDeck: updatedDeck } = dealCard(newDeck);
      newDealerHand.push(card);
      newDeck = updatedDeck;
    }

    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);
    setDeck(newDeck);
    setLastResult(null);
    
    // Check for blackjack
    const playerValue = calculateHandValue(newPlayerHand);
    const dealerValue = calculateHandValue(newDealerHand);
    
    setTimeout(() => {
      setIsLoading(false);
      
      if (playerValue === 21) {
        if (dealerValue === 21) {
          // Push
          endGame(newPlayerHand, newDealerHand, 'push', 'Both have blackjack');
        } else {
          // Player blackjack wins
          endGame(newPlayerHand, newDealerHand, 'win', 'Blackjack!');
        }
      } else {
        setGameState('playing');
      }
    }, 1500);
  };

  // Player hits
  const hit = () => {
    if (gameState !== 'playing') return;
    
    const { card, newDeck } = dealCard(deck);
    const newPlayerHand = [...playerHand, card];
    
    setPlayerHand(newPlayerHand);
    setDeck(newDeck);
    
    const playerValue = calculateHandValue(newPlayerHand);
    
    if (playerValue > 21) {
      // Player busts
      setTimeout(() => {
        endGame(newPlayerHand, dealerHand, 'lose', 'Player busts');
      }, 500);
    }
  };

  // Player stands
  const stand = () => {
    if (gameState !== 'playing') return;
    
    setGameState('dealer-turn');
    
    // Dealer plays
    let currentDealerHand = [...dealerHand];
    let currentDeck = [...deck];
    
    const dealerPlay = () => {
      const dealerValue = calculateHandValue(currentDealerHand);
      
      if (dealerValue < 17) {
        const { card, newDeck } = dealCard(currentDeck);
        currentDealerHand = [...currentDealerHand, card];
        currentDeck = newDeck;
        
        setDealerHand(currentDealerHand);
        setDeck(currentDeck);
        
        setTimeout(dealerPlay, 1000);
      } else {
        // Determine winner
        const playerValue = calculateHandValue(playerHand);
        const finalDealerValue = calculateHandValue(currentDealerHand);
        
        let result: 'win' | 'lose' | 'push';
        let reason: string;
        
        if (finalDealerValue > 21) {
          result = 'win';
          reason = 'Dealer busts';
        } else if (playerValue > finalDealerValue) {
          result = 'win';
          reason = 'Player wins';
        } else if (playerValue < finalDealerValue) {
          result = 'lose';
          reason = 'Dealer wins';
        } else {
          result = 'push';
          reason = 'Push';
        }
        
        setTimeout(() => {
          endGame(playerHand, currentDealerHand, result, reason);
        }, 1000);
      }
    };
    
    setTimeout(dealerPlay, 1000);
  };

  // End game
  const endGame = async (finalPlayerHand: Card[], finalDealerHand: Card[], result: 'win' | 'lose' | 'push', reason: string) => {
    const playerScore = calculateHandValue(finalPlayerHand);
    const dealerScore = calculateHandValue(finalDealerHand);
    
    setLastResult({
      playerHand: finalPlayerHand,
      dealerHand: finalDealerHand,
      playerScore,
      dealerScore,
      result,
      reason,
    });
    
    setGameState('finished');
    
    // Calculate payout
    let payout = 0;
    if (result === 'win') {
      if (playerScore === 21 && finalPlayerHand.length === 2) {
        // Blackjack pays 3:2
        payout = betAmount * 2.5;
      } else {
        // Regular win pays 1:1
        payout = betAmount * 2;
      }
    } else if (result === 'push') {
      // Push returns bet
      payout = betAmount;
    }
    
    // Simulate API call
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/games/bet', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          game_type: 'blackjack',
          amount: betAmount,
          prediction: {
            playerHand: finalPlayerHand,
            dealerHand: finalDealerHand,
            result,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        await refreshUser();
        
        if (result === 'win') {
          toast({
            title: "You Win!",
            description: `${reason} - Won ${FormatUtils.formatCurrency(payout - betAmount)}`,
          });
        } else if (result === 'lose') {
          toast({
            title: "You Lose",
            description: reason,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Push",
            description: "It's a tie! Your bet is returned.",
          });
        }
      }
    } catch (error) {
      console.error('Bet error:', error);
      toast({
        title: "Error",
        description: "Failed to process bet. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Reset game
  const resetGame = () => {
    setGameState('betting');
    setPlayerHand([]);
    setDealerHand([]);
    setDeck([]);
    setLastResult(null);
  };

  // Get card display
  const getCardDisplay = (card: Card, hidden = false) => {
    if (hidden) {
      return (
        <div className="w-20 h-28 bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-700 rounded-lg flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-200">
          <div className="text-white text-2xl animate-pulse">🂠</div>
        </div>
      );
    }
    
    const suitSymbols = {
      hearts: '♥️',
      diamonds: '♦️',
      clubs: '♣️',
      spades: '♠️',
    };
    
    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    
    return (
      <div className={`w-20 h-28 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center text-lg font-bold shadow-lg transform hover:scale-105 transition-all duration-200 ${
        isRed ? 'text-red-500' : 'text-black'
      }`}>
        <div className="text-xl">{card.rank}</div>
        <div className="text-2xl">{suitSymbols[card.suit]}</div>
      </div>
    );
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <span className="text-5xl">🃏</span>
            Blackjack
          </h1>
          <p className="text-muted-foreground text-lg">
            Get as close to 21 as possible without going over!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Table */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dealer Section */}
            <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-lg p-6 shadow-lg">
              {/* Animated Background */}
              <div className="absolute inset-0 overflow-hidden rounded-lg">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-red-400/20 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                <div className="absolute top-1/4 -right-4 w-6 h-6 bg-blue-400/20 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
                <div className="absolute -bottom-4 left-1/3 w-10 h-10 bg-green-400/20 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
              </div>
              
              <div className="text-center mb-4 relative z-10">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center justify-center gap-2">
                  <span className="text-2xl">🎩</span>
                  Dealer
                </h3>
                <div className="text-2xl font-bold text-primary">
                  {gameState === 'playing' || gameState === 'dealing' ? 
                    (dealerHand.length > 0 ? `${dealerHand[0].value}+` : '') :
                    calculateHandValue(dealerHand)
                  }
                </div>
              </div>
              
              <div className="flex justify-center space-x-3 mb-4 relative z-10">
                {dealerHand.map((card, index) => (
                  <div key={index} className="transform hover:scale-110 transition-all duration-200">
                    {getCardDisplay(card, index === 1 && (gameState === 'playing' || gameState === 'dealing'))}
                  </div>
                ))}
              </div>
            </div>

            {/* Player Section */}
            <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-lg p-6 shadow-lg">
              {/* Animated Background */}
              <div className="absolute inset-0 overflow-hidden rounded-lg">
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400/20 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute bottom-1/4 -left-4 w-6 h-6 bg-purple-400/20 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
                <div className="absolute -bottom-4 right-1/3 w-10 h-10 bg-pink-400/20 rounded-full animate-bounce" style={{animationDelay: '2.5s'}}></div>
              </div>
              
              <div className="text-center mb-4 relative z-10">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center justify-center gap-2">
                  <span className="text-2xl">👤</span>
                  Your Hand
                </h3>
                <div className={`text-2xl font-bold ${
                  calculateHandValue(playerHand) > 21 ? 'text-red-400' :
                  calculateHandValue(playerHand) === 21 ? 'text-green-400' :
                  'text-primary'
                }`}>
                  {calculateHandValue(playerHand)}
                </div>
              </div>
              
              <div className="flex justify-center space-x-3 mb-4 relative z-10">
                {playerHand.map((card, index) => (
                  <div key={index} className="transform hover:scale-110 transition-all duration-200">
                    {getCardDisplay(card)}
                  </div>
                ))}
              </div>
              
              {/* Action Buttons */}
              {gameState === 'playing' && (
                <div className="flex justify-center space-x-4 relative z-10">
                  <button
                    onClick={hit}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-blue-500/50"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg">👆</span>
                      Hit
                    </span>
                  </button>
                  <button
                    onClick={stand}
                    className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-red-500/50"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg">✋</span>
                      Stand
                    </span>
                  </button>
                </div>
              )}
              
              {gameState === 'dealing' && (
                <div className="text-center">
                  <LoadingSpinner />
                  <p className="text-muted-foreground mt-2">Dealing cards...</p>
                </div>
              )}
              
              {gameState === 'dealer-turn' && (
                <div className="text-center">
                  <p className="text-muted-foreground">Dealer is playing...</p>
                </div>
              )}
            </div>

            {/* Game Result */}
            {lastResult && gameState === 'finished' && (
              <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-lg p-6 shadow-lg">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-gold-400/20 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                  <div className="absolute top-1/4 -right-4 w-6 h-6 bg-silver-400/20 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
                  <div className="absolute -bottom-4 left-1/3 w-10 h-10 bg-bronze-400/20 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
                </div>
                
                <div className="text-center relative z-10">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                    <span className="text-2xl">🎯</span>
                    {lastResult.reason}
                  </h3>
                  <div className="text-lg text-muted-foreground mb-4 bg-background/50 rounded-lg p-2">
                    Player: {lastResult.playerScore} | Dealer: {lastResult.dealerScore}
                  </div>
                  <div className={`text-3xl font-bold mb-4 animate-pulse ${
                    lastResult.result === 'win' ? 'text-green-400' :
                    lastResult.result === 'lose' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {lastResult.result === 'win' ? '🎉 YOU WIN! 🎉' :
                     lastResult.result === 'lose' ? '💔 YOU LOSE 💔' : '🤝 PUSH 🤝'}
                  </div>
                  <button
                    onClick={resetGame}
                    className="casino-button px-8 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/80 hover:to-primary transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-primary/50"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg">🔄</span>
                      Play Again
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Betting Panel */}
          <div className="space-y-6">
            {/* Balance */}
            <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-lg p-6 shadow-lg">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1 flex items-center justify-center gap-2">
                  <span className="text-lg">💰</span>
                  Your Balance
                </div>
                <div className="text-3xl font-bold text-primary">
                  {FormatUtils.formatCurrency(user.balance)}
                </div>
              </div>
            </div>

            {/* Bet Controls */}
            {gameState === 'betting' && (
              <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-lg p-6 space-y-6 shadow-lg">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="text-xl">🎲</span>
                  Place Your Bet
                </h3>
                
                {/* Bet Amount */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Bet Amount
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setBetAmount(Math.max(gameConfig.minBet, betAmount / 2))}
                      className="px-4 py-2 bg-gradient-to-r from-background to-background/80 border border-border rounded text-white hover:from-muted hover:to-muted/80 transition-all duration-200 transform hover:scale-105 shadow-md"
                    >
                      ½
                    </button>
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                      min={gameConfig.minBet}
                      max={Math.min(gameConfig.maxBet, user.balance)}
                      step="0.01"
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-background to-background/80 border border-border rounded text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 shadow-md"
                    />
                    <button
                      onClick={() => setBetAmount(Math.min(gameConfig.maxBet, user.balance, betAmount * 2))}
                      className="px-4 py-2 bg-gradient-to-r from-background to-background/80 border border-border rounded text-white hover:from-muted hover:to-muted/80 transition-all duration-200 transform hover:scale-105 shadow-md"
                    >
                      2×
                    </button>
                  </div>
                </div>

                {/* Quick Bet Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {[1, 5, 10, 25].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      disabled={amount > user.balance}
                      className="px-4 py-3 bg-gradient-to-r from-background to-background/80 border border-border rounded-lg text-white hover:from-muted hover:to-muted/80 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-md font-semibold"
                    >
                      ${amount}
                    </button>
                  ))}
                </div>

                {/* Deal Button */}
                <button
                  onClick={startNewGame}
                  disabled={isLoading || betAmount <= 0 || betAmount > user.balance}
                  className="w-full casino-button py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-primary/80 hover:from-primary/80 hover:to-primary transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-primary/50"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-xl">🃏</span>
                    {isLoading ? 'Dealing...' : 'Deal Cards'}
                  </span>
                </button>
              </div>
            )}

            {/* Game Info */}
            <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-xl">📋</span>
                Game Rules
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><span>🎯</span> Get as close to 21 as possible</p>
                <p className="flex items-center gap-2"><span>👑</span> Face cards are worth 10</p>
                <p className="flex items-center gap-2"><span>🃏</span> Aces are worth 1 or 11</p>
                <p className="flex items-center gap-2"><span>💎</span> Blackjack pays 3:2</p>
                <p className="flex items-center gap-2"><span>🛑</span> Dealer stands on 17</p>
                <p className="flex items-center gap-2"><span>🏠</span> House edge: {(gameConfig.houseEdge * 100).toFixed(1)}%</p>
              </div>
            </div>

            {/* Current Bet */}
            {gameState !== 'betting' && (
              <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-lg p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center gap-2">
                  <span className="text-xl">💸</span>
                  Current Bet
                </h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary animate-pulse">
                    {FormatUtils.formatCurrency(betAmount)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}