'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader2, AlertCircle, X } from 'lucide-react';
import { logger } from '@/lib/utils';
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

interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  context?: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
  address?: string;
  text?: string;
}

interface MapboxResponse {
  features: MapboxFeature[];
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: ParsedAddress) => void;
  onServiceAreaError?: (state: string) => void;
  initialValue?: string;
  disabled?: boolean;
  serviceStates?: string[];
}

const SERVICE_STATES = ['TX', 'GA', 'NC', 'AZ', 'OK'];

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
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  // Fetch suggestions from Mapbox
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!mapboxToken || query.length < 5) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        access_token: mapboxToken,
        country: 'us',
        types: 'address',
        autocomplete: 'true',
        limit: '5',
      });

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data: MapboxResponse = await response.json();
      setSuggestions(data.features || []);
      setShowSuggestions(data.features?.length > 0);
      setSelectedIndex(-1);
    } catch (err) {
      logger.error('Mapbox geocoding error:', err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [mapboxToken]);

  // Debounced input handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setError(null);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce API calls - wait 500ms after user stops typing
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 500);
  };

  // Parse Mapbox feature into our address format
  const parseMapboxFeature = useCallback((feature: MapboxFeature): ParsedAddress | null => {
    const context = feature.context || [];

    // Extract components from context
    let city = '';
    let state = '';
    let zip = '';

    for (const ctx of context) {
      if (ctx.id.startsWith('place.')) {
        city = ctx.text;
      } else if (ctx.id.startsWith('region.')) {
        // Extract state abbreviation from short_code (e.g., "US-TX" -> "TX")
        state = ctx.short_code?.replace('US-', '') || ctx.text;
      } else if (ctx.id.startsWith('postcode.')) {
        zip = ctx.text;
      }
    }

    // Street address: combine address number with street name
    const streetAddress = feature.address
      ? `${feature.address} ${feature.text || ''}`
      : feature.text || '';

    if (!streetAddress || !city || !state || !zip) {
      return null;
    }

    return {
      streetAddress: streetAddress.trim(),
      city,
      state: state.toUpperCase(),
      zip,
      formattedAddress: feature.place_name,
      lat: feature.center[1],
      lng: feature.center[0],
      placeId: feature.id,
    };
  }, []);

  // Handle suggestion selection
  const handleSelect = useCallback((feature: MapboxFeature) => {
    const parsed = parseMapboxFeature(feature);

    if (!parsed) {
      setError('Please select a complete street address with city, state, and ZIP code.');
      return;
    }

    // Check service area
    if (!serviceStates.includes(parsed.state)) {
      setError(`Sorry, we don't serve ${parsed.state} yet.`);
      onServiceAreaError?.(parsed.state);
      return;
    }

    setValue(parsed.formattedAddress);
    setSuggestions([]);
    setShowSuggestions(false);
    setError(null);
    onAddressSelect(parsed);
  }, [parseMapboxFeature, serviceStates, onAddressSelect, onServiceAreaError]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleClear = () => {
    setValue('');
    setError(null);
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Show message if Mapbox isn't configured
  if (!mapboxToken) {
    return (
      <div className={styles.container}>
        <div className={styles.inputWrapper}>
          <MapPin className={styles.inputIcon} size={20} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="Enter address: 123 Main St, City, TX 75001"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={disabled}
            aria-label="Enter your property address"
          />
        </div>
        <p className={styles.hint}>
          Enter a full address: 123 Main St, City, ST 12345
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <MapPin className={styles.inputIcon} size={20} aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder="Start typing your address..."
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          data-form-type="other"
          data-lpignore="true"
          aria-label="Enter your property address"
          aria-expanded={showSuggestions}
          aria-autocomplete="list"
          aria-controls="address-suggestions-listbox"
          role="combobox"
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

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          id="address-suggestions-listbox"
          className={styles.suggestions}
          role="listbox"
        >
          {suggestions.map((feature, index) => (
            <button
              key={feature.id}
              type="button"
              className={`${styles.suggestionItem} ${index === selectedIndex ? styles.suggestionItemSelected : ''}`}
              onClick={() => handleSelect(feature)}
              onMouseEnter={() => setSelectedIndex(index)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <MapPin size={14} className={styles.suggestionIcon} />
              <span className={styles.suggestionText}>{feature.place_name}</span>
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default AddressAutocomplete;
