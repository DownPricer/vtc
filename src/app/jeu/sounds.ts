export class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private _muted = false;

  get muted() { return this._muted; }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AC();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.35;
    this.masterGain.connect(this.ctx.destination);
    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = "triangle";
    this.engineOsc.frequency.value = 0;
    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.value = 0;
    this.engineOsc.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);
    this.engineOsc.start();
  }

  toggleMute(): boolean {
    this._muted = !this._muted;
    if (this.masterGain && this.ctx) this.masterGain.gain.setTargetAtTime(this._muted ? 0 : 0.35, this.ctx.currentTime, 0.05);
    return this._muted;
  }

  updateEngine(speed: number, boost: boolean) {
    if (!this.ctx || !this.engineOsc || !this.engineGain) return;
    const t = this.ctx.currentTime;
    this.engineOsc.frequency.setTargetAtTime(35 + speed * 4.5 + (boost ? 25 : 0), t, 0.08);
    this.engineGain.gain.setTargetAtTime(Math.min(speed / 25, 0.13), t, 0.08);
  }

  playPickup() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(600, t); o.frequency.exponentialRampToValueAtTime(1400, t + 0.08);
    g.gain.setValueAtTime(0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    o.connect(g); g.connect(this.masterGain); o.start(t); o.stop(t + 0.12);
  }

  playBoost() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = "sawtooth"; o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(600, t + 0.2); o.frequency.exponentialRampToValueAtTime(200, t + 0.45);
    g.gain.setValueAtTime(0.12, t); g.gain.setValueAtTime(0.12, t + 0.2); g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    o.connect(g); g.connect(this.masterGain); o.start(t); o.stop(t + 0.45);
  }

  playCrash(intensity = 1) {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const dur = 0.1 + intensity * 0.08;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.2 + intensity * 0.1, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(g); g.connect(this.masterGain); src.start(t);
  }

  playBrake() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * 0.25);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(i / len * Math.PI) * 0.5;
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const hp = this.ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 2000;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    src.connect(hp); hp.connect(g); g.connect(this.masterGain); src.start(t);
  }

  playPickupClient() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    [523, 659, 784].forEach((freq, i) => {
      const o = this.ctx!.createOscillator(), g = this.ctx!.createGain();
      o.type = "sine"; o.frequency.value = freq;
      g.gain.setValueAtTime(0, t + i * 0.1); g.gain.linearRampToValueAtTime(0.13, t + i * 0.1 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.2);
      o.connect(g); g.connect(this.masterGain!); o.start(t + i * 0.1); o.stop(t + i * 0.1 + 0.2);
    });
  }

  playDropoffClient() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    [523, 659, 784, 1047].forEach((freq, i) => {
      const o = this.ctx!.createOscillator(), g = this.ctx!.createGain();
      o.type = "sine"; o.frequency.value = freq;
      g.gain.setValueAtTime(0, t + i * 0.1); g.gain.linearRampToValueAtTime(0.15, t + i * 0.1 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.25);
      o.connect(g); g.connect(this.masterGain!); o.start(t + i * 0.1); o.stop(t + i * 0.1 + 0.25);
    });
  }

  playHonk() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    [340, 350].forEach(freq => {
      const o = this.ctx!.createOscillator(), g = this.ctx!.createGain();
      o.type = "square"; o.frequency.value = freq;
      g.gain.setValueAtTime(0.08, t); g.gain.setValueAtTime(0.08, t + 0.15); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.connect(g); g.connect(this.masterGain!); o.start(t); o.stop(t + 0.2);
    });
  }

  playZoneTransition() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(900, t + 0.15);
    o.frequency.exponentialRampToValueAtTime(600, t + 0.3);
    g.gain.setValueAtTime(0.1, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g); g.connect(this.masterGain); o.start(t); o.stop(t + 0.3);
  }

  playVictory() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    [500, 630, 800, 1000].forEach((freq, i) => {
      const o = this.ctx!.createOscillator(), g = this.ctx!.createGain();
      o.type = "sine"; o.frequency.value = freq;
      g.gain.setValueAtTime(0, t + i * 0.15); g.gain.linearRampToValueAtTime(0.12, t + i * 0.15 + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.3);
      o.connect(g); g.connect(this.masterGain!); o.start(t + i * 0.15); o.stop(t + i * 0.15 + 0.3);
    });
  }

  stopEngine() {
    if (this.engineGain && this.ctx) this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
  }

  destroy() {
    this.stopEngine();
    try { this.engineOsc?.stop(); } catch { /* already stopped */ }
    try { if (this.ctx && this.ctx.state !== "closed") this.ctx.close(); } catch { /* ignore */ }
    this.ctx = null;
  }
}
