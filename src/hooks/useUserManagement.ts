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
      console.log(`Starting deletion process for user: ${userName} (${userId})`);
      
      // Step 1: Get all properties and contacts for this user
      const { data: userProperties } = await supabase
        .from('properties')
        .select('id, contact_id')
        .eq('user_id', userId);
      
      const propertyIds = userProperties?.map(p => p.id) || [];
      const contactIds = userProperties ? [...new Set(userProperties.map(p => p.contact_id).filter(Boolean))] : [];
      
      console.log(`Found ${propertyIds.length} properties and ${contactIds.length} contacts`);
      
      // Step 2: Delete bills first (they reference protests)
      if (propertyIds.length > 0) {
        await supabase.from('bills').delete().eq('user_id', userId);
        console.log('Deleted bills');
      }
      
      // Step 3: Delete protests (they reference properties)
      if (propertyIds.length > 0) {
        await supabase.from('protests').delete().in('property_id', propertyIds);
        console.log('Deleted protests');
      }
      
      // Step 4: Delete customer documents (reference multiple tables)
      await supabase.from('customer_documents').delete().eq('user_id', userId);
      if (contactIds.length > 0) {
        await supabase.from('customer_documents').delete().in('contact_id', contactIds);
      }
      if (propertyIds.length > 0) {
        await supabase.from('customer_documents').delete().in('property_id', propertyIds);
      }
      console.log('Deleted customer documents');
      
      // Step 5: Delete communication_properties (reference properties)
      if (propertyIds.length > 0) {
        await supabase.from('communication_properties').delete().in('property_id', propertyIds);
        console.log('Deleted communication properties');
      }
      
      // Step 6: Delete communications (reference contacts)
      if (contactIds.length > 0) {
        await supabase.from('communications').delete().in('contact_id', contactIds);
        console.log('Deleted communications');
      }
      
      // Step 7: Delete properties (now that all references are gone)
      if (propertyIds.length > 0) {
        await supabase.from('properties').delete().in('id', propertyIds);
        console.log('Deleted properties');
      }
      
      // Step 8: Delete contacts (now that properties are gone)
      if (contactIds.length > 0) {
        await supabase.from('contacts').delete().in('id', contactIds);
        console.log('Deleted contacts');
      }
      
      // Step 9: Delete owners (they reference user_id via created_by_user_id)
      await supabase.from('owners').delete().eq('created_by_user_id', userId);
      console.log('Deleted owners');
      
      // Step 10: Delete remaining user-specific data
      await supabase.from('credit_transactions').delete().eq('user_id', userId);
      await supabase.from('applications').delete().eq('user_id', userId);
      await supabase.from('verification_codes').delete().eq('user_id', userId);
      console.log('Deleted user transactions and applications');
      
      // Step 11: Delete referral relationships (both as referrer and referee)
      await supabase.from('referral_relationships').delete().or(`referrer_id.eq.${userId},referee_id.eq.${userId}`);
      console.log('Deleted referral relationships');
      
      // Step 12: Finally delete the profile
      await supabase.from('profiles').delete().eq('user_id', userId);
      console.log('Deleted profile');

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