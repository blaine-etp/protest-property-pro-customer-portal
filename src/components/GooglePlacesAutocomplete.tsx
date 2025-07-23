
import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string, placeData?: any) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  disabled?: boolean;
}

export const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Enter your address",
  className = "",
  label,
  disabled = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    // Load Google Places API
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}&libraries=places`;
      script.async = true;
      script.onload = () => setIsGoogleLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsGoogleLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isGoogleLoaded && inputRef.current && !autocompleteRef.current) {
      // Initialize autocomplete
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: 'us' },
          fields: ['formatted_address', 'address_components', 'place_id', 'geometry']
        }
      );

      // Add place selection listener
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place && place.formatted_address) {
          setIsLoading(true);
          
          // Extract address components
          const addressComponents = place.address_components || [];
          const placeData = {
            place_id: place.place_id,
            formatted_address: place.formatted_address,
            address_components: addressComponents,
            geometry: place.geometry
          };
          
          onChange(place.formatted_address, placeData);
          setIsLoading(false);
        }
      });
    }
  }, [isGoogleLoaded, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const content = (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`${className} ${isLoading ? 'pr-10' : ''}`}
        disabled={disabled}
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
    </div>
  );

  if (label) {
    return (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          {content}
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  }

  return content;
};
