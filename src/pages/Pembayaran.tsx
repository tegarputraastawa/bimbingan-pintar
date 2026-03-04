import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSiswaList, getKelasList, getPembayaranList, savePembayaran, deletePembayaran, formatRupiah, generateId, type Pembayaran as PembayaranType } from "@/lib/store";
import { toast } from "sonner";
import { CreditCard, Plus, Trash2, CheckCircle, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export default function Pembayaran() {
  const [refresh, setRefresh] = useState(0);
  const [open, setOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"semua" | "lunas" | "belum_lunas">("semua");
  const [form, setForm] = useState({ siswaId: "", jumlah: "", metode: "" as "tunai" | "transfer" | "ewallet", status: "" as "lunas" | "belum_lunas", keterangan: "" });

  const siswa = getSiswaList().filter((s) => s.aktif);
  const kelas = getKelasList();
  const allPembayaran = getPembayaranList().sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  const pembayaran = allPembayaran.filter((p) => filterStatus === "semua" || p.status === filterStatus);

  const selectedSiswa = siswa.find((s) => s.id === form.siswaId);
  const selectedKelas = selectedSiswa ? kelas.find((k) => k.id === selectedSiswa.kelasId) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.siswaId || !form.jumlah || !form.metode || !form.status) {
      toast.error("Lengkapi data pembayaran");
      return;
    }
    savePembayaran({
      id: generateId(),
      siswaId: form.siswaId,
      jumlah: Number(form.jumlah),
      tanggal: new Date().toISOString(),
      metode: form.metode,
      status: form.status,
      keterangan: form.keterangan,
    });
    toast.success("Pembayaran berhasil dicatat!");
    setForm({ siswaId: "", jumlah: "", metode: "" as any, status: "" as any, keterangan: "" });
    setOpen(false);
    setRefresh((r) => r + 1);
  };

  const toggleStatus = (p: PembayaranType) => {
    const list = getPembayaranList();
    const idx = list.findIndex((x) => x.id === p.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], status: list[idx].status === "lunas" ? "belum_lunas" : "lunas" };
      localStorage.setItem("bimbel_pembayaran", JSON.stringify(list));
      toast.success(`Status diubah ke ${list[idx].status === "lunas" ? "Lunas" : "Belum Lunas"}`);
      setRefresh((r) => r + 1);
    }
  };

  const hapus = (id: string) => {
    deletePembayaran(id);
    toast.success("Pembayaran dihapus");
    setRefresh((r) => r + 1);
  };

  const allSiswa = getSiswaList();

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in" key={refresh}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Pembayaran</h1>
          <p className="text-muted-foreground mt-1">Catat dan kelola pembayaran siswa</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Catat Pembayaran</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Catat Pembayaran Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Siswa *</Label>
                <Select value={form.siswaId} onValueChange={(v) => setForm({ ...form, siswaId: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih siswa" /></SelectTrigger>
                  <SelectContent>
                    {siswa.map((s) => <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {selectedKelas && (
                <p className="text-sm text-muted-foreground">Kelas: {selectedKelas.nama} — {formatRupiah(selectedKelas.harga)}/bulan</p>
              )}
              <div className="space-y-2">
                <Label>Jumlah (Rp) *</Label>
                <Input type="number" placeholder="0" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} />
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
                <Label>Status Pembayaran *</Label>
                <Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue placeholder="Status pembayaran" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lunas">Lunas</SelectItem>
                    <SelectItem value="belum_lunas">Belum Lunas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Keterangan</Label>
                <Input placeholder="Opsional" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} />
              </div>
              <Button type="submit" className="w-full">Simpan Pembayaran</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
            const s = allSiswa.find((s) => s.id === p.siswaId);
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
                    <Button variant="ghost" size="sm" className={isLunas ? "text-success hover:text-success" : "text-warning hover:text-warning"} onClick={() => toggleStatus(p)} title={isLunas ? "Tandai belum lunas" : "Tandai lunas"}>
                      {isLunas ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
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
