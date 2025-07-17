import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  }, []);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      // Fetch the profile for the authenticated user
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (profileError || !profileData) {
        throw new Error('Profile not found');
      }

      setProfile(profileData);

      // Fetch properties for this user
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          *,
          protests (
            appeal_status,
            exemption_status,
            auto_appeal_enabled,
            savings_amount
          )
        `)
        .eq('user_id', session.user.id);

      if (propertiesError) {
        throw new Error(`Failed to fetch properties: ${propertiesError.message}`);
      }

      // Transform the data to match the expected structure
      const transformedProperties = propertiesData?.map(property => ({
        ...property,
        appeal_status: property.protests?.[0] || null
      })) || [];

      setProperties(transformedProperties);
    } catch (err: any) {
      console.error('Error fetching customer data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoAppeal = async (propertyId: string) => {
    try {
      const property = properties.find(p => p.id === propertyId);
      if (!property?.appeal_status) return;

      const newAutoAppealStatus = !property.appeal_status.auto_appeal_enabled;

      const { error } = await supabase
        .from('protests')
        .update({ auto_appeal_enabled: newAutoAppealStatus })
        .eq('property_id', propertyId);

      if (error) {
        throw new Error(`Failed to update auto-appeal: ${error.message}`);
      }

      // Update local state
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