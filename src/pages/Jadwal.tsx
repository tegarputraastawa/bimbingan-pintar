import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getJadwalList, saveJadwal, deleteJadwal, getTutorList, getKelasList,
  getLiburList, saveLibur, deleteLibur, generateId, formatTanggalShort,
  type Jadwal as JadwalType,
} from "@/lib/store";
import { checkRoomConflict, getRuanganAktif } from "@/lib/ruangan";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Clock, ChevronLeft, ChevronRight, GraduationCap, Ban, Tv, DoorOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

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

export default function Jadwal() {
  const [refresh, setRefresh] = useState(0);
  const [weekRef, setWeekRef] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [liburOpen, setLiburOpen] = useState(false);
  const [liburForm, setLiburForm] = useState({ tanggal: "", keterangan: "" });
  const [ruanganList, setRuanganList] = useState<RuanganDB[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getRuanganAktif().then(setRuanganList);
  }, []);

  const jadwalList = getJadwalList();
  const tutors = getTutorList();
  const kelas = getKelasList();
  const liburList = getLiburList();
  const weekDates = useMemo(() => getWeekDates(weekRef), [weekRef]);

  const liburMap = useMemo(() => {
    const m: Record<string, string> = {};
    liburList.forEach((l) => { m[l.tanggal] = l.keterangan; });
    return m;
  }, [liburList]);

  const jadwalByDate = useMemo(() => {
    const m: Record<string, JadwalType[]> = {};
    jadwalList.forEach((j) => {
      if (!m[j.tanggal]) m[j.tanggal] = [];
      m[j.tanggal].push(j);
    });
    Object.values(m).forEach((arr) => arr.sort((a, b) => a.jamMulai.localeCompare(b.jamMulai)));
    return m;
  }, [jadwalList]);

  const prevWeek = () => { const d = new Date(weekRef); d.setDate(d.getDate() - 7); setWeekRef(d); };
  const nextWeek = () => { const d = new Date(weekRef); d.setDate(d.getDate() + 7); setWeekRef(d); };
  const goToday = () => setWeekRef(new Date());

  const validate = (excludeId?: string) => {
    if (!form.tutorId || !form.kelasId || !form.ruangan || !form.tanggal || !form.jamMulai || !form.jamSelesai) {
      toast.error("Lengkapi semua data jadwal");
      return false;
    }
    if (form.jamSelesai <= form.jamMulai) {
      toast.error("Jam selesai harus lebih besar dari jam mulai");
      return false;
    }
    // Check room conflict
    if (checkRoomConflict(form.ruangan, form.tanggal, form.jamMulai, form.jamSelesai, excludeId)) {
      toast.error(`Ruangan "${form.ruangan}" sudah terpakai pada tanggal dan jam tersebut!`);
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    saveJadwal({ id: generateId(), ...form });
    toast.success("Jadwal berhasil ditambahkan!");
    setForm({ ...emptyForm });
    setOpen(false);
    setRefresh((r) => r + 1);
  };

  const openEdit = (j: JadwalType) => {
    setEditId(j.id);
    setForm({ tutorId: j.tutorId, kelasId: j.kelasId, ruangan: j.ruangan, tanggal: j.tanggal, jamMulai: j.jamMulai, jamSelesai: j.jamSelesai });
    setEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !validate(editId)) return;
    saveJadwal({ id: editId, ...form });
    toast.success("Jadwal diperbarui!");
    setForm({ ...emptyForm });
    setEditOpen(false);
    setEditId(null);
    setRefresh((r) => r + 1);
  };

  const hapus = (id: string) => {
    deleteJadwal(id);
    toast.success("Jadwal dihapus");
    setRefresh((r) => r + 1);
  };

  const handleLiburSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liburForm.tanggal || !liburForm.keterangan) {
      toast.error("Lengkapi data hari libur");
      return;
    }
    saveLibur({ id: generateId(), ...liburForm });
    toast.success("Hari libur ditambahkan!");
    setLiburForm({ tanggal: "", keterangan: "" });
    setLiburOpen(false);
    setRefresh((r) => r + 1);
  };

  const hapusLibur = (id: string) => {
    deleteLibur(id);
    toast.success("Hari libur dihapus");
    setRefresh((r) => r + 1);
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
    <div className="p-6 md:p-8 space-y-6 animate-fade-in" key={refresh}>
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
                  {liburList.sort((a, b) => a.tanggal.localeCompare(b.tanggal)).map((l) => (
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
                  const tutor = tutors.find((t) => t.id === j.tutorId);
                  const k = kelas.find((k) => k.id === j.kelasId);
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
                        <Clock className="w-3 h-3" />{j.jamMulai}-{j.jamSelesai}
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
