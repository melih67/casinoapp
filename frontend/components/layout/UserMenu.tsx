'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/app/providers';
import { User } from '@shared/types';
import Link from 'next/link';

interface UserMenuProps {
  user: User;
}

export function UserMenu({ user }: UserMenuProps) {
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-background hover:bg-muted px-3 py-2 rounded-lg border transition-colors"
      >
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {user.username.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="hidden sm:block text-white font-medium">
          {user.username}
        </span>
        <svg 
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50">
          <div className="py-2">
            {/* User Info */}
            <div className="px-4 py-2 border-b border-border">
              <p className="text-sm font-medium text-white">{user.username}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              {user.role === 'admin' && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                  Admin
                </span>
              )}
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <Link
                href="/profile"
                className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-white hover:bg-muted transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </Link>

              <Link
                href="/history"
                className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-white hover:bg-muted transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Bet History
              </Link>

              <Link
                href="/leaderboard"
                className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-white hover:bg-muted transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Leaderboard
              </Link>

              {user.role === 'admin' && (
                <>
                  <div className="border-t border-border my-1"></div>
                  <Link
                    href="/admin"
                    className="flex items-center px-4 py-2 text-sm text-primary hover:text-primary/80 hover:bg-muted transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin Dashboard
                  </Link>
                </>
              )}

              <div className="border-t border-border my-1"></div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-muted transition-colors"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}