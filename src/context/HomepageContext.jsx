import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { realtimeDb } from '../config/firebase';

const HomepageContext = createContext();

export const useHomepage = () => {
  const context = useContext(HomepageContext);
  if (!context) {
    throw new Error('useHomepage must be used within a HomepageProvider');
  }
  return context;
};

export const HomepageProvider = ({ children }) => {
  const [homepageContent, setHomepageContent] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to homepage content from Firebase
    const homepageRef = ref(realtimeDb, 'homepage');
    
    const unsubscribe = onValue(homepageRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setHomepageContent(data);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching homepage content:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    homepageContent,
    loading
  };

  return (
    <HomepageContext.Provider value={value}>
      {children}
    </HomepageContext.Provider>
  );
};

export default HomepageContext;