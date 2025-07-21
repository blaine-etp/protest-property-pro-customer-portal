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

export const useTokenCustomerData = (token: string) => {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('No token provided');
      setLoading(false);
      return;
    }

    fetchCustomerData();
  }, [token]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);

      // This hook is now deprecated - token-based auth has been removed
      // Return error to redirect to new auth flow
      throw new Error('Token-based authentication is no longer supported. Please use the new signin flow.');
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

      // Auto appeal functionality not implemented yet
      console.log('Auto appeal toggle requested for property:', propertyId);
      
      // Placeholder for future auto-appeal implementation
      // For now, just toggle the local state
      const newAutoAppealStatus = !property.appeal_status.auto_appeal_enabled;

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