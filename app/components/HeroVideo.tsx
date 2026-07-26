"use client";

import { useEffect, useRef } from "react";

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const setSpeed = () => {
      video.defaultPlaybackRate = 1.5;
      video.playbackRate = 1.5;
    };

    setSpeed();
    video.addEventListener("loadedmetadata", setSpeed);
    return () => video.removeEventListener("loadedmetadata", setSpeed);
  }, []);

  return (
    <video
      ref={videoRef}
      className="home-hero-mobile-video"
      src="/assets/hero/tact-current-mobile.mp4"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-label="TACT Lifestyle current mobile campaign"
    />
  );
}
