"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { siteConfig } from "@/config/site.config";
import { getTenantSettings } from "@/config/getTenantSettings";

const icons = {
  shield_check: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  home: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  plane: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
} as const;

export function VideoSection() {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const t = getTenantSettings();
  const video = t.home.video;
  const markers = video.markers.filter((m) => m.enabled);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <section className="py-20 md:py-32 bg-dark relative overflow-hidden">

      {/* Déco */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">

        {/* En-tête */}
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-5">
            {video.eyebrow}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            {video.titlePrefix} <span className="text-gradient">{siteConfig.commercialName}</span>
          </h2>
          <p className="text-gray-400 text-base max-w-md mx-auto">
            {video.description}
          </p>
        </div>

        {/* Player vidéo */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-glow-lg group">

          {!playing && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 cursor-pointer" onClick={handlePlay}>
              <Image
                src={video.posterSrc}
                alt={`Vidéo ${siteConfig.commercialName}`}
                fill
                className="object-cover opacity-60"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              <button
                onClick={handlePlay}
                className="relative z-20 w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary shadow-glow-lg flex items-center justify-center hover:scale-110 transition-transform duration-300 animate-glow-pulse"
                aria-label="Lancer la vidéo"
              >
                <svg className="w-8 h-8 md:w-10 md:h-10 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>

              <div className="absolute bottom-6 left-6 right-6 text-center z-20">
                <p className="text-white font-bold text-lg md:text-xl">Vidéo de présentation</p>
                <p className="text-gray-300 text-sm mt-1">Service VTC premium en Normandie</p>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            controls={playing}
            className="w-full aspect-video bg-black"
            poster={video.posterSrc}
            onPause={() => setPlaying(false)}
          >
            <source src={video.videoSrc} type="video/mp4" />
            <source src={video.videoSrc} type="video/x-matroska" />
            <p className="text-gray-400 p-4">
              Votre navigateur ne supporte pas la lecture vidéo.{" "}
              <a href={video.videoSrc} download className="text-primary underline">
                Télécharger la vidéo
              </a>
            </p>
          </video>
        </div>

        {/* Marqueurs — SVG monochrome, style VTC */}
        <div className="grid grid-cols-3 gap-3 mt-8">
          {markers.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2.5 p-4 md:p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] group hover:border-primary/25 hover:bg-white/[0.04] transition-all duration-200"
            >
              <span className="text-primary group-hover:scale-110 transition-transform duration-200">
                {icons[item.iconKey as keyof typeof icons]}
              </span>
              <div className="text-center">
                <p className="text-white text-xs font-bold leading-tight">{item.label}</p>
                <p className="text-gray-600 text-[10px] mt-0.5 hidden sm:block">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
