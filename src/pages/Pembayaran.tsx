import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, AlertCircle, CheckCircle, Clock, Pencil, Calendar, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, differenceInDays } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";

type Pembayaran = {
  id: string;
  siswa_id: string;
  jumlah: number;
  tanggal: string;
  metode: string;
  status: string;
  keterangan: string;
  periode_mulai: string | null;
  periode_akhir: string | null;
  tanggal_jatuh_tempo: string | null;
};

type Siswa = {
  id: string;
  nama: string;
  kelas_id: string;
};

type Kelas = {
  id: string;
  nama: string;
  harga: number;
};

type OrangTua = {
  id: string;
  siswa_id: string;
  nama: string;
  telepon: string;
  hubungan: string;
};

export default function Pembayaran() {
  const [refresh, setRefresh] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"semua" | "lunas" | "belum_lunas">("semua");
  const [filterKelas, setFilterKelas] = useState<string>("semua");
  const [filterTanggalMulai, setFilterTanggalMulai] = useState("");
  const [filterTanggalAkhir, setFilterTanggalAkhir] = useState("");
  
  const [pembayaranList, setPembayaranList] = useState<Pembayaran[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [orangTuaList, setOrangTuaList] = useState<OrangTua[]>([]);
  
  const [form, setForm] = useState({ 
    jumlah: "", 
    metode: "" as "tunai" | "transfer" | "ewallet",
    keterangan: "" 
  });

  useEffect(() => {
    loadData();
  }, [refresh]);

  const loadData = async () => {
    const [pembayaranRes, siswaRes, kelasRes] = await Promise.all([
      supabase.from("pembayaran").select("*").order("tanggal", { ascending: false }),
      supabase.from("siswa").select("id, nama, kelas_id"),
      supabase.from("kelas").select("id, nama, harga"),
    ]);

    if (pembayaranRes.data) setPembayaranList(pembayaranRes.data);
    if (siswaRes.data) setSiswaList(siswaRes.data);
    if (kelasRes.data) setKelasList(kelasRes.data);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const openEdit = (p: Pembayaran) => {
    setEditId(p.id);
    setForm({
      jumlah: String(p.jumlah),
      metode: p.metode as any,
      keterangan: p.keterangan,
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !form.jumlah || !form.metode) {
      toast.error("Lengkapi data pembayaran");
      return;
    }

    const jumlah = Number(form.jumlah);
    const existing = pembayaranList.find((p) => p.id === editId);
    if (!existing) return;

    const siswa = siswaList.find((s) => s.id === existing.siswa_id);
    const kelas = siswa ? kelasList.find((k) => k.id === siswa.kelas_id) : null;
    const hargaKelas = kelas?.harga || 0;

    // Validasi: tidak boleh melebihi harga kelas
    if (hargaKelas > 0 && jumlah > hargaKelas) {
      toast.error(`Jumlah pembayaran tidak boleh melebihi biaya kelas: ${formatRupiah(hargaKelas)}`);
      return;
    }

    // Tentukan status: lunas jika jumlah >= harga kelas
    const newStatus = jumlah >= hargaKelas ? "lunas" : "belum_lunas";

    const { error } = await supabase
      .from("pembayaran")
      .update({
        jumlah,
        metode: form.metode,
        status: newStatus,
        keterangan: form.keterangan,
      })
      .eq("id", editId);

    if (error) {
      toast.error("Gagal memperbarui pembayaran");
      return;
    }

    toast.success("Pembayaran berhasil diperbarui!");
    setForm({ jumlah: "", metode: "" as any, keterangan: "" });
    setEditOpen(false);
    setEditId(null);
    setRefresh((r) => r + 1);
  };

  const handleJumlahChange = (val: string) => {
    const num = Number(val);
    if (maxJumlah > 0 && num > maxJumlah) {
      toast.error(`Jumlah tidak boleh melebihi biaya kelas: ${formatRupiah(maxJumlah)}`);
      setForm({ ...form, jumlah: String(maxJumlah) });
      return;
    }
    setForm({ ...form, jumlah: val });
  };

  // Filter pembayaran
  let filteredPembayaran = pembayaranList;

  if (filterStatus !== "semua") {
    filteredPembayaran = filteredPembayaran.filter((p) => p.status === filterStatus);
  }

  if (filterKelas !== "semua") {
    const siswaIds = siswaList.filter((s) => s.kelas_id === filterKelas).map((s) => s.id);
    filteredPembayaran = filteredPembayaran.filter((p) => siswaIds.includes(p.siswa_id));
  }

  if (filterTanggalMulai) {
    filteredPembayaran = filteredPembayaran.filter((p) => {
      if (!p.periode_mulai) return true;
      return p.periode_mulai >= filterTanggalMulai;
    });
  }

  if (filterTanggalAkhir) {
    filteredPembayaran = filteredPembayaran.filter((p) => {
      if (!p.periode_akhir) return true;
      return p.periode_akhir <= filterTanggalAkhir;
    });
  }

  const getJatuhTempoStatus = (p: Pembayaran) => {
    if (p.status === "lunas") return "lunas";
    if (!p.tanggal_jatuh_tempo) return "normal";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const jatuhTempo = parseISO(p.tanggal_jatuh_tempo);
    const daysLeft = differenceInDays(jatuhTempo, today);

    if (daysLeft < 0) return "overdue"; // Sudah lewat
    if (daysLeft <= 10) return "urgent"; // 10 hari atau kurang
    return "normal";
  };

  const selectedPembayaran = editId ? pembayaranList.find((p) => p.id === editId) : null;
  const selectedSiswa = selectedPembayaran ? siswaList.find((s) => s.id === selectedPembayaran.siswa_id) : null;
  const selectedKelas = selectedSiswa ? kelasList.find((k) => k.id === selectedSiswa.kelas_id) : null;
  const maxJumlah = selectedKelas?.harga || 0;

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in" key={refresh}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Pembayaran Siswa</h1>
          <p className="text-muted-foreground mt-1">Kelola pembayaran yang dibuat dari pendaftaran siswa</p>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={(v) => { 
        setEditOpen(v); 
        if (!v) { 
          setForm({ jumlah: "", metode: "" as any, keterangan: "" }); 
          setEditId(null); 
        } 
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Perbarui Pembayaran</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {selectedSiswa && (
              <p className="text-sm font-medium">Siswa: {selectedSiswa.nama}</p>
            )}
            {selectedKelas && (
              <p className="text-sm text-muted-foreground">
                Kelas: {selectedKelas.nama} — Biaya: {formatRupiah(selectedKelas.harga)}
              </p>
            )}
            <div className="space-y-2">
              <Label>Jumlah Pembayaran (Rp) *</Label>
              <Input
                type="number"
                placeholder="0"
                value={form.jumlah}
                onChange={(e) => handleJumlahChange(e.target.value)}
                max={maxJumlah > 0 ? maxJumlah : undefined}
              />
              {maxJumlah > 0 && (
                <p className="text-xs text-muted-foreground">
                  Maksimal: {formatRupiah(maxJumlah)}. Status otomatis menjadi Lunas jika mencapai biaya kelas.
                </p>
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
              <Input 
                placeholder="Opsional" 
                value={form.keterangan} 
                onChange={(e) => setForm({ ...form, keterangan: e.target.value })} 
              />
            </div>
            <Button type="submit" className="w-full">Simpan Perubahan</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <Card className="border-none shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Status</SelectItem>
                  <SelectItem value="lunas">Lunas</SelectItem>
                  <SelectItem value="belum_lunas">Belum Lunas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kelas</Label>
              <Select value={filterKelas} onValueChange={setFilterKelas}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Kelas</SelectItem>
                  {kelasList.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Periode Mulai</Label>
              <Input
                type="date"
                value={filterTanggalMulai}
                onChange={(e) => setFilterTanggalMulai(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Periode Akhir</Label>
              <Input
                type="date"
                value={filterTanggalAkhir}
                onChange={(e) => setFilterTanggalAkhir(e.target.value)}
              />
            </div>
          </div>
          {(filterStatus !== "semua" || filterKelas !== "semua" || filterTanggalMulai || filterTanggalAkhir) && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setFilterStatus("semua");
                setFilterKelas("semua");
                setFilterTanggalMulai("");
                setFilterTanggalAkhir("");
              }}
            >
              Reset Filter
            </Button>
          )}
        </CardContent>
      </Card>

      {filteredPembayaran.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="py-12 text-center">
            <CreditCard className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              {pembayaranList.length === 0 
                ? "Belum ada data pembayaran. Data otomatis dibuat saat pendaftaran siswa baru."
                : "Tidak ada data yang sesuai dengan filter."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPembayaran.map((p) => {
            const siswa = siswaList.find((s) => s.id === p.siswa_id);
            const kelas = siswa ? kelasList.find((k) => k.id === siswa.kelas_id) : null;
            const isLunas = p.status === "lunas";
            const jatuhTempoStatus = getJatuhTempoStatus(p);

            return (
              <Card 
                key={p.id} 
                className={cn(
                  "border-none shadow-sm transition-all",
                  jatuhTempoStatus === "overdue" && "border-l-4 border-l-destructive bg-destructive/5",
                  jatuhTempoStatus === "urgent" && "border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
                )}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <p className="font-semibold">{siswa?.nama || "Siswa dihapus"}</p>
                        <Badge variant={isLunas ? "default" : "destructive"} className="text-xs">
                          {isLunas ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Lunas
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Belum Lunas
                            </>
                          )}
                        </Badge>
                        {jatuhTempoStatus === "overdue" && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Lewat Jatuh Tempo
                          </Badge>
                        )}
                        {jatuhTempoStatus === "urgent" && (
                          <Badge className="text-xs bg-yellow-500 hover:bg-yellow-600">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Segera Jatuh Tempo
                          </Badge>
                        )}
                      </div>
                      
                      {kelas && (
                        <p className="text-sm text-muted-foreground mb-1">
                          Kelas: {kelas.nama} — Biaya: {formatRupiah(kelas.harga)}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {p.periode_mulai && p.periode_akhir && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(parseISO(p.periode_mulai), "dd MMM yyyy", { locale: localeId })} - {format(parseISO(p.periode_akhir), "dd MMM yyyy", { locale: localeId })}
                          </span>
                        )}
                        {p.tanggal_jatuh_tempo && !isLunas && (
                          <span className={cn(
                            "flex items-center gap-1",
                            jatuhTempoStatus === "overdue" && "text-destructive font-medium",
                            jatuhTempoStatus === "urgent" && "text-yellow-600 dark:text-yellow-400 font-medium"
                          )}>
                            <Clock className="w-3 h-3" />
                            Jatuh tempo: {format(parseISO(p.tanggal_jatuh_tempo), "dd MMM yyyy", { locale: localeId })}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-2">
                        <span className="capitalize px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs">
                          {p.metode}
                        </span>
                        {p.keterangan && <span>{p.keterangan}</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-primary text-lg">{formatRupiah(p.jumlah)}</p>
                        {kelas && p.jumlah < kelas.harga && (
                          <p className="text-xs text-muted-foreground">
                            Sisa: {formatRupiah(kelas.harga - p.jumlah)}
                          </p>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openEdit(p)} 
                        title="Edit pembayaran"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
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
