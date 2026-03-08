import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, DoorOpen, Users, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

type Ruangan = {
  id: string;
  nama: string;
  kapasitas: number;
  status: string;
};

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  aktif: { label: "Aktif", color: "default", icon: CheckCircle },
  "non-aktif": { label: "Non-Aktif", color: "secondary", icon: XCircle },
  rusak: { label: "Rusak", color: "destructive", icon: AlertTriangle },
};

const emptyForm = { nama: "", kapasitas: "20", status: "aktif" };

export default function RuanganPage() {
  const [data, setData] = useState<Ruangan[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data: rows } = await supabase.from("ruangan").select("*").order("nama");
    setData(rows || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.kapasitas) {
      toast.error("Lengkapi semua data");
      return;
    }
    const { error } = await supabase.from("ruangan").insert({
      nama: form.nama,
      kapasitas: Number(form.kapasitas),
      status: form.status,
    });
    if (error) { toast.error("Gagal menambah ruangan"); return; }
    toast.success("Ruangan berhasil ditambahkan!");
    setForm({ ...emptyForm });
    setOpen(false);
    fetchData();
  };

  const openEdit = (r: Ruangan) => {
    setEditId(r.id);
    setForm({ nama: r.nama, kapasitas: String(r.kapasitas), status: r.status });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !form.nama || !form.kapasitas) {
      toast.error("Lengkapi semua data");
      return;
    }
    const { error } = await supabase.from("ruangan").update({
      nama: form.nama,
      kapasitas: Number(form.kapasitas),
      status: form.status,
    }).eq("id", editId);
    if (error) { toast.error("Gagal memperbarui"); return; }
    toast.success("Ruangan diperbarui!");
    setForm({ ...emptyForm });
    setEditOpen(false);
    setEditId(null);
    fetchData();
  };

  const hapus = async (id: string) => {
    await supabase.from("ruangan").delete().eq("id", id);
    toast.success("Ruangan dihapus");
    fetchData();
  };

  const renderForm = (onSubmit: (e: React.FormEvent) => void, isEdit: boolean) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nama Ruangan *</Label>
        <Input placeholder="Ruang A1, Lab Komputer, dll" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Kapasitas Maksimal *</Label>
        <Input type="number" min="1" placeholder="20" value={form.kapasitas} onChange={(e) => setForm({ ...form, kapasitas: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Status *</Label>
        <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="aktif">Aktif</SelectItem>
            <SelectItem value="non-aktif">Non-Aktif</SelectItem>
            <SelectItem value="rusak">Rusak</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">{isEdit ? "Simpan Perubahan" : "Tambah Ruangan"}</Button>
    </form>
  );

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Ruangan</h1>
          <p className="text-muted-foreground mt-1">Kelola data ruangan bimbingan belajar</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm({ ...emptyForm }); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Tambah Ruangan</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Tambah Ruangan Baru</DialogTitle></DialogHeader>
            {renderForm(handleSubmit, false)}
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) { setForm({ ...emptyForm }); setEditId(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Ruangan</DialogTitle></DialogHeader>
          {renderForm(handleEditSubmit, true)}
        </DialogContent>
      </Dialog>

      {loading ? (
        <p className="text-muted-foreground text-center py-12">Memuat data...</p>
      ) : data.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="py-12 text-center">
            <DoorOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Belum ada data ruangan</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((r) => {
            const cfg = statusConfig[r.status] || statusConfig.aktif;
            const Icon = cfg.icon;
            return (
              <Card key={r.id} className="border-none shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <DoorOpen className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-lg">{r.nama}</h3>
                    </div>
                    <Badge variant={cfg.color as any} className="text-xs gap-1">
                      <Icon className="w-3 h-3" />{cfg.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                    <Users className="w-4 h-4" />
                    <span>Kapasitas: {r.kapasitas} siswa</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(r)}>
                      <Pencil className="w-3.5 h-3.5 mr-1.5" />Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Ruangan?</AlertDialogTitle>
                          <AlertDialogDescription>Ruangan "{r.nama}" akan dihapus permanen.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => hapus(r.id)}>Hapus</AlertDialogAction>
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
