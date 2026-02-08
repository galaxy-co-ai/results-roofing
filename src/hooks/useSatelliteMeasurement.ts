/**
 * useSatelliteMeasurement Hook
 *
 * Triggers a satellite measurement lookup when the user confirms their property.
 * Shows a loading state while fetching, then updates the quote with real data.
 * Falls back gracefully to manual entry if satellite data isn't available.
 */

import { useState, useCallback } from 'react';

interface SatelliteMeasurement {
  sqftTotal: number;
  sqftSteep: number;
  sqftFlat: number;
  pitchPrimary: number;
  pitchMin: number;
  pitchMax: number;
  facetCount: number;
  complexity: 'simple' | 'moderate' | 'complex';
  confidence: 'high' | 'medium' | 'low';
  imageryQuality: 'HIGH' | 'MEDIUM' | 'BASE';
  imageryDate: string | null;
}

interface UseSatelliteMeasurementResult {
  /** Trigger the satellite measurement lookup */
  fetchMeasurement: (quoteId: string, lat: number, lng: number) => Promise<void>;
  /** Measurement data once available */
  measurement: SatelliteMeasurement | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message if failed */
  error: string | null;
  /** Whether fallback to manual entry is needed */
  needsManualEntry: boolean;
  /** Whether satellite data was found */
  hasSatelliteData: boolean;
}

export function useSatelliteMeasurement(): UseSatelliteMeasurementResult {
  const [measurement, setMeasurement] = useState<SatelliteMeasurement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsManualEntry, setNeedsManualEntry] = useState(false);

  const fetchMeasurement = useCallback(
    async (quoteId: string, lat: number, lng: number) => {
      setIsLoading(true);
      setError(null);
      setNeedsManualEntry(false);

      try {
        const response = await fetch(
          `/api/quotes/${quoteId}/satellite-measurement`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude: lat, longitude: lng }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          // Building not found — fall back to manual entry
          if (data.code === 'NOT_FOUND') {
            setNeedsManualEntry(true);
            setError(null); // Not an error per se, just needs fallback
            return;
          }

          throw new Error(data.error || 'Failed to get satellite measurement');
        }

        setMeasurement(data.measurement);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[useSatelliteMeasurement]', message);
        setError(message);
        // On any error, allow manual entry as fallback
        setNeedsManualEntry(true);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    fetchMeasurement,
    measurement,
    isLoading,
    error,
    needsManualEntry,
    hasSatelliteData: measurement !== null,
  };
}
