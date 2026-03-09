import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, GraduationCap, Upload, X, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type TutorType = {
  id: string;
  nama: string;
  telepon: string;
  email: string;
  bidang: string;
  foto_url: string | null;
};

const emptyForm = { nama: "", telepon: "", email: "", bidang: "" };

export default function Tutor() {
  const [tutors, setTutors] = useState<TutorType[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTutors = async () => {
    setLoading(true);
    const { data } = await supabase.from("tutor").select("*").order("nama");
    setTutors((data || []) as TutorType[]);
    setLoading(false);
  };

  useEffect(() => { fetchTutors(); }, []);

  const filtered = tutors.filter((t) =>
    t.nama.toLowerCase().includes(search.toLowerCase()) || t.bidang.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Pilih file gambar (JPG, PNG)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran maksimal 2MB");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const uploadPhoto = async (tutorId: string): Promise<string | null> => {
    if (!selectedFile) return null;
    const ext = selectedFile.name.split(".").pop();
    const fileName = `${tutorId}.${ext}`;
    
    const { error } = await supabase.storage
      .from("tutor-photos")
      .upload(fileName, selectedFile, { upsert: true });
    
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    
    const { data: urlData } = supabase.storage.from("tutor-photos").getPublicUrl(fileName);
    return urlData.publicUrl + `?t=${Date.now()}`;
  };

  const clearFileSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.telepon || !form.bidang) {
      toast.error("Lengkapi data tutor (nama, telepon, bidang)");
      return;
    }
    setUploading(true);

    const { data, error } = await supabase.from("tutor").insert({
      nama: form.nama,
      telepon: form.telepon,
      email: form.email,
      bidang: form.bidang,
    }).select().single();

    if (error || !data) {
      toast.error("Gagal menambah tutor");
      setUploading(false);
      return;
    }

    if (selectedFile) {
      const fotoUrl = await uploadPhoto(data.id);
      if (fotoUrl) {
        await supabase.from("tutor").update({ foto_url: fotoUrl }).eq("id", data.id);
      }
    }

    toast.success("Tutor berhasil ditambahkan!");
    setForm({ ...emptyForm });
    clearFileSelection();
    setOpen(false);
    setUploading(false);
    fetchTutors();
  };

  const openEdit = (t: TutorType) => {
    setEditId(t.id);
    setForm({ nama: t.nama, telepon: t.telepon, email: t.email, bidang: t.bidang });
    setPreviewUrl(t.foto_url || null);
    setSelectedFile(null);
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !form.nama || !form.telepon || !form.bidang) {
      toast.error("Lengkapi data tutor");
      return;
    }
    setUploading(true);

    let fotoUrl: string | null = null;
    if (selectedFile) {
      fotoUrl = await uploadPhoto(editId);
    }

    const updateData: Record<string, string> = {
      nama: form.nama,
      telepon: form.telepon,
      email: form.email,
      bidang: form.bidang,
    };
    if (fotoUrl) updateData.foto_url = fotoUrl;

    const { error } = await supabase.from("tutor").update(updateData).eq("id", editId);
    if (error) {
      toast.error("Gagal memperbarui tutor");
      setUploading(false);
      return;
    }

    toast.success("Data tutor diperbarui!");
    setForm({ ...emptyForm });
    clearFileSelection();
    setEditOpen(false);
    setEditId(null);
    setUploading(false);
    fetchTutors();
  };

  const hapus = async (id: string) => {
    await supabase.from("tutor").delete().eq("id", id);
    // Also try to delete photo
    await supabase.storage.from("tutor-photos").remove([`${id}.jpg`, `${id}.png`, `${id}.jpeg`]);
    toast.success("Tutor dihapus");
    fetchTutors();
  };

  const renderForm = (onSubmit: (e: React.FormEvent) => void, isEdit: boolean) => (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Photo Upload */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <Avatar className="w-24 h-24 border-2 border-border">
            <AvatarImage src={previewUrl || undefined} />
            <AvatarFallback className="bg-muted">
              <User className="w-10 h-10 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          {previewUrl && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
              onClick={clearFileSelection}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            {previewUrl ? "Ganti Foto" : "Upload Foto"}
          </Button>
        </div>
      </div>

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
      <Button type="submit" className="w-full" disabled={uploading}>
        {uploading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Tutor"}
      </Button>
    </form>
  );

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Data Tutor</h1>
          <p className="text-muted-foreground mt-1">Kelola data pengajar bimbingan belajar</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setForm({ ...emptyForm }); clearFileSelection(); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Tambah Tutor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Tambah Tutor Baru</DialogTitle></DialogHeader>
            {renderForm(handleSubmit, false)}
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) { setForm({ ...emptyForm }); setEditId(null); clearFileSelection(); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Tutor</DialogTitle></DialogHeader>
          {renderForm(handleEditSubmit, true)}
        </DialogContent>
      </Dialog>

      <Input placeholder="Cari tutor..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

      {loading ? (
        <p className="text-muted-foreground text-center py-12">Memuat data...</p>
      ) : filtered.length === 0 ? (
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
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border border-border">
                    <AvatarImage src={t.foto_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {t.nama.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{t.nama}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                      <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs">{t.bidang}</span>
                      <span>{t.telepon}</span>
                      {t.email && <span>{t.email}</span>}
                    </div>
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
