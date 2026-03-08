import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { getSiswaList, getKelasList, getTutorList } from "@/lib/store";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, ClipboardList, CheckCircle, XCircle, AlertTriangle, MinusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

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

const kehadiranConfig: Record<string, { label: string; variant: string; icon: typeof CheckCircle }> = {
  hadir: { label: "Hadir", variant: "default", icon: CheckCircle },
  izin: { label: "Izin", variant: "secondary", icon: MinusCircle },
  sakit: { label: "Sakit", variant: "outline", icon: AlertTriangle },
  alpa: { label: "Alpa", variant: "destructive", icon: XCircle },
};

const emptyForm = { siswa_id: "", kelas_id: "", tutor_id: "", tanggal: "", kehadiran: "hadir", nilai: "", catatan: "" };

export default function LaporanPerkembangan() {
  const [data, setData] = useState<Laporan[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(true);
  const [filterSiswa, setFilterSiswa] = useState("semua");

  const siswaList = getSiswaList();
  const kelasList = getKelasList();
  const tutorList = getTutorList();

  const fetchData = async () => {
    const { data: rows } = await supabase.from("laporan_perkembangan").select("*").order("tanggal", { ascending: false });
    setData(rows || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = filterSiswa === "semua" ? data : data.filter((l) => l.siswa_id === filterSiswa);

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
    fetchData();
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
    if (nilaiNum !== null && (nilaiNum < 0 || nilaiNum > 100)) {
      toast.error("Nilai harus antara 0-100");
      return;
    }
    const { error } = await supabase.from("laporan_perkembangan").update({
      tanggal: form.tanggal,
      kehadiran: form.kehadiran,
      nilai: nilaiNum,
      catatan: form.catatan,
    }).eq("id", editId);
    if (error) { toast.error("Gagal memperbarui"); return; }
    toast.success("Laporan diperbarui!");
    setForm({ ...emptyForm });
    setEditOpen(false);
    setEditId(null);
    fetchData();
  };

  const hapus = async (id: string) => {
    await supabase.from("laporan_perkembangan").delete().eq("id", id);
    toast.success("Laporan dihapus");
    fetchData();
  };

  const getName = (list: { id: string; nama: string }[], id: string) => list.find((x) => x.id === id)?.nama || "-";

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

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Laporan Perkembangan</h1>
          <p className="text-muted-foreground mt-1">Catat kehadiran & nilai belajar siswa</p>
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

      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) { setForm({ ...emptyForm }); setEditId(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Laporan</DialogTitle></DialogHeader>
          {renderForm(handleEditSubmit, true)}
        </DialogContent>
      </Dialog>

      <div className="flex gap-2 flex-wrap">
        <Button variant={filterSiswa === "semua" ? "default" : "outline"} size="sm" onClick={() => setFilterSiswa("semua")}>
          Semua Siswa
        </Button>
        {siswaList.filter((s) => s.aktif).slice(0, 8).map((s) => (
          <Button key={s.id} variant={filterSiswa === s.id ? "default" : "outline"} size="sm" onClick={() => setFilterSiswa(s.id)}>
            {s.nama}
          </Button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-12">Memuat data...</p>
      ) : filtered.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="py-12 text-center">
            <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Belum ada laporan perkembangan</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((l) => {
            const cfg = kehadiranConfig[l.kehadiran] || kehadiranConfig.hadir;
            const Icon = cfg.icon;
            return (
              <Card key={l.id} className="border-none shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-semibold">{getName(siswaList, l.siswa_id)}</p>
                        <Badge variant={cfg.variant as any} className="text-xs gap-1">
                          <Icon className="w-3 h-3" />{cfg.label}
                        </Badge>
                        {l.nilai !== null && (
                          <Badge variant="outline" className="text-xs">Nilai: {l.nilai}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-0.5">
                        <p>{new Date(l.tanggal + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                        <p>Kelas: {getName(kelasList, l.kelas_id)} • Tutor: {getName(tutorList, l.tutor_id)}</p>
                        {l.catatan && <p className="mt-1 italic">"{l.catatan}"</p>}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(l)}><Pencil className="w-4 h-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
