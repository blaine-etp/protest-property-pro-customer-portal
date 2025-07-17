import { useState, useEffect } from 'react';
import { authService, formService } from '@/services';

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
      const { data: { session } } = await authService.getSession();
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

      setProfile(profileData);

      // Fetch properties for this user (using mock form service)
      const propertiesData = await formService.getPropertiesForUser(session.user.id);

      setProperties(propertiesData);
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

      const { error } = await formService.toggleAutoAppeal(propertyId);

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