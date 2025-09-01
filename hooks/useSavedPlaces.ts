import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { savedPlacesService } from '../services/savedPlacesService';
import { useAuth } from './useFirebaseAuth';
import { BusinessListing } from '../types/business';
import { businessService } from '../services/businessService';

export interface SavedPlace extends BusinessListing {
  savedAt: Date;
}

export const useSavedPlaces = () => {
  const { user } = useAuth();
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedPlaces = useCallback(async () => {
    if (!user) {
      setError("You must be logged in to see saved places.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const businessIds = await savedPlacesService.getSavedBusinesses(user.uid);
      const places = await Promise.all(
        businessIds.map(async (id) => {
          const business = await businessService.getBusinessById(id);
          return { ...business, id, savedAt: new Date() };
        })
      );
      setSavedPlaces(places.filter(p => p.id) as SavedPlace[]);
      setError(null);
    } catch (err) {
      setError("Failed to fetch saved places.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchSavedPlaces();
    }, [fetchSavedPlaces])
  );

  return { savedPlaces, loading, error, refetch: fetchSavedPlaces };
};


