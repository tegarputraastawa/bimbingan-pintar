import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getKelasList, saveSiswa, formatRupiah, generateId } from "@/lib/store";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

export default function Pendaftaran() {
  const navigate = useNavigate();
  const kelasList = getKelasList();
  const [form, setForm] = useState({ nama: "", email: "", telepon: "", alamat: "", kelasId: "" });

  const selectedKelas = kelasList.find((k) => k.id === form.kelasId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.telepon || !form.kelasId) {
      toast.error("Mohon lengkapi data yang wajib diisi");
      return;
    }
    saveSiswa({
      id: generateId(),
      nama: form.nama,
      email: form.email,
      telepon: form.telepon,
      alamat: form.alamat,
      kelasId: form.kelasId,
      tanggalDaftar: new Date().toISOString(),
      aktif: true,
    });
    toast.success(`${form.nama} berhasil didaftarkan!`);
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
