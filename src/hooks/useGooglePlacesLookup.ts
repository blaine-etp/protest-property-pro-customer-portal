
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddressLookupResult {
  address: string;
  placeId: string;
  estimatedSavings: number;
  parcelNumber: string;
  countyData?: any;
  multipleProperties?: any[];
}

export const useGooglePlacesLookup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const lookupAddress = async (
    address: string, 
    placeData: any,
    includeAllProperties: boolean = false
  ): Promise<AddressLookupResult | null> => {
    setIsLoading(true);
    
    try {
      // Step 1: Normalize address for AWS lookup
      const { data: normalizedData, error: normalizeError } = await supabase.functions.invoke(
        'normalize-address',
        {
          body: {
            googlePlacesData: placeData,
            address: address
          }
        }
      );

      if (normalizeError) {
        throw new Error(`Address normalization failed: ${normalizeError.message}`);
      }

      // Step 2: Lookup property in AWS
      const lookupFunction = includeAllProperties ? 'lookup-all-properties' : 'lookup-property';
      const { data: propertyData, error: lookupError } = await supabase.functions.invoke(
        lookupFunction,
        {
          body: {
            normalizedAddress: normalizedData.normalizedAddress,
            googlePlacesData: placeData,
            includeAllProperties
          }
        }
      );

      if (lookupError) {
        throw new Error(`Property lookup failed: ${lookupError.message}`);
      }

      return {
        address: propertyData.address,
        placeId: placeData.place_id,
        estimatedSavings: propertyData.estimatedSavings,
        parcelNumber: propertyData.parcelNumber,
        countyData: propertyData.countyData,
        multipleProperties: propertyData.multipleProperties
      };
    } catch (error: any) {
      console.error('Address lookup error:', error);
      toast({
        title: "Address Lookup Failed",
        description: error.message || "Unable to validate address. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { lookupAddress, isLoading };
};
