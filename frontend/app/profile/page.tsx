'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  balance: number;
  role: 'player' | 'admin';
  created_at: string;
  updated_at: string;
  avatar?: string;
  bio?: string;
  country?: string;
  birthday?: string;
  phone?: string;
  preferences: {
    notifications: boolean;
    soundEffects: boolean;
    animations: boolean;
    theme: 'dark' | 'light';
    language: string;
  };
  stats: {
    totalGamesPlayed: number;
    totalWagered: number;
    totalWon: number;
    favoriteGame: string;
    memberSince: string;
    lastLogin: string;
  };
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'security'>('overview');
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    country: '',
    birthday: '',
    phone: ''
  });
  const [preferences, setPreferences] = useState({
    notifications: true,
    soundEffects: true,
    animations: true,
    theme: 'dark' as 'dark' | 'light',
    language: 'en'
  });

  useEffect(() => {
    if (!user) {
      router.push('/games');
      return;
    }
    loadProfile();
  }, [user, router]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock profile data
      const mockProfile: UserProfile = {
        id: user?.id || '1',
        email: user?.email || 'player@example.com',
        username: user?.username || 'Player123',
        balance: user?.balance || 1250.50,
        role: user?.role || 'player',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: new Date().toISOString(),
        avatar: '',
        bio: 'Passionate casino player who loves the thrill of the game!',
        country: 'United States',
        birthday: '1990-05-15',
        phone: '+1 (555) 123-4567',
        preferences: {
          notifications: true,
          soundEffects: true,
          animations: true,
          theme: 'dark',
          language: 'en'
        },
        stats: {
          totalGamesPlayed: 247,
          totalWagered: 5420.75,
          totalWon: 4890.25,
          favoriteGame: 'Roulette',
          memberSince: '2024-01-15T10:30:00Z',
          lastLogin: new Date().toISOString()
        }
      };

      setProfile(mockProfile);
      setFormData({
        username: mockProfile.username,
        bio: mockProfile.bio || '',
        country: mockProfile.country || '',
        birthday: mockProfile.birthday || '',
        phone: mockProfile.phone || ''
      });
      setPreferences(mockProfile.preferences);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (profile) {
        setProfile({
          ...profile,
          ...formData,
          preferences,
          updated_at: new Date().toISOString()
        });
      }
      
      setEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/games');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? '👑' : '🎮';
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'admin' ? 'bg-yellow-600' : 'bg-blue-600';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-transparent rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/10 to-transparent rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            👤 My Profile
          </h1>
          <p className="text-xl text-gray-300">Manage your account and preferences</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading your profile...</p>
          </div>
        ) : profile ? (
          <div className="space-y-8">
            {/* Profile Header Card */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-4xl font-bold text-white">
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 px-2 py-1 rounded-full text-xs font-bold text-white ${getRoleBadgeColor(profile.role)}`}>
                    {getRoleIcon(profile.role)} {profile.role.toUpperCase()}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-white mb-2">{profile.username}</h2>
                  <p className="text-gray-300 mb-2">{profile.email}</p>
                  <p className="text-gray-400 text-sm mb-4">{profile.bio}</p>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <div className="bg-green-600 px-4 py-2 rounded-lg">
                      <div className="text-white font-bold text-lg">${profile.balance.toFixed(2)}</div>
                      <div className="text-green-200 text-sm">Current Balance</div>
                    </div>
                    <div className="bg-blue-600 px-4 py-2 rounded-lg">
                      <div className="text-white font-bold text-lg">{profile.stats.totalGamesPlayed}</div>
                      <div className="text-blue-200 text-sm">Games Played</div>
                    </div>
                    <div className="bg-purple-600 px-4 py-2 rounded-lg">
                      <div className="text-white font-bold text-lg">{profile.stats.favoriteGame}</div>
                      <div className="text-purple-200 text-sm">Favorite Game</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setEditing(!editing)}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    {editing ? '❌ Cancel' : '✏️ Edit Profile'}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex justify-center">
              <div className="bg-gray-800 rounded-2xl p-2 flex gap-2">
                {[
                  { key: 'overview', label: '📊 Overview', icon: '📊' },
                  { key: 'settings', label: '⚙️ Settings', icon: '⚙️' },
                  { key: 'security', label: '🔒 Security', icon: '🔒' }
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

            {/* Tab Content */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-6">📊 Account Overview</h3>
                  
                  {editing ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-gray-300 mb-2">Username</label>
                          <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 mb-2">Country</label>
                          <input
                            type="text"
                            value={formData.country}
                            onChange={(e) => setFormData({...formData, country: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 mb-2">Birthday</label>
                          <input
                            type="date"
                            value={formData.birthday}
                            onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 mb-2">Phone</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Bio</label>
                        <textarea
                          value={formData.bio}
                          onChange={(e) => setFormData({...formData, bio: e.target.value})}
                          rows={3}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={handleSaveProfile}
                          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                          💾 Save Changes
                        </button>
                        <button
                          onClick={() => setEditing(false)}
                          className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h4 className="text-xl font-semibold text-white mb-4">👤 Personal Information</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Email:</span>
                            <span className="text-white">{profile.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Country:</span>
                            <span className="text-white">{profile.country || 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Birthday:</span>
                            <span className="text-white">{profile.birthday ? formatDate(profile.birthday) : 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Phone:</span>
                            <span className="text-white">{profile.phone || 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Member Since:</span>
                            <span className="text-white">{formatDate(profile.stats.memberSince)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Last Login:</span>
                            <span className="text-white">{formatDateTime(profile.stats.lastLogin)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Gaming Statistics */}
                      <div className="space-y-4">
                        <h4 className="text-xl font-semibold text-white mb-4">🎮 Gaming Statistics</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-700 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-400">{profile.stats.totalGamesPlayed}</div>
                            <div className="text-gray-400 text-sm">Games Played</div>
                          </div>
                          <div className="bg-gray-700 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-400">${profile.stats.totalWagered.toFixed(2)}</div>
                            <div className="text-gray-400 text-sm">Total Wagered</div>
                          </div>
                          <div className="bg-gray-700 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-400">${profile.stats.totalWon.toFixed(2)}</div>
                            <div className="text-gray-400 text-sm">Total Won</div>
                          </div>
                          <div className="bg-gray-700 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-400">{profile.stats.favoriteGame}</div>
                            <div className="text-gray-400 text-sm">Favorite Game</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-6">⚙️ Preferences</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">🔔 Notifications</div>
                        <div className="text-gray-400 text-sm">Receive game and account notifications</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.notifications}
                          onChange={(e) => setPreferences({...preferences, notifications: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">🔊 Sound Effects</div>
                        <div className="text-gray-400 text-sm">Play sounds during games</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.soundEffects}
                          onChange={(e) => setPreferences({...preferences, soundEffects: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">✨ Animations</div>
                        <div className="text-gray-400 text-sm">Enable visual animations</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.animations}
                          onChange={(e) => setPreferences({...preferences, animations: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">🎨 Theme</div>
                        <div className="text-gray-400 text-sm">Choose your preferred theme</div>
                      </div>
                      <select
                        value={preferences.theme}
                        onChange={(e) => setPreferences({...preferences, theme: e.target.value as 'dark' | 'light'})}
                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="dark">🌙 Dark</option>
                        <option value="light">☀️ Light</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">🌍 Language</div>
                        <div className="text-gray-400 text-sm">Select your language</div>
                      </div>
                      <select
                        value={preferences.language}
                        onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="en">🇺🇸 English</option>
                        <option value="es">🇪🇸 Español</option>
                        <option value="fr">🇫🇷 Français</option>
                        <option value="de">🇩🇪 Deutsch</option>
                        <option value="zh">🇨🇳 中文</option>
                      </select>
                    </div>

                    <button
                      onClick={handleSaveProfile}
                      className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                    >
                      💾 Save Preferences
                    </button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-6">🔒 Security Settings</h3>
                  <div className="space-y-6">
                    <div className="bg-gray-700 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-white mb-4">🔑 Change Password</h4>
                      <div className="space-y-4">
                        <input
                          type="password"
                          placeholder="Current Password"
                          className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                          type="password"
                          placeholder="New Password"
                          className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                          type="password"
                          placeholder="Confirm New Password"
                          className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                        />
                        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                          🔄 Update Password
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-white mb-4">📱 Two-Factor Authentication</h4>
                      <p className="text-gray-300 mb-4">Add an extra layer of security to your account</p>
                      <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                        🔐 Enable 2FA
                      </button>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-white mb-4">📧 Email Verification</h4>
                      <div className="flex items-center gap-4">
                        <span className="text-green-400">✅ Verified</span>
                        <span className="text-gray-300">{profile.email}</span>
                      </div>
                    </div>

                    <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-red-400 mb-4">⚠️ Danger Zone</h4>
                      <p className="text-gray-300 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                      <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                        🗑️ Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-300">Failed to load profile data</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 text-center space-x-4">
          <button
            onClick={() => router.push('/games')}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            🎮 Back to Games
          </button>
          <button
            onClick={() => router.push('/history')}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            📊 View History
          </button>
        </div>
      </div>
    </div>
  );
}