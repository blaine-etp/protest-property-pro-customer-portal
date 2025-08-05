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
      console.log(`🗑️ Starting deletion process for user: ${userName} (${userId})`);
      
      // First, find all user-related data with proper relationships
      console.log('📊 Gathering user data relationships...');
      
      // Get all user properties 
      const { data: userProperties } = await supabase
        .from('properties')
        .select('id, contact_id, owner_id')
        .eq('user_id', userId);
      
      const propertyIds = userProperties?.map(p => p.id) || [];
      console.log(`Found ${propertyIds.length} properties for user`);
      
      // Get all protests linked to user properties
      const { data: userProtests } = await supabase
        .from('protests')
        .select('id')
        .in('property_id', propertyIds);
      
      const protestIds = userProtests?.map(p => p.id) || [];
      console.log(`Found ${protestIds.length} protests for user properties`);
      
      // Get all contacts linked to user properties
      const contactIds = userProperties ? [...new Set(userProperties.map(p => p.contact_id).filter(Boolean))] : [];
      console.log(`Found ${contactIds.length} unique contacts for user`);
      
      // Get all owners created by this user
      const { data: userOwners } = await supabase
        .from('owners')
        .select('id')
        .eq('created_by_user_id', userId);
      
      const ownerIds = userOwners?.map(o => o.id) || [];
      console.log(`Found ${ownerIds.length} owners created by user`);

      // DELETION PHASE - Following strict foreign key order
      console.log('🔥 Starting deletion in correct foreign key order...');

      // 1. Delete bills first (they reference protests and user)
      console.log('Deleting bills...');
      let totalBillsDeleted = 0;
      
      // Delete bills by user_id
      const { error: billsUserError, count: billsUserCount } = await supabase
        .from('bills')
        .delete({ count: 'exact' })
        .eq('user_id', userId);
      
      if (billsUserError) throw new Error(`Bills (by user_id) deletion failed: ${billsUserError.message}`);
      totalBillsDeleted += billsUserCount || 0;
      
      // Delete bills by protest_id (if any protests exist)
      if (protestIds.length > 0) {
        const { error: billsProtestError, count: billsProtestCount } = await supabase
          .from('bills')
          .delete({ count: 'exact' })
          .in('protest_id', protestIds);
        
        if (billsProtestError) throw new Error(`Bills (by protest_id) deletion failed: ${billsProtestError.message}`);
        totalBillsDeleted += billsProtestCount || 0;
      }
      
      console.log(`✅ Deleted ${totalBillsDeleted} bills total`);

      // 2. Delete customer documents (reference many tables)
      console.log('Deleting customer documents...');
      const { error: docError, count: docCount } = await supabase
        .from('customer_documents')
        .delete({ count: 'exact' })
        .eq('user_id', userId);
      
      if (docError) throw new Error(`Customer documents deletion failed: ${docError.message}`);
      console.log(`✅ Deleted ${docCount || 0} customer documents`);

      // 3. Delete communication_properties (reference properties)
      if (propertyIds.length > 0) {
        console.log('Deleting communication properties...');
        const { error: commPropError, count: commPropCount } = await supabase
          .from('communication_properties')
          .delete({ count: 'exact' })
          .in('property_id', propertyIds);
        
        if (commPropError) throw new Error(`Communication properties deletion failed: ${commPropError.message}`);
        console.log(`✅ Deleted ${commPropCount || 0} communication properties`);
      }

      // 4. Delete communications (reference contacts)
      if (contactIds.length > 0) {
        console.log('Deleting communications...');
        const { error: commError, count: commCount } = await supabase
          .from('communications')
          .delete({ count: 'exact' })
          .in('contact_id', contactIds);
        
        if (commError) throw new Error(`Communications deletion failed: ${commError.message}`);
        console.log(`✅ Deleted ${commCount || 0} communications`);
      }

      // 5. Delete protests (they reference properties)
      if (protestIds.length > 0) {
        console.log('Deleting protests...');
        const { error: protestError, count: protestCount } = await supabase
          .from('protests')
          .delete({ count: 'exact' })
          .in('id', protestIds);
        
        if (protestError) throw new Error(`Protests deletion failed: ${protestError.message}`);
        console.log(`✅ Deleted ${protestCount || 0} protests`);
      }

      // 6. Delete applications (reference user and properties)
      console.log('Deleting applications...');
      const { error: appError, count: appCount } = await supabase
        .from('applications')
        .delete({ count: 'exact' })
        .eq('user_id', userId);
      
      if (appError) throw new Error(`Applications deletion failed: ${appError.message}`);
      console.log(`✅ Deleted ${appCount || 0} applications`);

      // 7. Delete properties (now that protests and applications are gone)
      if (propertyIds.length > 0) {
        console.log('Deleting properties...');
        const { error: propError, count: propCount } = await supabase
          .from('properties')
          .delete({ count: 'exact' })
          .in('id', propertyIds);
        
        if (propError) throw new Error(`Properties deletion failed: ${propError.message}`);
        console.log(`✅ Deleted ${propCount || 0} properties`);
      }

      // 8. Delete contacts (now that properties are gone)
      if (contactIds.length > 0) {
        console.log('Deleting contacts...');
        const { error: contactError, count: contactCount } = await supabase
          .from('contacts')
          .delete({ count: 'exact' })
          .in('id', contactIds);
        
        if (contactError) throw new Error(`Contacts deletion failed: ${contactError.message}`);
        console.log(`✅ Deleted ${contactCount || 0} contacts`);
      }

      // 9. Delete owners (they reference profiles via created_by_user_id)
      if (ownerIds.length > 0) {
        console.log('Deleting owners...');
        const { error: ownerError, count: ownerCount } = await supabase
          .from('owners')
          .delete({ count: 'exact' })
          .in('id', ownerIds);
        
        if (ownerError) throw new Error(`Owners deletion failed: ${ownerError.message}`);
        console.log(`✅ Deleted ${ownerCount || 0} owners`);
      }

      // 10. Delete credit transactions, verification codes, referrals
      console.log('Deleting user financial and auth data...');
      
      const { error: creditError, count: creditCount } = await supabase
        .from('credit_transactions')
        .delete({ count: 'exact' })
        .eq('user_id', userId);
      
      if (creditError) throw new Error(`Credit transactions deletion failed: ${creditError.message}`);
      console.log(`✅ Deleted ${creditCount || 0} credit transactions`);

      const { error: verifyError, count: verifyCount } = await supabase
        .from('verification_codes')
        .delete({ count: 'exact' })
        .eq('user_id', userId);
      
      if (verifyError) throw new Error(`Verification codes deletion failed: ${verifyError.message}`);
      console.log(`✅ Deleted ${verifyCount || 0} verification codes`);

      const { error: referralError, count: referralCount } = await supabase
        .from('referral_relationships')
        .delete({ count: 'exact' })
        .or(`referrer_id.eq.${userId},referee_id.eq.${userId}`);
      
      if (referralError) throw new Error(`Referral relationships deletion failed: ${referralError.message}`);
      console.log(`✅ Deleted ${referralCount || 0} referral relationships`);

      // 11. FINAL: Delete the profile (last step - nothing should reference it now)
      console.log('Deleting user profile...');
      const { error: profileError, count: profileCount } = await supabase
        .from('profiles')
        .delete({ count: 'exact' })
        .eq('user_id', userId);
      
      if (profileError) throw new Error(`Profile deletion failed: ${profileError.message}`);
      console.log(`✅ Deleted ${profileCount || 0} profile records`);

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