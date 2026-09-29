import React, { useState, useEffect } from 'react';
import { Volume2, Power, Headphones, History, Plus, Bell, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  isSystemActive: boolean;
  onToggleSystem: () => void;
  onOpenJackGuide: () => void;
  onOpenLog: () => void;
  onOpenNewSchedule: () => void;
  activeCount: number;
  totalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isSystemActive,
  onToggleSystem,
  onOpenJackGuide,
  onOpenLog,
  onOpenNewSchedule,
  activeCount,
  totalCount
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const dateString = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="relative bg-emerald-950 text-white border-b border-emerald-800 shadow-md">
      {/* Background patterned overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#0f766e_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

      {/* Institutional Top Bar */}
      <div className="relative border-b border-emerald-900/60 bg-emerald-950/80 px-4 sm:px-6 py-1.5 text-xs text-emerald-200/90 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>MAHKAMAH AGUNG REPUBLIK INDONESIA</span>
          <span className="text-emerald-500">|</span>
          <span>WILAYAH HUKUM PTA KEPULAUAN BANGKA BELITUNG</span>
        </div>
        <div className="flex items-center gap-3 text-emerald-300 font-mono text-[11px]">
          <span>Zona Waktu: WIB (UTC+7)</span>
          <span className="text-emerald-700">•</span>
          <span>Sistem Siaran Pengumuman Otomatis v2.4</span>
        </div>
      </div>

      {/* Main Header Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Logo & Satker Identity */}
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-900 border border-amber-500/40 shadow-inner flex items-center justify-center text-amber-400">
              {/* Institution Seal Motif */}
              <div className="text-center">
                <Volume2 className="w-8 h-8 sm:w-9 sm:h-9 mx-auto text-amber-400 stroke-[1.75]" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-emerald-950 text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                PTA
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  Pengadilan Tinggi Agama
                </span>
                <span className="text-[11px] text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Zona Integritas WBK / WBBM
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                PTA Kepulauan Bangka Belitung
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200/90 mt-0.5">
                Sistem Otomatisasi Pemutaran Audio Anti Gratifikasi & Layanan Publik
              </p>
            </div>
          </div>

          {/* Right Side: Digital Clock & Master Control Button */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:self-center">
            {/* Live Clock Display */}
            <div className="bg-emerald-900/70 border border-emerald-700/60 rounded-xl px-4 py-2 min-w-[170px] text-right shadow-sm">
              <div className="font-mono text-2xl font-bold tracking-wider text-amber-300 flex items-center justify-end gap-1.5">
                <span>{timeString}</span>
                <span className="text-xs text-emerald-300 font-sans font-normal">WIB</span>
              </div>
              <div className="text-[11px] text-emerald-300 capitalize truncate mt-0.5">
                {dateString}
              </div>
            </div>

            {/* Master Activation Toggle (Autoplay Policy unlocker) */}
            <button
              onClick={onToggleSystem}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md ${
                isSystemActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/50 shadow-emerald-950/50'
                  : 'bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-500 hover:to-amber-600 border border-amber-400/50 animate-pulse'
              }`}
            >
              <Power className={`w-5 h-5 ${isSystemActive ? 'text-white' : 'text-amber-200'}`} />
              <div className="text-left leading-tight">
                <div className="font-bold flex items-center gap-1.5">
                  {isSystemActive ? 'Sistem Audio Aktif' : 'Mulai / Aktifkan Sistem'}
                  {isSystemActive ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-200" />
                  )}
                </div>
                <div className="text-[10px] font-normal opacity-90">
                  {isSystemActive ? `${activeCount} Jadwal Otomatis Siap` : 'Klik 1x untuk buka izin browser'}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="mt-4 pt-3 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-200">
            <span className="font-medium text-white">Status Operasional:</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-300">
              <span className={`w-2 h-2 rounded-full ${isSystemActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              {isSystemActive ? 'Standby (Mendengarkan Waktu)' : 'Menunggu Aktivasi Pengguna'}
            </span>
            <span className="text-emerald-700">|</span>
            <span>Total: <strong>{totalCount}</strong> Jadwal (<strong>{activeCount}</strong> Aktif)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenJackGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/60 rounded-lg text-emerald-100 transition-colors"
              title="Panduan Sambungan Kabel Jack Audio ke Sound System Satker"
            >
              <Headphones className="w-3.5 h-3.5 text-amber-400" />
              <span>Panduan Kabel Jack / Sound System</span>
            </button>

            <button
              onClick={onOpenLog}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/60 rounded-lg text-emerald-100 transition-colors"
              title="Lihat Riwayat Pemutaran Audio"
            >
              <History className="w-3.5 h-3.5 text-emerald-300" />
              <span>Riwayat Pemutaran</span>
            </button>

            <button
              onClick={onOpenNewSchedule}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold rounded-lg transition-colors shadow-sm"
              title="Tambah Jadwal Jam Pemutaran Audio Baru"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Jadwal</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
