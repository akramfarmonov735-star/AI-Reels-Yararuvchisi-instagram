
import React, { useState, useRef, useEffect } from 'react';
import { decodeAndGetAudioBuffer } from '../utils/audioUtils';
import { IconComponents } from './IconComponents';

interface ReelPreviewProps {
  imageUrl: string;
  audioB64: string;
}

export const ReelPreview: React.FC<ReelPreviewProps> = ({ imageUrl, audioB64 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const setupAudio = async () => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                gainNodeRef.current = audioContextRef.current.createGain();
                gainNodeRef.current.connect(audioContextRef.current.destination);
            }
            const { buffer, duration: audioDuration } = await decodeAndGetAudioBuffer(audioB64, audioContextRef.current);
            audioBufferRef.current = buffer;
            setDuration(audioDuration);
            setIsReady(true);
        } catch (error) {
            console.error("Failed to decode audio:", error);
            setIsReady(false);
        }
    };
    setupAudio();

    return () => {
        audioSourceRef.current?.stop();
        audioSourceRef.current?.disconnect();
        // Do not close audio context, it can be reused
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioB64]);
  
  const playAudio = () => {
    if (!audioContextRef.current || !audioBufferRef.current || !gainNodeRef.current) return;
    
    if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }
    
    // Stop any existing source
    if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
    }
    
    audioSourceRef.current = audioContextRef.current.createBufferSource();
    audioSourceRef.current.buffer = audioBufferRef.current;
    audioSourceRef.current.connect(gainNodeRef.current);
    audioSourceRef.current.start(0);

    audioSourceRef.current.onended = () => {
        setIsPlaying(false);
        if (imageRef.current) {
            imageRef.current.classList.remove('animate-ken-burns');
        }
    };
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      audioSourceRef.current?.stop();
      setIsPlaying(false);
      if (imageRef.current) {
        imageRef.current.classList.remove('animate-ken-burns');
      }
    } else {
        if (!isReady) return;
        playAudio();
        setIsPlaying(true);
        if (imageRef.current) {
            // Restart animation
            imageRef.current.classList.remove('animate-ken-burns');
            void imageRef.current.offsetWidth; // Trigger reflow
            imageRef.current.classList.add('animate-ken-burns');
        }
    }
  };

  const handleMuteToggle = () => {
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = isMuted ? 1 : 0;
        setIsMuted(!isMuted);
      }
  };

  return (
    <div className="aspect-[9/16] w-full max-w-[300px] mx-auto bg-black rounded-3xl shadow-2xl overflow-hidden relative border-4 border-slate-700">
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Generated content"
        className="w-full h-full object-cover"
        style={{ '--animation-duration': `${duration}s` } as React.CSSProperties}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <IconComponents.LoaderIcon className="w-10 h-10 text-white animate-spin" />
        </div>
      )}

      {isReady && (
         <div className="absolute inset-0 flex items-center justify-center">
            <button
                onClick={handlePlayPause}
                className="w-20 h-20 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label={isPlaying ? "Pauza" : "Ijro etish"}
            >
                {isPlaying ? <IconComponents.PauseIcon className="w-12 h-12" /> : <IconComponents.PlayIcon className="w-12 h-12 pl-1" />}
            </button>
        </div>
      )}

      <div className="absolute bottom-4 right-4">
        <button 
            onClick={handleMuteToggle}
            className="w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label={isMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
        >
            {isMuted ? <IconComponents.MutedIcon className="w-6 h-6" /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>}
        </button>
      </div>

    </div>
  );
};