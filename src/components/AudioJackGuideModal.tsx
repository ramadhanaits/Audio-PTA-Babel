import React from 'react';
import { X, Headphones, Volume2, ShieldCheck, Zap, Laptop, Radio, AlertCircle, CheckCircle2, Bell } from 'lucide-react';

interface AudioJackGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestSound: () => void;
  isWakeLockActive: boolean;
}

export const AudioJackGuideModal: React.FC<AudioJackGuideModalProps> = ({
  isOpen,
  onClose,
  onTestSound,
  isWakeLockActive
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-emerald-950 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                Panduan Output Kabel Jack & Sound System
              </h2>
              <p className="text-xs text-emerald-300">
                PTA Kepulauan Bangka Belitung • Pengaturan Suara Jernih & Stabil
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 text-sm text-slate-700 max-h-[75vh] overflow-y-auto">
          {/* Quick Test Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-950">
                  Uji Coba Pengeras Suara Sekarang
                </div>
                <div className="text-[11px] text-emerald-800">
                  Putar bel 4-nada untuk mengecek apakah suara sudah masuk ke mixer/amplifier kantor.
                </div>
              </div>
            </div>

            <button
              onClick={onTestSound}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 flex-shrink-0"
            >
              <Volume2 className="w-4 h-4 text-amber-300" />
              <span>Bunyikan Bel Tes</span>
            </button>
          </div>

          {/* Step 1: Cable Connections */}
          <div className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-800 text-white text-xs flex items-center justify-center">
                1
              </span>
              <span>Koneksi Fisik Kabel Jack Audio (AUX)</span>
            </div>
            <ul className="text-xs space-y-2 text-slate-600 pl-8 list-disc">
              <li>
                <strong>Jenis Kabel:</strong> Gunakan kabel <strong>Jack 3.5mm Stereo ke 2x RCA (Merah-Putih)</strong> atau <strong>Jack 3.5mm ke Jack 6.35mm Akai</strong> sesuai port input pada mixer / amplifier pengeras suara PTA Babel.
              </li>
              <li>
                <strong>Colokan Laptop/HP:</strong> Tancapkan ujung jack 3.5mm ke port headphone/earphone laptop atau HP Anda.
              </li>
              <li>
                <strong>Colokan Mixer/Amplifier:</strong> Tancapkan ke saluran input bertuliskan <em>LINE IN, AUX IN, CD/TAPE,</em> atau <em>CH LINE</em> (hindari port MIC IN langsung karena sensitivitasnya terlalu tinggi dan rawan distorsi).
              </li>
            </ul>
          </div>

          {/* Step 2: Volume Calibration */}
          <div className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-800 text-white text-xs flex items-center justify-center">
                2
              </span>
              <span>Kalibrasi Tingkat Volume (Anti Pecah / Cempreng)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pl-8">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                <div className="font-semibold text-slate-800">Volume Laptop / HP:</div>
                <p className="text-slate-600 mt-1">
                  Atur volume laptop di kisaran <strong>75% – 85%</strong>. Jangan 100% penuh untuk menghindari sinyal audio <em>clipping</em> (pecah).
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                <div className="font-semibold text-slate-800">Volume Amplifier / Ruangan:</div>
                <p className="text-slate-600 mt-1">
                  Atur kenyaringan suara ruangan melalui knop master volume pada amplifier mixer kantor agar distribusi ke speaker gedung merata.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3: Preventing Hum & Ground Loop */}
          <div className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-800 text-white text-xs flex items-center justify-center">
                3
              </span>
              <span>Mengatasi Dengung / Hum Saat Laptop Di-charge</span>
            </div>
            <div className="text-xs text-slate-600 pl-8 space-y-1.5">
              <p>
                Jika terdengar suara dengung (<em>humming 50Hz</em>) saat charger laptop dicolok:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Colokkan charger laptop ke stopkontak yang sama dengan amplifier kantor.</li>
                <li>Atau pasang alat kecil bernama <strong>Ground Loop Noise Isolator</strong> (filter jack 3.5mm) di antara kabel laptop dan amplifier.</li>
              </ul>
            </div>
          </div>

          {/* Step 4: Keep Awake & Autoplay */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-800 text-white text-xs flex items-center justify-center">
                4
              </span>
              <span>Kebijakan Browser & Menjaga Komputer Tetap Siaga</span>
            </div>
            <div className="text-xs text-slate-600 pl-8 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Screen Wake Lock: {isWakeLockActive ? 'Aktif (Layar Tidak Akan Tidur)' : 'Siap Diaktifkan'}</span>
              </div>
              <p>
                Sistem otomatis meminta izin <strong>Wake Lock</strong> ke browser agar komputer tidak memasuki mode tidur (Sleep) saat jam dinas berlangsung, sehingga jadwal audio tetap berbunyi tepat waktu.
              </p>
              <p className="text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                <strong>Catatan Autoplay Browser:</strong> Pastikan tombol <em>"Mulai / Aktifkan Sistem"</em> di bagian atas sudah berwarna hijau agar browser mengizinkan audio berbunyi otomatis tanpa terblokir.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Tutup & Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
