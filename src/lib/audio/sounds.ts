let audioCtx: AudioContext | null = null;

const getContext = (): AudioContext => {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
};

const playTone = (
  frequency: number,
  duration: number,
  startTime: number,
  ctx: AudioContext,
  gain: GainNode,
) => {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = frequency;
  osc.connect(gain);
  osc.start(startTime);
  osc.stop(startTime + duration);
};

export const playStartChime = () => {
  const ctx = getContext();
  const gain = ctx.createGain();
  gain.gain.value = 0.15;
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  playTone(440, 0.1, now, ctx, gain);
  playTone(587, 0.12, now + 0.12, ctx, gain);
};

export const playEndRing = () => {
  const ctx = getContext();
  const gain = ctx.createGain();
  gain.gain.value = 0.2;
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  playTone(880, 0.15, now, ctx, gain);
  playTone(698, 0.15, now + 0.18, ctx, gain);
  playTone(523, 0.25, now + 0.36, ctx, gain);

  gain.gain.setValueAtTime(0.2, now + 0.5);
  gain.gain.linearRampToValueAtTime(0, now + 0.7);
};
