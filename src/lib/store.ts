export interface Kelas {
  id: string;
  nama: string;
  harga: number;
  deskripsi: string;
}

export interface Siswa {
  id: string;
  nama: string;
  email: string;
  telepon: string;
  alamat: string;
  kelasId: string;
  tanggalDaftar: string;
  aktif: boolean;
}

export interface Pembayaran {
  id: string;
  siswaId: string;
  jumlah: number;
  tanggal: string;
  metode: "tunai" | "transfer" | "ewallet";
  status: "lunas" | "belum_lunas";
  keterangan: string;
}

export interface Tutor {
  id: string;
  nama: string;
  telepon: string;
  email: string;
  bidang: string;
}

export interface Jadwal {
  id: string;
  tutorId: string;
  kelasId: string;
  ruangan: string;
  tanggal: string; // YYYY-MM-DD
  jamMulai: string;
  jamSelesai: string;
}

export interface Libur {
  id: string;
  tanggal: string; // YYYY-MM-DD
  keterangan: string;
}

const KELAS_DEFAULT: Kelas[] = [
  { id: "k1", nama: "Matematika SD", harga: 350000, deskripsi: "Kelas 1-6 SD" },
  { id: "k2", nama: "Matematika SMP", harga: 450000, deskripsi: "Kelas 7-9 SMP" },
  { id: "k3", nama: "Matematika SMA", harga: 550000, deskripsi: "Kelas 10-12 SMA" },
  { id: "k4", nama: "Bahasa Inggris", harga: 400000, deskripsi: "Semua jenjang" },
  { id: "k5", nama: "IPA SMP", harga: 450000, deskripsi: "Fisika, Kimia, Biologi" },
  { id: "k6", nama: "Persiapan UTBK", harga: 750000, deskripsi: "Intensif UTBK/SNBT" },
];

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getKelasList(): Kelas[] {
  return loadFromStorage("bimbel_kelas", KELAS_DEFAULT);
}

export function getSiswaList(): Siswa[] {
  return loadFromStorage("bimbel_siswa", []);
}

export function getPembayaranList(): Pembayaran[] {
  return loadFromStorage("bimbel_pembayaran", []);
}

export function saveSiswa(siswa: Siswa) {
  const list = getSiswaList();
  const idx = list.findIndex((s) => s.id === siswa.id);
  if (idx >= 0) list[idx] = siswa;
  else list.push(siswa);
  saveToStorage("bimbel_siswa", list);
}

export function deleteSiswa(id: string) {
  saveToStorage("bimbel_siswa", getSiswaList().filter((s) => s.id !== id));
}

export function savePembayaran(p: Pembayaran) {
  const list = getPembayaranList();
  list.push(p);
  saveToStorage("bimbel_pembayaran", list);
}

export function updatePembayaran(p: Pembayaran) {
  const list = getPembayaranList();
  const idx = list.findIndex((x) => x.id === p.id);
  if (idx >= 0) {
    list[idx] = p;
    saveToStorage("bimbel_pembayaran", list);
  }
}

export function deletePembayaran(id: string) {
  saveToStorage("bimbel_pembayaran", getPembayaranList().filter((p) => p.id !== id));
}

// Tutor
export function getTutorList(): Tutor[] {
  return loadFromStorage("bimbel_tutor", []);
}

export function saveTutor(tutor: Tutor) {
  const list = getTutorList();
  const idx = list.findIndex((t) => t.id === tutor.id);
  if (idx >= 0) list[idx] = tutor;
  else list.push(tutor);
  saveToStorage("bimbel_tutor", list);
}

export function deleteTutor(id: string) {
  saveToStorage("bimbel_tutor", getTutorList().filter((t) => t.id !== id));
}

// Jadwal (date-based)
export function getJadwalList(): Jadwal[] {
  return loadFromStorage("bimbel_jadwal", []);
}

export function saveJadwal(jadwal: Jadwal) {
  const list = getJadwalList();
  const idx = list.findIndex((j) => j.id === jadwal.id);
  if (idx >= 0) list[idx] = jadwal;
  else list.push(jadwal);
  saveToStorage("bimbel_jadwal", list);
}

export function deleteJadwal(id: string) {
  saveToStorage("bimbel_jadwal", getJadwalList().filter((j) => j.id !== id));
}

// Libur (holidays)
export function getLiburList(): Libur[] {
  return loadFromStorage("bimbel_libur", []);
}

export function saveLibur(libur: Libur) {
  const list = getLiburList();
  const idx = list.findIndex((l) => l.id === libur.id);
  if (idx >= 0) list[idx] = libur;
  else list.push(libur);
  saveToStorage("bimbel_libur", list);
}

export function deleteLibur(id: string) {
  saveToStorage("bimbel_libur", getLiburList().filter((l) => l.id !== id));
}

export function isLibur(tanggal: string): boolean {
  return getLiburList().some((l) => l.tanggal === tanggal);
}

export function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

export function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export function formatTanggal(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function formatTanggalShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
}
