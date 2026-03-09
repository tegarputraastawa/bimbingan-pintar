import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, ClipboardList, CheckCircle, XCircle, AlertTriangle, MinusCircle, Search, User, CalendarDays, BookOpen, TrendingUp, FileDown, MessageCircle } from "lucide-react";
import { buildReportText, shareWhatsApp, shareWhatsAppNoNumber, generatePDF } from "@/lib/laporanUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Laporan = {
  id: string;
  siswa_id: string;
  kelas_id: string;
  tutor_id: string;
  tanggal: string;
  kehadiran: string;
  nilai: number | null;
  catatan: string;
};

type Siswa = { id: string; nama: string; aktif: boolean; kelas_id: string };
type Kelas = { id: string; nama: string };
type Tutor = { id: string; nama: string };
type OrangTua = { id: string; siswa_id: string; nama: string; telepon: string };

const kehadiranConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: typeof CheckCircle }> = {
  hadir: { label: "Hadir", variant: "default", icon: CheckCircle },
  izin: { label: "Izin", variant: "secondary", icon: MinusCircle },
  sakit: { label: "Sakit", variant: "outline", icon: AlertTriangle },
  alpa: { label: "Alpa", variant: "destructive", icon: XCircle },
};

const emptyForm = { siswa_id: "", kelas_id: "", tutor_id: "", tanggal: "", kehadiran: "hadir", nilai: "", catatan: "" };

export default function LaporanPerkembangan() {
  const [data, setData] = useState<Laporan[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [tutorList, setTutorList] = useState<Tutor[]>([]);
  const [orangTuaList, setOrangTuaList] = useState<OrangTua[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchNama, setSearchNama] = useState("");
  const [filterKelas, setFilterKelas] = useState("semua");
  const [filterTanggalMulai, setFilterTanggalMulai] = useState("");
  const [filterTanggalAkhir, setFilterTanggalAkhir] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    const [laporan, siswa, kelas, tutor, orangTua] = await Promise.all([
      supabase.from("laporan_perkembangan").select("*").order("tanggal", { ascending: false }),
      supabase.from("siswa").select("id, nama, aktif, kelas_id").order("nama"),
      supabase.from("kelas").select("id, nama").order("nama"),
      supabase.from("tutor").select("id, nama").order("nama"),
      supabase.from("orang_tua").select("id, siswa_id, nama, telepon"),
    ]);
    setData(laporan.data || []);
    setSiswaList((siswa.data || []) as Siswa[]);
    setKelasList(kelas.data || []);
    setTutorList(tutor.data || []);
    setOrangTuaList((orangTua.data || []) as OrangTua[]);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // Group laporan by siswa, apply filters
  const filteredData = useMemo(() => {
    let rows = [...data];

    // Date range filter
    if (filterTanggalMulai) rows = rows.filter((l) => l.tanggal >= filterTanggalMulai);
    if (filterTanggalAkhir) rows = rows.filter((l) => l.tanggal <= filterTanggalAkhir);

    // Filter kelas (via siswa's kelas_id matches laporan's kelas_id)
    if (filterKelas !== "semua") rows = rows.filter((l) => l.kelas_id === filterKelas);

    // Group by siswa
    const grouped: Record<string, { siswa: Siswa; laporanList: Laporan[] }> = {};
    for (const l of rows) {
      const siswa = siswaList.find((s) => s.id === l.siswa_id);
      if (!siswa) continue;
      // Search nama
      if (searchNama && !siswa.nama.toLowerCase().includes(searchNama.toLowerCase())) continue;
      if (!grouped[l.siswa_id]) grouped[l.siswa_id] = { siswa, laporanList: [] };
      grouped[l.siswa_id].laporanList.push(l);
    }
    return Object.values(grouped).sort((a, b) => a.siswa.nama.localeCompare(b.siswa.nama));
  }, [data, siswaList, searchNama, filterKelas, filterTanggalMulai, filterTanggalAkhir]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.siswa_id || !form.kelas_id || !form.tutor_id || !form.tanggal) {
      toast.error("Lengkapi data wajib");
      return;
    }
    const nilaiNum = form.nilai ? Number(form.nilai) : null;
    if (nilaiNum !== null && (nilaiNum < 0 || nilaiNum > 100)) {
      toast.error("Nilai harus antara 0-100");
      return;
    }
    const { error } = await supabase.from("laporan_perkembangan").insert({
      siswa_id: form.siswa_id,
      kelas_id: form.kelas_id,
      tutor_id: form.tutor_id,
      tanggal: form.tanggal,
      kehadiran: form.kehadiran,
      nilai: nilaiNum,
      catatan: form.catatan,
    });
    if (error) { toast.error("Gagal menambah laporan"); return; }
    toast.success("Laporan perkembangan ditambahkan!");
    setForm({ ...emptyForm });
    setOpen(false);
    fetchAll();
  };

  const openEdit = (l: Laporan) => {
    setEditId(l.id);
    setForm({
      siswa_id: l.siswa_id, kelas_id: l.kelas_id, tutor_id: l.tutor_id,
      tanggal: l.tanggal, kehadiran: l.kehadiran, nilai: l.nilai !== null ? String(l.nilai) : "", catatan: l.catatan,
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !form.tanggal) { toast.error("Lengkapi data wajib"); return; }
    const nilaiNum = form.nilai ? Number(form.nilai) : null;
    if (nilaiNum !== null && (nilaiNum < 0 || nilaiNum > 100)) { toast.error("Nilai harus antara 0-100"); return; }
    const { error } = await supabase.from("laporan_perkembangan").update({
      tanggal: form.tanggal, kehadiran: form.kehadiran, nilai: nilaiNum, catatan: form.catatan,
    }).eq("id", editId);
    if (error) { toast.error("Gagal memperbarui"); return; }
    toast.success("Laporan diperbarui!");
    setForm({ ...emptyForm });
    setEditOpen(false);
    setEditId(null);
    fetchAll();
  };

  const hapus = async (id: string) => {
    await supabase.from("laporan_perkembangan").delete().eq("id", id);
    toast.success("Laporan dihapus");
    fetchAll();
  };

  const getName = (list: { id: string; nama: string }[], id: string) =>
    list.find((x) => x.id === id)?.nama || "-";

  const getSiswaStats = (laporanList: Laporan[]) => {
    const hadir = laporanList.filter((l) => l.kehadiran === "hadir").length;
    const total = laporanList.length;
    const nilaiList = laporanList.filter((l) => l.nilai !== null).map((l) => l.nilai as number);
    const avgNilai = nilaiList.length > 0 ? Math.round(nilaiList.reduce((a, b) => a + b, 0) / nilaiList.length) : null;
    return { hadir, total, avgNilai };
  };

  const buildSiswaReport = (siswa: Siswa, laporanList: Laporan[]) => {
    const stats = getSiswaStats(laporanList);
    return {
      siswa_nama: siswa.nama,
      kelas_nama: getName(kelasList, siswa.kelas_id),
      total_pertemuan: stats.total,
      total_hadir: stats.hadir,
      rata_nilai: stats.avgNilai,
      laporan: laporanList.map((l) => ({
        tanggal: l.tanggal,
        kehadiran: l.kehadiran,
        nilai: l.nilai,
        catatan: l.catatan,
        kelas_nama: getName(kelasList, l.kelas_id),
        tutor_nama: getName(tutorList, l.tutor_id),
      })),
    };
  };

  const handleShareWA = (siswa: Siswa, laporanList: Laporan[]) => {
    const report = buildSiswaReport(siswa, laporanList);
    const text = buildReportText(report);
    const parent = orangTuaList.find((p) => p.siswa_id === siswa.id && p.telepon);
    if (parent?.telepon) {
      shareWhatsApp(parent.telepon, text);
    } else {
      shareWhatsAppNoNumber(text);
    }
  };

  const handleDownloadPDF = (siswa: Siswa, laporanList: Laporan[]) => {
    const report = buildSiswaReport(siswa, laporanList);
    generatePDF(report);
  };

  const renderForm = (onSubmit: (e: React.FormEvent) => void, isEdit: boolean) => (
    <form onSubmit={onSubmit} className="space-y-4">
      {!isEdit && (
        <>
          <div className="space-y-2">
            <Label>Siswa *</Label>
            <Select value={form.siswa_id} onValueChange={(v) => setForm({ ...form, siswa_id: v })}>
              <SelectTrigger><SelectValue placeholder="Pilih siswa" /></SelectTrigger>
              <SelectContent>
                {siswaList.filter((s) => s.aktif).map((s) => <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Kelas *</Label>
            <Select value={form.kelas_id} onValueChange={(v) => setForm({ ...form, kelas_id: v })}>
              <SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger>
              <SelectContent>
                {kelasList.map((k) => <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tutor *</Label>
            <Select value={form.tutor_id} onValueChange={(v) => setForm({ ...form, tutor_id: v })}>
              <SelectTrigger><SelectValue placeholder="Pilih tutor" /></SelectTrigger>
              <SelectContent>
                {tutorList.map((t) => <SelectItem key={t.id} value={t.id}>{t.nama}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      <div className="space-y-2">
        <Label>Tanggal *</Label>
        <Input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Kehadiran *</Label>
        <Select value={form.kehadiran} onValueChange={(v) => setForm({ ...form, kehadiran: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="hadir">Hadir</SelectItem>
            <SelectItem value="izin">Izin</SelectItem>
            <SelectItem value="sakit">Sakit</SelectItem>
            <SelectItem value="alpa">Alpa</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Nilai (0-100)</Label>
        <Input type="number" min="0" max="100" placeholder="Opsional" value={form.nilai} onChange={(e) => setForm({ ...form, nilai: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Catatan Tutor</Label>
        <Textarea placeholder="Catatan perkembangan belajar..." value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} />
      </div>
      <Button type="submit" className="w-full">{isEdit ? "Simpan Perubahan" : "Tambah Laporan"}</Button>
    </form>
  );

  const totalLaporan = data.length;
  const totalSiswa = filteredData.length;

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Laporan Perkembangan</h1>
          <p className="text-muted-foreground mt-1">Riwayat belajar per siswa</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm({ ...emptyForm }); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Tambah Laporan</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Tambah Laporan Perkembangan</DialogTitle></DialogHeader>
            {renderForm(handleSubmit, false)}
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) { setForm({ ...emptyForm }); setEditId(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Laporan</DialogTitle></DialogHeader>
          {renderForm(handleEditSubmit, true)}
        </DialogContent>
      </Dialog>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Laporan</p>
              <p className="text-xl font-bold">{totalLaporan}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Siswa Tampil</p>
              <p className="text-xl font-bold">{totalSiswa}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Hadir</p>
              <p className="text-xl font-bold">{data.filter((l) => l.kehadiran === "hadir").length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rata-rata Nilai</p>
              <p className="text-xl font-bold">
                {(() => {
                  const nilaiList = data.filter((l) => l.nilai !== null).map((l) => l.nilai as number);
                  return nilaiList.length > 0 ? Math.round(nilaiList.reduce((a, b) => a + b, 0) / nilaiList.length) : "-";
                })()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Nama */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama siswa..."
                value={searchNama}
                onChange={(e) => setSearchNama(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter Kelas */}
            <Select value={filterKelas} onValueChange={setFilterKelas}>
              <SelectTrigger>
                <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Semua Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Kelas</SelectItem>
                {kelasList.map((k) => <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Tanggal Mulai */}
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={filterTanggalMulai}
                onChange={(e) => setFilterTanggalMulai(e.target.value)}
                className="pl-9"
                placeholder="Tanggal mulai"
              />
            </div>

            {/* Tanggal Akhir */}
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={filterTanggalAkhir}
                onChange={(e) => setFilterTanggalAkhir(e.target.value)}
                className="pl-9"
                placeholder="Tanggal akhir"
              />
            </div>
          </div>

          {/* Active filters indicator */}
          {(searchNama || filterKelas !== "semua" || filterTanggalMulai || filterTanggalAkhir) && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-muted-foreground">Filter aktif:</span>
              {searchNama && <Badge variant="secondary" className="text-xs">Nama: "{searchNama}"</Badge>}
              {filterKelas !== "semua" && <Badge variant="secondary" className="text-xs">Kelas: {getName(kelasList, filterKelas)}</Badge>}
              {filterTanggalMulai && <Badge variant="secondary" className="text-xs">Dari: {filterTanggalMulai}</Badge>}
              {filterTanggalAkhir && <Badge variant="secondary" className="text-xs">Sampai: {filterTanggalAkhir}</Badge>}
              <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => {
                setSearchNama(""); setFilterKelas("semua"); setFilterTanggalMulai(""); setFilterTanggalAkhir("");
              }}>Reset</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content */}
      {loading ? (
        <p className="text-muted-foreground text-center py-12">Memuat data...</p>
      ) : filteredData.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="py-12 text-center">
            <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground font-medium">Tidak ada data ditemukan</p>
            <p className="text-sm text-muted-foreground mt-1">Coba ubah filter pencarian atau tambah laporan baru</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredData.map(({ siswa, laporanList }) => {
            const stats = getSiswaStats(laporanList);
            return (
              <Card key={siswa.id} className="border-none shadow-sm overflow-hidden">
                {/* Siswa Header */}
                <div className="px-5 pt-5 pb-3">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-base">{siswa.nama}</p>
                        <p className="text-xs text-muted-foreground">{getName(kelasList, siswa.kelas_id)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-semibold">{laporanList.length}</p>
                        <p className="text-xs text-muted-foreground">Pertemuan</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-primary">{stats.hadir}</p>
                        <p className="text-xs text-muted-foreground">Hadir</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{stats.avgNilai ?? "-"}</p>
                        <p className="text-xs text-muted-foreground">Rata Nilai</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Laporan List */}
                <div className="divide-y divide-border">
                  {laporanList.map((l) => {
                    const cfg = kehadiranConfig[l.kehadiran] || kehadiranConfig.hadir;
                    const Icon = cfg.icon;
                    return (
                      <div key={l.id} className="px-5 py-3 flex items-start justify-between hover:bg-muted/30 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <p className="text-sm font-medium">
                              {new Date(l.tanggal + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                            </p>
                            <Badge variant={cfg.variant} className="text-xs gap-1 py-0">
                              <Icon className="w-3 h-3" />{cfg.label}
                            </Badge>
                            {l.nilai !== null && (
                              <Badge variant="outline" className="text-xs py-0">Nilai: {l.nilai}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {getName(kelasList, l.kelas_id)} • Tutor: {getName(tutorList, l.tutor_id)}
                          </p>
                          {l.catatan && (
                            <p className="text-xs text-muted-foreground italic mt-0.5">"{l.catatan}"</p>
                          )}
                        </div>
                        <div className="flex gap-1 ml-3 flex-shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(l)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Laporan?</AlertDialogTitle>
                                <AlertDialogDescription>Laporan ini akan dihapus permanen.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => hapus(l.id)}>Hapus</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
