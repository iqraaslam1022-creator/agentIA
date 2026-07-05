import { supabase } from './supabaseClient';

/**
 * Replaces base44.auth.* calls.
 * Usage:
 *   import { auth } from '@/api/auth';
 *   await auth.signUp('ali@example.com', 'password123');
 *   await auth.login('ali@example.com', 'password123');
 *   await auth.logout();
 *   const user = await auth.getCurrentUser();
 */
export const auth = {
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata } // e.g. { full_name, phone } -> saved to auth metadata
    });
    if (error) throw error;
    return data;
  },

  async verifyOtp(email, token) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup'
    });
    if (error) throw error;
    return data;
  },

  async resendOtp(email) {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
    return true;
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async loginWithGoogle(redirectPath = '/') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${redirectPath}`
      }
    });
    if (error) throw error;
  },

  async sendPasswordReset(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
    return true;
  },

  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return true;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // fetch the matching profile row from public.users (role, agency_name, etc.)
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return { ...user, ...profile };
  },

  // fires a callback whenever auth state changes (login/logout)
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  }
};
