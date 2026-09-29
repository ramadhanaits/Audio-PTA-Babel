import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Volume2,
  Calendar,
  Filter,
  Search,
  Download,
  Upload,
  RefreshCw,
  Info,
  CheckCircle,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { ScheduleItem, PlayLog, SystemSettings } from './types';
import { INITIAL_SCHEDULES, CATEGORY_LABELS } from './data/defaultSchedules';
import { audioEngine } from './utils/audioEngine';
import {
  saveAudioFile,
  getAudioFile,
  deleteAudioFile,
  getAllStoredAudioKeys
} from './utils/audioStorage';
import { Header } from './components/Header';
import { AntiGratifikasiBanner } from './components/AntiGratifikasiBanner';
import { SystemStatusBar } from './components/SystemStatusBar';
import { AudioScheduleCard } from './components/AudioScheduleCard';
import { ScheduleModal } from './components/ScheduleModal';
import { AudioJackGuideModal } from './components/AudioJackGuideModal';
import { PlayLogDrawer } from './components/PlayLogDrawer';

const STORAGE_KEY_SCHEDULES = 'pta_babel_schedules_v2';
const STORAGE_KEY_LOGS = 'pta_babel_play_logs_v1';
const STORAGE_KEY_SETTINGS = 'pta_babel_settings_v1';

function getInitialSchedules(): ScheduleItem[] {
  try {
    const savedV2 = localStorage.getItem(STORAGE_KEY_SCHEDULES);
    if (savedV2) {
      return JSON.parse(savedV2);
    }

    // Migrate from v1 if present, preserving uploaded audio file names
    const savedV1 = localStorage.getItem('pta_babel_schedules_v1');
    if (savedV1) {
      const oldItems: ScheduleItem[] = JSON.parse(savedV1);
      const merged = INITIAL_SCHEDULES.map((initItem) => {
        const matchingOld = oldItems.find(
          (o) => o.id === initItem.id || (o.hour === initItem.hour && o.minute === initItem.minute)
        );
        if (matchingOld) {
          return {
            ...initItem,
            hasCustomAudio: matchingOld.hasCustomAudio,
            audioFileName: matchingOld.audioFileName,
            audioFileSize: matchingOld.audioFileSize,
            uploadedAt: matchingOld.uploadedAt,
            enabled: matchingOld.enabled
          };
        }
        return initItem;
      });

      const customItems = oldItems.filter(
        (o) => !INITIAL_SCHEDULES.some((i) => i.id === o.id || (i.hour === o.hour && i.minute === o.minute))
      );
      const combined = [...merged, ...customItems].sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
      localStorage.setItem(STORAGE_KEY_SCHEDULES, JSON.stringify(combined));
      return combined;
    }
  } catch (e) {
    console.warn('Failed to parse saved schedules:', e);
  }
  return INITIAL_SCHEDULES;
}

export default function App() {
  // Schedules State (Default 9 time slots: 08.00, 09.00, 10.00, 11.00, 13.00, 14.00, 15.00, 16.00, 16.25)
  const [schedules, setSchedules] = useState<ScheduleItem[]>(getInitialSchedules);

  // Playback State
  const [playbackState, setPlaybackState] = useState(audioEngine.getState());
  const [isSystemActive, setIsSystemActive] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(audioEngine.getVolume());
  const [isMuted, setIsMuted] = useState<boolean>(audioEngine.getIsMuted());
  const [playPreChime, setPlayPreChime] = useState<boolean>(true);
  const [isWakeLockActive, setIsWakeLockActive] = useState<boolean>(false);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Logs & Modals
  const [logs, setLogs] = useState<PlayLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved logs:', e);
    }
    return [];
  });

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [isJackGuideOpen, setIsJackGuideOpen] = useState<boolean>(false);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState<boolean>(false);

  // Time & Automation Tracking
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const lastTriggerKeyRef = useRef<string>('');
  const schedulesRef = useRef<ScheduleItem[]>(schedules);
  schedulesRef.current = schedules;
  const isSystemActiveRef = useRef<boolean>(isSystemActive);
  isSystemActiveRef.current = isSystemActive;
  const playPreChimeRef = useRef<boolean>(playPreChime);
  playPreChimeRef.current = playPreChime;

  // Sync stored audio keys from IndexedDB on initial load
  useEffect(() => {
    async function syncStoredFiles() {
      try {
        const storedKeys = await getAllStoredAudioKeys();
        setSchedules((prev) =>
          prev.map((item) => {
            const hasStored = storedKeys.includes(item.id);
            if (hasStored && !item.hasCustomAudio) {
              return { ...item, hasCustomAudio: true };
            } else if (!hasStored && item.hasCustomAudio && !item.audioFileName) {
              return { ...item, hasCustomAudio: false };
            }
            return item;
          })
        );
      } catch (err) {
        console.warn('Error reading stored audio files:', err);
      }
    }
    syncStoredFiles();
  }, []);

  // Save schedules to localStorage whenever changed
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SCHEDULES, JSON.stringify(schedules));
  }, [schedules]);

  // Save logs to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs.slice(0, 50)));
  }, [logs]);

  // Subscribe to Audio Engine events
  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((state) => {
      setPlaybackState(state);
    });
    return () => unsubscribe();
  }, []);

  // Helper to add audit log
  const addLog = (title: string, timeSlot: string, mode: 'Otomatis' | 'Manual', status: 'Berhasil' | 'Gagal' | 'Diberhentikan') => {
    const newLog: PlayLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      title,
      timeSlot,
      mode,
      status
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Play a specific schedule item
  const handlePlaySchedule = async (item: ScheduleItem, mode: 'Otomatis' | 'Manual' = 'Manual') => {
    // If not unlocked yet, try unlocking
    if (!audioEngine.getIsUnlocked()) {
      const unlocked = await audioEngine.unlockAudio();
      if (unlocked) {
        setIsSystemActive(true);
        setIsWakeLockActive(true);
      }
    }

    const timeSlotStr = `${String(item.hour).padStart(2, '0')}:${String(item.minute).padStart(2, '0')} WIB`;

    try {
      // Check if custom audio file is in IndexedDB
      const record = await getAudioFile(item.id);

      if (record && record.blob) {
        await audioEngine.playBlob(record.blob, item.id, item.title, playPreChimeRef.current);
      } else {
        // Fallback: chime + synthesized speech announcement
        await audioEngine.playFallbackAudio(item.id, item.title, item.description);
      }

      addLog(item.title, timeSlotStr, mode, 'Berhasil');
    } catch (err) {
      console.error('Failed to play schedule audio:', err);
      addLog(item.title, timeSlotStr, mode, 'Gagal');
    }
  };

  // Stop currently playing audio
  const handleStopAudio = () => {
    if (playbackState.currentTitle) {
      addLog(playbackState.currentTitle, 'Manual', 'Manual', 'Diberhentikan');
    }
    audioEngine.stop();
  };

  // Test Chime Bell
  const handleTestChime = async () => {
    if (!audioEngine.getIsUnlocked()) {
      await audioEngine.unlockAudio();
      setIsSystemActive(true);
      setIsWakeLockActive(true);
    }
    audioEngine.playChime();
  };

  // Master System Toggle
  const handleToggleSystem = async () => {
    if (!isSystemActive) {
      const unlocked = await audioEngine.unlockAudio();
      if (unlocked) {
        setIsSystemActive(true);
        setIsWakeLockActive(true);
        audioEngine.playChime(0.9); // play confirmation chime
      } else {
        alert('Izin audio browser belum diberikan. Mohon klik sembarang di layar lalu coba lagi.');
      }
    } else {
      setIsSystemActive(false);
      setIsWakeLockActive(false);
      audioEngine.releaseWakeLock();
      audioEngine.stop();
    }
  };

  // Master Volume Change
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    audioEngine.setVolume(newVol);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioEngine.setMute(nextMuted);
  };

  // Upload/Insert MP3 File handler
  const handleUploadFile = async (scheduleId: string, file: File) => {
    try {
      await saveAudioFile(scheduleId, file, file.name);

      setSchedules((prev) =>
        prev.map((item) => {
          if (item.id === scheduleId) {
            return {
              ...item,
              hasCustomAudio: true,
              audioFileName: file.name,
              audioFileSize: file.size,
              uploadedAt: new Date().toISOString()
            };
          }
          return item;
        })
      );
    } catch (err) {
      console.error('Failed to save audio file:', err);
      alert('Gagal menyimpan file audio ke database browser. Pastikan ukuran file wajar.');
    }
  };

  // Remove MP3 file
  const handleRemoveFile = async (scheduleId: string) => {
    if (confirm('Hapus file audio ini? Sistem akan kembali ke suara bel default jika belum ada file baru.')) {
      await deleteAudioFile(scheduleId);
      setSchedules((prev) =>
        prev.map((item) => {
          if (item.id === scheduleId) {
            return {
              ...item,
              hasCustomAudio: false,
              audioFileName: undefined,
              audioFileSize: undefined
            };
          }
          return item;
        })
      );
    }
  };

  // Schedule enable/disable toggle
  const handleToggleEnableSchedule = (scheduleId: string) => {
    setSchedules((prev) =>
      prev.map((item) => (item.id === scheduleId ? { ...item, enabled: !item.enabled } : item))
    );
  };

  // Save or edit schedule item
  const handleSaveSchedule = async (scheduleData: Omit<ScheduleItem, 'hasCustomAudio'>, file?: File) => {
    let hasCustomAudio = false;

    if (file) {
      await saveAudioFile(scheduleData.id, file, file.name);
      hasCustomAudio = true;
    } else {
      const existing = await getAudioFile(scheduleData.id);
      hasCustomAudio = !!existing;
    }

    setSchedules((prev) => {
      const index = prev.findIndex((s) => s.id === scheduleData.id);
      const fullItem: ScheduleItem = {
        ...scheduleData,
        hasCustomAudio,
        audioFileName: file ? file.name : (index >= 0 ? prev[index].audioFileName : undefined),
        audioFileSize: file ? file.size : (index >= 0 ? prev[index].audioFileSize : undefined)
      };

      if (index >= 0) {
        const updated = [...prev];
        updated[index] = fullItem;
        return updated;
      } else {
        return [...prev, fullItem].sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
      }
    });

    setEditingSchedule(null);
  };

  // Delete schedule
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (confirm('Yakin ingin menghapus jadwal ini?')) {
      await deleteAudioFile(scheduleId);
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
    }
  };

  // Reset to default PTA schedules
  const handleResetToDefault = async () => {
    if (confirm('Kembalikan ke jadwal standar PTA Kepulauan Bangka Belitung? File audio yang sudah diunggah tidak akan terhapus jika ID sama.')) {
      setSchedules(INITIAL_SCHEDULES);
      localStorage.setItem(STORAGE_KEY_SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
    }
  };

  // Export schedules as JSON
  const handleExportConfig = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(schedules, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `jadwal_audio_pta_babel_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import schedules JSON
  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            setSchedules(parsed);
            alert('Jadwal berhasil diimpor!');
          }
        } catch (err) {
          alert('Format file JSON tidak valid.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Real-time Automation Engine Tick (Every 1 second)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const hour = now.getHours();
      const minute = now.getMinutes();
      const second = now.getSeconds();
      const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, etc.

      // Exact on second 0 of the minute
      if (second === 0 && isSystemActiveRef.current) {
        const triggerKey = `${dayOfWeek}-${hour}-${minute}`;

        if (lastTriggerKeyRef.current !== triggerKey) {
          lastTriggerKeyRef.current = triggerKey;

          // Find schedule that matches current hour and minute and is active on this day
          const matched = schedulesRef.current.find(
            (item) =>
              item.enabled &&
              item.hour === hour &&
              item.minute === minute &&
              item.daysOfWeek.includes(dayOfWeek)
          );

          if (matched) {
            console.log(`[PA Engine] Memutar Otomatis: ${matched.title} (Jam ${hour}:${minute})`);
            handlePlaySchedule(matched, 'Otomatis');
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate Next Schedule and Time Remaining
  const { nextSchedule, timeRemainingText } = useMemo(() => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    const currentDay = now.getDay();
    const currentTotalSec = currentHour * 3600 + currentMinute * 60 + currentSecond;

    // Filter enabled schedules that run today and haven't passed yet
    const todaySchedules = schedules
      .filter((s) => s.enabled && s.daysOfWeek.includes(currentDay))
      .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));

    const futureToday = todaySchedules.find((s) => {
      const sTotalSec = s.hour * 3600 + s.minute * 60;
      return sTotalSec > currentTotalSec;
    });

    if (futureToday) {
      const targetSec = futureToday.hour * 3600 + futureToday.minute * 60;
      const diffSec = targetSec - currentTotalSec;
      const h = Math.floor(diffSec / 3600);
      const m = Math.floor((diffSec % 3600) / 60);
      const s = diffSec % 60;
      const text = `${h > 0 ? `${h}j ` : ''}${m}m ${String(s).padStart(2, '0')}d`;
      return { nextSchedule: futureToday, timeRemainingText: text };
    }

    // Otherwise find the earliest schedule of tomorrow or upcoming days
    const allEnabled = schedules.filter((s) => s.enabled);
    if (allEnabled.length > 0) {
      // Find first upcoming day schedule
      for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
        const nextDay = (currentDay + dayOffset) % 7;
        const matchedDaySchedules = allEnabled
          .filter((s) => s.daysOfWeek.includes(nextDay))
          .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));

        if (matchedDaySchedules.length > 0) {
          const first = matchedDaySchedules[0];
          const text = dayOffset === 1 ? 'Besok Pagi' : `Hari mendatang`;
          return { nextSchedule: first, timeRemainingText: text };
        }
      }
    }

    return { nextSchedule: null, timeRemainingText: '-' };
  }, [schedules, currentTime]);

  // Filtered schedules for rendering
  const filteredSchedules = useMemo(() => {
    return schedules
      .filter((item) => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch =
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(item.hour).includes(searchQuery);
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
  }, [schedules, selectedCategory, searchQuery]);

  const activeCount = schedules.filter((s) => s.enabled).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        isSystemActive={isSystemActive}
        onToggleSystem={handleToggleSystem}
        onOpenJackGuide={() => setIsJackGuideOpen(true)}
        onOpenLog={() => setIsLogDrawerOpen(true)}
        onOpenNewSchedule={() => {
          setEditingSchedule(null);
          setIsScheduleModalOpen(true);
        }}
        activeCount={activeCount}
        totalCount={schedules.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Anti Gratifikasi Motto Banner */}
        <AntiGratifikasiBanner />

        {/* Real-time Status & Master Audio Bar */}
        <SystemStatusBar
          isPlaying={playbackState.isPlaying}
          currentTitle={playbackState.currentTitle}
          currentScheduleId={playbackState.currentScheduleId}
          nextSchedule={nextSchedule}
          timeRemainingText={timeRemainingText}
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={handleVolumeChange}
          onToggleMute={handleToggleMute}
          onTestChime={handleTestChime}
          onStopAudio={handleStopAudio}
          playPreChime={playPreChime}
          onTogglePreChime={() => setPlayPreChime((prev) => !prev)}
          isSystemActive={isSystemActive}
          onStartSystem={handleToggleSystem}
        />

        {/* Filter, Search & Config Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Jadwal ({schedules.length})
            </button>
            {Object.entries(CATEGORY_LABELS).map(([catKey, catVal]) => (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === catKey
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {catVal.label}
              </button>
            ))}
          </div>

          {/* Search Box & Backup Controls */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari jadwal / jam..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 bg-slate-50/70"
              />
            </div>

            {/* Export JSON */}
            <button
              onClick={handleExportConfig}
              className="p-2 text-slate-500 hover:text-emerald-800 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
              title="Cadangkan / Ekspor Data Jadwal ke File JSON"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Import JSON */}
            <label
              className="p-2 text-slate-500 hover:text-emerald-800 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Impor Cadangan Jadwal dari File JSON"
            >
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={handleImportConfig} className="hidden" />
            </label>

            {/* Reset to defaults */}
            <button
              onClick={handleResetToDefault}
              className="p-2 text-slate-500 hover:text-amber-700 hover:bg-amber-50 border border-slate-200 rounded-xl transition-colors"
              title="Kembalikan ke Jadwal Bawaan PTA Babel"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Schedule Cards Grid */}
        {filteredSchedules.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
            <FolderOpen className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="font-semibold text-slate-700">Tidak ada jadwal audio ditemukan</p>
            <p className="text-xs text-slate-500 mt-1">
              Coba sesuaikan pencarian atau klik tombol "Tambah Jadwal" di atas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSchedules.map((item) => (
              <AudioScheduleCard
                key={item.id}
                item={item}
                isPlaying={playbackState.isPlaying && playbackState.currentScheduleId === item.id}
                onPlayNow={(schedule) => handlePlaySchedule(schedule, 'Manual')}
                onStop={handleStopAudio}
                onToggleEnable={handleToggleEnableSchedule}
                onUploadFile={handleUploadFile}
                onRemoveFile={handleRemoveFile}
                onEdit={(schedule) => {
                  setEditingSchedule(schedule);
                  setIsScheduleModalOpen(true);
                }}
                onDelete={handleDeleteSchedule}
              />
            ))}
          </div>
        )}

        {/* Institutional Audio Information & Setup Tips Card */}
        <div className="mt-8 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl flex-shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-600 space-y-1.5">
              <div className="font-bold text-slate-900 text-sm">
                Petunjuk Teknis Operator Audio PTA Kepulauan Bangka Belitung:
              </div>
              <p>
                1. <strong>Cara Memasukkan File .MP3:</strong> Klik tombol <em>"Klik untuk Masukkan File Audio (.MP3)"</em> pada setiap kartu jam di atas. File MP3 disimpan langsung secara offline di browser (IndexedDB komputer Anda), sehingga tidak memerlukan koneksi internet untuk memutarnya.
              </p>
              <p>
                2. <strong>Sambungan ke Speaker Gedung:</strong> Hubungkan kabel jack audio 3.5mm dari laptop atau HP ke port LINE IN amplifier / mixer sound system PTA Babel. Klik menu <em>"Panduan Kabel Jack / Sound System"</em> di atas untuk panduan setting volume anti dengung.
              </p>
              <p>
                3. <strong>Kebijakan Autoplay Browser:</strong> Setiap pagi saat menyalakan komputer server/laptop audio, cukup klik tombol hijau <strong>"Mulai / Aktifkan Sistem"</strong> 1 kali agar browser memberikan izin memutar audio otomatis sepanjang hari.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-emerald-950 text-emerald-300/80 text-xs py-5 border-t border-emerald-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <div className="font-semibold text-white">
              Pengadilan Tinggi Agama Kepulauan Bangka Belitung
            </div>
            <div className="text-[11px] text-emerald-400/90 mt-0.5">
              Komplek Perkantoran Terpadu Pemerintah Provinsi Kepulauan Bangka Belitung
            </div>
          </div>
          <div className="font-mono text-[11px] text-emerald-400">
            Integritas • Pelayanan Prima • Akuntabel • Transparan
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setEditingSchedule(null);
        }}
        onSave={handleSaveSchedule}
        initialData={editingSchedule}
      />

      <AudioJackGuideModal
        isOpen={isJackGuideOpen}
        onClose={() => setIsJackGuideOpen(false)}
        onTestSound={handleTestChime}
        isWakeLockActive={isWakeLockActive}
      />

      <PlayLogDrawer
        isOpen={isLogDrawerOpen}
        onClose={() => setIsLogDrawerOpen(false)}
        logs={logs}
        onClearLogs={() => {
          setLogs([]);
          localStorage.removeItem(STORAGE_KEY_LOGS);
        }}
      />
    </div>
  );
}
