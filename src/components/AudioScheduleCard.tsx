import React, { useRef } from 'react';
import {
  Play,
  Square,
  Upload,
  FileAudio,
  Trash2,
  Edit2,
  Clock,
  Check,
  Music,
  AlertCircle,
  Volume2
} from 'lucide-react';
import { ScheduleItem } from '../types';
import { CATEGORY_LABELS, DAY_NAMES } from '../data/defaultSchedules';

interface AudioScheduleCardProps {
  item: ScheduleItem;
  isPlaying: boolean;
  onPlayNow: (item: ScheduleItem) => void;
  onStop: () => void;
  onToggleEnable: (id: string) => void;
  onUploadFile: (id: string, file: File) => void;
  onRemoveFile: (id: string) => void;
  onEdit: (item: ScheduleItem) => void;
  onDelete: (id: string) => void;
}

export const AudioScheduleCard: React.FC<AudioScheduleCardProps> = ({
  item,
  isPlaying,
  onPlayNow,
  onStop,
  onToggleEnable,
  onUploadFile,
  onRemoveFile,
  onEdit,
  onDelete
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadFile(item.id, file);
    }
  };

  const categoryInfo = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.khusus;
  const timeFormatted = `${String(item.hour).padStart(2, '0')}:${String(item.minute).padStart(2, '0')}`;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      className={`relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
        isPlaying
          ? 'border-emerald-500 shadow-lg ring-2 ring-emerald-500/20'
          : item.enabled
          ? 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
          : 'border-slate-200/60 opacity-60 bg-slate-50/50'
      }`}
    >
      {/* Top Accent bar for category */}
      <div className={`h-1.5 w-full ${isPlaying ? 'bg-emerald-600 animate-pulse' : 'bg-slate-200'}`} />

      <div className="p-5">
        {/* Header row: Time, Category Badge, Toggle switch */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Hour & Minute Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-lg font-bold ${
              isPlaying
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-emerald-950 text-amber-300'
            }`}>
              <Clock className="w-4 h-4 text-amber-300" />
              <span>{timeFormatted}</span>
              <span className="text-xs font-sans text-emerald-300 font-normal">WIB</span>
            </div>

            {/* Category tag */}
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${categoryInfo.badgeBg}`}>
              {categoryInfo.label}
            </span>
          </div>

          {/* Active Switch Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              {item.enabled ? 'Aktif' : 'Nonaktif'}
            </span>
            <button
              onClick={() => onToggleEnable(item.id)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                item.enabled ? 'bg-emerald-700' : 'bg-slate-300'
              }`}
              title={item.enabled ? 'Matikan jadwal ini sementara' : 'Aktifkan jadwal ini'}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  item.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Title and Description */}
        <div className="mt-3.5">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-950">
            {item.title}
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>

        {/* Day Indicators */}
        <div className="mt-3 flex items-center gap-1">
          <span className="text-[10px] text-slate-400 font-medium mr-1">Hari:</span>
          {DAY_NAMES.map((name, index) => {
            const isDayActive = item.daysOfWeek.includes(index);
            return (
              <span
                key={name}
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                  isDayActive
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'text-slate-300'
                }`}
                title={name}
              >
                {name.slice(0, 3)}
              </span>
            );
          })}
        </div>

        {/* MP3 File Insertion Section (Requested specifically by user) */}
        <div className="mt-4 pt-3.5 border-t border-slate-100">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/ogg"
            className="hidden"
          />

          {item.hasCustomAudio && item.audioFileName ? (
            /* Uploaded MP3 File Card */
            <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                  <FileAudio className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-emerald-950 truncate" title={item.audioFileName}>
                    {item.audioFileName}
                  </div>
                  <div className="text-[10px] text-emerald-700 flex items-center gap-2">
                    <span>{formatFileSize(item.audioFileSize)}</span>
                    <span>•</span>
                    <span className="text-emerald-800 font-medium">Tersimpan di Penyimpanan Lokal</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-white hover:bg-emerald-100/70 border border-emerald-300 rounded-lg transition-colors"
                  title="Ganti dengan file MP3 lain"
                >
                  Ganti MP3
                </button>
                <button
                  onClick={() => onRemoveFile(item.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded"
                  title="Hapus file MP3 ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Insert File Dropzone Button */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group border border-dashed border-slate-300 hover:border-emerald-600 bg-slate-50/70 hover:bg-emerald-50/50 rounded-xl p-3 text-center cursor-pointer transition-all duration-150"
            >
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 group-hover:text-emerald-800">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Klik untuk Masukkan File Audio (.MP3)</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                File akan disimpan otomatis dan diputar tepat jam {timeFormatted} WIB
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions: Play/Stop Button + Edit / Delete */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          {isPlaying ? (
            <button
              onClick={onStop}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>Hentikan Audio</span>
            </button>
          ) : (
            <button
              onClick={() => onPlayNow(item)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
              title="Putar audio ini sekarang secara manual"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Putar Sekarang</span>
            </button>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Edit jam atau informasi jadwal ini"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Hapus jadwal ini"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
