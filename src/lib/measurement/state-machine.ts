/**
 * Measurement State Machine
 * Manages the progression through measurement states with timeout handling
 */

/**
 * Possible states in the measurement flow
 */
export type MeasurementState =
  | 'idle'
  | 'requesting'
  | 'polling'
  | 'delayed' // Taking longer than expected (15s)
  | 'complete'
  | 'timeout' // Exceeded timeout (45s)
  | 'error'
  | 'manual_entry';

/**
 * Events that trigger state transitions
 */
export type MeasurementEvent =
  | { type: 'REQUEST' }
  | { type: 'REQUEST_SUCCESS'; measurementId: string }
  | { type: 'REQUEST_ERROR'; error: string }
  | { type: 'POLL_SUCCESS'; data: MeasurementData }
  | { type: 'POLL_PENDING' }
  | { type: 'POLL_ERROR'; error: string }
  | { type: 'DELAYED' }
  | { type: 'TIMEOUT' }
  | { type: 'MANUAL_ENTRY' }
  | { type: 'RETRY' };

/**
 * Measurement data from Roofr or manual entry
 */
export interface MeasurementData {
  sqftTotal: number;
  pitchPrimary: number;
  complexity: 'simple' | 'moderate' | 'complex';
  source: 'roofr' | 'manual';
}

/**
 * Context passed through the state machine
 */
export interface MeasurementContext {
  state: MeasurementState;
  measurementId: string | null;
  data: MeasurementData | null;
  error: string | null;
  startTime: number | null;
  pollCount: number;
}

/**
 * Initial context
 */
export const initialContext: MeasurementContext = {
  state: 'idle',
  measurementId: null,
  data: null,
  error: null,
  startTime: null,
  pollCount: 0,
};

/**
 * Timing constants (in milliseconds)
 */
export const MEASUREMENT_TIMINGS = {
  /** Show "taking longer" message after 15 seconds */
  DELAYED_THRESHOLD: 15_000,
  /** Total timeout for measurement - 45 seconds */
  TIMEOUT_THRESHOLD: 45_000,
  /** Polling interval - 3 seconds */
  POLL_INTERVAL: 3_000,
  /** Maximum poll attempts */
  MAX_POLL_ATTEMPTS: 15,
  /** Initial backoff delay */
  BACKOFF_INITIAL: 1_000,
  /** Maximum backoff delay */
  BACKOFF_MAX: 10_000,
};

/**
 * Calculate exponential backoff delay
 */
export function calculateBackoff(attempt: number): number {
  const delay = MEASUREMENT_TIMINGS.BACKOFF_INITIAL * Math.pow(2, attempt);
  return Math.min(delay, MEASUREMENT_TIMINGS.BACKOFF_MAX);
}

/**
 * State machine transition function
 */
export function transition(
  context: MeasurementContext,
  event: MeasurementEvent
): MeasurementContext {
  const { state } = context;

  switch (event.type) {
    case 'REQUEST':
      if (state === 'idle' || state === 'timeout' || state === 'error') {
        return {
          ...context,
          state: 'requesting',
          error: null,
          startTime: Date.now(),
          pollCount: 0,
        };
      }
      return context;

    case 'REQUEST_SUCCESS':
      if (state === 'requesting') {
        return {
          ...context,
          state: 'polling',
          measurementId: event.measurementId,
        };
      }
      return context;

    case 'REQUEST_ERROR':
      if (state === 'requesting') {
        return {
          ...context,
          state: 'error',
          error: event.error,
        };
      }
      return context;

    case 'POLL_SUCCESS':
      if (state === 'polling' || state === 'delayed') {
        return {
          ...context,
          state: 'complete',
          data: event.data,
        };
      }
      return context;

    case 'POLL_PENDING':
      if (state === 'polling' || state === 'delayed') {
        return {
          ...context,
          pollCount: context.pollCount + 1,
        };
      }
      return context;

    case 'POLL_ERROR':
      if (state === 'polling' || state === 'delayed') {
        return {
          ...context,
          state: 'error',
          error: event.error,
        };
      }
      return context;

    case 'DELAYED':
      if (state === 'polling') {
        return {
          ...context,
          state: 'delayed',
        };
      }
      return context;

    case 'TIMEOUT':
      if (state === 'polling' || state === 'delayed') {
        return {
          ...context,
          state: 'timeout',
          error: 'Measurement timed out',
        };
      }
      return context;

    case 'MANUAL_ENTRY':
      // Can enter manual entry from delayed, timeout, or error states
      if (state === 'delayed' || state === 'timeout' || state === 'error') {
        return {
          ...context,
          state: 'manual_entry',
        };
      }
      return context;

    case 'RETRY':
      if (state === 'timeout' || state === 'error') {
        return {
          ...initialContext,
          state: 'requesting',
          startTime: Date.now(),
        };
      }
      return context;

    default:
      return context;
  }
}

/**
 * Check if the measurement has timed out
 */
export function checkTimeout(context: MeasurementContext): MeasurementEvent | null {
  if (!context.startTime) return null;
  
  const elapsed = Date.now() - context.startTime;
  
  if (elapsed >= MEASUREMENT_TIMINGS.TIMEOUT_THRESHOLD) {
    return { type: 'TIMEOUT' };
  }
  
  if (elapsed >= MEASUREMENT_TIMINGS.DELAYED_THRESHOLD && context.state === 'polling') {
    return { type: 'DELAYED' };
  }
  
  return null;
}

/**
 * Hook-friendly reducer for use with useReducer
 */
export function measurementReducer(
  context: MeasurementContext,
  event: MeasurementEvent
): MeasurementContext {
  return transition(context, event);
}
