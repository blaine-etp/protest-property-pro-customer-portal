
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAuthService } from '@/services/supabaseAuthService';

interface CustomerProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  lifetime_savings: number;
  is_authenticated: boolean;
}

interface Property {
  id: string;
  address: string;
  parcel_number?: string;
  estimated_savings?: number;
  appeal_status?: {
    appeal_status: string;
    exemption_status: string;
    auto_appeal_enabled: boolean;
    savings_amount: number;
  };
}

export const useAuthenticatedCustomerData = () => {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomerData();

    // Refetch on auth changes to prevent cross-account data bleed
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setTimeout(() => {
          fetchCustomerData();
        }, 0);
      }
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setProperties([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  const ensureProfileExists = async (userId: string, email: string | undefined | null) => {
    // Try to load existing profile
    const { data: existing, error: getError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!getError && existing) return existing as CustomerProfile;

    // Create a minimal profile if missing (allowed by RLS for the authenticated user)
    const fallbackFirst = (supabase.auth as any)?._state?.user?.user_metadata?.first_name
      || (email ? email.split('@')[0] : 'New');
    const fallbackLast = (supabase.auth as any)?._state?.user?.user_metadata?.last_name || 'User';

    const { data: created, error: insertError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        email: email ?? '',
        first_name: fallbackFirst || 'New',
        last_name: fallbackLast || 'User',
        is_authenticated: true,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create profile: ${insertError.message}`);
    }

    return created as CustomerProfile;
  };

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Real auth: read current session from Supabase
      console.log('🔍 Checking authentication (Supabase)...');
      const { data: { session } } = await supabaseAuthService.getSession();
      console.log('🔍 Session result:', session);

      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      // Ensure profile exists (create if missing)
      const ensuredProfile = await ensureProfileExists(session.user.id, session.user.email);
      setProfile(ensuredProfile);

      // Fetch properties scoped by user_id (RLS will additionally enforce this)
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          id,
          situs_address,
          parcel_number,
          estimated_savings,
          protests (
            appeal_status,
            exemption_status,
            savings_amount
          )
        `)
        .eq('user_id', session.user.id);

      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError);
        throw new Error(propertiesError.message);
      }

      const transformedProperties = (propertiesData || []).map((property: any) => ({
        id: property.id,
        address: property.situs_address,
        parcel_number: property.parcel_number,
        estimated_savings: property.estimated_savings,
        appeal_status: property.protests?.[0] ? {
          appeal_status: property.protests[0].appeal_status,
          exemption_status: property.protests[0].exemption_status,
          auto_appeal_enabled: false, // not stored yet; default locally
          savings_amount: property.protests[0].savings_amount
        } : undefined
      }));

      setProperties(transformedProperties);
    } catch (err: any) {
      console.error('Error fetching customer data:', err);
      setError(err.message || 'Failed to load data');
      setProfile(null);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoAppeal = async (propertyId: string) => {
    try {
      const property = properties.find(p => p.id === propertyId);
      if (!property?.appeal_status) return;

      const newAutoAppealStatus = !property.appeal_status.auto_appeal_enabled;
      console.log('Auto appeal toggle requested for property:', propertyId);

      // Local-only update for now
      setProperties(prev => prev.map(p =>
        p.id === propertyId && p.appeal_status
          ? {
              ...p,
              appeal_status: {
                ...p.appeal_status,
                auto_appeal_enabled: newAutoAppealStatus
              }
            }
          : p
      ));
    } catch (err: any) {
      console.error('Error toggling auto appeal:', err);
      throw err;
    }
  };

  return {
    profile,
    properties,
    loading,
    error,
    toggleAutoAppeal,
    refetch: fetchCustomerData
  };
};
