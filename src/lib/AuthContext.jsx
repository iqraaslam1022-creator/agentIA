import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { auth } from '@/api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  // Kept for compatibility with App.jsx — Supabase doesn't need a separate
  // "public settings" fetch like Base44 did, so this resolves immediately.
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    checkUserAuth();

    // Listen for login/logout events anywhere in the app
    const { data: listener } = auth.onAuthStateChange(async (authUser) => {
      if (authUser) {
        await loadFullUser(authUser.id);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const loadFullUser = async (userId) => {
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      // Auth account exists but no profile row — treat like Base44's
      // "user_not_registered" case
      setAuthError({
        type: 'user_not_registered',
        message: 'User not registered for this app'
      });
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    setUser(profile);
    setIsAuthenticated(true);
    setAuthError(null);
  };

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const currentUser = await auth.getCurrentUser();

      if (currentUser) {
        await loadFullUser(currentUser.id);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      setAuthError({
        type: 'auth_required',
        message: 'Authentication required'
      });
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const logout = async (shouldRedirect = true) => {
    await auth.logout();
    setUser(null);
    setIsAuthenticated(false);

    if (shouldRedirect) {
      window.location.href = '/login';
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
