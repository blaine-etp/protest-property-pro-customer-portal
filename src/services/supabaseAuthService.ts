import { supabase } from '@/integrations/supabase/client';
import { Session, User, AuthError } from '@supabase/supabase-js';

export interface AuthProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role?: string;
  is_trust_entity?: boolean;
  agree_to_updates?: boolean;
  permissions?: string;
  is_authenticated?: boolean;
  referral_credit_balance?: number;
  lifetime_savings?: number;
}

class SupabaseAuthService {
  // Sign in with email and password
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        return { user: null, session: null, error };
      }
      
      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('Auth service error:', error);
      return { user: null, session: null, error: error as AuthError };
    }
  }

  // Reset password
  async resetPasswordForEmail(email: string, options?: { redirectTo?: string }) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: options?.redirectTo || `${window.location.origin}/reset-password`
      });
      
      return { error };
    } catch (error) {
      console.error('Password reset error:', error);
      return { error: error as AuthError };
    }
  }

  // Get current session
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Get session error:', error);
        return { session: null, error };
      }
      
      return { session: data.session, error: null };
    } catch (error) {
      console.error('Auth service error:', error);
      return { session: null, error: error as AuthError };
    }
  }

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Auth service error:', error);
      return { error: error as AuthError };
    }
  }

  // Get current user
  async getCurrentUser(): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Get user error:', error);
        return { user: null, error };
      }
      
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Auth service error:', error);
      return { user: null, error: error as AuthError };
    }
  }

  // Auth state change listener
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    
    return subscription;
  }

  // Get user profile from profiles table
  async getProfile(userId: string): Promise<{ profile: AuthProfile | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Get profile error:', error);
        return { profile: null, error };
      }
      
      return { profile: data, error: null };
    } catch (error) {
      console.error('Profile service error:', error);
      return { profile: null, error };
    }
  }
}

export const supabaseAuthService = new SupabaseAuthService();
export { SupabaseAuthService };