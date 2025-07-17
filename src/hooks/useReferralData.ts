import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  referral_credit_balance: number;
  referral_code: string;
  authentication_token?: string;
  token_expires_at?: string;
}

interface ReferralRelationship {
  id: string;
  referee_email: string;
  referee_first_name?: string;
  referee_last_name?: string;
  status: string;
  signup_date: string;
  completion_date?: string;
  credit_awarded_amount: number;
}

interface CreditTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  balance_after: number;
  description?: string;
  created_at: string;
}

export const useReferralData = (token?: string, email?: string) => {
  const [referrals, setReferrals] = useState<ReferralRelationship[]>([]);
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]);
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [referralCode, setReferralCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token || email) {
      fetchReferralData();
    }
  }, [token, email]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First get the user profile
      let profileData: Profile | null = null;
      
      if (token) {
        const { data, error } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('authentication_token', token)
          .gt('token_expires_at', new Date().toISOString())
          .single();
        
        if (error) throw new Error('Invalid token or user not found');
        profileData = data as Profile;
      } else if (email) {
        const { data, error } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single();
        
        if (error) throw new Error('Invalid email or user not found');
        profileData = data as Profile;
      } else {
        throw new Error('No token or email provided');
      }

      if (!profileData) {
        throw new Error('User not found');
      }

      setCreditBalance(profileData.referral_credit_balance || 0);
      setReferralCode(profileData.referral_code || '');

      // Fetch referral relationships where this user is the referrer
      const { data: referralData, error: referralError } = await (supabase as any)
        .from('referral_relationships')
        .select('*')
        .eq('referrer_id', profileData.user_id)
        .order('created_at', { ascending: false });

      if (referralError) {
        throw new Error(`Failed to fetch referrals: ${referralError.message}`);
      }

      setReferrals(referralData || []);

      // Fetch credit transactions
      const { data: transactionData, error: transactionError } = await (supabase as any)
        .from('credit_transactions')
        .select('*')
        .eq('user_id', profileData.user_id)
        .order('created_at', { ascending: false });

      if (transactionError) {
        throw new Error(`Failed to fetch transactions: ${transactionError.message}`);
      }

      setCreditTransactions(transactionData || []);
    } catch (err: any) {
      console.error('Error fetching referral data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendReferralInvite = async (friendEmail: string, friendName: string) => {
    try {
      // Get the current user profile
      let profileData: Profile | null = null;
      
      if (token) {
        const { data, error } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('authentication_token', token)
          .gt('token_expires_at', new Date().toISOString())
          .single();
        
        if (error) throw new Error('User not found');
        profileData = data as Profile;
      } else if (email) {
        const { data, error } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single();
        
        if (error) throw new Error('User not found');
        profileData = data as Profile;
      } else {
        throw new Error('No token or email provided');
      }

      if (!profileData) {
        throw new Error('User not found');
      }

      // Prevent self-referral by email
      if (friendEmail.toLowerCase() === profileData.email.toLowerCase()) {
        throw new Error('You cannot refer yourself');
      }

      // Check if this email has already been referred
      const { data: existingReferral } = await (supabase as any)
        .from('referral_relationships')
        .select('id')
        .eq('referee_email', friendEmail)
        .single();

      if (existingReferral) {
        throw new Error('This email has already been referred');
      }

      // Create referral relationship
      const { error: insertError } = await (supabase as any)
        .from('referral_relationships')
        .insert({
          referrer_id: profileData.user_id,
          referee_id: profileData.user_id, // Temporary, will be updated when they sign up
          referral_code: profileData.referral_code,
          referee_email: friendEmail,
          referee_first_name: friendName.split(' ')[0],
          referee_last_name: friendName.split(' ').slice(1).join(' '),
          status: 'pending'
        });

      if (insertError) {
        throw new Error(`Failed to create referral: ${insertError.message}`);
      }

      // Refresh data
      await fetchReferralData();
      
      return true;
    } catch (err: any) {
      console.error('Error sending referral invite:', err);
      throw err;
    }
  };

  return {
    referrals,
    creditTransactions,
    creditBalance,
    referralCode,
    loading,
    error,
    sendReferralInvite,
    refetch: fetchReferralData
  };
};