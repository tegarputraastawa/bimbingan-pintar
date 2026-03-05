import { Users, UserCheck, UserX, CreditCard, TrendingUp, BookOpen, Calendar, Clock, GraduationCap, ChevronLeft, ChevronRight } from "lucide-react";
import { getSiswaList, getPembayaranList, getKelasList, getJadwalList, getTutorList, getLiburList, formatRupiah, formatTanggalShort } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";

const HARI_LABEL: Record<number, string> = {
  0: "Minggu", 1: "Senin", 2: "Selasa", 3: "Rabu", 4: "Kamis", 5: "Jumat", 6: "Sabtu",
};

function getWeekDates(refDate: Date): string[] {
  const d = new Date(refDate);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    dates.push(dd.toISOString().split("T")[0]);
  }
  return dates;
}

export default function Dashboard() {
  const siswa = getSiswaList();
  const pembayaran = getPembayaranList();
  const kelas = getKelasList();
  const jadwalList = getJadwalList();
  const tutors = getTutorList();
  const liburList = getLiburList();
  const [weekRef, setWeekRef] = useState(new Date());

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

  const today = new Date().toISOString().split("T")[0];
  const weekDates = useMemo(() => getWeekDates(weekRef), [weekRef]);

  const liburMap = useMemo(() => {
    const m: Record<string, string> = {};
    liburList.forEach((l) => { m[l.tanggal] = l.keterangan; });
    return m;
  }, [liburList]);

  const jadwalByDate = useMemo(() => {
    const m: Record<string, typeof jadwalList> = {};
    jadwalList.forEach((j) => {
      if (!m[j.tanggal]) m[j.tanggal] = [];
      m[j.tanggal].push(j);
    });
    Object.values(m).forEach((arr) => arr.sort((a, b) => a.jamMulai.localeCompare(b.jamMulai)));
    return m;
  }, [jadwalList]);

  const prevWeek = () => { const d = new Date(weekRef); d.setDate(d.getDate() - 7); setWeekRef(d); };
  const nextWeek = () => { const d = new Date(weekRef); d.setDate(d.getDate() + 7); setWeekRef(d); };

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
            <Calendar className="w-5 h-5" /> Jadwal Minggu Ini
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevWeek}><ChevronLeft className="w-4 h-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setWeekRef(new Date())}>Hari Ini</Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextWeek}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3 text-center">
            {formatTanggalShort(weekDates[0])} — {formatTanggalShort(weekDates[6])}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
            {weekDates.map((dateStr) => {
              const d = new Date(dateStr + "T00:00:00");
              const dayNum = d.getDay();
              const isToday = dateStr === today;
              const isHoliday = !!liburMap[dateStr];
              const items = jadwalByDate[dateStr] || [];

              return (
                <div
                  key={dateStr}
                  className={`rounded-lg p-2 text-center ${isToday ? "ring-2 ring-primary bg-primary/5" : isHoliday ? "bg-destructive/5" : "bg-muted/50"}`}
                >
                  <p className={`text-[10px] font-bold uppercase ${isHoliday ? "text-destructive" : isToday ? "text-primary" : "text-muted-foreground"}`}>
                    {HARI_LABEL[dayNum]}
                  </p>
                  <p className={`text-lg font-bold ${isToday ? "text-primary" : isHoliday ? "text-destructive" : ""}`}>{d.getDate()}</p>
                  {isHoliday && <Badge variant="destructive" className="text-[9px] px-1 py-0">{liburMap[dateStr]}</Badge>}
                  <div className="mt-1 space-y-1">
                    {items.slice(0, 3).map((j) => {
                      const k = kelas.find((k) => k.id === j.kelasId);
                      return (
                        <div key={j.id} className="text-[10px] bg-card rounded px-1 py-0.5 truncate border border-border">
                          <span className="font-medium">{k?.nama || "-"}</span>
                          <br />
                          <span className="text-muted-foreground">{j.jamMulai}</span>
                        </div>
                      );
                    })}
                    {items.length > 3 && <p className="text-[10px] text-muted-foreground">+{items.length - 3} lagi</p>}
                    {items.length === 0 && !isHoliday && <p className="text-[10px] text-muted-foreground">—</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-lg">Pendaftaran Terbaru</CardTitle></CardHeader>
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
          <CardHeader><CardTitle className="text-lg">Daftar Kelas & Harga</CardTitle></CardHeader>
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
