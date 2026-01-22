/**
 * Cal.com Scheduling Adapter
 * Provides integration with Cal.com for appointment booking
 * 
 * @see https://cal.com/docs/api-reference
 */

import { logger } from '@/lib/utils';

// Configuration from environment
const CALCOM_API_KEY = process.env.CALCOM_API_KEY || '';
const CALCOM_API_URL = process.env.CALCOM_API_URL || 'https://api.cal.com/v1';
const CALCOM_EVENT_TYPE_ID = process.env.CALCOM_EVENT_TYPE_ID || '';

/**
 * Time slot available for booking
 */
export interface TimeSlot {
  start: string; // ISO date string
  end: string;   // ISO date string
}

/**
 * Booking request payload
 */
export interface BookingRequest {
  eventTypeId: number;
  start: string; // ISO date string
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  language?: string;
  timeZone?: string;
}

/**
 * Booking response from Cal.com
 */
export interface BookingResponse {
  id: number;
  uid: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'ACCEPTED' | 'PENDING' | 'CANCELLED' | 'REJECTED';
  attendees: Array<{
    email: string;
    name: string;
    timeZone: string;
  }>;
  metadata?: Record<string, unknown>;
}

/**
 * Availability response
 */
export interface AvailabilityResponse {
  busy: Array<{ start: string; end: string }>;
  dateRanges: Array<{ start: string; end: string }>;
  slots: TimeSlot[];
}

/**
 * Cal.com Scheduling Adapter
 */
export const calcomAdapter = {
  /**
   * Check if Cal.com is configured
   */
  isConfigured(): boolean {
    return !!(CALCOM_API_KEY && CALCOM_EVENT_TYPE_ID);
  },

  /**
   * Get available time slots for a date range
   */
  async getAvailability(
    startDate: string,
    endDate: string,
    timezone: string = 'America/Chicago'
  ): Promise<TimeSlot[]> {
    if (!this.isConfigured()) {
      logger.warn('Cal.com not configured, returning mock availability');
      return generateMockAvailability(startDate, endDate);
    }

    try {
      const params = new URLSearchParams({
        apiKey: CALCOM_API_KEY,
        eventTypeId: CALCOM_EVENT_TYPE_ID,
        startTime: startDate,
        endTime: endDate,
        timeZone: timezone,
      });

      const response = await fetch(`${CALCOM_API_URL}/availability?${params}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch availability');
      }

      const data: AvailabilityResponse = await response.json();
      return data.slots;
    } catch (error) {
      logger.error('Cal.com availability error', error);
      throw error;
    }
  },

  /**
   * Create a booking
   */
  async createBooking(request: BookingRequest): Promise<BookingResponse> {
    if (!this.isConfigured()) {
      logger.warn('Cal.com not configured, returning mock booking');
      return generateMockBooking(request);
    }

    try {
      const response = await fetch(`${CALCOM_API_URL}/bookings?apiKey=${CALCOM_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create booking');
      }

      const data: BookingResponse = await response.json();
      logger.info('Cal.com booking created', { bookingId: data.id, uid: data.uid });
      return data;
    } catch (error) {
      logger.error('Cal.com booking error', error);
      throw error;
    }
  },

  /**
   * Cancel a booking
   */
  async cancelBooking(
    bookingId: number,
    reason?: string
  ): Promise<{ success: boolean }> {
    if (!this.isConfigured()) {
      logger.warn('Cal.com not configured, returning mock cancellation');
      return { success: true };
    }

    try {
      const response = await fetch(
        `${CALCOM_API_URL}/bookings/${bookingId}/cancel?apiKey=${CALCOM_API_KEY}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel booking');
      }

      logger.info('Cal.com booking cancelled', { bookingId, reason });
      return { success: true };
    } catch (error) {
      logger.error('Cal.com cancellation error', error);
      throw error;
    }
  },

  /**
   * Reschedule a booking
   */
  async rescheduleBooking(
    bookingId: number,
    newStart: string,
    reason?: string
  ): Promise<BookingResponse> {
    if (!this.isConfigured()) {
      logger.warn('Cal.com not configured, returning mock reschedule');
      return {
        id: bookingId,
        uid: `mock-${bookingId}`,
        title: 'Roof Installation',
        startTime: newStart,
        endTime: new Date(new Date(newStart).getTime() + 4 * 60 * 60 * 1000).toISOString(),
        status: 'ACCEPTED',
        attendees: [],
      };
    }

    try {
      const response = await fetch(
        `${CALCOM_API_URL}/bookings/${bookingId}/reschedule?apiKey=${CALCOM_API_KEY}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            start: newStart,
            rescheduleReason: reason,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reschedule booking');
      }

      const data: BookingResponse = await response.json();
      logger.info('Cal.com booking rescheduled', { bookingId, newStart });
      return data;
    } catch (error) {
      logger.error('Cal.com reschedule error', error);
      throw error;
    }
  },

  /**
   * Get booking by ID
   */
  async getBooking(bookingId: number): Promise<BookingResponse | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const response = await fetch(
        `${CALCOM_API_URL}/bookings/${bookingId}?apiKey=${CALCOM_API_KEY}`
      );

      if (!response.ok) {
        if (response.status === 404) return null;
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch booking');
      }

      return response.json();
    } catch (error) {
      logger.error('Cal.com get booking error', error);
      throw error;
    }
  },
};

/**
 * Generate mock availability for development
 */
function generateMockAvailability(startDate: string, endDate: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Generate slots for each day in range
  for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    // Skip weekends
    if (day.getDay() === 0 || day.getDay() === 6) continue;
    
    // Morning slot: 8 AM - 12 PM
    const morningStart = new Date(day);
    morningStart.setHours(8, 0, 0, 0);
    const morningEnd = new Date(day);
    morningEnd.setHours(12, 0, 0, 0);
    
    // Afternoon slot: 1 PM - 5 PM
    const afternoonStart = new Date(day);
    afternoonStart.setHours(13, 0, 0, 0);
    const afternoonEnd = new Date(day);
    afternoonEnd.setHours(17, 0, 0, 0);
    
    slots.push(
      { start: morningStart.toISOString(), end: morningEnd.toISOString() },
      { start: afternoonStart.toISOString(), end: afternoonEnd.toISOString() }
    );
  }
  
  return slots;
}

/**
 * Generate mock booking for development
 */
function generateMockBooking(request: BookingRequest): BookingResponse {
  const startTime = new Date(request.start);
  const endTime = new Date(startTime.getTime() + 4 * 60 * 60 * 1000); // 4 hours

  return {
    id: Math.floor(Math.random() * 100000),
    uid: `mock-${Date.now()}`,
    title: 'Roof Installation',
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    status: 'ACCEPTED',
    attendees: [
      {
        email: request.email,
        name: request.name,
        timeZone: request.timeZone || 'America/Chicago',
      },
    ],
    metadata: request.metadata,
  };
}

export default calcomAdapter;
