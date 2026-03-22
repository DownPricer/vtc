"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const songs = [
  { file: "_LA DANSE DES VOYANTS_.mp3",                                          title: "La Danse des Voyants" },
  { file: "ALLO PAPA NOËL (REMPLIS MON AGENDA)_ .mp3",                          title: "Allo Papa Noël" },
  { file: "BLEU LUMIÈRE (L'ALLERGIE AUX KÉPIS)_.mp3",                           title: "Bleu Lumière" },
  { file: "CAP SUR 2026 (L'ANNÉE LUMIÈRE)_.mp3",                                title: "Cap sur 2026" },
  { file: "CODE PILOTE (Y.G. VTC) RP.mp3",                                      title: "Code Pilote" },
  { file: "DOUCEMENT LES BASSES (GARDE TES POINTS)_ (reggae).mp3",              title: "Doucement les Basses" },
  { file: "ENTREPRENEUR.mp3",                                                    title: "L'Entrepreneur" },
  { file: "FAUT PAS ME CHAUFFER (L'ÉNERVÉ DU BITUME)_.mp3",                    title: "Faut pas me Chauffer" },
  { file: "LA FAUNE DU SIÈGE ARRIÈRE_.mp3",                                     title: "La Faune du Siège Arrière" },
  { file: "LA LÉGENDE DE L'ESPACE (L'ODYSSÉE D'IGREK G)_RP .mp3",              title: "La Légende de l'Espace" },
  { file: "LA SAGA DE YOHAN (ROOTS & BITUME)_.mp3",                             title: "La Saga de Yoann" },
  { file: "L'ASPHALTE ET MOI.mp3",                                               title: "L'Asphalte et Moi" },
  { file: "L'ASPHALTE ET TON OMBRE (CHRISTELLE)_ .mp3",                         title: "L'Asphalte et ton Ombre" },
  { file: "L'AVANCE SUR LE TEMPS (CHUCK YOHAN) RP_.mp3",                        title: "L'Avance sur le Temps" },
  { file: "LE COMPTEUR A ZERO.mp3",                                              title: "Le Compteur à Zéro" },
  { file: "LE DOJO DU BITUME (IPPON SUR LA FATIGUE)_.mp3",                      title: "Le Dojo du Bitume" },
  { file: "LE DOS EN VRAC (ET LES YEUX CERNÉS)_.mp3",                           title: "Le Dos en Vrac" },
  { file: "LE JACKPOT (C'EST POUR PAPA) RP_.mp3",                               title: "Le Jackpot" },
  { file: "LE MACHISTADOR DU BITUME (Y.G. VTC) RP.mp3",                         title: "Le Machistador" },
  { file: "LE MAÎTRE DU JEU (SCRATCH THE ROAD) (1).mp3",                        title: "Le Maître du Jeu" },
  { file: "LE NOUVEAU YOHAN (ZEN, SOYONS ZEN)_.mp3",                            title: "Le Nouveau Yoann" },
  { file: "LE SMILE AU VOLANT RP.mp3",                                           title: "Le Smile au Volant" },
  { file: "LE TETRIS (MISSION BAGAGES).mp3",                                     title: "Le Tetris" },
  { file: "L'EFFET YO-HANN (BIENVENUE AU CLUB)_.mp3",                           title: "L'Effet Yoann" },
  { file: "LES CHEVEUX D'ARGENT (COMME MES PROPRES AÏEUX)_.mp3",                title: "Les Cheveux d'Argent" },
  { file: "L'HOMME DANS LE RÉTRO (MON EMPIRE À 4 ROUES)_RP.mp3",               title: "L'Homme dans le Rétro" },
  { file: "L'INSTINCT SAUVAGE (LE ZOO SUR LA ROUTE)_.mp3",                      title: "L'Instinct Sauvage" },
  { file: "L'ORFÈVRE DU VOLANT (MAÎTRE À BORD)_.mp3",                           title: "L'Orfèvre du Volant" },
  { file: "MARCHE PAS SUR MES TAPIS_.mp3",                                       title: "Marche pas sur mes Tapis" },
  { file: "MISSION COMMANDO (TERMINUS ROISSY)_.mp3",                             title: "Mission Commando" },
  { file: "MON JEU, MA RÈGLE (ALL IN) RP_.mp3",                                 title: "Mon Jeu, Ma Règle" },
  { file: "PLUS FORT QUE LA MÉCANIQUE (CHRISTELLE)_.mp3",                       title: "Plus fort que la Mécanique" },
  { file: "ROAD RAGE (THE CLASH) (1).mp3",                                       title: "Road Rage" },
];

function fmt(s: number) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? "0" : ""}${sec}`;
}

function EqBars({ active }: { active: boolean }) {
  return (
    <span className="flex items-end gap-[2px] h-3">
      {[3, 5, 4, 6, 3].map((h, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-sm transition-all ${active ? "bg-green-400 animate-pulse" : "bg-gray-700"}`}
          style={{
            height: active ? `${h * 2}px` : "3px",
            animationDelay: `${i * 0.1}s`,
            animationDuration: "0.7s",
          }}
        />
      ))}
    </span>
  );
}

export function RadioSection() {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [showList, setShowList] = useState(false);
  const [started, setStarted] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const loadTrack = useCallback((i: number, autoplay = false) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = `/radio/music/${encodeURIComponent(songs[i].file)}`;
    audio.load();
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    if (autoplay) audio.play().catch(() => {});
  }, []);

  const nextTrack = useCallback((auto = false) => {
    setIdx((prev) => {
      const next = shuffle
        ? Math.floor(Math.random() * songs.length)
        : (prev + 1) % songs.length;
      loadTrack(next, auto || playing);
      return next;
    });
  }, [shuffle, playing, loadTrack]);

  const prevTrack = useCallback(() => {
    setIdx((prev) => {
      const p = (prev - 1 + songs.length) % songs.length;
      loadTrack(p, playing);
      return p;
    });
  }, [playing, loadTrack]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!started) {
      setStarted(true);
      loadTrack(idx, true);
      setPlaying(true);
      return;
    }
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => {});
      setPlaying(true);
    }
  }, [started, playing, idx, loadTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onEnded = () => nextTrack(true);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [nextTrack]);

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = progressRef.current!.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
  };

  const selectSong = (i: number) => {
    setIdx(i);
    setStarted(true);
    loadTrack(i, true);
    setPlaying(true);
    setShowList(false);
  };

  const freq = (88.1 + (idx * 0.4)).toFixed(1);

  return (
    <section id="radio" className="relative py-14 md:py-20 overflow-hidden scroll-mt-24 md:scroll-mt-28">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-medium to-dark" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-5">

        {/* Section header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold tracking-[0.25em] uppercase text-primary mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Radio YG VTC
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            La Station <span className="text-primary">du Bitume</span>
          </h2>
          <div
            className="max-w-md mx-auto rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-3 text-left"
            role="note"
            aria-label="À propos des titres"
          >
            <p className="text-[11px] leading-relaxed text-gray-300">
              <span className="font-semibold text-primary/95">À savoir :</span> les morceaux diffusés ici sont des
              créations originales au ton <strong className="text-gray-200 font-medium">humoristique</strong> — elles
              jouent avec les situations du quotidien et l&apos;univers du chauffeur, sans jamais se prendre au sérieux.
            </p>
          </div>
        </div>

        {/* ════════════ AUTORADIO ════════════ */}
        <div className="relative">

          {/* Outer chrome bezel */}
          <div
            className="rounded-2xl p-[2px]"
            style={{
              background: "linear-gradient(180deg, #555 0%, #222 40%, #333 60%, #111 100%)",
            }}
          >
            {/* Inner body */}
            <div
              className="rounded-[14px] overflow-hidden"
              style={{
                background: "linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)",
              }}
            >

              {/* ── Top bar: brand + frequency ── */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-primary" />
                  <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">YG · VTC</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-primary text-xs font-bold tracking-wider">{freq} FM</span>
                  <EqBars active={playing} />
                </div>
              </div>

              {/* ── LED display ── */}
              <div
                className="mx-4 mt-4 rounded-lg p-4 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #0a0f05 0%, #0d1208 50%, #080c04 100%)",
                  border: "1px solid rgba(50,70,30,0.3)",
                  boxShadow: playing
                    ? "inset 0 0 30px rgba(80,200,50,0.08), 0 0 15px rgba(80,200,50,0.05)"
                    : "inset 0 0 20px rgba(0,0,0,0.5)",
                }}
              >
                {/* Scanlines */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.03]"
                  style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 3px)",
                  }}
                />

                {/* Track number + total */}
                <div className="flex items-baseline justify-between mb-1 relative z-10">
                  <span
                    className="font-mono text-[10px] tracking-wider"
                    style={{ color: playing ? "#6fca3a" : "#3a5020" }}
                  >
                    TRACK {String(idx + 1).padStart(2, "0")} / {String(songs.length).padStart(2, "0")}
                  </span>
                  <span
                    className="font-mono text-[10px]"
                    style={{ color: playing ? "#6fca3a" : "#3a5020" }}
                  >
                    {shuffle ? "RND" : "SEQ"}
                  </span>
                </div>

                {/* Track title — scrolling feel */}
                <p
                  className="font-mono text-sm font-bold truncate mb-2 relative z-10 transition-colors duration-500"
                  style={{ color: playing ? "#8dff40" : "#4a6a28" }}
                >
                  {songs[idx].title}
                </p>

                {/* Time display */}
                <div className="flex items-center justify-between relative z-10">
                  <span
                    className="font-mono text-lg font-black tracking-wider"
                    style={{ color: playing ? "#8dff40" : "#4a6a28" }}
                  >
                    {fmt(currentTime)}
                  </span>
                  <span
                    className="font-mono text-xs"
                    style={{ color: playing ? "#5a9030" : "#2a3a18" }}
                  >
                    {duration > 0 ? fmt(duration) : "--:--"}
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  ref={progressRef}
                  onClick={seekTo}
                  className="mt-3 h-1 w-full rounded-full cursor-pointer relative z-10"
                  style={{ background: "rgba(80,120,40,0.15)" }}
                >
                  <div
                    className="h-full rounded-full transition-none"
                    style={{
                      width: `${progress}%`,
                      background: playing
                        ? "linear-gradient(90deg, #5a9030, #8dff40)"
                        : "#3a5020",
                    }}
                  />
                </div>
              </div>

              {/* ── Controls ── */}
              <div className="px-4 py-4 flex items-center justify-between">

                {/* Left: shuffle */}
                <button
                  onClick={() => setShuffle(s => !s)}
                  className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-90"
                  style={{
                    background: shuffle
                      ? "linear-gradient(180deg, #2a2a2a, #1a1a1a)"
                      : "linear-gradient(180deg, #222, #151515)",
                    boxShadow: shuffle
                      ? "inset 0 1px 0 rgba(255,133,51,0.2), 0 1px 3px rgba(0,0,0,0.5)"
                      : "inset 0 1px 0 rgba(255,255,255,0.05), 0 1px 3px rgba(0,0,0,0.5)",
                    border: `1px solid ${shuffle ? "rgba(255,133,51,0.3)" : "rgba(255,255,255,0.06)"}`,
                  }}
                  title="Aléatoire"
                >
                  <svg className={`w-3.5 h-3.5 ${shuffle ? "text-primary" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h7M4 19h7M16 3l4 4-4 4M20 7h-4a4 4 0 00-4 4M16 21l4-4-4-4M20 17h-4a4 4 0 01-4-4" />
                  </svg>
                </button>

                {/* Center: prev / play / next */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevTrack}
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all active:scale-90"
                    style={{
                      background: "linear-gradient(180deg, #252525, #161616)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 2px 4px rgba(0,0,0,0.5)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                    </svg>
                  </button>

                  {/* Main play button */}
                  <button
                    onClick={togglePlay}
                    className="w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 relative overflow-hidden"
                    style={{
                      background: "linear-gradient(180deg, #FF9544, #E07020)",
                      boxShadow: playing
                        ? "0 0 20px rgba(255,133,51,0.4), inset 0 1px 0 rgba(255,255,255,0.25)"
                        : "0 0 10px rgba(255,133,51,0.2), inset 0 1px 0 rgba(255,255,255,0.2)",
                      border: "1px solid rgba(255,180,100,0.3)",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-full" />
                    {playing ? (
                      <svg className="w-6 h-6 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-white relative z-10 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => nextTrack(false)}
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all active:scale-90"
                    style={{
                      background: "linear-gradient(180deg, #252525, #161616)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 2px 4px rgba(0,0,0,0.5)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/>
                    </svg>
                  </button>
                </div>

                {/* Right: playlist */}
                <button
                  onClick={() => setShowList(s => !s)}
                  className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-90"
                  style={{
                    background: showList
                      ? "linear-gradient(180deg, #2a2a2a, #1a1a1a)"
                      : "linear-gradient(180deg, #222, #151515)",
                    boxShadow: showList
                      ? "inset 0 1px 0 rgba(255,133,51,0.2), 0 1px 3px rgba(0,0,0,0.5)"
                      : "inset 0 1px 0 rgba(255,255,255,0.05), 0 1px 3px rgba(0,0,0,0.5)",
                    border: `1px solid ${showList ? "rgba(255,133,51,0.3)" : "rgba(255,255,255,0.06)"}`,
                  }}
                  title={`${songs.length} titres`}
                >
                  <svg className={`w-3.5 h-3.5 ${showList ? "text-primary" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* ── Speaker grille ── */}
              <div className="px-4 pb-3">
                <div
                  className="h-4 rounded-md"
                  style={{
                    background: "linear-gradient(180deg, #0f0f0f, #141414)",
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
                    backgroundSize: "6px 6px",
                    border: "1px solid rgba(255,255,255,0.03)",
                  }}
                />
              </div>

            </div>
          </div>

          {/* Chrome screws — decorative */}
          <div className="absolute top-2 left-3 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-gray-400 to-gray-700" />
          <div className="absolute top-2 right-3 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-gray-400 to-gray-700" />
          <div className="absolute bottom-2 left-3 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-gray-400 to-gray-700" />
          <div className="absolute bottom-2 right-3 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-gray-400 to-gray-700" />
        </div>

        {/* ── Playlist panel ── */}
        {showList && (
          <div
            className="mt-3 rounded-xl overflow-hidden border border-white/[0.06]"
            style={{ background: "linear-gradient(180deg, #161616, #0e0e0e)" }}
          >
            <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center justify-between">
              <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{songs.length} titres</span>
              <button onClick={() => setShowList(false)} className="text-gray-600 hover:text-gray-400 p-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-52">
              {songs.map((s, i) => (
                <button
                  key={i}
                  onClick={() => selectSong(i)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2 border-b border-white/[0.03] last:border-0 text-left transition-colors active:bg-white/5 ${
                    i === idx ? "bg-primary/[0.06]" : "hover:bg-white/[0.03]"
                  }`}
                >
                  <span className={`font-mono text-[10px] flex-shrink-0 w-4 text-right ${i === idx ? "text-primary" : "text-gray-700"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {i === idx && playing ? (
                    <EqBars active />
                  ) : (
                    <span className="w-4 flex-shrink-0" />
                  )}
                  <span className={`text-xs truncate ${i === idx ? "text-primary font-semibold" : "text-gray-400"}`}>
                    {s.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
      <audio ref={audioRef} preload="none" />
    </section>
  );
}
