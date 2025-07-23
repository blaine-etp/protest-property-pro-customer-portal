
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Enter your property address...",
  className = "",
  required = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAutocomplete = () => {
      console.log('🔍 Initializing Google Places Autocomplete...');
      
      if (!inputRef.current) {
        console.error('❌ Input ref not available');
        return;
      }

      if (!window.google?.maps?.places) {
        console.error('❌ Google Maps Places API not available');
        setGoogleError('Google Maps not available');
        return;
      }

      try {
        console.log('🔍 Creating Autocomplete instance...');
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ['address'],
            componentRestrictions: { country: 'us' },
            fields: ['formatted_address', 'address_components', 'place_id']
          }
        );

        autocompleteRef.current.addListener('place_changed', () => {
          console.log('🔍 Place changed event fired');
          const place = autocompleteRef.current.getPlace();
          console.log('🔍 Selected place:', place);
          
          if (place.formatted_address) {
            console.log('🔍 Setting address:', place.formatted_address);
            onChange(place.formatted_address);
          }
        });

        console.log('✅ Google Places Autocomplete initialized successfully');
        setGoogleError(null);
      } catch (error) {
        console.error('❌ Error initializing Google Places:', error);
        setGoogleError('Failed to initialize Google Places');
      }
    };

    const handleGoogleLoaded = () => {
      console.log('🔍 Google Places loaded event received');
      if (window.googlePlacesLoaded) {
        setIsGoogleLoaded(true);
        initializeAutocomplete();
      } else {
        console.log('🔍 Google Places failed to load, using fallback');
        setIsGoogleLoaded(false);
        setGoogleError('Google Places API failed to load');
      }
    };

    if (window.googlePlacesLoaded !== undefined) {
      handleGoogleLoaded();
    } else {
      console.log('🔍 Waiting for Google Places to load...');
      window.addEventListener('googlePlacesLoaded', handleGoogleLoaded);
      return () => window.removeEventListener('googlePlacesLoaded', handleGoogleLoaded);
    }
  }, [onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex-1 relative">
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
      <Input
        ref={inputRef}
        type="text"
        placeholder={googleError ? `${placeholder} (Manual entry)` : placeholder}
        value={value}
        onChange={handleInputChange}
        className={`pl-12 h-14 text-lg border-0 bg-transparent focus:ring-0 ${className}`}
        required={required}
      />
      {googleError && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
          Manual entry
        </div>
      )}
    </div>
  );
};
