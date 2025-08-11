import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthResponse {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: any;
}

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  permissions?: string;
  is_authenticated?: boolean;
}

export class SupabaseAuthService {
  async signInWithPassword({ email, password }: { email: string; password: string }): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { data: { user: data.user, session: data.session }, error };
    } catch (error) {
      return { data: { user: null, session: null }, error };
    }
  }

  async signUp({ email, password }: { email: string; password: string }): Promise<AuthResponse> {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      return { data: { user: data.user, session: data.session }, error };
    } catch (error) {
      return { data: { user: null, session: null }, error };
    }
  }

  async resetPasswordForEmail(email: string, options?: { redirectTo?: string }): Promise<{ error: any }> {
    try {
      const redirectTo = options?.redirectTo ?? `${window.location.origin}/set-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      
      return { error };
    } catch (error) {
      return { error };
    }
  }

  async signInWithMagicLink(email: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      return { error };
    } catch (error) {
      return { error };
    }
  }

  async getSession(): Promise<{ data: { session: Session | null }; error: any }> {
    try {
      const { data, error } = await supabase.auth.getSession();
      return { data: { session: data.session }, error };
    } catch (error) {
      return { data: { session: null }, error };
    }
  }

  async signOut(): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      return { error };
    } catch (error) {
      return { error };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async getProfile(userId: string): Promise<{ data: Profile | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        callback(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }

  onAuthStateChangeOriginal(callback: (event: string, session: Session | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return () => subscription.unsubscribe();
  }
}

export const supabaseAuthService = new SupabaseAuthService();