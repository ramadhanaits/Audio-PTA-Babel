import React, { useState, useEffect } from 'react';
import { X, Clock, FileAudio, Upload } from 'lucide-react';
import { ScheduleItem } from '../types';
import { CATEGORY_LABELS, DAY_NAMES } from '../data/defaultSchedules';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: Omit<ScheduleItem, 'hasCustomAudio'>, file?: File) => void;
  initialData?: ScheduleItem | null;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [hour, setHour] = useState<number>(8);
  const [minute, setMinute] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<ScheduleItem['category']>('anti_gratifikasi');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialData) {
      setHour(initialData.hour);
      setMinute(initialData.minute);
      setTitle(initialData.title);
      setDescription(initialData.description);
      setCategory(initialData.category);
      setDaysOfWeek(initialData.daysOfWeek);
      setSelectedFile(null);
    } else {
      setHour(9);
      setMinute(0);
      setTitle('');
      setDescription('');
      setCategory('anti_gratifikasi');
      setDaysOfWeek([1, 2, 3, 4, 5]);
      setSelectedFile(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleToggleDay = (dayIndex: number) => {
    if (daysOfWeek.includes(dayIndex)) {
      if (daysOfWeek.length > 1) {
        setDaysOfWeek(daysOfWeek.filter((d) => d !== dayIndex));
      }
    } else {
      setDaysOfWeek([...daysOfWeek, dayIndex].sort());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave(
      {
        id: initialData ? initialData.id : `custom-${Date.now()}`,
        hour: Number(hour),
        minute: Number(minute),
        title: title.trim(),
        description: description.trim(),
        category,
        daysOfWeek,
        enabled: initialData ? initialData.enabled : true,
        repeatTimes: 1
      },
      selectedFile || undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-emerald-950 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold">
              {initialData ? 'Ubah Jadwal Pemutaran Audio' : 'Tambah Jadwal Pemutaran Baru'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Time Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Waktu Pemutaran (WIB)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-[11px] text-slate-500 block mb-0.5">Jam (00 - 23)</label>
                <select
                  value={hour}
                  onChange={(e) => setHour(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-base font-bold focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i}>
                      {String(i).padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-slate-400 text-xl font-bold pt-4">:</div>

              <div className="flex-1">
                <label className="text-[11px] text-slate-500 block mb-0.5">Menit (00 - 59)</label>
                <select
                  value={minute}
                  onChange={(e) => setMinute(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-base font-bold focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
                >
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                    <option key={m} value={m}>
                      {String(m).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Judul Pengumuman / Audio
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Peringatan Pagi Anti Gratifikasi"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Kategori Siaran
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ScheduleItem['category'])}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
            >
              {Object.entries(CATEGORY_LABELS).map(([catKey, catVal]) => (
                <option key={catKey} value={catKey}>
                  {catVal.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Keterangan / Naskah Himbauan (Opsional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Teks ringkas himbauan pengadilan..."
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
            />
          </div>

          {/* Days active */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Hari Aktif
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DAY_NAMES.map((dayName, idx) => {
                const isSelected = daysOfWeek.includes(idx);
                return (
                  <button
                    key={dayName}
                    type="button"
                    onClick={() => handleToggleDay(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-emerald-800 text-white border-emerald-900 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {dayName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Audio File Picker in Modal */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Sisipkan File Audio (.MP3 / .WAV)
            </label>
            <label className="flex items-center gap-3 p-3 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <Upload className="w-5 h-5 text-emerald-700 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-800 truncate">
                  {selectedFile ? selectedFile.name : 'Pilih file .mp3 dari komputer / flashdisk'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {selectedFile
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                    : 'Bisa juga diunggah nanti langsung pada kartu jadwal'}
                </div>
              </div>
              <input
                type="file"
                accept="audio/mp3,audio/mpeg,audio/wav"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedFile(file);
                }}
              />
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors"
            >
              Simpan Jadwal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
