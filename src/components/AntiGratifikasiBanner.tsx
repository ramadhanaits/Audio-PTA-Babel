import React from 'react';
import { ShieldCheck, Award, Megaphone, VolumeX, Sparkles } from 'lucide-react';

export const AntiGratifikasiBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-emerald-700/60 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-400/40 text-amber-300 flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-amber-300 tracking-wide uppercase">
                Maklumat Pelayanan & Integritas
              </span>
              <span className="text-[10px] bg-emerald-700/60 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-600/50">
                Peringatan Rutin Pengeras Suara
              </span>
            </div>
            <p className="text-sm font-semibold text-white mt-0.5">
              "Katakan Tidak pada Gratifikasi! Layanan PTA Kepulauan Bangka Belitung Bebas Biaya Liar, Bersih, dan Berkeadilan."
            </p>
            <p className="text-xs text-emerald-200/80 mt-1">
              Audio peringatan diputar secara berkala ke seluruh area kantor & ruang tunggu sidang untuk menjamin komitmen aparatur dan rasa nyaman masyarakat pencari keadilan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto bg-emerald-950/70 px-4 py-2.5 rounded-xl border border-emerald-700/60 text-xs">
          <Award className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="text-left">
            <div className="font-semibold text-amber-200">Zona Integritas</div>
            <div className="text-[11px] text-emerald-300">Menuju WBK / WBBM 2026</div>
          </div>
        </div>
      </div>
    </div>
  );
};
