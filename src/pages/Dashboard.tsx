import { Users, UserCheck, UserX, CreditCard, TrendingUp, BookOpen, Calendar, Clock, GraduationCap } from "lucide-react";
import { getSiswaList, getPembayaranList, getKelasList, getJadwalList, getTutorList, formatRupiah } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HARI_LIST = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"] as const;
const HARI_LABEL: Record<string, string> = {
  senin: "Senin", selasa: "Selasa", rabu: "Rabu", kamis: "Kamis",
  jumat: "Jumat", sabtu: "Sabtu", minggu: "Minggu",
};

function getHariIni(): string {
  const days = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
  return days[new Date().getDay()];
}

export default function Dashboard() {
  const siswa = getSiswaList();
  const pembayaran = getPembayaranList();
  const kelas = getKelasList();
  const jadwalList = getJadwalList();
  const tutors = getTutorList();
  const [jadwalView, setJadwalView] = useState<"hari" | "minggu">("hari");

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

  const hariIni = getHariIni();

  const jadwalHariIni = useMemo(() => {
    return jadwalList
      .filter((j) => j.hari === hariIni)
      .sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));
  }, [jadwalList, hariIni]);

  const jadwalPerHari = useMemo(() => {
    const grouped: Record<string, typeof jadwalList> = {};
    HARI_LIST.forEach((h) => {
      const items = jadwalList.filter((j) => j.hari === h).sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));
      if (items.length > 0) grouped[h] = items;
    });
    return grouped;
  }, [jadwalList]);

  const renderJadwalItem = (j: typeof jadwalList[0]) => {
    const tutor = tutors.find((t) => t.id === j.tutorId);
    const k = kelas.find((k) => k.id === j.kelasId);
    return (
      <div key={j.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
        <div className="space-y-0.5">
          <p className="font-medium text-sm">{k?.nama || "-"}</p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />{tutor?.nama || "-"}</span>
            <span>Ruang: {j.ruangan}</span>
          </div>
        </div>
        <span className="flex items-center gap-1 text-sm font-medium text-primary">
          <Clock className="w-3.5 h-3.5" />{j.jamMulai} - {j.jamSelesai}
        </span>
      </div>
    );
  };

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

      {/* Jadwal Section */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Jadwal Bimbel
          </CardTitle>
          <div className="flex gap-1">
            <Button variant={jadwalView === "hari" ? "default" : "outline"} size="sm" onClick={() => setJadwalView("hari")}>
              Hari Ini ({HARI_LABEL[hariIni]})
            </Button>
            <Button variant={jadwalView === "minggu" ? "default" : "outline"} size="sm" onClick={() => setJadwalView("minggu")}>
              Minggu Ini
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {jadwalView === "hari" ? (
            jadwalHariIni.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">Tidak ada jadwal hari ini</p>
            ) : (
              <div>{jadwalHariIni.map(renderJadwalItem)}</div>
            )
          ) : (
            Object.keys(jadwalPerHari).length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">Belum ada jadwal dibuat</p>
            ) : (
              <div className="space-y-4">
                {HARI_LIST.map((h) => {
                  const items = jadwalPerHari[h];
                  if (!items) return null;
                  return (
                    <div key={h}>
                      <Badge variant={h === hariIni ? "default" : "secondary"} className="mb-2">{HARI_LABEL[h]}</Badge>
                      <div>{items.map(renderJadwalItem)}</div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </CardContent>
      </Card>

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
