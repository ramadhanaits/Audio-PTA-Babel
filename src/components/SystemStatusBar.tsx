import React from 'react';
import { Volume2, VolumeX, Bell, Square, Play, Sparkles, Clock, Radio, CheckCircle, Info } from 'lucide-react';
import { ScheduleItem } from '../types';

interface SystemStatusBarProps {
  isPlaying: boolean;
  currentTitle: string | null;
  currentScheduleId: string | null;
  nextSchedule: ScheduleItem | null;
  timeRemainingText: string;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (newVol: number) => void;
  onToggleMute: () => void;
  onTestChime: () => void;
  onStopAudio: () => void;
  playPreChime: boolean;
  onTogglePreChime: () => void;
  isSystemActive: boolean;
  onStartSystem: () => void;
}

export const SystemStatusBar: React.FC<SystemStatusBarProps> = ({
  isPlaying,
  currentTitle,
  currentScheduleId,
  nextSchedule,
  timeRemainingText,
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  onTestChime,
  onStopAudio,
  playPreChime,
  onTogglePreChime,
  isSystemActive,
  onStartSystem
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Playback Status & Countdown (Cols 1-7) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center gap-3">
            {/* Status indicator badge */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
              isPlaying
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse'
                : isSystemActive
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${
                isPlaying ? 'bg-emerald-600 animate-ping' : isSystemActive ? 'bg-blue-600' : 'bg-amber-500'
              }`} />
              <span>
                {isPlaying
                  ? 'Sedang Mengudara (ON AIR)'
                  : isSystemActive
                  ? 'Sistem Siaga (Mendengarkan Jadwal)'
                  : 'Sistem Belum Diaktifkan'}
              </span>
            </div>

            {isPlaying && (
              <button
                onClick={onStopAudio}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-semibold transition-colors"
                title="Hentikan pemutaran audio yang sedang berjalan"
              >
                <Square className="w-3 h-3 fill-rose-600 text-rose-600" />
                <span>Hentikan Audio</span>
              </button>
            )}
          </div>

          {/* Current song / title or waiting status */}
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {isPlaying ? 'Audio Aktif Saat Ini' : 'Status Pemutaran'}
            </div>
            <div className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2 mt-0.5">
              {isPlaying ? (
                <>
                  <Radio className="w-5 h-5 text-emerald-600 animate-pulse flex-shrink-0" />
                  <span className="text-emerald-950 font-semibold">{currentTitle}</span>
                </>
              ) : (
                <span className="text-slate-600 font-normal">
                  {isSystemActive
                    ? 'Menunggu waktu pemutaran berikutnya...'
                    : 'Klik "Mulai / Aktifkan Sistem" di atas agar audio dapat memutar otomatis'}
                </span>
              )}
            </div>
          </div>

          {/* Animated Spectrum Waveform when audio is playing */}
          {isPlaying ? (
            <div className="flex items-end gap-1 h-6 pt-1">
              {[...Array(24)].map((_, i) => (
                <span
                  key={i}
                  className="w-1 bg-emerald-600 rounded-t transition-all duration-150"
                  style={{
                    height: `${Math.max(15, Math.floor(Math.random() * 100))}%`,
                    animation: `pulse 0.${(i % 5) + 3}s ease-in-out infinite alternate`
                  }}
                />
              ))}
            </div>
          ) : (
            /* Next schedule countdown bar */
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/70 px-3.5 py-2 rounded-xl">
              <Clock className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              {nextSchedule ? (
                <div>
                  <span className="font-semibold text-slate-800">
                    Jadwal Terdekat:{' '}
                  </span>
                  <span className="font-mono font-bold text-emerald-800">
                    {String(nextSchedule.hour).padStart(2, '0')}:{String(nextSchedule.minute).padStart(2, '0')} WIB
                  </span>
                  <span className="mx-1.5 text-slate-400">•</span>
                  <span className="text-slate-700">{nextSchedule.title}</span>
                  <span className="mx-1.5 text-slate-400">•</span>
                  <span className="text-emerald-700 font-semibold">
                    (Dalam {timeRemainingText})
                  </span>
                </div>
              ) : (
                <span>Tidak ada jadwal aktif berikutnya untuk hari ini.</span>
              )}
            </div>
          )}
        </div>

        {/* Master Volume & Output Controls (Cols 8-12) */}
        <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-200/80 pt-4 lg:pt-0 lg:pl-6 space-y-3.5">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-emerald-700" />
              Kontrol Volume Master
            </span>
            <span className="font-mono font-bold text-slate-800">
              {isMuted ? 'Muted (0%)' : `${Math.round(volume * 100)}%`}
            </span>
          </div>

          {/* Volume slider */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMute}
              className={`p-2 rounded-lg border transition-colors ${
                isMuted
                  ? 'bg-rose-50 border-rose-300 text-rose-600'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
              title={isMuted ? 'Buka Senyap (Unmute)' : 'Senyapkan (Mute)'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                if (isMuted) onToggleMute();
                onVolumeChange(parseFloat(e.target.value));
              }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
            />
          </div>

          {/* Test tone button & Pre-Chime Option */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <button
              onClick={onTestChime}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg font-medium transition-colors"
              title="Putar bel 4-nada untuk menguji kabel audio jack dan amplifier sound system"
            >
              <Bell className="w-3.5 h-3.5 text-emerald-700" />
              <span>Tes Bel Chime (Pengeras)</span>
            </button>

            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-900">
              <input
                type="checkbox"
                checked={playPreChime}
                onChange={onTogglePreChime}
                className="w-4 h-4 text-emerald-700 rounded border-slate-300 focus:ring-emerald-600"
              />
              <span className="text-[11px]">Bel Chime sebelum MP3</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
