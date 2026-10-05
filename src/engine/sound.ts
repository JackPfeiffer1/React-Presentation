import { getDeck, setSoundOn } from './deckStore'

type Voice = 'pop' | 'stamp' | 'ding' | 'whoosh' | 'boom' | 'tick'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let noise: AudioBuffer | null = null

/** Create the audio context. Must run inside a user gesture (key press or click). */
export function unlockSound() {
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return
      ctx = new Ctor()
      master = ctx.createGain()
      master.gain.value = 0.35
      master.connect(ctx.destination)
      noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
      const data = noise.getChannelData(0)
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    }
    if (ctx.state === 'suspended') void ctx.resume()
  } catch {
    ctx = null
  }
}

export function toggleSound() {
  setSoundOn(!getDeck().soundOn)
}

function env(gain: GainNode, t: number, peak: number, attack: number, decay: number) {
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(peak, t + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay)
}

function tone(type: OscillatorType, from: number, to: number, start: number, length: number, peak: number) {
  if (!ctx || !master) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(from, start)
  osc.frequency.exponentialRampToValueAtTime(to, start + length)
  env(gain, start, peak, 0.005, length)
  osc.connect(gain).connect(master)
  osc.start(start)
  osc.stop(start + length + 0.05)
}

function burst(filterType: BiquadFilterType, freqFrom: number, freqTo: number, start: number, length: number, peak: number, q = 1) {
  if (!ctx || !master || !noise) return
  const src = ctx.createBufferSource()
  src.buffer = noise
  const filter = ctx.createBiquadFilter()
  filter.type = filterType
  filter.Q.value = q
  filter.frequency.setValueAtTime(freqFrom, start)
  filter.frequency.exponentialRampToValueAtTime(freqTo, start + length)
  const gain = ctx.createGain()
  env(gain, start, peak, Math.min(0.04, length / 4), length)
  src.connect(filter).connect(gain).connect(master)
  src.start(start)
  src.stop(start + length + 0.05)
}

export function play(voice: Voice) {
  if (!getDeck().soundOn || !ctx) return
  try {
    const t = ctx.currentTime + 0.005
    switch (voice) {
      case 'pop':
        tone('sine', 620, 940, t, 0.07, 0.5)
        break
      case 'stamp':
        tone('sine', 120, 50, t, 0.16, 0.9)
        burst('lowpass', 900, 200, t, 0.08, 0.35)
        break
      case 'ding':
        tone('sine', 880, 880, t, 0.25, 0.35)
        tone('sine', 1320, 1320, t + 0.11, 0.35, 0.3)
        break
      case 'whoosh':
        burst('bandpass', 300, 2600, t, 0.42, 0.5, 0.8)
        break
      case 'boom':
        tone('sine', 90, 42, t, 0.9, 1)
        burst('lowpass', 1400, 120, t, 0.6, 0.5)
        break
      case 'tick':
        burst('highpass', 4000, 6000, t, 0.015, 0.05)
        break
    }
  } catch {
    // Sound is decoration. Never let it break the talk.
  }
}
