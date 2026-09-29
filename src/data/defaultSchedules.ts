import { ScheduleItem } from '../types';

export const INITIAL_SCHEDULES: ScheduleItem[] = [
  {
    id: 'pta-0800',
    hour: 8,
    minute: 0,
    title: 'Peringatan Pagi & Anti Gratifikasi',
    description: 'Peringatan Zona Integritas: Komitmen tolak suap, pungli, gratifikasi, serta maklumat pelayanan prima PTA Kep. Bangka Belitung.',
    category: 'anti_gratifikasi',
    daysOfWeek: [1, 2, 3, 4, 5], // Senin - Jumat
    enabled: true,
    hasCustomAudio: false,
    repeatTimes: 1
  },
  {
    id: 'pta-0900',
    hour: 9,
    minute: 0,
    title: 'Peringatan Integritas & Standar Pelayanan Pagi',
    description: 'Himbauan pelaksanaan tugas berintegritas, melayani dengan 5S (Senyum, Salam, Sapa, Sopan, Santun) bagi seluruh aparatur.',
    category: 'layanan_publik',
    daysOfWeek: [1, 2, 3, 4, 5],
    enabled: true,
    hasCustomAudio: false,
    repeatTimes: 1
  },
  {
    id: 'pta-1000',
    hour: 10,
    minute: 0,
    title: 'Pengumuman Layanan Publik & PTSP Bebas Calo',
    description: 'Himbauan standar pelayanan prima, keterbukaan informasi, bebas percaloan, dan kenyamanan para pihak di area Pengadilan.',
    category: 'layanan_publik',
    daysOfWeek: [1, 2, 3, 4, 5],
    enabled: true,
    hasCustomAudio: false,
    repeatTimes: 1
  },
  {
    id: 'pta-1100',
    hour: 11,
    minute: 0,
    title: 'Pemberitahuan Menjelang Istirahat & Disiplin Kerja',
    description: 'Peringatan ketertiban jam kerja aparatur peradilan dan kelancaran penyelesaian layanan persidangan pagi.',
    category: 'disiplin',
    daysOfWeek: [1, 2, 3, 4, 5],
    enabled: true,
    hasCustomAudio: false,
    repeatTimes: 1
  },
  {
    id: 'pta-1300',
    hour: 13,
    minute: 0,
    title: 'Peringatan Memulai Pelayanan Siang & Ruang Sidang',
    description: 'Himbauan petugas meja layanan PTSP dan ruang sidang untuk kembali melayani masyarakat pencari keadilan tepat waktu.',
    category: 'disiplin',
    daysOfWeek: [1, 2, 3, 4, 5],
    enabled: true,
    hasCustomAudio: false,
    repeatTimes: 1
  },
  {
    id: 'pta-1400',
    hour: 14,
    minute: 0,
    title: 'Peringatan Ketertiban & Integritas Pelayanan Siang',
    description: 'Himbauan menjaga ketertiban ruang pelayanan, transparansi biaya perkara sesuai ketentuan, dan pelayanan prima.',
    category: 'anti_gratifikasi',
    daysOfWeek: [1, 2, 3, 4, 5],
    enabled: true,
    hasCustomAudio: false,
    repeatTimes: 1
  },
  {
    id: 'pta-1500',
    hour: 15,
    minute: 0,
    title: 'Pemberitahuan Sore & Integritas Pegawai',
    description: 'Peringatan berkala integritas aparatur peradilan serta percepatan penyelesaian berkas perkara dan e-Court.',
    category: 'anti_gratifikasi',
    daysOfWeek: [1, 2, 3, 4, 5],
    enabled: true,
    hasCustomAudio: false,
    repeatTimes: 1
  },
  {
    id: 'pta-1600',
    hour: 16,
    minute: 0,
    title: 'Peringatan Menjelang Akhir Jam Kerja',
    description: 'Himbauan merapikan arsip dinas, menyelesaikan disposisi surat tugas, dan pengecekan register pelayanan harian.',
    category: 'disiplin',
    daysOfWeek: [1, 2, 3, 4, 5],
    enabled: true,
    hasCustomAudio: false,
    repeatTimes: 1
  },
  {
    id: 'pta-1625',
    hour: 16,
    minute: 25,
    title: 'Pemberitahuan Akhir Jam Kerja & Keamanan Kantor',
    description: 'Pemberitahuan berakhirnya jam kerja operasional kantor, pengamanan dokumen perkara, dan pemadaman listrik/komputer/AC.',
    category: 'penutupan',
    daysOfWeek: [1, 2, 3, 4, 5],
    enabled: true,
    hasCustomAudio: false,
    repeatTimes: 1
  }
];

export const CATEGORY_LABELS: Record<ScheduleItem['category'], { label: string; color: string; badgeBg: string }> = {
  anti_gratifikasi: {
    label: 'Anti Gratifikasi & WBK',
    color: 'text-emerald-800',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300'
  },
  layanan_publik: {
    label: 'Layanan Publik / PTSP',
    color: 'text-amber-800',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-300'
  },
  istirahat: {
    label: 'Istirahat & Ibadah',
    color: 'text-blue-800',
    badgeBg: 'bg-blue-50 text-blue-800 border-blue-300'
  },
  disiplin: {
    label: 'Disiplin Kerja',
    color: 'text-indigo-800',
    badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-300'
  },
  penutupan: {
    label: 'Penutupan Kantor',
    color: 'text-purple-800',
    badgeBg: 'bg-purple-50 text-purple-800 border-purple-300'
  },
  khusus: {
    label: 'Pengumuman Khusus',
    color: 'text-slate-800',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300'
  }
};

export const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
