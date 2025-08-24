import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { dbHelpers, Database } from '@/services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = Database['public']['Tables']['users']['Row'];

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook<AuthStore>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from storage on app start
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = useCallback(async (email: string, name: string) => {
    try {
      setIsLoading(true);
      
      // Check if user exists
      let userData = await dbHelpers.getUserByEmail(email);
      
      if (!userData) {
        // Create new user
        userData = await dbHelpers.createUser({
          email,
          name,
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`
        });
      }

      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error signing in:', error);
      // Provide more specific error messages
      if (error instanceof Error) {
        throw new Error(`Sign in failed: ${error.message}`);
      } else {
        throw new Error('Sign in failed: Unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = await dbHelpers.getUserById(user.id);
      if (updatedUser) {
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }, [user]);

  return useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signOut,
    updateProfile
  }), [user, isLoading, signIn, signOut, updateProfile]);
});