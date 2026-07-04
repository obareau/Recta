// Lit sonore d'un « communiqué diffusé » — nappe de la Rectitude, self-contained
// (Recta n'embarque pas le moteur chiptune de Terra-Incognita). Bourdonnement
// grave + bips de station à numéros + friction de porteuse. Déterministe par seed.
// Router master → captureDest (MediaRecorder) et/ou destination (monitoring).

import { rngFor, type Rng } from "./rng";

export class BroadcastBed {
  private ctx: AudioContext;
  private master: GainNode;
  private beeper: number | null = null;
  private rng: Rng;
  private mode: "normal" | "pirate" = "normal";

  constructor(seed: string, ctx = new AudioContext()) {
    this.ctx = ctx;
    this.rng = rngFor(seed, "bed");
    this.master = ctx.createGain();
    this.master.gain.value = 0.5;
  }

  /** Flux audio capturable (MediaRecorder). */
  captureStream(): MediaStream {
    const dest = this.ctx.createMediaStreamDestination();
    this.master.connect(dest);
    return dest.stream;
  }

  /** Écoute locale (facultative). */
  monitor(): void {
    this.master.connect(this.ctx.destination);
  }

  start(): void {
    void this.ctx.resume();
    // Bourdonnement grave : deux dents de scie légèrement désaccordées → battement.
    for (const detune of [0, 6]) {
      const osc = this.ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = 55;
      osc.detune.value = detune;
      const lp = this.ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 180;
      const g = this.ctx.createGain();
      g.gain.value = 0.16;
      osc.connect(lp); lp.connect(g); g.connect(this.master);
      osc.start();
    }
    // Friction de porteuse : bruit filtré, très bas.
    const nb = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
    const data = nb.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = this.rng() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = nb; noise.loop = true;
    const nbp = this.ctx.createBiquadFilter();
    nbp.type = "bandpass"; nbp.frequency.value = 1800; nbp.Q.value = 0.6;
    const ng = this.ctx.createGain();
    ng.gain.value = 0.04;
    noise.connect(nbp); nbp.connect(ng); ng.connect(this.master);
    noise.start();

    this.scheduleBeeps();
  }

  /** Bips de « station à numéros » — cadence régulière, chaotique en mode pirate. */
  private scheduleBeeps(): void {
    const tick = (): void => {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = this.mode === "pirate" ? "square" : "sine";
      const base = this.mode === "pirate" ? 320 + this.rng() * 600 : (this.rng() < 0.5 ? 660 : 880);
      osc.frequency.value = base;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.18, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      osc.connect(g); g.connect(this.master);
      osc.start(t); osc.stop(t + 0.2);
      const gap = this.mode === "pirate" ? 120 + this.rng() * 220 : 900 + this.rng() * 500;
      this.beeper = window.setTimeout(tick, gap);
    };
    tick();
  }

  /** Bascule en intrusion pirate : porteuse instable, bips erratiques. */
  setPirate(on: boolean): void {
    this.mode = on ? "pirate" : "normal";
    if (on) this.master.gain.setTargetAtTime(0.62, this.ctx.currentTime, 0.05);
  }

  stop(): void {
    if (this.beeper !== null) clearTimeout(this.beeper);
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
  }
}
