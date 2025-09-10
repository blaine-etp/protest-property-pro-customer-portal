import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MultiStepForm, { FormData } from '@/components/MultiStepForm';
import { GooglePlacesAutocomplete } from '@/components/GooglePlacesAutocomplete';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Start: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showFallback, setShowFallback] = useState(false);
  const [fallbackAddress, setFallbackAddress] = useState('');
  const [fallbackPlacesData, setFallbackPlacesData] = useState<any>(null);

  // Parse query parameters
  const address = searchParams.get('address') || '';
  const placeId = searchParams.get('place_id') || '';
  const formattedAddress = searchParams.get('formatted_address') || '';
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const county = searchParams.get('county') || '';
  const referralCode = searchParams.get('ref') || searchParams.get('utm_source') || null;

  // Build initial places data
  const initialPlacesData: Partial<FormData> = {
    placeId,
    formattedAddress,
    latitude: lat ? parseFloat(lat) : undefined,
    longitude: lng ? parseFloat(lng) : undefined,
    county,
    referralCode,
    // Add other fields as needed based on your FormData interface
  };

  useEffect(() => {
    // Show fallback if missing required data
    if (!address || !placeId) {
      setShowFallback(true);
      setFallbackAddress(address);
    }
  }, [address, placeId, navigate]);

  const handleComplete = (formData: FormData) => {
    // Navigate to email verification or success page
    navigate('/email-verification');
  };

  const handleFallbackSubmit = () => {
    if (fallbackPlacesData && fallbackAddress) {
      setShowFallback(false);
    }
  };

  // Show fallback address confirmation
  if (showFallback) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Confirm Your Property Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                We need to verify your property address to get started.
              </p>
              <GooglePlacesAutocomplete
                value={fallbackAddress}
                onChange={setFallbackAddress}
                onPlacesDataChange={setFallbackPlacesData}
                placeholder="Enter your property address..."
                required
              />
              <button
                onClick={handleFallbackSubmit}
                disabled={!fallbackPlacesData}
                className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render the main wizard
  return (
    <div className="container mx-auto px-4 py-8">
      <MultiStepForm
        address={address}
        referralCode={referralCode}
        initialPlacesData={initialPlacesData}
        onComplete={handleComplete}
      />
    </div>
  );
};

export default Start;