import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getJadwalList, saveJadwal, deleteJadwal, getTutorList, getKelasList, generateId, type Jadwal as JadwalType } from "@/lib/store";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Calendar, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

const HARI_LIST = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"] as const;
const HARI_LABEL: Record<string, string> = {
  senin: "Senin", selasa: "Selasa", rabu: "Rabu", kamis: "Kamis",
  jumat: "Jumat", sabtu: "Sabtu", minggu: "Minggu",
};

const emptyForm = { tutorId: "", kelasId: "", ruangan: "", hari: "" as any, jamMulai: "", jamSelesai: "" };

export default function Jadwal() {
  const [refresh, setRefresh] = useState(0);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [filterHari, setFilterHari] = useState<string>("semua");

  const jadwalList = getJadwalList();
  const tutors = getTutorList();
  const kelas = getKelasList();

  const filtered = filterHari === "semua" ? jadwalList : jadwalList.filter((j) => j.hari === filterHari);
  const sorted = [...filtered].sort((a, b) => {
    const hariOrder = HARI_LIST.indexOf(a.hari as any) - HARI_LIST.indexOf(b.hari as any);
    if (hariOrder !== 0) return hariOrder;
    return a.jamMulai.localeCompare(b.jamMulai);
  });

  const validate = () => {
    if (!form.tutorId || !form.kelasId || !form.ruangan || !form.hari || !form.jamMulai || !form.jamSelesai) {
      toast.error("Lengkapi semua data jadwal");
      return false;
    }
    if (form.jamSelesai <= form.jamMulai) {
      toast.error("Jam selesai harus lebih besar dari jam mulai");
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
    setForm({ tutorId: j.tutorId, kelasId: j.kelasId, ruangan: j.ruangan, hari: j.hari, jamMulai: j.jamMulai, jamSelesai: j.jamSelesai });
    setEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !validate()) return;
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
        {tutors.length === 0 && <p className="text-xs text-destructive">Belum ada tutor. Tambahkan tutor terlebih dahulu.</p>}
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
        <Input placeholder="Ruang A1, Lab, dll" value={form.ruangan} onChange={(e) => setForm({ ...form, ruangan: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Hari *</Label>
        <Select value={form.hari} onValueChange={(v: any) => setForm({ ...form, hari: v })}>
          <SelectTrigger><SelectValue placeholder="Pilih hari" /></SelectTrigger>
          <SelectContent>
            {HARI_LIST.map((h) => <SelectItem key={h} value={h}>{HARI_LABEL[h]}</SelectItem>)}
          </SelectContent>
        </Select>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Jadwal</h1>
          <p className="text-muted-foreground mt-1">Kelola jadwal bimbingan belajar per minggu</p>
        </div>
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

      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) { setForm({ ...emptyForm }); setEditId(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Jadwal</DialogTitle></DialogHeader>
          {renderForm(handleEditSubmit, true)}
        </DialogContent>
      </Dialog>

      <div className="flex flex-wrap gap-2">
        <Button variant={filterHari === "semua" ? "default" : "outline"} size="sm" onClick={() => setFilterHari("semua")}>Semua</Button>
        {HARI_LIST.map((h) => (
          <Button key={h} variant={filterHari === h ? "default" : "outline"} size="sm" onClick={() => setFilterHari(h)}>
            {HARI_LABEL[h]}
          </Button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Belum ada jadwal</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((j) => {
            const tutor = tutors.find((t) => t.id === j.tutorId);
            const k = kelas.find((k) => k.id === j.kelasId);
            return (
              <Card key={j.id} className="border-none shadow-sm">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{HARI_LABEL[j.hari]}</Badge>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />{j.jamMulai} - {j.jamSelesai}
                      </span>
                    </div>
                    <p className="font-semibold">{k?.nama || "-"}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span>Tutor: {tutor?.nama || "-"}</span>
                      <span>Ruang: {j.ruangan}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(j)}><Pencil className="w-4 h-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
