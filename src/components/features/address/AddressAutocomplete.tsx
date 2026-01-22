'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader2, AlertCircle, X } from 'lucide-react';
import styles from './AddressAutocomplete.module.css';

export interface ParsedAddress {
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  placeId: string;
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: ParsedAddress) => void;
  onServiceAreaError?: (state: string) => void;
  initialValue?: string;
  disabled?: boolean;
  serviceStates?: string[];
}

const SERVICE_STATES = ['TX', 'GA', 'NC', 'AZ'];

declare global {
  interface Window {
    google: typeof google;
    initGooglePlaces?: () => void;
  }
}

export function AddressAutocomplete({
  onAddressSelect,
  onServiceAreaError,
  initialValue = '',
  disabled = false,
  serviceStates = SERVICE_STATES,
}: AddressAutocompleteProps) {
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Load Google Places script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      console.warn('Google Places API key not configured');
      setIsScriptLoaded(true); // Allow fallback to manual entry
      return;
    }

    if (window.google?.maps?.places) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Google Places script');
      setIsScriptLoaded(true); // Allow fallback
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Initialize autocomplete when script loads
  useEffect(() => {
    if (!isScriptLoaded || !inputRef.current || !window.google?.maps?.places) {
      return;
    }

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'us' },
      fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
      types: ['address'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      handlePlaceSelect(place);
    });

    autocompleteRef.current = autocomplete;

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScriptLoaded]);

  const parseAddressComponents = useCallback(
    (place: google.maps.places.PlaceResult): ParsedAddress | null => {
      if (!place.address_components || !place.geometry?.location) {
        return null;
      }

      let streetNumber = '';
      let route = '';
      let city = '';
      let state = '';
      let zip = '';

      for (const component of place.address_components) {
        const types = component.types;

        if (types.includes('street_number')) {
          streetNumber = component.long_name;
        } else if (types.includes('route')) {
          route = component.long_name;
        } else if (types.includes('locality')) {
          city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          state = component.short_name;
        } else if (types.includes('postal_code')) {
          zip = component.long_name;
        }
      }

      const streetAddress = [streetNumber, route].filter(Boolean).join(' ');

      if (!streetAddress || !city || !state || !zip) {
        return null;
      }

      return {
        streetAddress,
        city,
        state,
        zip,
        formattedAddress: place.formatted_address || `${streetAddress}, ${city}, ${state} ${zip}`,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        placeId: place.place_id || '',
      };
    },
    []
  );

  const handlePlaceSelect = useCallback(
    (place: google.maps.places.PlaceResult) => {
      setError(null);
      setIsLoading(true);

      const parsed = parseAddressComponents(place);

      if (!parsed) {
        setError('Please select a complete street address with city, state, and ZIP code.');
        setIsLoading(false);
        return;
      }

      // Check service area
      if (!serviceStates.includes(parsed.state)) {
        setError(`Sorry, we don't serve ${parsed.state} yet.`);
        setIsLoading(false);
        onServiceAreaError?.(parsed.state);
        return;
      }

      setValue(parsed.formattedAddress);
      setIsLoading(false);
      onAddressSelect(parsed);
    },
    [parseAddressComponents, serviceStates, onAddressSelect, onServiceAreaError]
  );

  const handleClear = () => {
    setValue('');
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <MapPin className={styles.inputIcon} size={20} />
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder="Enter your home address"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled || isLoading}
          autoComplete="off"
        />
        {isLoading && <Loader2 className={styles.loadingIcon} size={20} />}
        {value && !isLoading && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Clear address"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {error && (
        <div className={styles.error}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <p className={styles.hint}>
        Start typing and select your address from the dropdown
      </p>
    </div>
  );
}

export default AddressAutocomplete;
