import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { getSiswaList, type Siswa } from "@/lib/store";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, UserCheck, Phone, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

type OrangTua = {
  id: string;
  siswa_id: string;
  nama: string;
  telepon: string;
  email: string;
  hubungan: string;
  alamat: string;
};

const emptyForm = { siswa_id: "", nama: "", telepon: "", email: "", hubungan: "Orang Tua", alamat: "" };

export default function OrangTuaPage() {
  const [data, setData] = useState<OrangTua[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(true);
  const [filterSiswa, setFilterSiswa] = useState("semua");

  const siswaList = getSiswaList();

  const fetchData = async () => {
    const { data: rows } = await supabase.from("orang_tua").select("*").order("nama");
    setData(rows || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = filterSiswa === "semua" ? data : data.filter((o) => o.siswa_id === filterSiswa);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.siswa_id || !form.nama || !form.telepon) {
      toast.error("Lengkapi data wajib (Siswa, Nama, Telepon)");
      return;
    }
    const { error } = await supabase.from("orang_tua").insert({
      siswa_id: form.siswa_id,
      nama: form.nama,
      telepon: form.telepon,
      email: form.email,
      hubungan: form.hubungan,
      alamat: form.alamat,
    });
    if (error) { toast.error("Gagal menambah data"); return; }
    toast.success("Data orang tua ditambahkan!");
    setForm({ ...emptyForm });
    setOpen(false);
    fetchData();
  };

  const openEdit = (o: OrangTua) => {
    setEditId(o.id);
    setForm({ siswa_id: o.siswa_id, nama: o.nama, telepon: o.telepon, email: o.email, hubungan: o.hubungan, alamat: o.alamat });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !form.nama || !form.telepon) {
      toast.error("Lengkapi data wajib");
      return;
    }
    const { error } = await supabase.from("orang_tua").update({
      nama: form.nama,
      telepon: form.telepon,
      email: form.email,
      hubungan: form.hubungan,
      alamat: form.alamat,
    }).eq("id", editId);
    if (error) { toast.error("Gagal memperbarui"); return; }
    toast.success("Data orang tua diperbarui!");
    setForm({ ...emptyForm });
    setEditOpen(false);
    setEditId(null);
    fetchData();
  };

  const hapus = async (id: string) => {
    await supabase.from("orang_tua").delete().eq("id", id);
    toast.success("Data orang tua dihapus");
    fetchData();
  };

  const getSiswaName = (id: string) => siswaList.find((s) => s.id === id)?.nama || "Siswa tidak ditemukan";

  const renderForm = (onSubmit: (e: React.FormEvent) => void, isEdit: boolean) => (
    <form onSubmit={onSubmit} className="space-y-4">
      {!isEdit && (
        <div className="space-y-2">
          <Label>Siswa *</Label>
          <Select value={form.siswa_id} onValueChange={(v) => setForm({ ...form, siswa_id: v })}>
            <SelectTrigger><SelectValue placeholder="Pilih siswa" /></SelectTrigger>
            <SelectContent>
              {siswaList.filter((s) => s.aktif).map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {isEdit && <p className="text-sm font-medium">Siswa: {getSiswaName(form.siswa_id)}</p>}
      <div className="space-y-2">
        <Label>Nama Orang Tua / Wali *</Label>
        <Input placeholder="Nama lengkap" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Hubungan</Label>
        <Select value={form.hubungan} onValueChange={(v) => setForm({ ...form, hubungan: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Orang Tua">Orang Tua</SelectItem>
            <SelectItem value="Ayah">Ayah</SelectItem>
            <SelectItem value="Ibu">Ibu</SelectItem>
            <SelectItem value="Wali">Wali</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Telepon *</Label>
        <Input placeholder="08xxxxxxxxxx" value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" placeholder="email@contoh.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Alamat</Label>
        <Input placeholder="Alamat lengkap" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} />
      </div>
      <Button type="submit" className="w-full">{isEdit ? "Simpan Perubahan" : "Tambah Data"}</Button>
    </form>
  );

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Orang Tua / Wali</h1>
          <p className="text-muted-foreground mt-1">Kelola kontak orang tua siswa</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm({ ...emptyForm }); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Tambah Data</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Tambah Orang Tua / Wali</DialogTitle></DialogHeader>
            {renderForm(handleSubmit, false)}
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) { setForm({ ...emptyForm }); setEditId(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Orang Tua / Wali</DialogTitle></DialogHeader>
          {renderForm(handleEditSubmit, true)}
        </DialogContent>
      </Dialog>

      <div className="flex gap-2 flex-wrap">
        <Button variant={filterSiswa === "semua" ? "default" : "outline"} size="sm" onClick={() => setFilterSiswa("semua")}>
          Semua
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
            <UserCheck className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Belum ada data orang tua</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <Card key={o.id} className="border-none shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{o.nama}</p>
                    <Badge variant="secondary" className="text-xs">{o.hubungan}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Siswa: {getSiswaName(o.siswa_id)}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {o.telepon && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{o.telepon}</span>}
                    {o.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{o.email}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(o)}><Pencil className="w-4 h-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Data?</AlertDialogTitle>
                        <AlertDialogDescription>Data orang tua "{o.nama}" akan dihapus.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => hapus(o.id)}>Hapus</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
