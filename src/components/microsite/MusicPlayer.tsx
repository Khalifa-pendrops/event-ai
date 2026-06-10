'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

export function MusicPlayer({ 
  url, 
  category, 
  autoPlay = false, 
  compact = false 
}: { 
  url: string; 
  category?: string; 
  autoPlay?: boolean; 
  compact?: boolean; 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Autoplay for background music in invitations
  useEffect(() => {
    if (!autoPlay || !audioRef.current) return;

    const audio = audioRef.current;

    // Start unmuted if possible
    audio.muted = false;
    audio.volume = volume;

    const attemptPlay = () => {
      audio.play()
        .then(() => {
          setIsPlaying(true);
          setIsMuted(false);
        })
        .catch(() => {
          // Browser blocked unmuted autoplay - start muted so it plays silently
          audio.muted = true;
          audio.play()
            .then(() => {
              setIsPlaying(true);
              setIsMuted(true);
            })
            .catch(() => {});
        });
    };

    // Small delay to ensure DOM ready
    const timer = setTimeout(attemptPlay, 300);

    return () => clearTimeout(timer);
  }, [autoPlay, url]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    if (v > 0 && isMuted) setIsMuted(false);
  };

  const handleToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isPlaying) {
      // Start playing (and ensure unmuted)
      audio.play().catch(() => {});
      setIsPlaying(true);
      audio.muted = false;
      setIsMuted(false);
    } else if (isMuted) {
      // Unmute while continuing to play
      audio.muted = false;
      setIsMuted(false);
    } else {
      // Mute (keep "playing" in background so it resumes sound when unmuted)
      audio.muted = true;
      setIsMuted(true);
    }
  };

  if (compact) {
    // Minimal hidden player for public invitations: small elegant icon only.
    // Autoplays by default (unmuted if browser allows). Guest sees the subtle control.
    return (
      <button
        onClick={handleToggle}
        className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#111]/80 text-[#C5A26F] backdrop-blur transition-all hover:bg-[#111] hover:text-white ${isPlaying ? 'animate-pulse' : ''}`}
        title={isPlaying ? (isMuted ? 'Unmute music' : 'Pause music') : 'Play music'}
        aria-label="Music control"
      >
        {isPlaying && !isMuted ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4" />
        )}
        <audio ref={audioRef} src={url} loop />
      </button>
    );
  }

  // Full player for wizard preview
  return (
    <div className="flex items-center gap-3 rounded-full bg-[#111] border border-white/10 px-4 py-2 text-sm">
      <button onClick={togglePlay} className="text-[#C5A26F] hover:text-white">
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <div className="flex-1 min-w-[120px]">
        <div className="text-[#f5f0e6]/70 text-xs truncate">{category || 'Background Music'}</div>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.05" 
          value={volume} 
          onChange={handleVolume} 
          className="w-full accent-[#C5A26F]" 
        />
      </div>
      <button onClick={toggleMute} className="text-[#C5A26F] hover:text-white">
        {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
      <audio ref={audioRef} src={url} loop />
    </div>
  );
}
