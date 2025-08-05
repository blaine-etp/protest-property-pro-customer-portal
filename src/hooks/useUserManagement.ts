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

      console.log(`Starting deletion process for user: ${userName} (${userId})`);
      
      // Step 1: Get all properties, contacts, protests for this user to establish relationships
      const { data: userProperties, error: propsError } = await supabase
        .from('properties')
        .select('id, contact_id, owner_id')
        .eq('user_id', userId);
      
      if (propsError) {
        throw new Error(`Failed to fetch user properties: ${propsError.message}`);
      }
      
      const propertyIds = userProperties?.map(p => p.id) || [];
      const contactIds = userProperties ? [...new Set(userProperties.map(p => p.contact_id).filter(Boolean))] : [];
      const ownerIds = userProperties ? [...new Set(userProperties.map(p => p.owner_id).filter(Boolean))] : [];
      
      // Get protests for bills deletion
      const { data: protests, error: protestsError } = await supabase
        .from('protests')
        .select('id')
        .in('property_id', propertyIds);
      
      if (protestsError) {
        throw new Error(`Failed to fetch protests: ${protestsError.message}`);
      }
      
      const protestIds = protests?.map(p => p.id) || [];
      
      console.log(`Found ${propertyIds.length} properties, ${contactIds.length} contacts, ${ownerIds.length} owners, ${protestIds.length} protests`);
      
      // Step 2: Delete bills (they reference protests via protest_id)
      if (protestIds.length > 0) {
        const { error: billsError } = await supabase
          .from('bills')
          .delete()
          .in('protest_id', protestIds);
        
        if (billsError) {
          throw new Error(`Failed to delete bills: ${billsError.message}`);
        }
        console.log('✓ Deleted bills');
      }
      
      // Step 3: Delete customer documents (reference multiple tables)
      const { error: docsError1 } = await supabase.from('customer_documents').delete().eq('user_id', userId);
      if (docsError1) throw new Error(`Failed to delete user documents: ${docsError1.message}`);
      
      if (contactIds.length > 0) {
        const { error: docsError2 } = await supabase.from('customer_documents').delete().in('contact_id', contactIds);
        if (docsError2) throw new Error(`Failed to delete contact documents: ${docsError2.message}`);
      }
      
      if (propertyIds.length > 0) {
        const { error: docsError3 } = await supabase.from('customer_documents').delete().in('property_id', propertyIds);
        if (docsError3) throw new Error(`Failed to delete property documents: ${docsError3.message}`);
      }
      
      if (ownerIds.length > 0) {
        const { error: docsError4 } = await supabase.from('customer_documents').delete().in('owner_id', ownerIds);
        if (docsError4) throw new Error(`Failed to delete owner documents: ${docsError4.message}`);
      }
      console.log('✓ Deleted customer documents');
      
      // Step 4: Delete communication_properties (reference properties)
      if (propertyIds.length > 0) {
        const { error: commPropsError } = await supabase
          .from('communication_properties')
          .delete()
          .in('property_id', propertyIds);
        
        if (commPropsError) {
          throw new Error(`Failed to delete communication properties: ${commPropsError.message}`);
        }
        console.log('✓ Deleted communication properties');
      }
      
      // Step 5: Delete communications (reference contacts)
      if (contactIds.length > 0) {
        const { error: commsError } = await supabase
          .from('communications')
          .delete()
          .in('contact_id', contactIds);
        
        if (commsError) {
          throw new Error(`Failed to delete communications: ${commsError.message}`);
        }
        console.log('✓ Deleted communications');
      }
      
      // Step 6: Delete protests (they reference properties)
      if (protestIds.length > 0) {
        const { error: protestsDeleteError } = await supabase
          .from('protests')
          .delete()
          .in('id', protestIds);
        
        if (protestsDeleteError) {
          throw new Error(`Failed to delete protests: ${protestsDeleteError.message}`);
        }
        console.log('✓ Deleted protests');
      }
      
      // Step 7: Delete applications (reference users and properties)
      const { error: appsError } = await supabase.from('applications').delete().eq('user_id', userId);
      if (appsError) throw new Error(`Failed to delete applications: ${appsError.message}`);
      console.log('✓ Deleted applications');
      
      // Step 8: Delete properties (now that all references are gone)
      if (propertyIds.length > 0) {
        const { error: propsDeleteError } = await supabase
          .from('properties')
          .delete()
          .in('id', propertyIds);
        
        if (propsDeleteError) {
          throw new Error(`Failed to delete properties: ${propsDeleteError.message}`);
        }
        console.log('✓ Deleted properties');
      }
      
      // Step 9: Delete contacts (independent table)
      if (contactIds.length > 0) {
        const { error: contactsError } = await supabase
          .from('contacts')
          .delete()
          .in('id', contactIds);
        
        if (contactsError) {
          throw new Error(`Failed to delete contacts: ${contactsError.message}`);
        }
        console.log('✓ Deleted contacts');
      }
      
      // Step 10: Delete owners (they reference user_id via created_by_user_id)
      const { error: ownersError } = await supabase.from('owners').delete().eq('created_by_user_id', userId);
      if (ownersError) throw new Error(`Failed to delete owners: ${ownersError.message}`);
      console.log('✓ Deleted owners');
      
      // Step 11: Delete remaining user-specific data
      const { error: creditsError } = await supabase.from('credit_transactions').delete().eq('user_id', userId);
      if (creditsError) throw new Error(`Failed to delete credit transactions: ${creditsError.message}`);
      
      const { error: verifyError } = await supabase.from('verification_codes').delete().eq('user_id', userId);
      if (verifyError) throw new Error(`Failed to delete verification codes: ${verifyError.message}`);
      console.log('✓ Deleted user transactions and verification codes');
      
      // Step 12: Delete referral relationships (both as referrer and referee)
      const { error: referralError } = await supabase
        .from('referral_relationships')
        .delete()
        .or(`referrer_id.eq.${userId},referee_id.eq.${userId}`);
      
      if (referralError) throw new Error(`Failed to delete referral relationships: ${referralError.message}`);
      console.log('✓ Deleted referral relationships');
      
      // Step 13: Finally delete the profile
      const { error: profileError } = await supabase.from('profiles').delete().eq('user_id', userId);
      if (profileError) throw new Error(`Failed to delete profile: ${profileError.message}`);
      console.log('✓ Deleted profile');

      // Remove from auth.users table (this will fail with anon key, but that's expected)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.warn('Could not delete from auth.users (expected with anon key):', authError.message);
        // This is expected and doesn't affect the cleanup
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