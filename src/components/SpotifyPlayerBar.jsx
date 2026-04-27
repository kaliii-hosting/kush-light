import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, ListMusic, Volume2, VolumeX, Maximize2, Music } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

const SpotifyPlayerBar = () => {
  const { tracks, currentTrack, isPlaying, playTrack, pauseTrack, togglePlayPause, nextTrack, previousTrack } = useMusic();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [previousVolume, setPreviousVolume] = useState(0.75);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const audioRef = useRef(new Audio());

  // Handle audio playback
  useEffect(() => {
    const audio = audioRef.current;

    if (currentTrack?.audioUrl) {
      // Load new track
      audio.src = currentTrack.audioUrl;
      audio.volume = volume;
      
      if (isPlaying) {
        audio.play().catch(e => console.error('Error playing audio:', e));
      }
    }

    return () => {
      audio.pause();
    };
  }, [currentTrack]);

  // Handle play/pause state
  useEffect(() => {
    const audio = audioRef.current;
    
    if (isPlaying && currentTrack) {
      audio.play().catch(e => console.error('Error playing audio:', e));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  // Update time and duration
  useEffect(() => {
    const audio = audioRef.current;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        handleNext();
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isRepeat]);

  // Volume control
  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  // Format time
  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle seek
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    setVolume(percentage);
  };

  // Toggle mute
  const toggleMute = () => {
    if (volume > 0) {
      setPreviousVolume(volume);
      setVolume(0);
    } else {
      setVolume(previousVolume);
    }
  };

  // Handle next with shuffle
  const handleNext = () => {
    if (isShuffle && tracks.length > 1) {
      const availableTracks = tracks.filter(t => t.id !== currentTrack?.id);
      const randomIndex = Math.floor(Math.random() * availableTracks.length);
      playTrack(availableTracks[randomIndex]);
    } else {
      nextTrack();
    }
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };


  return (
    <>
      <div className="bg-gray-darkest border-t border-border px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between fixed bottom-0 left-0 right-0 z-[60]">
      {/* Left section - Current track */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        {currentTrack ? (
          <>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-dark rounded-md overflow-hidden flex-shrink-0">
              {currentTrack.coverUrl || currentTrack.thumbnail || currentTrack.albumArt ? (
                <MediaPlaceholder kind="image" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="h-5 w-5 sm:h-6 sm:w-6 text-text-secondary" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[120px] md:max-w-[200px]">{currentTrack.title}</div>
              <div className="text-text-secondary text-xs truncate max-w-[100px] sm:max-w-[120px] md:max-w-[200px]">{currentTrack.artist}</div>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-dark rounded-md flex items-center justify-center flex-shrink-0">
              <Music className="h-5 w-5 sm:h-6 sm:w-6 text-text-secondary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white text-xs sm:text-sm">No track selected</div>
              <div className="text-text-secondary text-xs">Add tracks from admin</div>
            </div>
          </>
        )}
      </div>

      {/* Center section - Player controls */}
      <div className="flex flex-col items-center gap-1 sm:gap-2 flex-1 max-w-[400px] sm:max-w-[722px]">
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setIsShuffle(!isShuffle)}
            className={`${isShuffle ? 'text-primary' : 'text-text-secondary'} hover:text-white transition-colors`}
          >
            <Shuffle className="h-4 w-4" />
          </button>
          <button 
            onClick={previousTrack}
            disabled={!currentTrack}
            className="text-text-secondary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button 
            onClick={togglePlayPause}
            disabled={!currentTrack}
            className="bg-primary rounded-full p-1.5 sm:p-2 hover:bg-primary-hover hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlaying ? (
              <Pause className="h-3 w-3 sm:h-4 sm:w-4 text-white fill-white" />
            ) : (
              <Play className="h-3 w-3 sm:h-4 sm:w-4 text-white fill-white ml-0.5" />
            )}
          </button>
          <button 
            onClick={handleNext}
            disabled={!currentTrack}
            className="text-text-secondary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button 
            onClick={() => setIsRepeat(!isRepeat)}
            className={`${isRepeat ? 'text-primary' : 'text-text-secondary'} hover:text-white transition-colors`}
          >
            <Repeat className="h-4 w-4" />
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="flex items-center gap-1 sm:gap-2 w-full">
          <span className="text-text-secondary text-xs">{formatTime(currentTime)}</span>
          <div 
            onClick={handleSeek}
            className="flex-1 bg-gray-light rounded-full h-1 relative group cursor-pointer"
          >
            <div 
              className="absolute left-0 top-0 h-full bg-white rounded-full group-hover:bg-primary transition-colors"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            ></div>
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            ></div>
          </div>
          <span className="text-text-secondary text-xs">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right section - Volume and other controls */}
      <div className="flex items-center gap-1 sm:gap-3 flex-1 justify-end">
        <button 
          onClick={() => setShowQueue(!showQueue)}
          className={`${showQueue ? 'text-primary' : 'text-spotify-text-subdued'} hover:text-white transition-colors`}
          title="Show queue"
        >
          <ListMusic className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            onClick={toggleMute}
            className="text-text-secondary hover:text-white transition-colors"
          >
            {volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <div 
            onClick={handleVolumeChange}
            className="w-12 sm:w-24 bg-gray-light rounded-full h-1 relative group cursor-pointer"
          >
            <div 
              className="absolute left-0 top-0 h-full bg-white rounded-full group-hover:bg-primary transition-colors"
              style={{ width: `${volume * 100}%` }}
            ></div>
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${volume * 100}%` }}
            ></div>
          </div>
        </div>
        <button 
          onClick={toggleFullscreen}
          className={`${isFullscreen ? 'text-primary' : 'text-spotify-text-subdued'} hover:text-white transition-colors`}
          title="Fullscreen"
          disabled={!currentTrack}
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
    </div>

    {/* Queue Panel */}
    {showQueue && (
      <div className="fixed bottom-24 right-4 bg-gray-darkest border border-border rounded-lg p-4 w-80 max-h-96 overflow-y-auto z-[65] shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Queue</h3>
          <button 
            onClick={() => setShowQueue(false)}
            className="text-text-secondary hover:text-white"
          >
            ×
          </button>
        </div>
        {tracks.length > 0 ? (
          <div className="space-y-2">
            {tracks.map((track) => (
              <div 
                key={track.id}
                onClick={() => playTrack(track)}
                className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                  currentTrack?.id === track.id 
                    ? 'bg-gray-light' 
                    : 'hover:bg-gray-dark'
                }`}
              >
                <div className="w-10 h-10 bg-gray-dark rounded overflow-hidden flex-shrink-0">
                  {track.coverUrl || track.thumbnail || track.albumArt ? (
                    <MediaPlaceholder kind="image" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="h-4 w-4 text-text-secondary" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm truncate">{track.title}</div>
                  <div className="text-text-secondary text-xs truncate">{track.artist}</div>
                </div>
                {currentTrack?.id === track.id && isPlaying && (
                  <div className="text-primary">
                    <Volume2 className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-sm text-center py-8">
            No tracks in queue. Add tracks from admin panel.
          </p>
        )}
      </div>
    )}


    {/* Fullscreen Player */}
    {isFullscreen && currentTrack && (
      <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
        <button 
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 text-white hover:text-primary transition-colors p-2"
        >
          <Maximize2 className="h-6 w-6" />
        </button>
        
        <div className="text-center max-w-2xl mx-auto p-8">
          <div className="w-80 h-80 mx-auto mb-8 bg-gray-dark rounded-lg overflow-hidden">
            {currentTrack.coverUrl || currentTrack.thumbnail || currentTrack.albumArt ? (
              <MediaPlaceholder kind="image" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="h-32 w-32 text-text-secondary" />
              </div>
            )}
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2">{currentTrack.title}</h1>
          <p className="text-2xl text-text-secondary mb-8">{currentTrack.artist}</p>
          
          <div className="flex items-center justify-center gap-6 mb-8">
            <button 
              onClick={() => setIsShuffle(!isShuffle)}
              className={`${isShuffle ? 'text-primary' : 'text-text-secondary'} hover:text-white transition-colors`}
            >
              <Shuffle className="h-6 w-6" />
            </button>
            <button 
              onClick={previousTrack}
              disabled={!currentTrack}
              className="text-text-secondary hover:text-white transition-colors disabled:opacity-50"
            >
              <SkipBack className="h-8 w-8" />
            </button>
            <button 
              onClick={togglePlayPause}
              className="bg-primary rounded-full p-4 hover:bg-primary-hover hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="h-8 w-8 text-white fill-white" />
              ) : (
                <Play className="h-8 w-8 text-white fill-white ml-1" />
              )}
            </button>
            <button 
              onClick={handleNext}
              disabled={!currentTrack}
              className="text-text-secondary hover:text-white transition-colors disabled:opacity-50"
            >
              <SkipForward className="h-8 w-8" />
            </button>
            <button 
              onClick={() => setIsRepeat(!isRepeat)}
              className={`${isRepeat ? 'text-primary' : 'text-text-secondary'} hover:text-white transition-colors`}
            >
              <Repeat className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex items-center gap-4 max-w-md mx-auto">
            <span className="text-text-secondary text-sm">{formatTime(currentTime)}</span>
            <div 
              onClick={handleSeek}
              className="flex-1 bg-gray-light rounded-full h-2 relative group cursor-pointer"
            >
              <div 
                className="absolute left-0 top-0 h-full bg-white rounded-full group-hover:bg-primary transition-colors"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              ></div>
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              ></div>
            </div>
            <span className="text-text-secondary text-sm">{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default SpotifyPlayerBar;