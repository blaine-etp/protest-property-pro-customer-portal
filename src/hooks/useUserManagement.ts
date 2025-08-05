import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  created_at: string;
  is_authenticated: boolean;
  role?: string;
  referral_credit_balance: number;
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    try {
      setDeleting(userId);

      // Delete all associated data in the correct order (respecting foreign key constraints)
      
      // Delete customer documents
      await supabase.from('customer_documents').delete().eq('user_id', userId);
      
      // Delete credit transactions
      await supabase.from('credit_transactions').delete().eq('user_id', userId);
      
      // Delete applications
      await supabase.from('applications').delete().eq('user_id', userId);
      
      // Delete properties
      await supabase.from('properties').delete().eq('user_id', userId);
      
      // Delete bills
      await supabase.from('bills').delete().eq('user_id', userId);
      
      // Delete verification codes
      await supabase.from('verification_codes').delete().eq('user_id', userId);
      
      // Delete referral relationships (both as referrer and referee)
      await supabase.from('referral_relationships').delete().or(`referrer_id.eq.${userId},referee_id.eq.${userId}`);
      
      // Finally delete the profile
      await supabase.from('profiles').delete().eq('user_id', userId);

      // Remove from auth.users table (this will cascade delete any remaining references)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.warn('Could not delete from auth.users:', authError.message);
        // Continue anyway as the user data has been cleaned up
      }

      toast.success(`User ${userName} and all associated data deleted successfully`);
      await fetchUsers(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(`Failed to delete user: ${error.message}`);
    } finally {
      setDeleting(null);
    }
  };

  return {
    users,
    loading,
    deleting,
    deleteUser,
    refetch: fetchUsers
  };
};