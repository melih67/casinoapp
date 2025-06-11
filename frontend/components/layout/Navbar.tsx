'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/providers';
import { useAuthStore } from '@/stores/authStore';
import { FormatUtils } from '@shared/utils';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserMenu } from './UserMenu';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function Navbar() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">CasinoApp</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                href="/" 
                className="text-muted-foreground hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link 
                href="/games" 
                className="text-muted-foreground hover:text-white transition-colors"
              >
                Games
              </Link>
              {user && (
                <>
                  <Link 
                    href="/profile" 
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    Profile
                  </Link>
                  <Link 
                    href="/history" 
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    History
                  </Link>
                </>
              )}
              {user?.role === 'admin' && (
                <Link 
                  href="/admin" 
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Admin
                </Link>
              )}
            </div>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : user ? (
                <>
                  {/* Balance Display */}
                  <div className="hidden sm:flex items-center space-x-2 bg-background px-3 py-1.5 rounded-lg border">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold text-white">
                      {FormatUtils.formatCurrency(user.balance)}
                    </span>
                  </div>

                  {/* User Menu */}
                  <UserMenu user={user} />
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="casino-button px-4 py-2"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-muted-foreground hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4">
              <div className="flex flex-col space-y-4">
                <Link 
                  href="/" 
                  className="text-muted-foreground hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  href="/games" 
                  className="text-muted-foreground hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Games
                </Link>
                {user && (
                  <>
                    <Link 
                      href="/profile" 
                      className="text-muted-foreground hover:text-white transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link 
                      href="/history" 
                      className="text-muted-foreground hover:text-white transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      History
                    </Link>
                    {/* Mobile Balance Display */}
                    <div className="flex items-center space-x-2 bg-background px-3 py-2 rounded-lg border w-fit">
                      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold text-white">
                        Balance: {FormatUtils.formatCurrency(user.balance)}
                      </span>
                    </div>
                  </>
                )}
                {user?.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    className="text-primary hover:text-primary/80 transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}