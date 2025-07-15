import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CustomerProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  lifetime_savings: number;
}

export interface Property {
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

export const useCustomerData = (email: string) => {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!email) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single();

        if (profileError) {
          throw new Error(`Profile not found: ${profileError.message}`);
        }

        setProfile(profileData);

        // Fetch properties with protest data
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
          .eq('user_id', profileData.user_id);

        if (propertiesError) {
          throw new Error(`Properties not found: ${propertiesError.message}`);
        }

        // Transform the data to match our Property interface
        const transformedProperties = (propertiesData || []).map(property => ({
          ...property,
          appeal_status: Array.isArray(property.protests) 
            ? property.protests[0] 
            : property.protests
        }));

        setProperties(transformedProperties);
      } catch (err) {
        console.error('Error fetching customer data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [email]);

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
        p.id === propertyId 
          ? { 
              ...p, 
              appeal_status: p.appeal_status ? {
                ...p.appeal_status,
                auto_appeal_enabled: newAutoAppealStatus
              } : undefined
            }
          : p
      ));
    } catch (err) {
      console.error('Error toggling auto-appeal:', err);
      throw err;
    }
  };

  return {
    profile,
    properties,
    loading,
    error,
    toggleAutoAppeal,
  };
};