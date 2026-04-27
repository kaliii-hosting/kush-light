import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { realtimeDb } from '../config/firebase';

const LogosContext = createContext();

export const useLogos = () => {
  const context = useContext(LogosContext);
  if (!context) {
    throw new Error('useLogos must be used within a LogosProvider');
  }
  return context;
};

// Default logos configuration
const defaultLogos = {
  desktop: {
    url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/logos/Logo%20Kushie%20(W-SVG).svg',
    alt: 'Brand',
    width: 'auto',
    height: '40'
  },
  mobile: {
    url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/logos/Brand%20Icon%20Logo%20(W-SVG).svg',
    alt: 'Brand',
    width: '32',
    height: '32'
  },
  footer: {
    url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/logos/Logo%20Kushie%20(W-SVG).svg',
    alt: 'Brand',
    width: 'auto',
    height: '32'
  },
  ageVerification: {
    url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/logos/Logo%20Kushie%20(W-SVG).svg',
    alt: 'Brand',
    width: 'auto',
    height: '48'
  },
  adminDashboard: {
    url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/logos/Logo%20Kushie%20(W-SVG).svg',
    alt: 'Brand Admin',
    width: 'auto',
    height: '40'
  }
};

export const LogosProvider = ({ children }) => {
  const [logos, setLogos] = useState(defaultLogos);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load logos from Firebase
  useEffect(() => {
    const logosRef = ref(realtimeDb, 'siteLogos');
    
    const unsubscribe = onValue(logosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLogos(data);
      } else {
        // If no logos exist, populate with defaults
        set(logosRef, defaultLogos);
      }
      setLoading(false);
    }, (error) => {
      console.error('Firebase logos listener error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update specific logo
  const updateLogo = async (logoType, logoData) => {
    setSaving(true);
    try {
      const updates = {
        ...logos,
        [logoType]: {
          ...logos[logoType],
          ...logoData
        }
      };
      
      await set(ref(realtimeDb, 'siteLogos'), updates);
      setLogos(updates);
      return true;
    } catch (error) {
      console.error('Error updating logo:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Update all logos
  const updateAllLogos = async (newLogos) => {
    setSaving(true);
    try {
      await set(ref(realtimeDb, 'siteLogos'), newLogos);
      setLogos(newLogos);
      return true;
    } catch (error) {
      console.error('Error updating logos:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults
  const resetToDefaults = async () => {
    setSaving(true);
    try {
      await set(ref(realtimeDb, 'siteLogos'), defaultLogos);
      setLogos(defaultLogos);
      return true;
    } catch (error) {
      console.error('Error resetting logos:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const value = {
    logos,
    loading,
    saving,
    updateLogo,
    updateAllLogos,
    resetToDefaults,
    defaultLogos
  };

  return (
    <LogosContext.Provider value={value}>
      {children}
    </LogosContext.Provider>
  );
};

export default LogosContext;