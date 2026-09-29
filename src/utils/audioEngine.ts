/**
 * Core Audio Engine for PTA Kepulauan Bangka Belitung PA System.
 * Handles HTML5 audio playback, Web Audio API chimes, volume calibration, and wake lock.
 */

type PlaybackStateListener = (state: {
  isPlaying: boolean;
  currentScheduleId: string | null;
  currentTitle: string | null;
  currentTime: number;
  duration: number;
  isChime: boolean;
}) => void;

class AudioEngine {
  private audioElement: HTMLAudioElement;
  private audioContext: AudioContext | null = null;
  private wakeLock: any = null;
  private isUnlocked: boolean = false;
  private stateListeners: Set<PlaybackStateListener> = new Set();
  private currentScheduleId: string | null = null;
  private currentTitle: string | null = null;
  private isChimePlaying: boolean = false;
  private currentObjectUrl: string | null = null;
  private masterVolume: number = 0.9;
  private isMuted: boolean = false;

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.preload = 'auto';

    this.audioElement.addEventListener('timeupdate', () => {
      this.notifyListeners();
    });

    this.audioElement.addEventListener('ended', () => {
      this.stop();
    });

    this.audioElement.addEventListener('error', (e) => {
      console.warn('Audio playback error:', e);
      this.stop();
    });
  }

  public subscribe(listener: PlaybackStateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.getState());
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  private notifyListeners() {
    const state = this.getState();
    for (const listener of this.stateListeners) {
      listener(state);
    }
  }

  public getState() {
    return {
      isPlaying: !this.audioElement.paused || this.isChimePlaying,
      currentScheduleId: this.currentScheduleId,
      currentTitle: this.currentTitle,
      currentTime: this.audioElement.currentTime || 0,
      duration: this.audioElement.duration || 0,
      isChime: this.isChimePlaying
    };
  }

  /**
   * Unlock AudioContext and AudioElement on user gesture (Autoplay Policy compliance)
   */
  public async unlockAudio(): Promise<boolean> {
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
        }
      }

      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Play a tiny silent buffer on audio element to ensure it's unblocked
      this.audioElement.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      await this.audioElement.play().catch(() => {});
      this.audioElement.pause();
      this.audioElement.currentTime = 0;

      this.isUnlocked = true;

      // Request Screen Wake Lock so computer doesn't enter sleep mode
      await this.requestWakeLock();

      return true;
    } catch (err) {
      console.warn('Could not unlock audio context:', err);
      return false;
    }
  }

  public getIsUnlocked(): boolean {
    return this.isUnlocked;
  }

  /**
   * Request screen wake lock
   */
  public async requestWakeLock(): Promise<boolean> {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
        this.wakeLock.addEventListener('release', () => {
          this.wakeLock = null;
        });
        return true;
      } catch (err) {
        console.warn('Wake Lock request failed:', err);
        return false;
      }
    }
    return false;
  }

  public releaseWakeLock() {
    if (this.wakeLock) {
      this.wakeLock.release().catch(() => {});
      this.wakeLock = null;
    }
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (!this.isMuted) {
      this.audioElement.volume = this.masterVolume;
    }
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    this.audioElement.volume = muted ? 0 : this.masterVolume;
    this.notifyListeners();
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Play an official four-tone Judicial / Public Address chime using Web Audio API
   */
  public async playChime(tempoFactor: number = 1.0): Promise<void> {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.audioContext = new AudioCtx();
    }

    if (!this.audioContext) return;
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.isChimePlaying = true;
    this.notifyListeners();

    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const vol = this.isMuted ? 0 : this.masterVolume;

    // Pleasant 4-note melodic chime: F4 -> A4 -> C5 -> F5
    const notes = [
      { freq: 349.23, time: 0.0, dur: 0.38 }, // F4
      { freq: 440.00, time: 0.28, dur: 0.38 }, // A4
      { freq: 523.25, time: 0.56, dur: 0.42 }, // C5
      { freq: 698.46, time: 0.88, dur: 0.85 }  // F5
    ];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(vol * 0.45, now);
    masterGain.connect(ctx.destination);

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, now + note.time * tempoFactor);

      // Envelope: smooth attack, gentle bell decay
      const startTime = now + note.time * tempoFactor;
      const duration = note.dur * tempoFactor;

      noteGain.gain.setValueAtTime(0.0001, startTime);
      noteGain.gain.exponentialRampToValueAtTime(1.0, startTime + 0.03);
      noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
    });

    return new Promise((resolve) => {
      setTimeout(() => {
        this.isChimePlaying = false;
        this.notifyListeners();
        resolve();
      }, 1600 * tempoFactor);
    });
  }

  /**
   * Play speech announcement using Web Speech API as fallback when no MP3 uploaded yet
   */
  public async playSpeechAnnouncement(title: string, description: string): Promise<void> {
    if (!('speechSynthesis' in window)) return;

    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      const text = `Perhatian. Pengadilan Tinggi Agama Kepulauan Bangka Belitung. ${title}. ${description}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = this.isMuted ? 0 : this.masterVolume;

      utterance.onend = () => {
        resolve();
      };
      utterance.onerror = () => {
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Play an audio Blob or File from IndexedDB
   */
  public async playBlob(blob: Blob, scheduleId: string, title: string, playPreChime: boolean = false): Promise<void> {
    this.stop();

    if (playPreChime) {
      await this.playChime();
    }

    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
    }

    this.currentObjectUrl = URL.createObjectURL(blob);
    this.audioElement.src = this.currentObjectUrl;
    this.audioElement.volume = this.isMuted ? 0 : this.masterVolume;
    this.currentScheduleId = scheduleId;
    this.currentTitle = title;

    try {
      await this.audioElement.play();
      this.notifyListeners();
    } catch (err) {
      console.error('Failed to play audio blob:', err);
      this.stop();
      throw err;
    }
  }

  /**
   * Play sample fallback when user hasn't inserted custom MP3 yet
   */
  public async playFallbackAudio(scheduleId: string, title: string, description: string): Promise<void> {
    this.stop();
    this.currentScheduleId = scheduleId;
    this.currentTitle = title;
    this.notifyListeners();

    try {
      await this.playChime(1.1);
      await this.playSpeechAnnouncement(title, description);
    } finally {
      this.stop();
    }
  }

  /**
   * Stop any current playback
   */
  public stop() {
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isChimePlaying = false;
    this.currentScheduleId = null;
    this.currentTitle = null;
    this.notifyListeners();
  }

  public pause() {
    this.audioElement.pause();
    this.notifyListeners();
  }

  public resume() {
    if (this.audioElement.src) {
      this.audioElement.play().catch(console.warn);
      this.notifyListeners();
    }
  }
}

export const audioEngine = new AudioEngine();
