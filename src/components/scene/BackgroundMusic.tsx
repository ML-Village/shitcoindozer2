import React, { useRef, useEffect, useState } from 'react';

interface BackgroundMusicProps {
  src: string;
}

const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.2; // Set initial volume
      audio.loop = true; // Make the audio loop
    }
  }, []);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div>
      <audio ref={audioRef} src={src} />
      <button
        className={`${isPlaying ? 'bg-[#ff4444]' : 'bg-[#4CAF50]/80'}`}
        onClick={toggleMusic}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 11,
          padding: '8px 12px',
          fontSize: '14px',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        {isPlaying ? 'Pause Music' : 'Play Music'}
      </button>
    </div>
  );
};

export default BackgroundMusic;