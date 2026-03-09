import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";

type Kelas = {
  id: string;
  nama: string;
  harga: number;
  deskripsi: string;
  aktif: boolean;
};

export default function Pendaftaran() {
  const navigate = useNavigate();
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [form, setForm] = useState({ 
    nama: "", 
    email: "", 
    telepon: "", 
    alamat: "", 
    kelasId: "" 
  });
  const [tanggalMulai, setTanggalMulai] = useState<Date>();
  const [tanggalAkhir, setTanggalAkhir] = useState<Date>();

  useEffect(() => {
    loadKelas();
  }, []);

  const loadKelas = async () => {
    const { data, error } = await supabase
      .from("kelas")
      .select("*")
      .eq("aktif", true)
      .order("nama");
    
    if (error) {
      toast.error("Gagal memuat data kelas");
      return;
    }
    setKelasList(data || []);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const selectedKelas = kelasList.find((k) => k.id === form.kelasId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.telepon || !form.kelasId) {
      toast.error("Mohon lengkapi data yang wajib diisi");
      return;
    }

    if (!tanggalMulai || !tanggalAkhir) {
      toast.error("Mohon pilih tanggal mulai dan tanggal akhir");
      return;
    }

    if (tanggalAkhir < tanggalMulai) {
      toast.error("Tanggal akhir harus setelah tanggal mulai");
      return;
    }

    // Insert siswa
    const { data: siswaData, error: siswaError } = await supabase
      .from("siswa")
      .insert({
        nama: form.nama,
        email: form.email,
        telepon: form.telepon,
        alamat: form.alamat,
        kelas_id: form.kelasId,
        tanggal_mulai: format(tanggalMulai, "yyyy-MM-dd"),
        tanggal_akhir: format(tanggalAkhir, "yyyy-MM-dd"),
        aktif: true,
      })
      .select()
      .single();

    if (siswaError || !siswaData) {
      toast.error("Gagal mendaftarkan siswa");
      return;
    }

    // Hitung tanggal jatuh tempo: 10 hari sebelum tanggal_akhir
    const jatuhTempo = new Date(tanggalAkhir);
    jatuhTempo.setDate(jatuhTempo.getDate() - 10);

    // Otomatis buat pembayaran dengan status belum_lunas
    const selectedKelas = kelasList.find((k) => k.id === form.kelasId);
    const { error: pembayaranError } = await supabase.from("pembayaran").insert({
      siswa_id: siswaData.id,
      jumlah: 0,
      status: "belum_lunas",
      metode: "tunai",
      keterangan: "Pendaftaran baru - menunggu pembayaran",
      periode_mulai: format(tanggalMulai, "yyyy-MM-dd"),
      periode_akhir: format(tanggalAkhir, "yyyy-MM-dd"),
      tanggal_jatuh_tempo: format(jatuhTempo, "yyyy-MM-dd"),
    });

    if (pembayaranError) {
      console.error("Gagal membuat data pembayaran:", pembayaranError);
      toast.error("Siswa terdaftar, tapi gagal membuat data pembayaran");
    } else {
      toast.success(`${form.nama} berhasil didaftarkan! Data pembayaran otomatis dibuat.`);
    }

    navigate("/siswa");
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Pendaftaran Siswa</h1>
        <p className="text-muted-foreground mt-1">Daftarkan siswa baru ke bimbingan belajar</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="w-5 h-5 text-primary" />
            Form Pendaftaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Lengkap *</Label>
              <Input id="nama" placeholder="Masukkan nama lengkap" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telepon">No. Telepon *</Label>
                <Input id="telepon" placeholder="08xxxxxxxxxx" value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@contoh.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Textarea id="alamat" placeholder="Alamat lengkap" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal Mulai *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !tanggalMulai && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tanggalMulai ? format(tanggalMulai, "PPP", { locale: localeId }) : "Pilih tanggal"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={tanggalMulai}
                      onSelect={setTanggalMulai}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Tanggal Akhir *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !tanggalAkhir && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tanggalAkhir ? format(tanggalAkhir, "PPP", { locale: localeId }) : "Pilih tanggal"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={tanggalAkhir}
                      onSelect={setTanggalAkhir}
                      disabled={(date) => tanggalMulai ? date < tanggalMulai : false}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Pilih Kelas *</Label>
              <Select value={form.kelasId} onValueChange={(v) => setForm({ ...form, kelasId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas yang diikuti" />
                </SelectTrigger>
                <SelectContent>
                  {kelasList.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.nama} — {formatRupiah(k.harga)}/bulan
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedKelas && (
              <div className="rounded-xl bg-secondary p-4">
                <p className="text-sm font-medium text-secondary-foreground">Kelas: {selectedKelas.nama}</p>
                <p className="text-xs text-muted-foreground">{selectedKelas.deskripsi}</p>
                <p className="text-lg font-bold text-primary mt-2">{formatRupiah(selectedKelas.harga)}<span className="text-xs font-normal text-muted-foreground">/bulan</span></p>
              </div>
            )}
            <Button type="submit" className="w-full" size="lg">
              <UserPlus className="w-4 h-4 mr-2" />
              Daftarkan Siswa
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
