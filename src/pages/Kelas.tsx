import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookOpen, Plus, Pencil, Trash2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type Kelas = {
  id: string;
  nama: string;
  harga: number;
  deskripsi: string;
  aktif: boolean;
};

export default function Kelas() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ nama: "", harga: "", deskripsi: "", aktif: true });

  const loadKelas = async () => {
    const { data, error } = await supabase
      .from("kelas")
      .select("*")
      .order("nama");
    
    if (error) {
      toast.error("Gagal memuat data kelas");
      return;
    }
    setKelasList(data || []);
  };

  useEffect(() => {
    loadKelas();
  }, []);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.nama || !form.harga) {
      toast.error("Nama dan harga wajib diisi");
      return;
    }

    const harga = parseInt(form.harga);
    if (isNaN(harga) || harga < 0) {
      toast.error("Harga harus berupa angka positif");
      return;
    }

    if (editingKelas) {
      const { error } = await supabase
        .from("kelas")
        .update({
          nama: form.nama,
          harga,
          deskripsi: form.deskripsi,
          aktif: form.aktif,
        })
        .eq("id", editingKelas.id);

      if (error) {
        toast.error("Gagal mengupdate kelas");
        return;
      }
      toast.success("Kelas berhasil diupdate");
    } else {
      const { error } = await supabase
        .from("kelas")
        .insert({
          nama: form.nama,
          harga,
          deskripsi: form.deskripsi,
          aktif: form.aktif,
        });

      if (error) {
        toast.error("Gagal menambahkan kelas");
        return;
      }
      toast.success("Kelas berhasil ditambahkan");
    }

    setForm({ nama: "", harga: "", deskripsi: "", aktif: true });
    setEditingKelas(null);
    setDialogOpen(false);
    loadKelas();
  };

  const handleEdit = (kelas: Kelas) => {
    setEditingKelas(kelas);
    setForm({
      nama: kelas.nama,
      harga: kelas.harga.toString(),
      deskripsi: kelas.deskripsi,
      aktif: kelas.aktif,
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from("kelas")
      .delete()
      .eq("id", deleteId);

    if (error) {
      toast.error("Gagal menghapus kelas");
      return;
    }

    toast.success("Kelas berhasil dihapus");
    setDeleteId(null);
    loadKelas();
  };

  const toggleStatus = async (kelas: Kelas) => {
    const { error } = await supabase
      .from("kelas")
      .update({ aktif: !kelas.aktif })
      .eq("id", kelas.id);

    if (error) {
      toast.error("Gagal mengubah status");
      return;
    }

    toast.success(`Kelas ${!kelas.aktif ? "diaktifkan" : "dinonaktifkan"}`);
    loadKelas();
  };

  const filteredKelas = kelasList.filter((k) =>
    k.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Manajemen Kelas</h1>
          <p className="text-muted-foreground mt-1">Kelola data kelas bimbingan belajar</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setForm({ nama: "", harga: "", deskripsi: "", aktif: true });
            setEditingKelas(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Kelas
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                {editingKelas ? "Edit Kelas" : "Tambah Kelas Baru"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Kelas *</Label>
                <Input
                  id="nama"
                  placeholder="Contoh: Matematika SD"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="harga">Biaya per Bulan *</Label>
                <Input
                  id="harga"
                  type="number"
                  placeholder="Contoh: 350000"
                  value={form.harga}
                  onChange={(e) => setForm({ ...form, harga: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Textarea
                  id="deskripsi"
                  placeholder="Deskripsi kelas"
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="aktif">Status Aktif</Label>
                <Switch
                  id="aktif"
                  checked={form.aktif}
                  onCheckedChange={(checked) => setForm({ ...form, aktif: checked })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingKelas ? "Update" : "Simpan"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setForm({ nama: "", harga: "", deskripsi: "", aktif: true });
                    setEditingKelas(null);
                  }}
                >
                  Batal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6 border-none shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredKelas.map((kelas) => (
          <Card key={kelas.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {kelas.nama}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    kelas.aktif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}>
                    {kelas.aktif ? "Aktif" : "Non-aktif"}
                  </span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">{kelas.deskripsi || "Tidak ada deskripsi"}</p>
                <p className="text-2xl font-bold text-primary mt-2">
                  {formatRupiah(kelas.harga)}
                  <span className="text-xs font-normal text-muted-foreground">/bulan</span>
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(kelas)}
                  className="flex-1"
                >
                  <Pencil className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteId(kelas.id)}
                  className="flex-1"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Hapus
                </Button>
                <Button
                  size="sm"
                  variant={kelas.aktif ? "secondary" : "default"}
                  onClick={() => toggleStatus(kelas)}
                  className="flex-1"
                >
                  {kelas.aktif ? "Nonaktifkan" : "Aktifkan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredKelas.length === 0 && (
        <Card className="border-none shadow-sm">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? "Tidak ada kelas yang ditemukan" : "Belum ada data kelas"}
            </p>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kelas?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kelas ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
