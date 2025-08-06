
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AddPropertyMultiStepForm } from './AddPropertyMultiStepForm';
import { Home, AlertTriangle, Loader2, User } from 'lucide-react';
import { GooglePlacesAutocomplete, GooglePlacesData } from '@/components/GooglePlacesAutocomplete';

const addPropertySchema = z.object({
  address: z.string().min(1, 'Property address is required'),
  parcelNumber: z.string().optional(),
  includeAllProperties: z.boolean(),
});

type AddPropertyFormData = z.infer<typeof addPropertySchema>;

interface Customer {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  property_count: number;
}

interface AddPropertyFormProps {
  customer: Customer;
  onBack: () => void;
  onSuccess: () => void;
}

interface PropertyVerificationData {
  legalOwnerName: string;
  parcelNumber: string;
  address: string;
}

export const AddPropertyForm: React.FC<AddPropertyFormProps> = ({ 
  customer, 
  onBack, 
  onSuccess 
}) => {
  const [showMultiStep, setShowMultiStep] = useState(false);
  const [verificationData, setVerificationData] = useState<PropertyVerificationData | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [googlePlacesData, setGooglePlacesData] = useState<GooglePlacesData | null>(null);
  const [currentAddress, setCurrentAddress] = useState('');

  const form = useForm<AddPropertyFormData>({
    resolver: zodResolver(addPropertySchema),
    defaultValues: {
      address: '',
      parcelNumber: '',
      includeAllProperties: false,
    },
  });

  // Handle Google Places data and trigger property lookup
  const handleGooglePlacesDataChange = (data: GooglePlacesData) => {
    setGooglePlacesData(data);
    setCurrentAddress(data.formattedAddress || '');
    handleAddressLookup(data.formattedAddress);
  };

  // Mock property lookup function - simulates API call to property records
  const handleAddressLookup = async (address: string) => {
    if (!address || address.length < 10) {
      setVerificationData(null);
      return;
    }

    setIsLookingUp(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock property data based on address with enhanced data from Google Places
    const mockPropertyData: PropertyVerificationData = {
      legalOwnerName: address.includes('Main') ? 'Smith Family Trust' : 
                     address.includes('Oak') ? 'Johnson, Robert & Mary' :
                     address.includes('Elm') ? 'ABC Properties LLC' :
                     'Williams, John Michael',
      parcelNumber: `PAR-${Math.floor(Math.random() * 900000) + 100000}`,
      address: address
    };
    
    setVerificationData(mockPropertyData);
    setIsLookingUp(false);
  };

  const handleContinueToForm = () => {
    if (currentAddress && currentAddress.length >= 10) {
      setShowMultiStep(true);
    }
  };

  // Show multi-step form if address is confirmed
  if (showMultiStep) {
    return (
      <AddPropertyMultiStepForm
        customer={customer}
        onBack={() => setShowMultiStep(false)}
        onSuccess={onSuccess}
        initialAddress={currentAddress}
        googlePlacesData={googlePlacesData}
        verificationData={verificationData}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Add New Property</h2>
          <p className="text-slate-600 mt-1">
            Adding a property for {customer.first_name} {customer.last_name}
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Back to Search
        </Button>
      </div>

      {/* Customer Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <User className="h-5 w-5" />
            Selected Customer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-900">Name:</span>
              <p className="text-blue-800">{customer.first_name} {customer.last_name}</p>
            </div>
            <div>
              <span className="font-medium text-blue-900">Email:</span>
              <p className="text-blue-800">{customer.email}</p>
            </div>
            <div>
              <span className="font-medium text-blue-900">Existing Properties:</span>
              <p className="text-blue-800">{customer.property_count}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Address Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Property Address
          </CardTitle>
          <CardDescription>
            Enter the property address to begin the application process.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Property Address *
            </label>
            <GooglePlacesAutocomplete
              value={currentAddress}
              onChange={setCurrentAddress}
              onPlacesDataChange={handleGooglePlacesDataChange}
              placeholder="Enter property address"
              required
            />
          </div>

          {/* Property Verification Section */}
          {(isLookingUp || verificationData) && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-5 w-5" />
                  Property Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLookingUp ? (
                  <div className="flex items-center gap-3 text-yellow-700">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Looking up property information...</span>
                  </div>
                ) : verificationData ? (
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-yellow-200">
                      <h4 className="font-semibold text-yellow-800 mb-3">Property Records Found:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-yellow-800">Legal Owner Name:</span>
                          <p className="text-yellow-700 font-semibold">{verificationData.legalOwnerName}</p>
                        </div>
                        <div>
                          <span className="font-medium text-yellow-800">Parcel Number:</span>
                          <p className="text-yellow-700 font-semibold">{verificationData.parcelNumber}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          <Button
            onClick={handleContinueToForm}
            variant="accent"
            size="lg"
            className="w-full"
            disabled={!currentAddress || currentAddress.length < 10}
          >
            Continue to Application
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
