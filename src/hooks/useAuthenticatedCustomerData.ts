import { useState, useEffect } from 'react';
import { mockAuthService } from '@/services/mockAuthService';
import { mockFormService } from '@/services/mockFormService';
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
      console.log('🔍 Checking authentication...');
      const { data: { session } } = await mockAuthService.getSession();
      console.log('🔍 Session result:', session);
      if (!session?.user) {
        console.log('🔍 No session or user found, session:', session);
        throw new Error('User not authenticated');
      }
      console.log('🔍 User authenticated:', session.user);

      // Fetch the profile for the authenticated user
      const { data: profileData, error: profileError } = await mockAuthService.getProfile(session.user.id);

      if (profileError || !profileData) {
        throw new Error('Profile not found');
      }

      setProfile(profileData);

      // Fetch properties for this user from Supabase
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
      }

      // Transform the data to match expected format
      const transformedProperties = (propertiesData || []).map((property: any) => ({
        id: property.id,
        address: property.situs_address,
        parcel_number: property.parcel_number,
        estimated_savings: property.estimated_savings,
        appeal_status: property.protests?.[0] ? {
          appeal_status: property.protests[0].appeal_status,
          exemption_status: property.protests[0].exemption_status,
          auto_appeal_enabled: false, // Default value since it's not stored in protests table
          savings_amount: property.protests[0].savings_amount
        } : undefined
      }));

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

      // Since auto_appeal_enabled is not currently stored in the database,
      // we'll just update the local state for now
      console.log('Auto appeal toggle requested for property:', propertyId);
      
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