import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { getSiswaList, getKelasList, saveSiswa, deleteSiswa, formatRupiah } from "@/lib/store";
import { toast } from "sonner";
import { Search, Trash2, Users } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DataSiswa() {
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState("");
  const [filterAktif, setFilterAktif] = useState<"semua" | "aktif" | "nonaktif">("semua");

  const siswa = getSiswaList();
  const kelas = getKelasList();

  const filtered = siswa
    .filter((s) => s.nama.toLowerCase().includes(search.toLowerCase()))
    .filter((s) => filterAktif === "semua" || (filterAktif === "aktif" ? s.aktif : !s.aktif))
    .sort((a, b) => new Date(b.tanggalDaftar).getTime() - new Date(a.tanggalDaftar).getTime());

  const toggleAktif = (s: typeof siswa[0]) => {
    saveSiswa({ ...s, aktif: !s.aktif });
    toast.success(`${s.nama} ${s.aktif ? "dinonaktifkan" : "diaktifkan"}`);
    setRefresh((r) => r + 1);
  };

  const hapusSiswa = (s: typeof siswa[0]) => {
    deleteSiswa(s.id);
    toast.success(`${s.nama} dihapus`);
    setRefresh((r) => r + 1);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in" key={refresh}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Data Siswa</h1>
        <p className="text-muted-foreground mt-1">Kelola data dan status siswa</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari nama siswa..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(["semua", "aktif", "nonaktif"] as const).map((f) => (
            <Button key={f} variant={filterAktif === f ? "default" : "outline"} size="sm" onClick={() => setFilterAktif(f)} className="capitalize">
              {f === "nonaktif" ? "Non-Aktif" : f}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Belum ada data siswa</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((s) => {
            const k = kelas.find((k) => k.id === s.kelasId);
            return (
              <Card key={s.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold truncate">{s.nama}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${s.aktif ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                          {s.aktif ? "Aktif" : "Non-Aktif"}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-sm text-muted-foreground">
                        <p>📞 {s.telepon}</p>
                        <p>📚 {k?.nama || "-"} ({k ? formatRupiah(k.harga) : "-"})</p>
                        <p>📅 {new Date(s.tanggalDaftar).toLocaleDateString("id-ID")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground hidden sm:inline">{s.aktif ? "Aktif" : "Non"}</span>
                        <Switch checked={s.aktif} onCheckedChange={() => toggleAktif(s)} />
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Siswa?</AlertDialogTitle>
                            <AlertDialogDescription>Data {s.nama} akan dihapus permanen.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => hapusSiswa(s)}>Hapus</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
