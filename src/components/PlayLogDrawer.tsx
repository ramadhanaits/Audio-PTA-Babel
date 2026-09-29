import React from 'react';
import { X, History, Trash2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { PlayLog } from '../types';

interface PlayLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: PlayLog[];
  onClearLogs: () => void;
}

export const PlayLogDrawer: React.FC<PlayLogDrawerProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-emerald-950 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold">
              Riwayat Pemutaran Audio Pengumuman
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Log List */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-2.5">
          {logs.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">Belum ada riwayat pemutaran audio hari ini.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Catatan akan otomatis muncul setiap kali audio diputar oleh jadwal atau tombol manual.
              </p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-0.5">
                    {log.status === 'Berhasil' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">
                      {log.title}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-mono">{log.timestamp} WIB</span>
                      <span>•</span>
                      <span className="font-mono text-emerald-800 font-semibold">{log.timeSlot}</span>
                      <span>•</span>
                      <span className="text-slate-600">Mode: {log.mode}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                      log.status === 'Berhasil'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 disabled:opacity-40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Bersihkan Riwayat</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
