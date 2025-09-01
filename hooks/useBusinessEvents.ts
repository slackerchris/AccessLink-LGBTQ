import { useState, useEffect, useCallback } from 'react';
import { BusinessEvent } from '../types/event';
import { enhancedBusinessService } from '../services/enhancedBusinessService';
import { DbResult } from '../types/firestore';
import { useAuth } from './useFirebaseAuth';

export const useBusinessEvents = (businessId: string | null) => {
  const [events, setEvents] = useState<BusinessEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!businessId) {
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await enhancedBusinessService.getBusinessEvents(businessId);
      if (result.success && result.data) {
        setEvents(result.data);
      } else {
        setError(result.error ? result.error.message : 'Failed to fetch events.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching business events:', err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const addEvent = async (eventData: Omit<BusinessEvent, 'id' | 'createdAt' | 'updatedAt' | 'businessId'>): Promise<DbResult<BusinessEvent>> => {
    if (!businessId) {
        const errorResult: DbResult<BusinessEvent> = { success: false, error: new Error("Business ID is not available to add an event.") };
        return Promise.resolve(errorResult);
    }
    
    const result = await enhancedBusinessService.addBusinessEvent(businessId, eventData);
    if (result.success && result.data) {
        setEvents(prevEvents => [result.data, ...prevEvents]);
    }
    return result;
  };

  const updateEvent = async (eventId: string, eventData: Partial<BusinessEvent>): Promise<DbResult<void>> => {
    if (!businessId) {
        const errorResult: DbResult<void> = { success: false, error: new Error("Business ID is not available to update an event.") };
        return Promise.resolve(errorResult);
    }

    const result = await enhancedBusinessService.updateBusinessEvent(businessId, eventId, eventData);
    if (result.success) {
        setEvents(prevEvents => 
          prevEvents.map(event => event.id === eventId ? { ...event, ...eventData } : event)
        );
    }
    return result;
  };

  const deleteEvent = async (eventId: string): Promise<DbResult<void>> => {
    if (!businessId) {
        const errorResult: DbResult<void> = { success: false, error: new Error("Business ID is not available to delete an event.") };
        return Promise.resolve(errorResult);
    }

    const result = await enhancedBusinessService.deleteBusinessEvent(businessId, eventId);
    if (result.success) {
        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
    }
    return result;
  };

  return {
    events,
    loading,
    error,
    refreshEvents: fetchEvents,
    addEvent,
    updateEvent,
    deleteEvent,
  };
};
