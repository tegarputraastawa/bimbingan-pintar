import { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatTanggalShort } from "@/lib/store";
import { getRuanganAktif } from "@/lib/ruangan";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Clock, ChevronLeft, ChevronRight, GraduationCap, Ban, Tv, DoorOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { canWrite } from "@/lib/roleAccess";
import KirimJadwalPDF from "@/components/KirimJadwalPDF";

const HARI_LABEL: Record<number, string> = {
  0: "Minggu", 1: "Senin", 2: "Selasa", 3: "Rabu", 4: "Kamis", 5: "Jumat", 6: "Sabtu",
};

function getWeekDates(refDate: Date): string[] {
  const d = new Date(refDate);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    dates.push(dd.toISOString().split("T")[0]);
  }
  return dates;
}

function toDateObj(s: string) {
  return new Date(s + "T00:00:00");
}

const emptyForm = { tutorId: "", kelasId: "", ruangan: "", tanggal: "", jamMulai: "", jamSelesai: "" };

type RuanganDB = { id: string; nama: string; kapasitas: number; status: string };
type TutorDB = { id: string; nama: string; bidang: string; email: string; telepon: string };
type KelasDB = { id: string; nama: string };
type JadwalDB = { id: string; tutor_id: string; kelas_id: string; ruangan: string; tanggal: string; jam_mulai: string; jam_selesai: string };
type LiburDB = { id: string; tanggal: string; keterangan: string };

export default function Jadwal() {
  const [weekRef, setWeekRef] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [liburOpen, setLiburOpen] = useState(false);
  const [liburForm, setLiburForm] = useState({ tanggal: "", keterangan: "" });
  const [ruanganList, setRuanganList] = useState<RuanganDB[]>([]);
  const [tutors, setTutors] = useState<TutorDB[]>([]);
  const [kelas, setKelas] = useState<KelasDB[]>([]);
  const [jadwalList, setJadwalList] = useState<JadwalDB[]>([]);
  const [liburList, setLiburList] = useState<LiburDB[]>([]);
  const navigate = useNavigate();
  const { role } = useAuth();
  const isWritable = canWrite(role, "jadwal");

  const fetchAll = useCallback(async () => {
    const [jadwalRes, liburRes, tutorRes, kelasRes, ruanganRes] = await Promise.all([
      supabase.from("jadwal").select("*"),
      supabase.from("libur").select("*"),
      supabase.from("tutor").select("id, nama, bidang, email, telepon"),
      supabase.from("kelas").select("id, nama"),
      getRuanganAktif(),
    ]);
    setJadwalList((jadwalRes.data || []) as JadwalDB[]);
    setLiburList((liburRes.data || []) as LiburDB[]);
    setTutors((tutorRes.data || []) as TutorDB[]);
    setKelas((kelasRes.data || []) as KelasDB[]);
    setRuanganList(ruanganRes);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const weekDates = useMemo(() => getWeekDates(weekRef), [weekRef]);

  const liburMap = useMemo(() => {
    const m: Record<string, string> = {};
    liburList.forEach((l) => { m[l.tanggal] = l.keterangan; });
    return m;
  }, [liburList]);

  const jadwalByDate = useMemo(() => {
    const m: Record<string, JadwalDB[]> = {};
    jadwalList.forEach((j) => {
      if (!m[j.tanggal]) m[j.tanggal] = [];
      m[j.tanggal].push(j);
    });
    Object.values(m).forEach((arr) => arr.sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai)));
    return m;
  }, [jadwalList]);

  const prevWeek = () => { const d = new Date(weekRef); d.setDate(d.getDate() - 7); setWeekRef(d); };
  const nextWeek = () => { const d = new Date(weekRef); d.setDate(d.getDate() + 7); setWeekRef(d); };
  const goToday = () => setWeekRef(new Date());

  const checkRoomConflict = (excludeId?: string) => {
    return jadwalList.some((j) => {
      if (excludeId && j.id === excludeId) return false;
      if (j.ruangan !== form.ruangan || j.tanggal !== form.tanggal) return false;
      return j.jam_mulai < form.jamSelesai && form.jamMulai < j.jam_selesai;
    });
  };

  const validate = (excludeId?: string) => {
    if (!form.tutorId || !form.kelasId || !form.ruangan || !form.tanggal || !form.jamMulai || !form.jamSelesai) {
      toast.error("Lengkapi semua data jadwal");
      return false;
    }
    if (form.jamSelesai <= form.jamMulai) {
      toast.error("Jam selesai harus lebih besar dari jam mulai");
      return false;
    }
    if (checkRoomConflict(excludeId)) {
      toast.error(`Ruangan "${form.ruangan}" sudah terpakai pada tanggal dan jam tersebut!`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const { error } = await supabase.from("jadwal").insert({
      tutor_id: form.tutorId,
      kelas_id: form.kelasId,
      ruangan: form.ruangan,
      tanggal: form.tanggal,
      jam_mulai: form.jamMulai,
      jam_selesai: form.jamSelesai,
    });
    if (error) { toast.error("Gagal menyimpan: " + error.message); return; }
    toast.success("Jadwal berhasil ditambahkan!");
    setForm({ ...emptyForm });
    setOpen(false);
    fetchAll();
  };

  const openEdit = (j: JadwalDB) => {
    setEditId(j.id);
    setForm({ tutorId: j.tutor_id, kelasId: j.kelas_id, ruangan: j.ruangan, tanggal: j.tanggal, jamMulai: j.jam_mulai, jamSelesai: j.jam_selesai });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !validate(editId)) return;
    const { error } = await supabase.from("jadwal").update({
      tutor_id: form.tutorId,
      kelas_id: form.kelasId,
      ruangan: form.ruangan,
      tanggal: form.tanggal,
      jam_mulai: form.jamMulai,
      jam_selesai: form.jamSelesai,
    }).eq("id", editId);
    if (error) { toast.error("Gagal memperbarui: " + error.message); return; }
    toast.success("Jadwal diperbarui!");
    setForm({ ...emptyForm });
    setEditOpen(false);
    setEditId(null);
    fetchAll();
  };

  const hapus = async (id: string) => {
    const { error } = await supabase.from("jadwal").delete().eq("id", id);
    if (error) { toast.error("Gagal menghapus: " + error.message); return; }
    toast.success("Jadwal dihapus");
    fetchAll();
  };

  const handleLiburSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liburForm.tanggal || !liburForm.keterangan) {
      toast.error("Lengkapi data hari libur");
      return;
    }
    const { error } = await supabase.from("libur").insert({
      tanggal: liburForm.tanggal,
      keterangan: liburForm.keterangan,
    });
    if (error) { toast.error("Gagal menyimpan: " + error.message); return; }
    toast.success("Hari libur ditambahkan!");
    setLiburForm({ tanggal: "", keterangan: "" });
    setLiburOpen(false);
    fetchAll();
  };

  const hapusLibur = async (id: string) => {
    const { error } = await supabase.from("libur").delete().eq("id", id);
    if (error) { toast.error("Gagal menghapus: " + error.message); return; }
    toast.success("Hari libur dihapus");
    fetchAll();
  };

  const today = new Date().toISOString().split("T")[0];

  const renderForm = (onSubmit: (e: React.FormEvent) => void, isEdit: boolean) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Tutor *</Label>
        <Select value={form.tutorId} onValueChange={(v) => setForm({ ...form, tutorId: v })}>
          <SelectTrigger><SelectValue placeholder="Pilih tutor" /></SelectTrigger>
          <SelectContent>
            {tutors.map((t) => <SelectItem key={t.id} value={t.id}>{t.nama} — {t.bidang}</SelectItem>)}
          </SelectContent>
        </Select>
        {tutors.length === 0 && <p className="text-xs text-destructive">Belum ada tutor.</p>}
      </div>
      <div className="space-y-2">
        <Label>Kelas *</Label>
        <Select value={form.kelasId} onValueChange={(v) => setForm({ ...form, kelasId: v })}>
          <SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger>
          <SelectContent>
            {kelas.map((k) => <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Ruangan *</Label>
        {ruanganList.length > 0 ? (
          <Select value={form.ruangan} onValueChange={(v) => setForm({ ...form, ruangan: v })}>
            <SelectTrigger><SelectValue placeholder="Pilih ruangan" /></SelectTrigger>
            <SelectContent>
              {ruanganList.map((r) => (
                <SelectItem key={r.id} value={r.nama}>
                  <span className="flex items-center gap-2">
                    <DoorOpen className="w-3.5 h-3.5" />
                    {r.nama} (maks {r.kapasitas} siswa)
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input placeholder="Ruang A1, Lab, dll" value={form.ruangan} onChange={(e) => setForm({ ...form, ruangan: e.target.value })} />
        )}
        <p className="text-xs text-muted-foreground">Ruangan yang sama tidak boleh beririsan jadwalnya</p>
      </div>
      <div className="space-y-2">
        <Label>Tanggal *</Label>
        <Input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Jam Mulai *</Label>
          <Input type="time" value={form.jamMulai} onChange={(e) => setForm({ ...form, jamMulai: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Jam Selesai *</Label>
          <Input type="time" value={form.jamSelesai} onChange={(e) => setForm({ ...form, jamSelesai: e.target.value })} />
        </div>
      </div>
      <Button type="submit" className="w-full">{isEdit ? "Simpan Perubahan" : "Tambah Jadwal"}</Button>
    </form>
  );

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Jadwal</h1>
          <p className="text-muted-foreground mt-1">Kelola jadwal bimbingan belajar per minggu</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/display")} className="gap-1.5">
            <Tv className="w-4 h-4" /> Mode TV
          </Button>
          <Dialog open={liburOpen} onOpenChange={setLiburOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10">
                <Ban className="w-4 h-4" /> Hari Libur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Tambah Hari Libur</DialogTitle></DialogHeader>
              <form onSubmit={handleLiburSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Tanggal *</Label>
                  <Input type="date" value={liburForm.tanggal} onChange={(e) => setLiburForm({ ...liburForm, tanggal: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Keterangan *</Label>
                  <Input placeholder="Libur Nasional, dll" value={liburForm.keterangan} onChange={(e) => setLiburForm({ ...liburForm, keterangan: e.target.value })} />
                </div>
                <Button type="submit" className="w-full">Tambah Hari Libur</Button>
              </form>
              {liburList.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Daftar Hari Libur:</p>
                  {[...liburList].sort((a, b) => a.tanggal.localeCompare(b.tanggal)).map((l) => (
                    <div key={l.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-destructive/10 text-sm">
                      <span><span className="font-medium text-destructive">{formatTanggalShort(l.tanggal)}</span> — {l.keterangan}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => hapusLibur(l.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm({ ...emptyForm }); }}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Tambah Jadwal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Tambah Jadwal Baru</DialogTitle></DialogHeader>
              {renderForm(handleSubmit, false)}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) { setForm({ ...emptyForm }); setEditId(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Jadwal</DialogTitle></DialogHeader>
          {renderForm(handleEditSubmit, true)}
        </DialogContent>
      </Dialog>

      {/* Week Navigator */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={prevWeek}><ChevronLeft className="w-4 h-4" /></Button>
        <div className="text-center">
          <p className="font-semibold text-sm">
            {formatTanggalShort(weekDates[0])} — {formatTanggalShort(weekDates[6])}
          </p>
          <Button variant="link" size="sm" className="text-xs h-auto p-0" onClick={goToday}>Hari Ini</Button>
        </div>
        <Button variant="outline" size="icon" onClick={nextWeek}><ChevronRight className="w-4 h-4" /></Button>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDates.map((dateStr) => {
          const d = toDateObj(dateStr);
          const dayNum = d.getDay();
          const isToday = dateStr === today;
          const isHoliday = !!liburMap[dateStr];
          const items = jadwalByDate[dateStr] || [];

          return (
            <Card
              key={dateStr}
              className={`border shadow-sm transition-all ${isToday ? "ring-2 ring-primary" : ""} ${isHoliday ? "bg-destructive/5 border-destructive/30" : "border-border"}`}
            >
              <CardHeader className="p-3 pb-1">
                <CardTitle className={`text-xs font-bold flex items-center justify-between ${isHoliday ? "text-destructive" : isToday ? "text-primary" : "text-muted-foreground"}`}>
                  <span>{HARI_LABEL[dayNum]}</span>
                  <span className={`text-lg ${isToday ? "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center" : ""}`}>
                    {d.getDate()}
                  </span>
                </CardTitle>
                {isHoliday && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 w-fit">{liburMap[dateStr]}</Badge>
                )}
              </CardHeader>
              <CardContent className="p-3 pt-1 space-y-2">
                {isHoliday && items.length === 0 && (
                  <p className="text-[11px] text-destructive/70 italic">Libur</p>
                )}
                {items.length === 0 && !isHoliday && (
                  <p className="text-[11px] text-muted-foreground italic">Tidak ada jadwal</p>
                )}
                {items.map((j) => {
                  const tutor = tutors.find((t) => t.id === j.tutor_id);
                  const k = kelas.find((k) => k.id === j.kelas_id);
                  return (
                    <div key={j.id} className={`rounded-md p-2 text-[11px] space-y-0.5 ${isHoliday ? "bg-destructive/10 border border-destructive/20" : "bg-muted"}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs">{k?.nama || "-"}</span>
                        <div className="flex gap-0.5">
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => openEdit(j)}><Pencil className="w-3 h-3" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive"><Trash2 className="w-3 h-3" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Jadwal?</AlertDialogTitle>
                                <AlertDialogDescription>Jadwal ini akan dihapus permanen.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => hapus(j.id)}>Hapus</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />{j.jam_mulai}-{j.jam_selesai}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <GraduationCap className="w-3 h-3" />{tutor?.nama || "-"}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <DoorOpen className="w-3 h-3" />{j.ruangan}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
