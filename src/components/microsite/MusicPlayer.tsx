'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

export function MusicPlayer({ url, category }: { url: string; category?: string }) {
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
