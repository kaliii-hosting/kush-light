import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, onValue, set, push, remove } from 'firebase/database';
import { realtimeDb } from '../config/firebase';

const MusicContext = createContext();

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

export const MusicProvider = ({ children }) => {
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load tracks from Firebase
  useEffect(() => {
    const tracksRef = ref(realtimeDb, 'musicTracks');
    
    const unsubscribe = onValue(tracksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const tracksArray = Object.entries(data).map(([id, track]) => ({
          id,
          ...track
        }));
        setTracks(tracksArray);
        
        // Set first track as current if none selected
        if (!currentTrack && tracksArray.length > 0) {
          setCurrentTrack(tracksArray[0]);
        }
      } else {
        setTracks([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentTrack]);

  // Add new track
  const addTrack = async (trackData) => {
    try {
      const tracksRef = ref(realtimeDb, 'musicTracks');
      await push(tracksRef, {
        ...trackData,
        createdAt: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Error adding track:', error);
      return false;
    }
  };

  // Update track
  const updateTrack = async (trackId, updates) => {
    try {
      const trackRef = ref(realtimeDb, `musicTracks/${trackId}`);
      await set(trackRef, {
        ...tracks.find(t => t.id === trackId),
        ...updates,
        updatedAt: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating track:', error);
      return false;
    }
  };

  // Delete track
  const deleteTrack = async (trackId) => {
    try {
      const trackRef = ref(realtimeDb, `musicTracks/${trackId}`);
      await remove(trackRef);
      
      // If deleted track was current, select next
      if (currentTrack?.id === trackId) {
        const index = tracks.findIndex(t => t.id === trackId);
        if (tracks.length > 1) {
          setCurrentTrack(tracks[index + 1] || tracks[0]);
        } else {
          setCurrentTrack(null);
        }
      }
      return true;
    } catch (error) {
      console.error('Error deleting track:', error);
      return false;
    }
  };

  // Player controls
  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const pauseTrack = () => {
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (!currentTrack || tracks.length === 0) return;
    
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentTrack(tracks[nextIndex]);
  };

  const previousTrack = () => {
    if (!currentTrack || tracks.length === 0) return;
    
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    setCurrentTrack(tracks[prevIndex]);
  };

  const value = {
    tracks,
    currentTrack,
    isPlaying,
    loading,
    addTrack,
    updateTrack,
    deleteTrack,
    playTrack,
    pauseTrack,
    togglePlayPause,
    nextTrack,
    previousTrack
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
};