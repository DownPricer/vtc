"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { siteConfig, type SiteConfig } from "@/config/site.config";
import { rgbString } from "@/lib/branding/colorUtils";

type IntroScreenProps = { runtimeSite?: SiteConfig };

export function IntroScreen({ runtimeSite }: IntroScreenProps) {
  const site = runtimeSite ?? siteConfig;
  const siteRef = useRef(site);
  siteRef.current = site;

  const P = site.branding.colors.primary;
  const HL = site.branding.colors.accentHighlight;
  const pSoft = (a: number) => rgbString(P, a);
  const hlSoft = (a: number) => rgbString(HL, a);

  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<"playing" | "exit">("playing");
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ne rejouer qu'une fois par session
    if (sessionStorage.getItem("intro-done")) {
      setVisible(false);
      return;
    }

    const snap = siteRef.current.branding.colors;
    const Pc = snap.primary;

    // Génère les particules de vitesse
    const container = particlesRef.current;
    if (container) {
      for (let i = 0; i < 22; i++) {
        const p = document.createElement("div");
        p.style.cssText = `
          position: absolute;
          width: 2px;
          left: ${Math.random() * 100}%;
          top: 0;
          background: linear-gradient(to bottom, ${Pc}, transparent);
          border-radius: 2px;
          opacity: 0;
          animation: introParticle ${0.35 + Math.random() * 0.45}s linear infinite;
          animation-delay: ${Math.random() * 0.85}s;
        `;
        container.appendChild(p);
      }
    }

    // Déclenche l'onde de choc et le halo au moment où le logo s'arrête
    const shockTimer = setTimeout(() => {
      document.querySelectorAll(".intro-shockwave").forEach((el, i) => {
        (el as HTMLElement).style.animation = `introShockwave 0.45s cubic-bezier(.25,.8,.25,1) ${i * 0.08}s forwards`;
      });
      const glow = document.getElementById("intro-glow");
      if (glow) glow.style.animation = "introGlow 0.55s ease forwards";
      const reflection = document.getElementById("intro-reflection");
      if (reflection) reflection.style.animation = "introReflection 0.35s ease forwards";
    }, 1050);

    // Texte sous le logo
    const textTimer = setTimeout(() => {
      const text = document.getElementById("intro-tagline");
      if (text) text.style.animation = "introTextIn 0.4s ease forwards";
    }, 1280);

    // Arrêt des particules
    const stopTimer = setTimeout(() => {
      if (container) {
        container.childNodes.forEach((p) => {
          (p as HTMLElement).style.animationPlayState = "paused";
          (p as HTMLElement).style.opacity = "0";
        });
      }
    }, 1680);

    // Transition vers le site (total ~2,5 s avant fondu, puis ~0,5 s de sortie)
    const exitTimer = setTimeout(() => {
      setPhase("exit");
      setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem("intro-done", "1");
        document.body.style.overflow = "";
      }, 520);
    }, 2080);

    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(shockTimer);
      clearTimeout(textTimer);
      clearTimeout(stopTimer);
      clearTimeout(exitTimer);
      document.body.style.overflow = "";
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        animation: phase === "exit" ? "introFadeOut 0.52s ease forwards" : "none",
      }}
    >
      {/* Route en perspective */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "55%",
          perspective: "450px",
          overflow: "hidden",
          opacity: 0,
          animation: "introRoadFadeIn 0.48s ease 0.08s forwards",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            width: "220%",
            height: "100%",
            transform: "translateX(-50%) rotateX(58deg)",
            transformOrigin: "bottom center",
            background: "linear-gradient(to top, #0f0f0f 0%, #050505 100%)",
          }}
        >
          {/* Bandes latérales de la route */}
          <div
            style={{
              position: "absolute",
              left: "35%",
              top: 0,
              bottom: 0,
              width: "2px",
              background: pSoft(0.15),
            }}
          />
          <div
            style={{
              position: "absolute",
              right: "35%",
              top: 0,
              bottom: 0,
              width: "2px",
              background: pSoft(0.15),
            }}
          />
          {/* Lignes centrales */}
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                width: "5px",
                bottom: `${10 + i * 15}%`,
                height: `${28 - i * 3}px`,
                background: P,
                borderRadius: "2px",
                opacity: 0,
                animation: `introRoadLine 0.62s linear infinite`,
                animationDelay: `${i * 0.12}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Phares */}
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: "calc(50% - 110px)",
          width: "130px",
          height: "320px",
          background: `radial-gradient(ellipse at top, ${hlSoft(0.18)} 0%, transparent 70%)`,
          transform: "rotate(-6deg)",
          opacity: 0,
          animation: "introHeadlight 0.75s ease 0.18s forwards",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "38%",
          right: "calc(50% - 110px)",
          width: "130px",
          height: "320px",
          background: `radial-gradient(ellipse at top, ${hlSoft(0.18)} 0%, transparent 70%)`,
          transform: "rotate(6deg)",
          opacity: 0,
          animation: "introHeadlight 0.75s ease 0.18s forwards",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Particules de vitesse */}
      <div
        ref={particlesRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* Ondes de choc (positionnées au centre) */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="intro-shockwave"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            border: `2px solid ${i === 1 ? HL : i === 2 ? pSoft(0.35) : P}`,
            transform: "translate(-50%, -50%) scale(0)",
            opacity: 0,
            pointerEvents: "none",
            zIndex: 5,
          }}
        />
      ))}

      {/* Halo */}
      <div
        id="intro-glow"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${pSoft(0.55)} 0%, ${pSoft(0.2)} 35%, transparent 70%)`,
          transform: "translate(-50%, -50%) scale(0)",
          opacity: 0,
          pointerEvents: "none",
          zIndex: 4,
        }}
      />

      {/* Logo + tagline */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <Image
          src={site.branding.logoSrc}
          alt={site.branding.logoAlt}
          width={200}
          height={200}
          priority
          style={{
            objectFit: "contain",
            borderRadius: "50%",
            opacity: 0,
            filter: "blur(18px) brightness(2.5)",
            animation: "introLogoArrival 0.95s cubic-bezier(.16,1,.3,1) 0.22s forwards",
          }}
        />

        {/* Reflet sol */}
        <div
          id="intro-reflection"
          style={{
            width: "130px",
            height: "28px",
            background: `radial-gradient(ellipse, ${pSoft(0.35)} 0%, transparent 70%)`,
            borderRadius: "50%",
            filter: "blur(6px)",
            opacity: 0,
            marginTop: "-18px",
          }}
        />

        {/* Tagline */}
        <p
          id="intro-tagline"
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: "0.78rem",
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.6)",
            opacity: 0,
            transform: "translateY(12px)",
            margin: 0,
          }}
        >
          {site.commercialName} — {site.tagline}
        </p>
      </div>

      {/* Scanlines TV subtiles */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 8,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
        }}
      />
    </div>
  );
}
