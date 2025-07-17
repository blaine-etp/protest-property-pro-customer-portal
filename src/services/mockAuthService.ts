// Mock Authentication Service
// Replaces all Supabase auth operations with localStorage-based simulation

interface MockUser {
  id: string;
  email: string;
  permissions?: string;
}

interface MockSession {
  user: MockUser;
  access_token: string;
  refresh_token: string;
}

interface MockProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  permissions: string;
  is_authenticated: boolean;
  lifetime_savings: number;
}

class MockAuthService {
  private readonly MOCK_USERS_KEY = 'mock_auth_users';
  private readonly MOCK_SESSION_KEY = 'mock_auth_session';
  private readonly MOCK_PROFILES_KEY = 'mock_auth_profiles';

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    console.log('🔍 Initializing mock data...');
    
    // Initialize with some default users if none exist
    const existingUsers = this.getMockUsers();
    console.log('🔍 Existing users:', existingUsers);
    
    if (existingUsers.length === 0) {
      console.log('🔍 Creating default users and profiles...');
      const defaultUsers: MockUser[] = [
        { id: 'admin-1', email: 'admin@example.com', permissions: 'administrator' },
        { id: 'customer-1', email: 'customer@example.com', permissions: 'customer' },
        { id: 'test-user-1', email: 'test@example.com', permissions: 'customer' }
      ];
      
      const defaultProfiles: MockProfile[] = [
        {
          id: 'profile-admin-1',
          user_id: 'admin-1',
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@example.com',
          permissions: 'administrator',
          is_authenticated: true,
          lifetime_savings: 0
        },
        {
          id: 'profile-customer-1', 
          user_id: 'customer-1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'customer@example.com',
          permissions: 'customer',
          is_authenticated: true,
          lifetime_savings: 2500
        },
        {
          id: 'profile-test-1',
          user_id: 'test-user-1',
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          permissions: 'customer',
          is_authenticated: true,
          lifetime_savings: 1200
        }
      ];
      
      localStorage.setItem(this.MOCK_USERS_KEY, JSON.stringify(defaultUsers));
      localStorage.setItem(this.MOCK_PROFILES_KEY, JSON.stringify(defaultProfiles));
      
      // Create a default session for the customer user for demo purposes
      const defaultSession: MockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: defaultUsers[1] // customer user
      };
      console.log('🔍 Creating default session:', defaultSession);
      this.setMockSession(defaultSession);
    }
    
    // Always ensure there's a session for demo purposes
    const currentSession = localStorage.getItem(this.MOCK_SESSION_KEY);
    console.log('🔍 Current session in localStorage:', currentSession);
    
    if (!currentSession) {
      console.log('🔍 No session found, creating one...');
      const users = this.getMockUsers();
      if (users.length > 0) {
        const customerUser = users.find(u => u.permissions === 'customer') || users[0];
        const demoSession: MockSession = {
          access_token: 'demo-access-token',
          refresh_token: 'demo-refresh-token',
          user: customerUser
        };
        console.log('🔍 Creating demo session:', demoSession);
        this.setMockSession(demoSession);
      }
    }
  }

  private getMockUsers(): MockUser[] {
    const users = localStorage.getItem(this.MOCK_USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  private getMockProfiles(): MockProfile[] {
    const profiles = localStorage.getItem(this.MOCK_PROFILES_KEY);
    return profiles ? JSON.parse(profiles) : [];
  }

  private setMockSession(session: MockSession | null) {
    if (session) {
      localStorage.setItem(this.MOCK_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(this.MOCK_SESSION_KEY);
    }
  }

  // Simulate supabase.auth.signInWithPassword
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = this.getMockUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return {
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' }
      };
    }

    // For mock purposes, any password works (except empty)
    if (!password) {
      return {
        data: { user: null, session: null },
        error: { message: 'Password is required' }
      };
    }

    const session: MockSession = {
      user,
      access_token: `mock_token_${Date.now()}`,
      refresh_token: `mock_refresh_${Date.now()}`
    };

    this.setMockSession(session);

    return {
      data: { user, session },
      error: null
    };
  }

  // Simulate supabase.auth.resetPasswordForEmail
  async resetPasswordForEmail(email: string, options?: { redirectTo?: string }) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = this.getMockUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return {
        error: { message: 'User not found' }
      };
    }

    // In real implementation, this would send an email
    console.log(`Mock: Password reset email sent to ${email}`);
    console.log(`Mock: Redirect URL would be ${options?.redirectTo}`);

    return { error: null };
  }

  // Simulate supabase.auth.getSession
  async getSession() {
    console.log('🔍 MockAuthService.getSession called');
    const sessionData = localStorage.getItem(this.MOCK_SESSION_KEY);
    console.log('🔍 Session data from localStorage:', sessionData);
    const session = sessionData ? JSON.parse(sessionData) : null;
    console.log('🔍 Parsed session:', session);

    return {
      data: { session },
      error: null
    };
  }

  // Simulate supabase.auth.signOut
  async signOut() {
    this.setMockSession(null);
    return { error: null };
  }

  // Simulate supabase.auth.onAuthStateChange (original Supabase format)
  onAuthStateChangeOriginal(callback: (event: string, session: MockSession | null) => void) {
    // Initial state check
    const currentSession = this.getCurrentSession();
    if (currentSession) {
      setTimeout(() => callback('SIGNED_IN', currentSession), 0);
    } else {
      setTimeout(() => callback('SIGNED_OUT', null), 0);
    }

    // Return subscription object
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            // Mock unsubscribe
            console.log('Mock auth state subscription unsubscribed');
          }
        }
      }
    };
  }

  private getCurrentSession(): MockSession | null {
    const sessionData = localStorage.getItem(this.MOCK_SESSION_KEY);
    return sessionData ? JSON.parse(sessionData) : null;
  }

  // Get current user (compatible with Supabase User type)
  async getCurrentUser() {
    const session = this.getCurrentSession();
    if (!session) return null;
    
    // Convert MockUser to Supabase User format
    return {
      id: session.user.id,
      email: session.user.email,
      user_metadata: {},
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      role: 'authenticated',
      email_confirmed_at: new Date().toISOString(),
    };
  }

  // Auth state change handler compatible with component usage
  onAuthStateChange(callback: (user: any) => void): () => void {
    // Initial state check
    setTimeout(async () => {
      const user = await this.getCurrentUser();
      callback(user);
    }, 0);

    // Return unsubscribe function
    return () => {
      console.log('Mock auth state subscription unsubscribed');
    };
  }

  // Mock method to get profile data (replaces Supabase database queries)
  async getProfile(userId: string): Promise<{ data: MockProfile | null; error: any }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const profiles = this.getMockProfiles();
    const profile = profiles.find(p => p.user_id === userId);
    
    if (!profile) {
      return {
        data: null,
        error: { message: 'Profile not found' }
      };
    }

    return {
      data: profile,
      error: null
    };
  }

  // Method to create a new user (for testing)
  createMockUser(email: string, permissions: string = 'customer') {
    const users = this.getMockUsers();
    const profiles = this.getMockProfiles();
    
    const newUser: MockUser = {
      id: `user-${Date.now()}`,
      email,
      permissions
    };

    const newProfile: MockProfile = {
      id: `profile-${Date.now()}`,
      user_id: newUser.id,
      first_name: email.split('@')[0],
      last_name: 'User',
      email,
      permissions,
      is_authenticated: true,
      lifetime_savings: 0
    };

    users.push(newUser);
    profiles.push(newProfile);

    localStorage.setItem(this.MOCK_USERS_KEY, JSON.stringify(users));
    localStorage.setItem(this.MOCK_PROFILES_KEY, JSON.stringify(profiles));

    return newUser;
  }
}

// Export singleton instance
export const mockAuthService = new MockAuthService();

// Export types for use in other files
export type { MockUser, MockSession, MockProfile };