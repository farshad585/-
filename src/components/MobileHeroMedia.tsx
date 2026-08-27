import { useEffect, useRef, useState } from 'react';

interface MobileHeroMediaProps {
  imageSrc: string;
  videoSrc: string;
  alt: string;
}

export default function MobileHeroMedia({ imageSrc, videoSrc, alt }: MobileHeroMediaProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const videoElement = videoRef.current;

    // Preload and prepare video
    if (videoElement) {
      videoElement.muted = true;
      videoElement.defaultMuted = true;
      videoElement.playsInline = true;
      videoElement.setAttribute('playsinline', '');
      videoElement.setAttribute('webkit-playsinline', '');
    }

    // Exact 3-second delay with zero animation/movement
    const timer = setTimeout(() => {
      if (!isMounted || !videoElement) return;

      try {
        videoElement.currentTime = 0;
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (isMounted) {
                setIsVideoPlaying(true);
              }
            })
            .catch((err) => {
              console.warn('Hero mobile video autoplay was prevented or delayed:', err);
              // Fallback: static image remains visible seamlessly
              if (isMounted) {
                setIsVideoPlaying(false);
              }
            });
        }
      } catch (err) {
        console.warn('Error starting hero video:', err);
        if (isMounted) {
          setIsVideoPlaying(false);
        }
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (videoElement) {
        videoElement.pause();
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
      {/* 1. Static Initial Hero Image (Visible immediately, fallback if video fails) */}
      <img
        src={imageSrc}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover object-right opacity-95"
        loading="eager"
        fetchPriority="high"
        width={941}
        height={1672}
      />

      {/* 2. Seamless Dancing Character Video (Starts smoothly after 3 seconds, loops seamlessly) */}
      <video
        ref={videoRef}
        src={videoSrc}
        poster={imageSrc}
        muted
        playsInline
        loop
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        className={`absolute inset-0 w-full h-full object-cover object-right transition-opacity duration-700 ease-in-out ${
          isVideoPlaying ? 'opacity-95' : 'opacity-0'
        }`}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
