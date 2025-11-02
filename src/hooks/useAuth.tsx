'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

const supabase = createClient();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;

    // Load user on mount
    getCurrentUser()
      .then((user) => {
        if (isSubscribed) {
          setUser(user);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('[AuthProvider] Error loading user:', error);
        if (isSubscribed) {
          setUser(null);
          setLoading(false);
        }
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log('[AuthProvider] Auth state changed:', event, session?.user?.email);

      // Only fetch user on sign in, not on every token refresh
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        try {
          const user = await getCurrentUser();
          if (isSubscribed) {
            setUser(user);
          }
        } catch (error) {
          console.error('[AuthProvider] Error fetching user:', error);
          if (isSubscribed) {
            setUser(null);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        if (isSubscribed) {
          setUser(null);
        }
      }

      if (isSubscribed) {
        setLoading(false);
      }
    });

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
