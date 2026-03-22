"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SoundManager } from "./sounds";

const PRIMARY = "#FF8533", PRIMARY_DARK = "#E07A2E", NEON_BLUE = "#00d2ff", GOLD = "#FFD580";
const CANVAS_W = 400, CANVAS_H = 700;
const ROAD_LEFT = 70, ROAD_RIGHT = 330, ROAD_W = ROAD_RIGHT - ROAD_LEFT;
const LANE_COUNT = 3, LANE_W = ROAD_W / LANE_COUNT;
const TOTAL_DISTANCE = 150;

type VehicleType = "car" | "moto" | "truck" | "bus" | "scooter";
type Zone = "campagne" | "autoroute" | "ville";

interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string }
interface TrafficCar { x: number; y: number; speed: number; color: string; w: number; h: number; type: VehicleType; sway: number }
interface SceneryObj { x: number; y: number; type: string; size: number; variant?: number }
interface Powerup { x: number; y: number; type: "telepeage" | "pourboire"; pulse: number }
interface RainDrop { x: number; y: number; speed: number; length: number }
interface TipPopup { text: string; x: number; y: number; life: number }
interface ScoreEntry { pseudo: string; score: number; date: number }
interface TouchState { left: boolean; right: boolean; brake: boolean }

interface PassengerInfo {
  state: "none" | "waiting" | "aboard";
  x: number; y: number; side: "left" | "right"; emoji: string;
  timer: number; maxTimer: number;
  dropoffY: number; dropoffSpawned: boolean;
}

interface GameState {
  distance: number; score: number; speed: number; maxSpeed: number;
  boostActive: boolean; boostTimer: number; envOffset: number;
  gameActive: boolean; gameStarted: boolean; biomeProgress: number;
  combo: number; comboTimer: number; shakeX: number; shakeY: number;
  isRaining: boolean; rainTimer: number; tipPopups: TipPopup[];
  zone: Zone; prevZone: Zone; zoneTransTimer: number; zoneName: string;
  passenger: PassengerInfo; clientsServed: number; braking: boolean;
  flashRed: number;
}

const CAR_COLORS = ["#c0392b", "#2980b9", "#27ae60", "#8e44ad", "#e74c3c", "#2c3e50", "#d35400", "#1abc9c"];
const PASSENGER_EMOJIS = ["🧑", "👩", "👨", "🧓", "👦", "👧"];

function laneCenter(lane: number) { return ROAD_LEFT + LANE_W * lane + LANE_W / 2; }
function getZone(dist: number): Zone { return dist > 100 ? "campagne" : dist > 50 ? "autoroute" : "ville"; }
function zoneName(z: Zone): string { return z === "campagne" ? "CAMPAGNE — Normandie" : z === "autoroute" ? "AUTOROUTE A13" : "PARIS — Zone Urbaine"; }

function crashWeight(type: VehicleType): number {
  switch (type) { case "moto": return 0.4; case "scooter": return 0.3; case "car": return 1; case "truck": return 1.8; case "bus": return 2.2; }
}

function LeaderboardTable({ scores }: { scores: ScoreEntry[] }) {
  if (!scores.length) return <p className="text-gray-600 text-xs text-center py-3">Aucun score enregistré</p>;
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div className="w-full">
      {scores.map((e, i) => (
        <div key={`${e.pseudo}-${e.date}`} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
          <span className="text-base w-7 text-center">{i < 3 ? medals[i] : <span className="text-gray-600 text-sm">{i + 1}</span>}</span>
          <span className="text-sm flex-1 text-white font-medium tracking-wide">{e.pseudo}</span>
          <span className="text-sm font-bold tabular-nums" style={{ color: i === 0 ? GOLD : PRIMARY }}>{e.score.toLocaleString("fr-FR")}</span>
        </div>
      ))}
    </div>
  );
}

// ========================================================================
export function VTCGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const soundRef = useRef<SoundManager | null>(null);
  const stateRef = useRef<GameState>({
    distance: TOTAL_DISTANCE, score: 0, speed: 0, maxSpeed: 11,
    boostActive: false, boostTimer: 0, envOffset: 0,
    gameActive: false, gameStarted: false, biomeProgress: 0,
    combo: 0, comboTimer: 0, shakeX: 0, shakeY: 0,
    isRaining: false, rainTimer: 600, tipPopups: [],
    zone: "campagne", prevZone: "campagne", zoneTransTimer: 0, zoneName: "",
    passenger: { state: "none", x: 0, y: 0, side: "left", emoji: "🧑", timer: 0, maxTimer: 0, dropoffY: -1, dropoffSpawned: false }, clientsServed: 0, braking: false, flashRed: 0,
  });
  const keysRef = useRef<Record<string, boolean>>({});
  const playerRef = useRef({ x: CANVAS_W / 2 - 24, y: 540, w: 48, h: 90, tilt: 0 });
  const trafficRef = useRef<TrafficCar[]>([]);
  const sceneryRef = useRef<SceneryObj[]>([]);
  const powerupsRef = useRef<Powerup[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const rainRef = useRef<RainDrop[]>([]);
  const frameRef = useRef(0);
  const touchStateRef = useRef<TouchState>({ left: false, right: false, brake: false });
  const isTouchRef = useRef(false);
  const idleOffsetRef = useRef(0);
  const brakeSoundPlayed = useRef(false);

  const [screenState, setScreenState] = useState<"start" | "playing" | "end">("start");
  const [muted, setMuted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [pseudo, setPseudo] = useState("");
  const [finalScore, setFinalScore] = useState(0);
  const [finalStars, setFinalStars] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hudData, setHudData] = useState({ dist: TOTAL_DISTANCE, score: 0, speed: 0, combo: 0, boost: false, zone: "campagne" as Zone, clients: 0, passengerAboard: false });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    (async () => {
      try { const r = await fetch("/api/scores"); if (r.ok) { const d = await r.json(); if (Array.isArray(d) && d.length) { setLeaderboard(d); return; } } } catch { /* */ }
      try { const l = JSON.parse(localStorage.getItem("vtc76-scores") || "[]"); if (l.length) setLeaderboard(l); } catch { /* */ }
    })();
    isTouchRef.current = "ontouchstart" in window;
  }, []);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    Object.assign(s, {
      distance: TOTAL_DISTANCE, score: 0, speed: 0, maxSpeed: 11,
      boostActive: false, boostTimer: 0, envOffset: 0,
      gameActive: true, gameStarted: true, biomeProgress: 0,
      combo: 0, comboTimer: 0, shakeX: 0, shakeY: 0,
      isRaining: false, rainTimer: 600, tipPopups: [],
      zone: "campagne" as Zone, prevZone: "campagne" as Zone, zoneTransTimer: 0, zoneName: "",
      passenger: { state: "none", x: 0, y: 0, side: "left", emoji: "🧑", timer: 0, maxTimer: 0, dropoffY: -1, dropoffSpawned: false }, clientsServed: 0, braking: false, flashRed: 0,
    });
    playerRef.current = { x: CANVAS_W / 2 - 24, y: 540, w: 48, h: 90, tilt: 0 };
    trafficRef.current = []; sceneryRef.current = []; powerupsRef.current = [];
    particlesRef.current = []; rainRef.current = []; frameRef.current = 0;
    brakeSoundPlayed.current = false;
    setSubmitted(false); setPseudo("");
    if (!soundRef.current) soundRef.current = new SoundManager();
    soundRef.current.init();
    setScreenState("playing");
  }, []);

  const submitScore = useCallback(async () => {
    const name = pseudo.trim();
    if (!name || submitting || submitted) return;
    setSubmitting(true);
    try {
      const r = await fetch("/api/scores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pseudo: name, score: finalScore }) });
      if (r.ok) { const d = await r.json(); if (Array.isArray(d)) { setLeaderboard(d); setSubmitted(true); setSubmitting(false); return; } }
      throw new Error();
    } catch {
      const l: ScoreEntry[] = JSON.parse(localStorage.getItem("vtc76-scores") || "[]");
      l.push({ pseudo: name.toUpperCase(), score: finalScore, date: Date.now() });
      l.sort((a, b) => b.score - a.score);
      const t5 = l.slice(0, 5);
      localStorage.setItem("vtc76-scores", JSON.stringify(t5));
      setLeaderboard(t5);
    }
    setSubmitted(true); setSubmitting(false);
  }, [pseudo, finalScore, submitting, submitted]);

  useEffect(() => {
    document.body.style.overflow = "hidden"; document.body.style.touchAction = "none";
    document.body.style.position = "fixed"; document.body.style.width = "100%"; document.body.style.height = "100%";
    return () => { document.body.style.overflow = ""; document.body.style.touchAction = ""; document.body.style.position = ""; document.body.style.width = ""; document.body.style.height = ""; };
  }, []);

  useEffect(() => {
    const h = () => setScale(Math.min(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H));
    h(); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => {
    const d = (e: KeyboardEvent) => { keysRef.current[e.code] = true; if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault(); };
    const u = (e: KeyboardEvent) => { keysRef.current[e.code] = false; };
    window.addEventListener("keydown", d); window.addEventListener("keyup", u);
    return () => { window.removeEventListener("keydown", d); window.removeEventListener("keyup", u); };
  }, []);

  // --- NEW TOUCH CONTROLS: 3 zones ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    function updateTouch(touches: TouchList) {
      const rect = canvas!.getBoundingClientRect();
      let left = false, right = false, brake = false;
      for (let i = 0; i < touches.length; i++) {
        const cx = (touches[i].clientX - rect.left) / rect.width * CANVAS_W;
        if (cx < CANVAS_W * 0.33) left = true;
        else if (cx > CANVAS_W * 0.67) right = true;
        else brake = true;
      }
      touchStateRef.current = { left, right, brake };
    }
    const ts = (e: TouchEvent) => { e.preventDefault(); updateTouch(e.touches); };
    const te = (e: TouchEvent) => { e.preventDefault(); if (!e.touches.length) touchStateRef.current = { left: false, right: false, brake: false }; else updateTouch(e.touches); };
    canvas.addEventListener("touchstart", ts, { passive: false });
    canvas.addEventListener("touchmove", ts, { passive: false });
    canvas.addEventListener("touchend", te, { passive: false });
    canvas.addEventListener("touchcancel", te, { passive: false });
    return () => { canvas.removeEventListener("touchstart", ts); canvas.removeEventListener("touchmove", ts); canvas.removeEventListener("touchend", te); canvas.removeEventListener("touchcancel", te); };
  }, []);

  const toggleMute = useCallback(() => { if (soundRef.current) setMuted(soundRef.current.toggleMute()); }, []);
  useEffect(() => () => { soundRef.current?.destroy(); }, []);

  // ========================================================================
  // GAME LOOP
  // ========================================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;

    function spawnParticle(x: number, y: number, color: string, count: number) {
      for (let i = 0; i < count; i++) particlesRef.current.push({ x, y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 30 + Math.random() * 20, maxLife: 50, size: 2 + Math.random() * 3, color });
    }

    function spawnBrakeSmoke(px: number, py: number, pw: number, ph: number) {
      for (let i = 0; i < 3; i++) particlesRef.current.push({ x: px + pw * 0.2 + Math.random() * pw * 0.6, y: py + ph - 5, vx: (Math.random() - 0.5) * 2, vy: Math.random() * 2, life: 15 + Math.random() * 10, maxLife: 25, size: 4 + Math.random() * 4, color: "rgba(200,200,200,0.5)" });
    }

    function spawnTraffic(s: GameState) {
      const rateByZone = { campagne: 0.012, autoroute: 0.02, ville: 0.03 };
      if (Math.random() > rateByZone[s.zone]) return;
      const lane = Math.floor(Math.random() * LANE_COUNT);
      const x = laneCenter(lane);
      if (trafficRef.current.some(t => Math.abs(t.x + t.w / 2 - x) < 50 && t.y < 50)) return;

      let type: VehicleType;
      const r = Math.random();
      if (s.zone === "campagne") { type = r < 0.75 ? "car" : r < 0.9 ? "truck" : "moto"; }
      else if (s.zone === "autoroute") { type = r < 0.35 ? "car" : r < 0.6 ? "truck" : r < 0.8 ? "bus" : "moto"; }
      else { type = r < 0.3 ? "car" : r < 0.5 ? "moto" : r < 0.7 ? "scooter" : r < 0.85 ? "bus" : "truck"; }

      const specs: Record<VehicleType, { w: number; h: number; sMin: number; sMax: number }> = {
        car: { w: 40, h: 75, sMin: 2, sMax: 5 }, moto: { w: 20, h: 50, sMin: 4, sMax: 7 },
        truck: { w: 45, h: 120, sMin: 1, sMax: 3 }, bus: { w: 45, h: 140, sMin: 1.5, sMax: 3 },
        scooter: { w: 18, h: 40, sMin: 3, sMax: 5 },
      };
      const sp = specs[type];
      const color = type === "truck" ? "#8899aa" : type === "bus" ? (Math.random() > 0.5 ? "#e8b828" : "#3070c0") : CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];
      trafficRef.current.push({ x: x - sp.w / 2, y: -sp.h - 20, speed: sp.sMin + Math.random() * (sp.sMax - sp.sMin), color, w: sp.w, h: sp.h, type, sway: Math.random() * Math.PI * 2 });
    }

    function spawnScenery(s: GameState) {
      if (Math.random() > 0.05) return;
      const side = Math.random() > 0.5 ? "left" : "right";
      const baseX = side === "left" ? Math.random() * 55 + 2 : ROAD_RIGHT + 5 + Math.random() * 45;
      let type: string;
      const r = Math.random();
      if (s.zone === "campagne") {
        type = r < 0.25 ? "tree" : r < 0.4 ? "cow" : r < 0.55 ? "wheatfield" : r < 0.7 ? "farmhouse" : r < 0.8 ? "church" : r < 0.9 ? "haybale" : "fence";
      } else if (s.zone === "autoroute") {
        type = r < 0.35 ? "guardrail" : r < 0.55 ? "roadsign" : r < 0.75 ? "pylon" : "tree";
      } else {
        type = r < 0.35 ? "tallbuilding" : r < 0.55 ? "streetlamp" : r < 0.75 ? "citytree" : "tallbuilding";
      }
      sceneryRef.current.push({ x: baseX, y: -80, type, size: 25 + Math.random() * 20, variant: Math.random() });
    }

    function spawnPowerups(s: GameState) {
      if (Math.random() < (s.zone === "autoroute" ? 0.006 : 0.003) && !s.boostActive) {
        const lane = Math.floor(Math.random() * LANE_COUNT);
        powerupsRef.current.push({ x: laneCenter(lane) - 15, y: -60, type: "telepeage", pulse: 0 });
      }
      if (Math.random() < 0.008) {
        const lane = Math.floor(Math.random() * LANE_COUNT);
        if (!powerupsRef.current.some(p => Math.abs(p.x - (laneCenter(lane) - 10)) < 40 && p.y < 100))
          powerupsRef.current.push({ x: laneCenter(lane) - 10, y: -60, type: "pourboire", pulse: 0 });
      }
    }

    function trySpawnPassenger(s: GameState) {
      if (s.passenger.state !== "none") return;
      const freq = { campagne: 0.001, autoroute: 0.002, ville: 0.004 };
      if (Math.random() > freq[s.zone]) return;
      const side = Math.random() > 0.5 ? "left" : "right";
      s.passenger = {
        state: "waiting", x: side === "left" ? ROAD_LEFT - 25 : ROAD_RIGHT + 5, y: -60,
        side, emoji: PASSENGER_EMOJIS[Math.floor(Math.random() * PASSENGER_EMOJIS.length)],
        timer: 0, maxTimer: 600, dropoffY: -1, dropoffSpawned: false,
      };
    }

    // ---- IDLE PREVIEW ----
    function drawIdlePreview() {
      if (!ctx) return;
      idleOffsetRef.current += 2;
      const off = idleOffsetRef.current;
      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = "rgb(12,45,12)"; ctx.fillRect(0, 0, ROAD_LEFT, CANVAS_H); ctx.fillRect(ROAD_RIGHT, 0, CANVAS_W - ROAD_RIGHT, CANVAS_H);
      const g = ctx.createLinearGradient(ROAD_LEFT, 0, ROAD_RIGHT, 0);
      g.addColorStop(0, "#151515"); g.addColorStop(0.5, "#253545"); g.addColorStop(1, "#151515");
      ctx.fillStyle = g; ctx.fillRect(ROAD_LEFT, 0, ROAD_W, CANVAS_H);
      ctx.strokeStyle = "rgba(255,133,51,0.4)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ROAD_LEFT, 0); ctx.lineTo(ROAD_LEFT, CANVAS_H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ROAD_RIGHT, 0); ctx.lineTo(ROAD_RIGHT, CANVAS_H); ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.setLineDash([35, 45]); ctx.lineDashOffset = -off; ctx.lineWidth = 2;
      for (let i = 1; i < LANE_COUNT; i++) { const lx = ROAD_LEFT + LANE_W * i; ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, CANVAS_H); ctx.stroke(); }
      ctx.setLineDash([]);
      for (let i = 0; i < 5; i++) {
        const ty = ((i * 160 + off * 0.5) % (CANVAS_H + 80)) - 40;
        ctx.fillStyle = "rgba(30,60,20,0.5)";
        ctx.beginPath(); ctx.moveTo(25, ty); ctx.lineTo(45, ty + 30); ctx.lineTo(5, ty + 30); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(CANVAS_W - 25, ty + 50); ctx.lineTo(CANVAS_W - 5, ty + 80); ctx.lineTo(CANVAS_W - 45, ty + 80); ctx.closePath(); ctx.fill();
      }
      const vg = ctx.createRadialGradient(CANVAS_W / 2, CANVAS_H / 2, 100, CANVAS_W / 2, CANVAS_H / 2, 400);
      vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.7)");
      ctx.fillStyle = vg; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }

    // ---- UPDATE ----
    function update() {
      const s = stateRef.current;
      if (!s.gameActive) return;
      const keys = keysRef.current;
      const p = playerRef.current;
      const ts = touchStateRef.current;
      frameRef.current++;

      // --- Zone detection ---
      const newZone = getZone(s.distance);
      if (newZone !== s.zone) {
        s.prevZone = s.zone; s.zone = newZone;
        s.zoneTransTimer = 180; s.zoneName = zoneName(newZone);
        soundRef.current?.playZoneTransition();
      }
      if (s.zoneTransTimer > 0) s.zoneTransTimer--;

      // --- Controls ---
      const currentMax = s.boostActive ? 22 : (s.isRaining ? 9 : (s.zone === "autoroute" ? 14 : 11));
      const touchAccel = ts.left || ts.right;
      const keyAccel = keys["ArrowUp"] || keys["KeyW"];
      const braking = ts.brake || keys["Space"] || keys["ArrowDown"] || keys["KeyS"];

      if (braking && s.speed > 0.5) {
        s.speed = Math.max(s.speed - 0.45, 0);
        s.braking = true;
        spawnBrakeSmoke(p.x, p.y, p.w, p.h);
        if (!brakeSoundPlayed.current) { soundRef.current?.playBrake(); brakeSoundPlayed.current = true; }
      } else if (touchAccel || keyAccel) {
        s.speed = Math.min(s.speed + 0.16, currentMax);
        s.braking = false; brakeSoundPlayed.current = false;
      } else {
        s.speed = Math.max(s.speed - 0.05, 0);
        s.braking = false; brakeSoundPlayed.current = false;
      }

      // --- Steering ---
      const steerSpeed = s.boostActive ? 4.5 : (s.isRaining ? 4 : 5.5);
      const driftFactor = s.isRaining ? 0.92 : 0.85;
      const steerL = (keys["ArrowLeft"] || keys["KeyA"] || (ts.left && !ts.right));
      const steerR = (keys["ArrowRight"] || keys["KeyD"] || (ts.right && !ts.left));
      if (steerL) { p.x -= steerSpeed; p.tilt = Math.max(p.tilt - 0.025, -0.15); }
      else if (steerR) { p.x += steerSpeed; p.tilt = Math.min(p.tilt + 0.025, 0.15); }
      else { p.tilt *= driftFactor; }

      if (s.speed > 8) { p.x += p.tilt * s.speed * 0.15; }

      p.x = Math.max(ROAD_LEFT + 3, Math.min(ROAD_RIGHT - p.w - 3, p.x));
      s.biomeProgress = Math.min(1, 1 - s.distance / TOTAL_DISTANCE);
      s.envOffset += s.speed;
      s.distance -= s.speed / 450;

      // --- Boost ---
      if (s.boostActive) {
        s.boostTimer--;
        if (s.boostTimer <= 0) s.boostActive = false;
        if (frameRef.current % 2 === 0) spawnParticle(p.x + p.w / 2 + (Math.random() - 0.5) * 20, p.y + p.h, NEON_BLUE, 1);
      }
      if (s.speed > 3 && frameRef.current % 3 === 0) spawnParticle(p.x + p.w / 2, p.y + p.h, "rgba(255,133,51,0.6)", 1);

      s.comboTimer--; if (s.comboTimer <= 0) s.combo = 0;

      // --- Rain ---
      s.rainTimer--;
      if (s.rainTimer <= 0) { s.isRaining = !s.isRaining; s.rainTimer = s.isRaining ? 400 + Math.random() * 300 : 500 + Math.random() * 400; }
      if (s.isRaining) { for (let i = 0; i < 3; i++) rainRef.current.push({ x: Math.random() * CANVAS_W, y: -10, speed: 12 + Math.random() * 8, length: 10 + Math.random() * 15 }); }
      rainRef.current.forEach(r => { r.y += r.speed + s.speed; });
      rainRef.current = rainRef.current.filter(r => r.y < CANVAS_H).slice(-150);

      // --- Move objects ---
      for (let i = trafficRef.current.length - 1; i >= 0; i--) {
        const t = trafficRef.current[i];
        t.y += s.speed - t.speed;
        if (t.type === "moto" || t.type === "scooter") { t.sway += (t.type === "scooter" ? 0.12 : 0.06); t.x += Math.sin(t.sway) * (t.type === "scooter" ? 1.2 : 0.6); }
        if (t.y > CANVAS_H + 50) trafficRef.current.splice(i, 1);
      }
      for (let i = sceneryRef.current.length - 1; i >= 0; i--) { sceneryRef.current[i].y += s.speed * 0.8; if (sceneryRef.current[i].y > CANVAS_H + 80) sceneryRef.current.splice(i, 1); }
      for (let i = powerupsRef.current.length - 1; i >= 0; i--) { powerupsRef.current[i].y += s.speed; if (powerupsRef.current[i].y > CANVAS_H + 50) powerupsRef.current.splice(i, 1); }
      particlesRef.current.forEach(pt => { pt.x += pt.vx; pt.y += pt.vy; pt.life--; });
      particlesRef.current = particlesRef.current.filter(pt => pt.life > 0);

      // --- Passenger logic ---
      const psg = s.passenger;
      if (psg.state === "waiting") {
        psg.y += s.speed * 0.8;
        const nearX = psg.side === "left" ? (p.x < ROAD_LEFT + 30) : (p.x + p.w > ROAD_RIGHT - 30);
        if (nearX && Math.abs(p.y - psg.y) < 60 && s.speed < 4) {
          psg.state = "aboard"; psg.timer = psg.maxTimer; s.score += 150;
          s.tipPopups.push({ text: "+150 CLIENT!", x: psg.x + 15, y: psg.y, life: 60 });
          soundRef.current?.playPickupClient();
          spawnParticle(psg.x + 15, psg.y + 15, "#4ade80", 12);
        }
        if (psg.y > CANVAS_H + 50) psg.state = "none";
      }
      if (psg.state === "aboard") {
        psg.timer--;
        if (!psg.dropoffSpawned && psg.timer < psg.maxTimer - 120) {
          psg.dropoffSpawned = true; psg.dropoffY = -80;
        }
        if (psg.dropoffSpawned && psg.dropoffY >= 0) psg.dropoffY += s.speed;
        if (psg.dropoffSpawned && psg.dropoffY < 0) psg.dropoffY += s.speed;
        if (psg.dropoffSpawned && psg.dropoffY > 0 && psg.dropoffY < CANVAS_H) {
          if (p.y < psg.dropoffY + 40 && p.y + p.h > psg.dropoffY) {
            s.score += 300; s.clientsServed++; psg.state = "none";
            s.tipPopups.push({ text: "+300 DÉPOSÉ!", x: CANVAS_W / 2, y: psg.dropoffY, life: 60 });
            soundRef.current?.playDropoffClient();
            spawnParticle(CANVAS_W / 2, psg.dropoffY + 20, GOLD, 15);
          }
        }
        if (psg.dropoffSpawned && psg.dropoffY > CANVAS_H + 20) {
          s.score = Math.max(0, s.score - 100); psg.state = "none";
          s.tipPopups.push({ text: "-100 RATÉ!", x: CANVAS_W / 2, y: CANVAS_H / 2, life: 60 });
        }
        if (psg.timer <= 0) {
          s.score = Math.max(0, s.score - 100); psg.state = "none";
          s.tipPopups.push({ text: "-100 TROP LENT!", x: CANVAS_W / 2, y: CANVAS_H / 2, life: 60 });
        }
      }

      // --- Traffic collisions ---
      for (let i = trafficRef.current.length - 1; i >= 0; i--) {
        const t = trafficRef.current[i];
        const hit = p.x < t.x + t.w - 6 && p.x + p.w > t.x + 6 && p.y < t.y + t.h - 8 && p.y + p.h > t.y + 8;
        if (!hit) continue;
        if (s.boostActive) {
          s.score += 50; s.tipPopups.push({ text: "+50", x: t.x + t.w / 2, y: t.y, life: 40 });
          spawnParticle(t.x + t.w / 2, t.y + t.h / 2, NEON_BLUE, 8); trafficRef.current.splice(i, 1);
        } else {
          const cw = crashWeight(t.type);
          s.speed *= Math.max(0.05, 0.2 - cw * 0.05);
          const penalty = Math.floor(100 + cw * 50);
          s.score = Math.max(0, s.score - penalty); s.combo = 0;
          s.shakeX = 6 + cw * 4; s.shakeY = 3 + cw * 2;
          s.flashRed = 10 + cw * 5;
          const knockback = cw * 8;
          if (p.x + p.w / 2 < t.x + t.w / 2) p.x -= knockback; else p.x += knockback;
          s.tipPopups.push({ text: `-${penalty}`, x: p.x + p.w / 2, y: p.y - 10, life: 60 });
          spawnParticle(p.x + p.w / 2, p.y, "#e74c3c", 8 + Math.floor(cw * 5));
          trafficRef.current.splice(i, 1);
          soundRef.current?.playCrash(cw);
          try { navigator.vibrate?.(30 + Math.floor(cw * 30)); } catch { /* */ }
        }
      }

      // --- Powerup collisions ---
      for (let i = powerupsRef.current.length - 1; i >= 0; i--) {
        const pw = powerupsRef.current[i]; const sz = pw.type === "telepeage" ? 30 : 20;
        if (!(p.x < pw.x + sz && p.x + p.w > pw.x && p.y < pw.y + sz && p.y + p.h > pw.y)) continue;
        if (pw.type === "telepeage") {
          s.boostActive = true; s.boostTimer = 300; s.score += 500;
          s.tipPopups.push({ text: "+500 BOOST!", x: pw.x + 15, y: pw.y, life: 60 });
          spawnParticle(pw.x + 15, pw.y + 15, NEON_BLUE, 20); soundRef.current?.playBoost();
        } else {
          s.combo++; s.comboTimer = 180; const bonus = 100 * Math.min(s.combo, 5);
          s.score += bonus; s.tipPopups.push({ text: s.combo > 1 ? `+${bonus} x${s.combo}` : `+${bonus}`, x: pw.x + 10, y: pw.y, life: 50 });
          spawnParticle(pw.x + 10, pw.y + 10, GOLD, 10); soundRef.current?.playPickup();
          try { navigator.vibrate?.(20); } catch { /* */ }
        }
        powerupsRef.current.splice(i, 1);
      }

      s.shakeX *= 0.85; s.shakeY *= 0.85;
      if (s.flashRed > 0) s.flashRed--;
      soundRef.current?.updateEngine(s.speed, s.boostActive);

      if (s.distance <= 0) {
        s.distance = 0; s.gameActive = false;
        const totalScore = Math.floor(s.score + s.envOffset / 10 + s.clientsServed * 200);
        const stars = totalScore > 4000 ? 5 : totalScore > 2500 ? 4 : totalScore > 1500 ? 3 : totalScore > 700 ? 2 : 1;
        setFinalScore(totalScore); setFinalStars(stars);
        soundRef.current?.stopEngine(); soundRef.current?.playVictory();
        setScreenState("end");
      }

      setHudData({
        dist: s.distance, score: Math.floor(s.score + s.envOffset / 10),
        speed: Math.floor(s.speed * 14), combo: s.combo, boost: s.boostActive,
        zone: s.zone, clients: s.clientsServed, passengerAboard: s.passenger.state === "aboard",
      });
    }

    // ---- DRAW VEHICLE ----
    function drawVehicle(c: CanvasRenderingContext2D, car: TrafficCar) {
      c.save();
      c.shadowBlur = 4; c.shadowColor = "rgba(0,0,0,0.4)";
      if (car.type === "car") {
        const g = c.createLinearGradient(car.x, car.y, car.x + car.w, car.y + car.h);
        g.addColorStop(0, car.color); g.addColorStop(1, "#111");
        c.fillStyle = g; c.beginPath(); c.roundRect(car.x, car.y, car.w, car.h, 6); c.fill(); c.shadowBlur = 0;
        c.fillStyle = "rgba(100,180,255,0.3)"; c.fillRect(car.x + 5, car.y + 8, car.w - 10, 18);
        c.fillStyle = "#e74c3c"; c.fillRect(car.x + 4, car.y + car.h - 7, 8, 3); c.fillRect(car.x + car.w - 12, car.y + car.h - 7, 8, 3);
      } else if (car.type === "moto") {
        c.fillStyle = car.color; c.fillRect(car.x + 6, car.y, 8, car.h); c.shadowBlur = 0;
        c.fillStyle = "#333"; c.beginPath(); c.arc(car.x + 10, car.y + 5, 5, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(car.x + 10, car.y + car.h - 5, 5, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#ff0"; c.fillRect(car.x + 7, car.y, 6, 3);
      } else if (car.type === "truck") {
        c.fillStyle = "#667788"; c.beginPath(); c.roundRect(car.x, car.y, car.w, car.h * 0.7, 4); c.fill();
        c.fillStyle = car.color; c.beginPath(); c.roundRect(car.x + 2, car.y + car.h * 0.7, car.w - 4, car.h * 0.3, 4); c.fill(); c.shadowBlur = 0;
        c.fillStyle = "rgba(100,180,255,0.3)"; c.fillRect(car.x + 5, car.y + car.h * 0.72, car.w - 10, 12);
        c.fillStyle = "#e74c3c"; c.fillRect(car.x + 3, car.y + car.h - 6, 10, 4); c.fillRect(car.x + car.w - 13, car.y + car.h - 6, 10, 4);
      } else if (car.type === "bus") {
        c.fillStyle = car.color; c.beginPath(); c.roundRect(car.x, car.y, car.w, car.h, 5); c.fill(); c.shadowBlur = 0;
        c.fillStyle = "rgba(180,220,255,0.35)";
        for (let w = 0; w < 5; w++) c.fillRect(car.x + 4, car.y + 10 + w * 26, car.w - 8, 14);
        c.fillStyle = "#fff"; c.fillRect(car.x + 5, car.y + 2, 10, 4); c.fillRect(car.x + car.w - 15, car.y + 2, 10, 4);
      } else {
        c.fillStyle = car.color; c.fillRect(car.x + 5, car.y, 8, car.h); c.shadowBlur = 0;
        c.fillStyle = "#555"; c.beginPath(); c.arc(car.x + 9, car.y + car.h - 4, 4, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#ff0"; c.fillRect(car.x + 6, car.y, 5, 2);
      }
      c.restore();
    }

    // ---- DRAW SCENERY ----
    function drawSceneryItem(c: CanvasRenderingContext2D, item: SceneryObj) {
      const { x, y, size: sz } = item;
      c.save();
      switch (item.type) {
        case "tree":
          c.fillStyle = "#1a5c10"; c.beginPath(); c.arc(x + sz / 2, y + sz * 0.3, sz * 0.4, 0, Math.PI * 2); c.fill();
          c.fillStyle = "#2d7a1e"; c.beginPath(); c.arc(x + sz / 2 - 4, y + sz * 0.2, sz * 0.3, 0, Math.PI * 2); c.fill();
          c.fillStyle = "#5a3a1a"; c.fillRect(x + sz * 0.4, y + sz * 0.5, sz * 0.2, sz * 0.5);
          break;
        case "cow":
          c.fillStyle = "#f0f0f0"; c.fillRect(x, y + 5, sz * 0.7, sz * 0.35);
          c.fillStyle = "#444"; c.fillRect(x + 3, y + 8, sz * 0.15, sz * 0.1); c.fillRect(x + sz * 0.4, y + 10, sz * 0.15, sz * 0.12);
          c.fillStyle = "#f0f0f0"; c.fillRect(x - 2, y + sz * 0.3, 4, 10); c.fillRect(x + sz * 0.6, y + sz * 0.3, 4, 10);
          break;
        case "wheatfield":
          c.fillStyle = "#c5a233"; c.fillRect(x, y, sz * 0.9, sz * 0.6);
          c.fillStyle = "#d4b84a";
          for (let i = 0; i < 4; i++) { const wx = x + i * sz * 0.22; c.fillRect(wx, y - 5 + Math.sin(frameRef.current * 0.05 + i) * 3, 3, sz * 0.25); }
          break;
        case "farmhouse":
          c.fillStyle = "#d4a76a"; c.fillRect(x, y + sz * 0.3, sz * 0.7, sz * 0.6);
          c.fillStyle = "#5a3018";
          c.fillRect(x + 2, y + sz * 0.35, 3, sz * 0.2); c.fillRect(x + sz * 0.15, y + sz * 0.35, 3, sz * 0.2);
          c.fillRect(x + sz * 0.4, y + sz * 0.35, 3, sz * 0.2); c.fillRect(x + sz * 0.55, y + sz * 0.35, 3, sz * 0.2);
          c.fillStyle = "#8B4513"; c.beginPath(); c.moveTo(x - 2, y + sz * 0.32); c.lineTo(x + sz * 0.35, y + sz * 0.05); c.lineTo(x + sz * 0.72, y + sz * 0.32); c.closePath(); c.fill();
          c.fillStyle = "#c4a060"; c.fillRect(x + sz * 0.25, y + sz * 0.6, sz * 0.2, sz * 0.3);
          break;
        case "church":
          c.fillStyle = "#bbb"; c.fillRect(x, y + sz * 0.4, sz * 0.5, sz * 0.6);
          c.fillStyle = "#999"; c.beginPath(); c.moveTo(x - 2, y + sz * 0.42); c.lineTo(x + sz * 0.25, y + sz * 0.15); c.lineTo(x + sz * 0.52, y + sz * 0.42); c.closePath(); c.fill();
          c.fillStyle = "#777"; c.fillRect(x + sz * 0.2, y, sz * 0.1, sz * 0.2);
          c.fillStyle = "#FFD700"; c.fillRect(x + sz * 0.15, y + sz * 0.55, sz * 0.08, sz * 0.12);
          break;
        case "haybale":
          c.fillStyle = "#c4a030"; c.beginPath(); c.arc(x + sz * 0.3, y + sz * 0.3, sz * 0.25, 0, Math.PI * 2); c.fill();
          c.strokeStyle = "#a08020"; c.lineWidth = 1; c.beginPath(); c.arc(x + sz * 0.3, y + sz * 0.3, sz * 0.18, 0, Math.PI * 2); c.stroke();
          break;
        case "fence":
          c.fillStyle = "#8B6914"; c.fillRect(x, y + 8, sz * 0.8, 3); c.fillRect(x, y + 18, sz * 0.8, 3);
          for (let i = 0; i < 4; i++) c.fillRect(x + i * sz * 0.22, y, 3, 24);
          break;
        case "guardrail":
          c.fillStyle = "#aab"; c.fillRect(x, y, 4, sz * 1.5);
          c.fillStyle = "#889"; c.fillRect(x - 1, y + 5, 6, sz * 0.1); c.fillRect(x - 1, y + sz, 6, sz * 0.1);
          break;
        case "roadsign":
          c.fillStyle = "#556"; c.fillRect(x + sz * 0.3, y + sz * 0.4, 4, sz * 0.6);
          c.fillStyle = "#1a5fb4"; c.beginPath(); c.roundRect(x, y, sz * 0.65, sz * 0.35, 3); c.fill();
          c.fillStyle = "#fff"; c.font = `${Math.max(7, sz * 0.12)}px sans-serif`; c.textAlign = "center";
          c.fillText(item.variant! > 0.5 ? "PARIS" : "ROUEN", x + sz * 0.32, y + sz * 0.24);
          break;
        case "pylon":
          c.strokeStyle = "#667"; c.lineWidth = 2;
          c.beginPath(); c.moveTo(x + sz * 0.3, y); c.lineTo(x + sz * 0.15, y + sz); c.stroke();
          c.beginPath(); c.moveTo(x + sz * 0.3, y); c.lineTo(x + sz * 0.45, y + sz); c.stroke();
          c.beginPath(); c.moveTo(x + sz * 0.1, y + sz * 0.3); c.lineTo(x + sz * 0.5, y + sz * 0.3); c.stroke();
          break;
        case "tallbuilding": {
          const bh = sz * 1.8;
          c.fillStyle = "#3a3a4a"; c.fillRect(x, y, sz * 0.6, bh);
          c.fillStyle = "#555"; c.fillRect(x, y, sz * 0.6, 4);
          for (let row = 0; row < 6; row++) for (let col = 0; col < 2; col++) {
            c.fillStyle = Math.random() > 0.35 ? "rgba(255,220,100,0.7)" : "rgba(100,120,150,0.3)";
            c.fillRect(x + 3 + col * (sz * 0.25), y + 6 + row * (bh / 7), sz * 0.18, bh / 9);
          }
          break;
        }
        case "streetlamp":
          c.fillStyle = "#556"; c.fillRect(x + 8, y + 10, 3, sz);
          c.fillStyle = "#778"; c.fillRect(x + 4, y + 8, 11, 4);
          c.fillStyle = "rgba(255,220,100,0.15)"; c.beginPath(); c.arc(x + 9, y + 14, 18, 0, Math.PI * 2); c.fill();
          c.fillStyle = "rgba(255,220,100,0.6)"; c.beginPath(); c.arc(x + 9, y + 10, 3, 0, Math.PI * 2); c.fill();
          break;
        case "citytree":
          c.fillStyle = "#2a5a1a"; c.beginPath(); c.arc(x + 8, y + 8, 10, 0, Math.PI * 2); c.fill();
          c.fillStyle = "#5a3a1a"; c.fillRect(x + 6, y + 16, 4, 14);
          break;
      }
      c.restore();
    }

    // ---- DRAW GAME ----
    function drawGame() {
      if (!ctx) return;
      const s = stateRef.current;
      ctx.save();
      ctx.translate(s.shakeX * (Math.random() - 0.5), s.shakeY * (Math.random() - 0.5));

      // Background by zone
      if (s.zone === "campagne") { ctx.fillStyle = "#1a3a12"; }
      else if (s.zone === "autoroute") { ctx.fillStyle = "#1a2a1a"; }
      else { ctx.fillStyle = "#1a1a20"; }
      ctx.fillRect(0, 0, ROAD_LEFT, CANVAS_H); ctx.fillRect(ROAD_RIGHT, 0, CANVAS_W - ROAD_RIGHT, CANVAS_H);

      // Guardrails on autoroute
      if (s.zone === "autoroute") {
        ctx.fillStyle = "#778"; ctx.fillRect(ROAD_LEFT - 4, 0, 4, CANVAS_H); ctx.fillRect(ROAD_RIGHT, 0, 4, CANVAS_H);
      }

      // Road
      const roadG = ctx.createLinearGradient(ROAD_LEFT, 0, ROAD_RIGHT, 0);
      roadG.addColorStop(0, "#181818"); roadG.addColorStop(0.15, "#2a3540"); roadG.addColorStop(0.5, "#303e4e");
      roadG.addColorStop(0.85, "#2a3540"); roadG.addColorStop(1, "#181818");
      ctx.fillStyle = roadG; ctx.fillRect(ROAD_LEFT, 0, ROAD_W, CANVAS_H);

      // Road edges
      ctx.strokeStyle = s.zone === "autoroute" ? "#aaa" : PRIMARY; ctx.lineWidth = s.zone === "autoroute" ? 3 : 4;
      ctx.beginPath(); ctx.moveTo(ROAD_LEFT, 0); ctx.lineTo(ROAD_LEFT, CANVAS_H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ROAD_RIGHT, 0); ctx.lineTo(ROAD_RIGHT, CANVAS_H); ctx.stroke();

      // Lane lines
      ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.setLineDash([35, 45]); ctx.lineDashOffset = -s.envOffset; ctx.lineWidth = 3;
      for (let i = 1; i < LANE_COUNT; i++) { ctx.beginPath(); ctx.moveTo(ROAD_LEFT + LANE_W * i, 0); ctx.lineTo(ROAD_LEFT + LANE_W * i, CANVAS_H); ctx.stroke(); }
      ctx.setLineDash([]);

      // Speed lines
      if (s.speed > 6) {
        const a = Math.min((s.speed - 6) / 16, 0.25);
        ctx.strokeStyle = `rgba(255,133,51,${a})`; ctx.lineWidth = 1.5;
        for (let i = 0; i < 5; i++) { const lx = ROAD_LEFT + 5 + Math.random() * (ROAD_W - 10); const ly = Math.random() * CANVAS_H; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, ly + 20 + s.speed * 3); ctx.stroke(); }
      }

      // Scenery
      sceneryRef.current.forEach(item => drawSceneryItem(ctx, item));

      // Dropoff zone
      const psg = s.passenger;
      if (psg.state === "aboard" && psg.dropoffSpawned && psg.dropoffY > -50 && psg.dropoffY < CANVAS_H) {
        const pulse = 0.5 + Math.sin(frameRef.current * 0.1) * 0.3;
        ctx.fillStyle = `rgba(74,222,128,${0.15 + pulse * 0.1})`;
        ctx.fillRect(ROAD_LEFT, psg.dropoffY, ROAD_W, 40);
        ctx.strokeStyle = `rgba(74,222,128,${0.4 + pulse * 0.2})`; ctx.lineWidth = 2;
        ctx.strokeRect(ROAD_LEFT + 1, psg.dropoffY, ROAD_W - 2, 40);
        ctx.fillStyle = `rgba(255,255,255,${0.4 + pulse * 0.2})`; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("▼ DÉPOSER ICI ▼", CANVAS_W / 2, psg.dropoffY + 25);
      }

      // Waiting passenger
      if (psg.state === "waiting") {
        const pulse = Math.sin(frameRef.current * 0.08) * 3;
        ctx.font = "22px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(psg.emoji, psg.x + 12, psg.y + 20 + pulse);
        ctx.fillStyle = "#4ade80"; ctx.font = "bold 9px sans-serif";
        ctx.fillText("STOP", psg.x + 12, psg.y - 5);
        ctx.strokeStyle = "rgba(74,222,128,0.4)"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
        ctx.strokeRect(psg.x - 5, psg.y - 12, 35, 45); ctx.setLineDash([]);
      }

      // Powerups
      powerupsRef.current.forEach(pw => {
        ctx.save(); pw.pulse += 0.08; const pf = 1 + Math.sin(pw.pulse) * 0.15;
        if (pw.type === "telepeage") {
          ctx.shadowBlur = 20; ctx.shadowColor = NEON_BLUE; ctx.fillStyle = NEON_BLUE;
          ctx.beginPath(); ctx.arc(pw.x + 15, pw.y + 15, 16 * pf, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0; ctx.fillStyle = "#fff"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "center"; ctx.fillText("T", pw.x + 15, pw.y + 20);
        } else {
          ctx.shadowBlur = 15; ctx.shadowColor = GOLD; ctx.fillStyle = PRIMARY;
          ctx.beginPath(); ctx.arc(pw.x + 10, pw.y + 10, 12 * pf, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0; ctx.fillStyle = "#fff"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center"; ctx.fillText("€", pw.x + 10, pw.y + 15);
        }
        ctx.restore();
      });

      // Traffic
      trafficRef.current.forEach(car => drawVehicle(ctx, car));

      // Player car
      const p = playerRef.current;
      ctx.save(); ctx.translate(p.x + p.w / 2, p.y + p.h / 2); ctx.rotate(p.tilt);
      ctx.shadowBlur = s.boostActive ? 30 : 12; ctx.shadowColor = s.boostActive ? NEON_BLUE : PRIMARY;
      const bc = s.boostActive ? NEON_BLUE : "#7f8c8d";
      const bg = ctx.createLinearGradient(-p.w / 2, -p.h / 2, p.w / 2, p.h / 2);
      bg.addColorStop(0, bc); bg.addColorStop(1, s.boostActive ? "#0088aa" : "#5a6269");
      ctx.fillStyle = bg;
      const hw = p.w / 2, hh = p.h / 2;
      ctx.beginPath(); ctx.moveTo(-hw + 8, -hh); ctx.lineTo(hw - 8, -hh); ctx.quadraticCurveTo(hw, -hh, hw, -hh + 8); ctx.lineTo(hw, hh - 6); ctx.quadraticCurveTo(hw, hh, hw - 6, hh); ctx.lineTo(-hw + 6, hh); ctx.quadraticCurveTo(-hw, hh, -hw, hh - 6); ctx.lineTo(-hw, -hh + 8); ctx.quadraticCurveTo(-hw, -hh, -hw + 8, -hh); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
      const wg = ctx.createLinearGradient(0, -15, 0, 20); wg.addColorStop(0, "rgba(100,180,255,0.35)"); wg.addColorStop(1, "rgba(50,80,120,0.55)");
      ctx.fillStyle = wg; ctx.beginPath(); ctx.moveTo(-hw + 6, -12); ctx.lineTo(hw - 6, -12); ctx.lineTo(hw - 9, 22); ctx.lineTo(-hw + 9, 22); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.shadowBlur = 8; ctx.shadowColor = "#fff"; ctx.fillRect(-hw + 3, -hh + 2, 10, 4); ctx.fillRect(hw - 13, -hh + 2, 10, 4); ctx.shadowBlur = 0;
      ctx.fillStyle = s.braking ? "#ff3333" : "#e74c3c"; if (s.braking) { ctx.shadowBlur = 12; ctx.shadowColor = "#ff0000"; }
      ctx.fillRect(-hw + 5, hh - 6, 8, 4); ctx.fillRect(hw - 13, hh - 6, 8, 4); ctx.shadowBlur = 0;
      ctx.fillStyle = PRIMARY; ctx.font = "bold 7px sans-serif"; ctx.textAlign = "center"; ctx.fillText("VTC76", 0, hh - 12);
      if (s.speed > 2) {
        ctx.strokeStyle = `rgba(255,133,51,${Math.min(s.speed / 15, 0.4)})`; ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) { const tx = -hw + 5 + i * (hw - 5); ctx.beginPath(); ctx.moveTo(tx, hh); ctx.lineTo(tx + (Math.random() - 0.5) * 4, hh + 15 + s.speed * 2); ctx.stroke(); }
      }
      // Passenger aboard indicator
      if (psg.state === "aboard") {
        ctx.fillStyle = "#4ade80"; ctx.font = "14px sans-serif"; ctx.fillText(psg.emoji, 0, -hh - 8);
      }
      ctx.restore();

      // Particles
      particlesRef.current.forEach(pt => { ctx.globalAlpha = pt.life / pt.maxLife; ctx.fillStyle = pt.color; ctx.fillRect(pt.x, pt.y, pt.size, pt.size); });
      ctx.globalAlpha = 1;

      // Rain
      if (s.isRaining) {
        ctx.strokeStyle = "rgba(150,180,220,0.3)"; ctx.lineWidth = 1;
        rainRef.current.forEach(r => { ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.x - 1, r.y + r.length); ctx.stroke(); });
      }

      // Progress bar with zone markers
      const barX = CANVAS_W - 22, barY = 55, barH = CANVAS_H - 200;
      const progress = 1 - s.distance / TOTAL_DISTANCE;
      ctx.fillStyle = "rgba(30,30,30,0.8)"; ctx.beginPath(); ctx.roundRect(barX - 6, barY - 5, 18, barH + 10, 9); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(barX - 6, barY - 5, 18, barH + 10, 9); ctx.stroke();
      const zoneMarks = [{ p: 50 / 150, label: "V" }, { p: 100 / 150, label: "A" }];
      zoneMarks.forEach(zm => {
        const my = barY + barH * (1 - zm.p);
        ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.fillRect(barX - 5, my, 16, 1);
        ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.font = "6px sans-serif"; ctx.textAlign = "center"; ctx.fillText(zm.label, barX + 3, my - 2);
      });
      const fillH = barH * progress;
      const pg = ctx.createLinearGradient(0, barY + barH - fillH, 0, barY + barH);
      pg.addColorStop(0, PRIMARY); pg.addColorStop(1, PRIMARY_DARK);
      ctx.fillStyle = pg; ctx.beginPath(); ctx.roundRect(barX - 3, barY + barH - fillH, 12, Math.max(fillH, 4), 6); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "10px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("✈", barX + 3, barY - 8); ctx.fillText("🏠", barX + 3, barY + barH + 16);
      ctx.fillStyle = PRIMARY; ctx.beginPath(); ctx.arc(barX + 3, barY + barH - fillH, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(barX + 3, barY + barH - fillH, 2.5, 0, Math.PI * 2); ctx.fill();

      // Passenger timer bar
      if (psg.state === "aboard") {
        const tbW = 100, tbH = 6, tbX = CANVAS_W / 2 - tbW / 2, tbY = 50;
        const pct = psg.timer / psg.maxTimer;
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.beginPath(); ctx.roundRect(tbX - 2, tbY - 2, tbW + 4, tbH + 4, 5); ctx.fill();
        ctx.fillStyle = pct > 0.3 ? "#4ade80" : "#ef4444";
        ctx.beginPath(); ctx.roundRect(tbX, tbY, tbW * pct, tbH, 3); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = "bold 8px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(`${psg.emoji} EN COURSE`, CANVAS_W / 2, tbY - 5);
      }

      // Tip popups
      s.tipPopups.forEach(tp => { ctx.globalAlpha = tp.life / 60; ctx.fillStyle = tp.text.startsWith("-") ? "#e74c3c" : GOLD; ctx.font = "bold 16px sans-serif"; ctx.textAlign = "center"; ctx.fillText(tp.text, tp.x, tp.y); tp.y -= 1.5; tp.life--; });
      ctx.globalAlpha = 1;
      s.tipPopups = s.tipPopups.filter(tp => tp.life > 0);

      // Zone transition banner
      if (s.zoneTransTimer > 0) {
        const a = Math.min(s.zoneTransTimer / 30, 1) * (s.zoneTransTimer > 150 ? (180 - s.zoneTransTimer) / 30 : 1);
        ctx.globalAlpha = Math.min(a, 1);
        ctx.fillStyle = "rgba(10,10,10,0.85)"; ctx.beginPath(); ctx.roundRect(30, CANVAS_H / 2 - 30, CANVAS_W - 60, 60, 12); ctx.fill();
        ctx.strokeStyle = PRIMARY; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(30, CANVAS_H / 2 - 30, CANVAS_W - 60, 60, 12); ctx.stroke();
        ctx.fillStyle = "#fff"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "center"; ctx.fillText(s.zoneName, CANVAS_W / 2, CANVAS_H / 2 + 5);
        ctx.globalAlpha = 1;
      }

      // Red flash on crash
      if (s.flashRed > 0) {
        ctx.fillStyle = `rgba(220,40,40,${s.flashRed * 0.02})`; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      }

      // Mobile controls
      if (isTouchRef.current && s.gameActive) {
        const ts2 = touchStateRef.current;
        const ty = CANVAS_H - 80;
        ctx.fillStyle = ts2.left ? "rgba(255,133,51,0.35)" : "rgba(255,255,255,0.06)";
        ctx.beginPath(); ctx.roundRect(8, ty, 115, 65, 14); ctx.fill();
        ctx.fillStyle = ts2.left ? "#fff" : "rgba(255,255,255,0.35)";
        ctx.font = "bold 26px sans-serif"; ctx.textAlign = "center"; ctx.fillText("◀", 65, ty + 42);

        ctx.fillStyle = ts2.brake ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.06)";
        ctx.beginPath(); ctx.roundRect(130, ty, 140, 65, 14); ctx.fill();
        ctx.fillStyle = ts2.brake ? "#fff" : "rgba(255,255,255,0.3)";
        ctx.font = "bold 14px sans-serif"; ctx.fillText("🛑 FREIN", CANVAS_W / 2, ty + 42);

        ctx.fillStyle = ts2.right ? "rgba(255,133,51,0.35)" : "rgba(255,255,255,0.06)";
        ctx.beginPath(); ctx.roundRect(CANVAS_W - 123, ty, 115, 65, 14); ctx.fill();
        ctx.fillStyle = ts2.right ? "#fff" : "rgba(255,255,255,0.35)";
        ctx.font = "bold 26px sans-serif"; ctx.fillText("▶", CANVAS_W - 65, ty + 42);
      }

      ctx.restore();
    }

    function gameLoop() {
      const s = stateRef.current;
      if (s.gameActive) {
        spawnTraffic(s); spawnScenery(s); spawnPowerups(s); trySpawnPassenger(s);
        update(); drawGame();
      } else { drawIdlePreview(); }
      animId = requestAnimationFrame(gameLoop);
    }
    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // ========================================================================
  // RENDER
  // ========================================================================
  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center" style={{ touchAction: "none" }}>
      <div className="relative" style={{ width: CANVAS_W * scale, height: CANVAS_H * scale }}>
        <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="block" style={{ width: CANVAS_W * scale, height: CANVAS_H * scale, borderRadius: screenState === "start" ? 16 : 0 }} />

        {screenState === "start" && (
          <div className="absolute inset-0 z-40 flex items-start justify-center overflow-y-auto" style={{ borderRadius: 16 }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black/95" style={{ borderRadius: 16 }} />
            <div className="relative z-10 w-full max-w-xs flex flex-col items-center gap-4 px-4 py-6">
              <div className="relative w-full flex items-end justify-center" style={{ height: 180 }}>
                <div className="relative w-36 h-44 -mb-2"><Image src="/images/chauffeur.png" alt="Chauffeur VTC76" fill className="object-contain drop-shadow-2xl" sizes="144px" priority /></div>
                <div className="absolute top-2 right-2 w-10 h-10 opacity-80"><Image src="/images/vtc76.png" alt="VTC76" fill className="object-contain" sizes="40px" /></div>
              </div>
              <div className="text-center -mt-1">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-1">VTC76 Presents</p>
                <h1 className="text-2xl font-extrabold tracking-tight" style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${GOLD})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MISSION AÉROPORT</h1>
                <p className="text-gray-500 text-[10px] mt-1">Normandie → Autoroute A13 → Paris CDG</p>
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                <div className="flex items-center gap-2.5 text-[11px] text-gray-300 bg-white/[0.04] rounded-lg px-3 py-2 border border-white/5">
                  <span className="text-sm">🧑</span><span>Récupérez des clients, déposez-les à temps !</span>
                </div>
                <div className="flex items-center gap-2.5 text-[11px] text-gray-300 bg-white/[0.04] rounded-lg px-3 py-2 border border-white/5">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] shrink-0 font-bold" style={{ background: NEON_BLUE }}>T</span>
                  <span>Télépéage = Boost + Invincibilité</span>
                </div>
                <div className="flex items-center gap-2.5 text-[11px] text-gray-300 bg-white/[0.04] rounded-lg px-3 py-2 border border-white/5">
                  <span className="text-sm">🛑</span><span>Frein d&apos;urgence pour déraper et ralentir</span>
                </div>
              </div>
              {leaderboard.length > 0 && (
                <div className="w-full bg-white/[0.03] rounded-xl border border-white/5 p-3">
                  <h2 className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: GOLD }}>Top 5 — Meilleurs chauffeurs</h2>
                  <LeaderboardTable scores={leaderboard} />
                </div>
              )}
              <button onClick={startGame} className="w-full py-4 rounded-xl font-bold text-white text-base transition-all hover:scale-[1.03] active:scale-95" style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_DARK})`, boxShadow: "0 0 40px rgba(255,133,51,0.3), inset 0 1px 0 rgba(255,255,255,0.15)" }}>DÉMARRER LA COURSE</button>
              <p className="text-gray-600 text-[9px] text-center leading-relaxed">Clavier : Flèches + Espace (frein)<br />Mobile : ◀ ▶ pour tourner+accélérer, centre = frein</p>
              <Link href="/" className="text-gray-600 text-[11px] hover:text-gray-400 transition-colors pb-4">← Retour au site vtc76.fr</Link>
            </div>
          </div>
        )}

        {screenState === "playing" && (
          <>
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-2 pointer-events-none" style={{ background: "rgba(10,10,10,0.85)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${PRIMARY}40` }}>
              <div className="flex items-center gap-2.5">
                <div className="flex flex-col"><span className="text-[7px] text-gray-500 uppercase">Dist.</span><span className="text-[11px] font-bold tabular-nums" style={{ color: PRIMARY }}>{hudData.dist.toFixed(1)} km</span></div>
                <div className="flex flex-col"><span className="text-[7px] text-gray-500 uppercase">Vit.</span><span className="text-[11px] font-bold tabular-nums text-white">{hudData.speed}</span></div>
                <div className="flex flex-col"><span className="text-[7px] text-gray-500 uppercase">Clients</span><span className="text-[11px] font-bold tabular-nums text-green-400">{hudData.clients}</span></div>
              </div>
              <div className="flex items-center gap-2">
                {hudData.passengerAboard && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-600 text-white animate-pulse">EN COURSE</span>}
                {hudData.combo > 1 && <span className="text-[10px] font-bold animate-pulse" style={{ color: GOLD }}>x{hudData.combo}</span>}
                {hudData.boost && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse" style={{ background: NEON_BLUE, color: "#fff" }}>BOOST</span>}
                <div className="flex flex-col items-end"><span className="text-[7px] text-gray-500 uppercase">Score</span><span className="text-[11px] font-bold tabular-nums" style={{ color: GOLD }}>{hudData.score.toLocaleString("fr-FR")}</span></div>
              </div>
            </div>
            <button onClick={toggleMute} className="absolute z-20 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all hover:scale-110 active:scale-90" style={{ top: 42, right: 6, background: "rgba(30,30,30,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}>{muted ? "🔇" : "🔊"}</button>
          </>
        )}

        {screenState === "end" && (
          <div className="absolute inset-0 z-30 bg-black/92 flex items-start justify-center overflow-y-auto">
            <div className="flex flex-col items-center w-full max-w-xs px-4 py-6 min-h-full justify-center gap-3">
              <div className="relative w-20 h-24 -mb-1"><Image src="/images/chauffeur.png" alt="Chauffeur" fill className="object-contain" sizes="80px" /></div>
              <h2 className="text-lg font-bold" style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${GOLD})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MISSION TERMINÉE</h2>
              <p className="text-gray-400 text-[11px]">Passagers déposés à l&apos;aéroport !</p>
              <div className="text-2xl" style={{ color: GOLD }}>{Array.from({ length: 5 }, (_, i) => (i < finalStars ? "★" : "☆")).join("")}</div>
              <div className="flex gap-3">
                <div className="bg-white/5 rounded-xl px-4 py-2 border border-white/10 text-center">
                  <p className="text-[9px] text-gray-500 uppercase">Score</p>
                  <p className="text-lg font-bold" style={{ color: PRIMARY }}>{finalScore.toLocaleString("fr-FR")}</p>
                </div>
                <div className="bg-white/5 rounded-xl px-4 py-2 border border-white/10 text-center">
                  <p className="text-[9px] text-gray-500 uppercase">Clients</p>
                  <p className="text-lg font-bold text-green-400">{stateRef.current.clientsServed}</p>
                </div>
              </div>
              {!submitted ? (
                <div className="w-full flex flex-col gap-2">
                  <p className="text-[10px] text-gray-400 text-center uppercase tracking-wider">Entrez votre pseudo pour le classement</p>
                  <input type="text" maxLength={10} value={pseudo} onChange={(e) => setPseudo(e.target.value.toUpperCase())} onKeyDown={(e) => { if (e.key === "Enter") submitScore(); }} placeholder="VOTRE PSEUDO" autoFocus className="w-full px-4 py-3 rounded-xl text-center font-bold text-sm tracking-widest text-white placeholder-gray-600 outline-none transition-all focus:ring-2 focus:ring-orange-500/50" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <button onClick={submitScore} disabled={!pseudo.trim() || submitting} className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-40" style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_DARK})` }}>{submitting ? "..." : "ENREGISTRER"}</button>
                </div>
              ) : <p className="text-xs text-green-400">Score enregistré !</p>}
              {leaderboard.length > 0 && (
                <div className="w-full bg-white/[0.03] rounded-xl border border-white/5 p-3 mt-1">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: GOLD }}>Classement</h3>
                  <LeaderboardTable scores={leaderboard} />
                </div>
              )}
              <div className="flex flex-col gap-2 w-full mt-2">
                <button onClick={startGame} className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.03] active:scale-95" style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_DARK})`, boxShadow: "0 0 20px rgba(255,133,51,0.2)" }}>REJOUER</button>
                <Link href="/calculateur" className="w-full py-2.5 rounded-xl font-semibold text-sm text-center transition-all hover:scale-[1.03] border" style={{ borderColor: `${PRIMARY}40`, color: PRIMARY }}>Réserver un VTC</Link>
                <Link href="/" className="text-center text-xs text-gray-500 hover:text-gray-300 transition-colors mt-1 pb-4">← Retour à l&apos;accueil</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
