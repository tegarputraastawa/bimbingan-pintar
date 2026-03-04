import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSiswaList, getKelasList, getPembayaranList, savePembayaran, updatePembayaran, deletePembayaran, formatRupiah, generateId, type Pembayaran as PembayaranType } from "@/lib/store";
import { toast } from "sonner";
import { CreditCard, Plus, Trash2, CheckCircle, Clock, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

const emptyForm = { siswaId: "", jumlah: "", metode: "" as "tunai" | "transfer" | "ewallet", status: "" as "lunas" | "belum_lunas", keterangan: "" };

export default function Pembayaran() {
  const [refresh, setRefresh] = useState(0);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"semua" | "lunas" | "belum_lunas">("semua");
  const [form, setForm] = useState({ ...emptyForm });

  const allSiswa = getSiswaList();
  const siswaAktif = allSiswa.filter((s) => s.aktif);
  const kelas = getKelasList();
  const allPembayaran = getPembayaranList().sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  const pembayaran = allPembayaran.filter((p) => filterStatus === "semua" || p.status === filterStatus);

  const selectedSiswa = allSiswa.find((s) => s.id === form.siswaId);
  const selectedKelas = selectedSiswa ? kelas.find((k) => k.id === selectedSiswa.kelasId) : null;
  const maxJumlah = selectedKelas?.harga || 0;

  const handleStatusChange = (status: string) => {
    if (status === "lunas" && selectedKelas) {
      setForm({ ...form, status: status as any, jumlah: String(selectedKelas.harga) });
    } else {
      setForm({ ...form, status: status as any });
    }
  };

  const handleJumlahChange = (val: string) => {
    const num = Number(val);
    if (maxJumlah > 0 && num > maxJumlah) {
      toast.error(`Jumlah tidak boleh melebihi harga kelas: ${formatRupiah(maxJumlah)}`);
      setForm({ ...form, jumlah: String(maxJumlah) });
      return;
    }
    setForm({ ...form, jumlah: val });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.siswaId || !form.jumlah || !form.metode || !form.status) {
      toast.error("Lengkapi data pembayaran");
      return;
    }
    const jumlah = Number(form.jumlah);
    if (maxJumlah > 0 && jumlah > maxJumlah) {
      toast.error(`Jumlah tidak boleh melebihi harga kelas: ${formatRupiah(maxJumlah)}`);
      return;
    }
    savePembayaran({
      id: generateId(),
      siswaId: form.siswaId,
      jumlah,
      tanggal: new Date().toISOString(),
      metode: form.metode,
      status: form.status,
      keterangan: form.keterangan,
    });
    toast.success("Pembayaran berhasil dicatat!");
    setForm({ ...emptyForm });
    setOpen(false);
    setRefresh((r) => r + 1);
  };

  const openEdit = (p: PembayaranType) => {
    setEditId(p.id);
    setForm({
      siswaId: p.siswaId,
      jumlah: String(p.jumlah),
      metode: p.metode,
      status: p.status,
      keterangan: p.keterangan,
    });
    setEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !form.jumlah || !form.metode || !form.status) {
      toast.error("Lengkapi data pembayaran");
      return;
    }
    const jumlah = Number(form.jumlah);
    if (maxJumlah > 0 && jumlah > maxJumlah) {
      toast.error(`Jumlah tidak boleh melebihi harga kelas: ${formatRupiah(maxJumlah)}`);
      return;
    }
    const existing = getPembayaranList().find((p) => p.id === editId);
    if (!existing) return;
    updatePembayaran({
      ...existing,
      jumlah,
      metode: form.metode,
      status: form.status,
      keterangan: form.keterangan,
    });
    toast.success("Pembayaran berhasil diperbarui!");
    setForm({ ...emptyForm });
    setEditOpen(false);
    setEditId(null);
    setRefresh((r) => r + 1);
  };

  const hapus = (id: string) => {
    deletePembayaran(id);
    toast.success("Pembayaran dihapus");
    setRefresh((r) => r + 1);
  };

  const renderForm = (onSubmit: (e: React.FormEvent) => void, isEdit: boolean) => (
    <form onSubmit={onSubmit} className="space-y-4">
      {!isEdit && (
        <div className="space-y-2">
          <Label>Siswa *</Label>
          <Select value={form.siswaId} onValueChange={(v) => setForm({ ...form, siswaId: v, jumlah: "", status: "" as any })}>
            <SelectTrigger><SelectValue placeholder="Pilih siswa" /></SelectTrigger>
            <SelectContent>
              {siswaAktif.map((s) => <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
      {isEdit && selectedSiswa && (
        <p className="text-sm font-medium">Siswa: {selectedSiswa.nama}</p>
      )}
      {selectedKelas && (
        <p className="text-sm text-muted-foreground">Kelas: {selectedKelas.nama} — Maks: {formatRupiah(selectedKelas.harga)}/bulan</p>
      )}
      <div className="space-y-2">
        <Label>Status Pembayaran *</Label>
        <Select value={form.status} onValueChange={handleStatusChange}>
          <SelectTrigger><SelectValue placeholder="Status pembayaran" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="lunas">Lunas</SelectItem>
            <SelectItem value="belum_lunas">Belum Lunas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Jumlah (Rp) *</Label>
        <Input
          type="number"
          placeholder="0"
          value={form.jumlah}
          onChange={(e) => handleJumlahChange(e.target.value)}
          max={maxJumlah > 0 ? maxJumlah : undefined}
          readOnly={form.status === "lunas"}
        />
        {form.status === "lunas" && selectedKelas && (
          <p className="text-xs text-muted-foreground">Otomatis terisi harga kelas saat status Lunas</p>
        )}
        {maxJumlah > 0 && form.status !== "lunas" && (
          <p className="text-xs text-muted-foreground">Maksimal: {formatRupiah(maxJumlah)}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Metode *</Label>
        <Select value={form.metode} onValueChange={(v: any) => setForm({ ...form, metode: v })}>
          <SelectTrigger><SelectValue placeholder="Metode pembayaran" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="tunai">Tunai</SelectItem>
            <SelectItem value="transfer">Transfer Bank</SelectItem>
            <SelectItem value="ewallet">E-Wallet</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Keterangan</Label>
        <Input placeholder="Opsional" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} />
      </div>
      <Button type="submit" className="w-full">{isEdit ? "Simpan Perubahan" : "Simpan Pembayaran"}</Button>
    </form>
  );

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in" key={refresh}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Pembayaran</h1>
          <p className="text-muted-foreground mt-1">Catat dan kelola pembayaran siswa</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm({ ...emptyForm }); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Catat Pembayaran</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Catat Pembayaran Baru</DialogTitle>
            </DialogHeader>
            {renderForm(handleSubmit, false)}
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) { setForm({ ...emptyForm }); setEditId(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pembayaran</DialogTitle>
          </DialogHeader>
          {renderForm(handleEditSubmit, true)}
        </DialogContent>
      </Dialog>

      <div className="flex gap-2">
        {([["semua", "Semua"], ["lunas", "Lunas"], ["belum_lunas", "Belum Lunas"]] as const).map(([val, label]) => (
          <Button key={val} variant={filterStatus === val ? "default" : "outline"} size="sm" onClick={() => setFilterStatus(val)}>
            {label}
          </Button>
        ))}
      </div>

      {pembayaran.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="py-12 text-center">
            <CreditCard className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Belum ada data pembayaran</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pembayaran.map((p) => {
            const s = allSiswa.find((x) => x.id === p.siswaId);
            const isLunas = p.status === "lunas";
            return (
              <Card key={p.id} className="border-none shadow-sm">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{s?.nama || "Siswa dihapus"}</p>
                      <Badge variant={isLunas ? "default" : "destructive"} className="text-xs">
                        {isLunas ? <><CheckCircle className="w-3 h-3 mr-1" />Lunas</> : <><Clock className="w-3 h-3 mr-1" />Belum Lunas</>}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                      <span>{new Date(p.tanggal).toLocaleDateString("id-ID")}</span>
                      <span className="capitalize px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs">{p.metode}</span>
                      {p.keterangan && <span>{p.keterangan}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary">{formatRupiah(p.jumlah)}</span>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)} title="Edit pembayaran">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Pembayaran?</AlertDialogTitle>
                          <AlertDialogDescription>Data pembayaran ini akan dihapus.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => hapus(p.id)}>Hapus</AlertDialogAction>
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
