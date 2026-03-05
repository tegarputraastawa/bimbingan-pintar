import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTutorList, saveTutor, deleteTutor, generateId, type Tutor as TutorType } from "@/lib/store";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, GraduationCap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const emptyForm = { nama: "", telepon: "", email: "", bidang: "" };

export default function Tutor() {
  const [refresh, setRefresh] = useState(0);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [search, setSearch] = useState("");

  const tutors = getTutorList();
  const filtered = tutors.filter((t) =>
    t.nama.toLowerCase().includes(search.toLowerCase()) || t.bidang.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.telepon || !form.bidang) {
      toast.error("Lengkapi data tutor (nama, telepon, bidang)");
      return;
    }
    saveTutor({ id: generateId(), ...form });
    toast.success("Tutor berhasil ditambahkan!");
    setForm({ ...emptyForm });
    setOpen(false);
    setRefresh((r) => r + 1);
  };

  const openEdit = (t: TutorType) => {
    setEditId(t.id);
    setForm({ nama: t.nama, telepon: t.telepon, email: t.email, bidang: t.bidang });
    setEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !form.nama || !form.telepon || !form.bidang) {
      toast.error("Lengkapi data tutor");
      return;
    }
    saveTutor({ id: editId, ...form });
    toast.success("Data tutor diperbarui!");
    setForm({ ...emptyForm });
    setEditOpen(false);
    setEditId(null);
    setRefresh((r) => r + 1);
  };

  const hapus = (id: string) => {
    deleteTutor(id);
    toast.success("Tutor dihapus");
    setRefresh((r) => r + 1);
  };

  const renderForm = (onSubmit: (e: React.FormEvent) => void, isEdit: boolean) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nama Tutor *</Label>
        <Input placeholder="Nama lengkap" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
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
        <Label>Bidang/Mata Pelajaran *</Label>
        <Input placeholder="Matematika, Fisika, dll" value={form.bidang} onChange={(e) => setForm({ ...form, bidang: e.target.value })} />
      </div>
      <Button type="submit" className="w-full">{isEdit ? "Simpan Perubahan" : "Tambah Tutor"}</Button>
    </form>
  );

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in" key={refresh}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Data Tutor</h1>
          <p className="text-muted-foreground mt-1">Kelola data pengajar bimbingan belajar</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm({ ...emptyForm }); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Tambah Tutor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Tambah Tutor Baru</DialogTitle></DialogHeader>
            {renderForm(handleSubmit, false)}
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) { setForm({ ...emptyForm }); setEditId(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Tutor</DialogTitle></DialogHeader>
          {renderForm(handleEditSubmit, true)}
        </DialogContent>
      </Dialog>

      <Input placeholder="Cari tutor..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

      {filtered.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="py-12 text-center">
            <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Belum ada data tutor</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <Card key={t.id} className="border-none shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{t.nama}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                    <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs">{t.bidang}</span>
                    <span>{t.telepon}</span>
                    {t.email && <span>{t.email}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="w-4 h-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Tutor?</AlertDialogTitle>
                        <AlertDialogDescription>Data tutor "{t.nama}" akan dihapus permanen.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => hapus(t.id)}>Hapus</AlertDialogAction>
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
