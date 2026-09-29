export interface ScheduleItem {
  id: string;
  hour: number;          // 0 - 23
  minute: number;        // 0 - 59
  title: string;         // e.g. "Peringatan Pagi & Anti Gratifikasi"
  description: string;   // e.g. "Himbauan tolak suap, pungli, dan gratifikasi di lingkungan PTA Kep. Babel"
  category: 'anti_gratifikasi' | 'layanan_publik' | 'istirahat' | 'disiplin' | 'penutupan' | 'khusus';
  daysOfWeek: number[];  // [1, 2, 3, 4, 5] for Mon-Fri, etc.
  enabled: boolean;
  hasCustomAudio: boolean;
  audioFileName?: string;
  audioFileSize?: number;
  audioDuration?: number;
  uploadedAt?: string;
  repeatTimes?: number;  // default 1
}

export interface PlayLog {
  id: string;
  timestamp: string;
  title: string;
  timeSlot: string;
  mode: 'Otomatis' | 'Manual';
  status: 'Berhasil' | 'Gagal' | 'Diberhentikan';
  details?: string;
}

export interface SystemSettings {
  masterVolume: number; // 0 to 1
  autoStartOnLaunch: boolean;
  playChimeBeforeAudio: boolean;
  chimeVolume: number;
  workDaysOnly: boolean;
  preventSleep: boolean;
}
