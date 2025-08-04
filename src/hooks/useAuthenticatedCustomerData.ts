import { useState, useEffect } from 'react';
import { authService } from '@/services';
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
      const sessionResult = await authService.getSession();
      
      // Handle different return types from mock vs supabase auth services
      const session = 'session' in sessionResult ? sessionResult.session : sessionResult.data?.session;
      
      console.log('🔍 Session result:', session);
      if (!session?.user) {
        console.log('🔍 No session or user found, session:', session);
        throw new Error('User not authenticated');
      }
      console.log('🔍 User authenticated:', session.user);

      // Fetch the profile for the authenticated user
      const { data: profileData, error: profileError } = await authService.getProfile(session.user.id);

      if (profileError || !profileData) {
        throw new Error('Profile not found');
      }

      // Transform profile data to match CustomerProfile interface
      const customerProfile: CustomerProfile = {
        id: profileData.user_id, // Use user_id as the id field
        user_id: profileData.user_id,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        email: profileData.email,
        phone: profileData.phone,
        lifetime_savings: profileData.lifetime_savings || 0,
        is_authenticated: profileData.is_authenticated || true
      };

      setProfile(customerProfile);

      // Fetch properties for this user from Supabase
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          id,
          situs_address,
          parcel_number,
          estimated_savings,
          auto_appeal_enabled,
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
          auto_appeal_enabled: property.auto_appeal_enabled, // Use the database field
          savings_amount: property.protests[0].savings_amount
        } : {
          appeal_status: 'pending',
          exemption_status: 'pending',
          auto_appeal_enabled: property.auto_appeal_enabled, // Use the database field
          savings_amount: 0
        }
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

      console.log('Auto appeal toggle requested for property:', propertyId, 'new status:', newAutoAppealStatus);
      
      // Update the database first
      const { error: updateError } = await supabase
        .from('properties')
        .update({ auto_appeal_enabled: newAutoAppealStatus })
        .eq('id', propertyId);

      if (updateError) {
        console.error('Error updating auto appeal in database:', updateError);
        throw new Error('Failed to update auto appeal setting');
      }

      console.log('✅ Auto appeal status updated in database successfully');
      
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