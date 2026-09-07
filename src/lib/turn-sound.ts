export const TURN_END_SOUND_REPEAT_COUNT = 3;
export const TURN_END_SOUND_INTERVAL_MS = 250;

export function playTurnEndSound(): void {
  try {
    const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioContext = new AudioContextClass();
    for (let index = 0; index < TURN_END_SOUND_REPEAT_COUNT; index += 1) {
      const startTime = audioContext.currentTime + (index * TURN_END_SOUND_INTERVAL_MS) / 1000;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, startTime);
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.2);
      if (index === TURN_END_SOUND_REPEAT_COUNT - 1) oscillator.onended = () => void audioContext.close();
    }
  } catch {
    return;
  }
}
