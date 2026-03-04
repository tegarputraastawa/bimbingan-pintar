import { Users, UserCheck, UserX, CreditCard, TrendingUp, BookOpen } from "lucide-react";
import { getSiswaList, getPembayaranList, getKelasList, formatRupiah } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

export default function Dashboard() {
  const siswa = getSiswaList();
  const pembayaran = getPembayaranList();
  const kelas = getKelasList();

  const stats = useMemo(() => {
    const aktif = siswa.filter((s) => s.aktif).length;
    const nonAktif = siswa.filter((s) => !s.aktif).length;
    const totalPemasukan = pembayaran.reduce((sum, p) => sum + p.jumlah, 0);
    const bulanIni = pembayaran.filter((p) => {
      const d = new Date(p.tanggal);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const pemasukanBulanIni = bulanIni.reduce((sum, p) => sum + p.jumlah, 0);
    return { total: siswa.length, aktif, nonAktif, totalPemasukan, pemasukanBulanIni };
  }, [siswa, pembayaran]);

  const statCards = [
    { label: "Total Siswa", value: stats.total, icon: Users, color: "text-primary" },
    { label: "Siswa Aktif", value: stats.aktif, icon: UserCheck, color: "text-success" },
    { label: "Siswa Non-Aktif", value: stats.nonAktif, icon: UserX, color: "text-destructive" },
    { label: "Total Kelas", value: kelas.length, icon: BookOpen, color: "text-info" },
    { label: "Pemasukan Bulan Ini", value: formatRupiah(stats.pemasukanBulanIni), icon: TrendingUp, color: "text-warning" },
    { label: "Total Pemasukan", value: formatRupiah(stats.totalPemasukan), icon: CreditCard, color: "text-primary" },
  ];

  const recentSiswa = [...siswa].sort((a, b) => new Date(b.tanggalDaftar).getTime() - new Date(a.tanggalDaftar).getTime()).slice(0, 5);

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Ringkasan data bimbingan belajar</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{s.label}</p>
                  <p className="text-2xl font-bold mt-2">{s.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl bg-muted ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Pendaftaran Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSiswa.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">Belum ada siswa terdaftar</p>
            ) : (
              <div className="space-y-3">
                {recentSiswa.map((s) => {
                  const k = kelas.find((k) => k.id === s.kelasId);
                  return (
                    <div key={s.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium text-sm">{s.nama}</p>
                        <p className="text-xs text-muted-foreground">{k?.nama || "-"}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.aktif ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                        {s.aktif ? "Aktif" : "Non-Aktif"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Daftar Kelas & Harga</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kelas.map((k) => (
                <div key={k.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-sm">{k.nama}</p>
                    <p className="text-xs text-muted-foreground">{k.deskripsi}</p>
                  </div>
                  <span className="font-semibold text-sm text-primary">{formatRupiah(k.harga)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
