import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSiswaList, getKelasList, getPembayaranList, formatRupiah } from "@/lib/store";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLORS = ["hsl(168,65%,38%)", "hsl(35,90%,55%)", "hsl(210,80%,55%)", "hsl(0,72%,51%)", "hsl(142,71%,45%)", "hsl(280,60%,50%)"];

export default function Laporan() {
  const siswa = getSiswaList();
  const kelas = getKelasList();
  const pembayaran = getPembayaranList();
  const [filterBayar, setFilterBayar] = useState<"semua" | "lunas" | "belum_lunas" | "belum_bayar">("semua");

  const kelasDistribusi = useMemo(() => {
    return kelas.map((k) => ({
      name: k.nama,
      value: siswa.filter((s) => s.kelasId === k.id).length,
    })).filter((d) => d.value > 0);
  }, [siswa, kelas]);

  const pemasukanBulanan = useMemo(() => {
    const months: Record<string, number> = {};
    pembayaran.forEach((p) => {
      const d = new Date(p.tanggal);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[key] = (months[key] || 0) + p.jumlah;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([bulan, jumlah]) => {
        const [y, m] = bulan.split("-");
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        return { bulan: `${monthNames[Number(m) - 1]} ${y}`, jumlah };
      });
  }, [pembayaran]);

  const totalPemasukan = pembayaran.reduce((s, p) => s + p.jumlah, 0);
  const totalLunas = pembayaran.filter((p) => p.status === "lunas").reduce((s, p) => s + p.jumlah, 0);
  const totalBelumLunas = pembayaran.filter((p) => p.status === "belum_lunas").reduce((s, p) => s + p.jumlah, 0);

  // Laporan status bayar per siswa aktif
  const laporanSiswa = useMemo(() => {
    const siswaAktif = siswa.filter((s) => s.aktif);
    return siswaAktif.map((s) => {
      const k = kelas.find((k) => k.id === s.kelasId);
      const bayarSiswa = pembayaran.filter((p) => p.siswaId === s.id);
      const lunas = bayarSiswa.filter((p) => p.status === "lunas");
      const belumLunas = bayarSiswa.filter((p) => p.status === "belum_lunas");
      const totalBayar = bayarSiswa.reduce((sum, p) => sum + p.jumlah, 0);

      let statusBayar: "lunas" | "belum_lunas" | "belum_bayar";
      if (bayarSiswa.length === 0) statusBayar = "belum_bayar";
      else if (belumLunas.length > 0) statusBayar = "belum_lunas";
      else statusBayar = "lunas";

      return { siswa: s, kelas: k, totalBayar, jumlahTransaksi: bayarSiswa.length, lunas: lunas.length, belumLunas: belumLunas.length, statusBayar };
    });
  }, [siswa, kelas, pembayaran]);

  const filteredLaporan = laporanSiswa.filter((l) => filterBayar === "semua" || l.statusBayar === filterBayar);

  const countLunas = laporanSiswa.filter((l) => l.statusBayar === "lunas").length;
  const countBelumLunas = laporanSiswa.filter((l) => l.statusBayar === "belum_lunas").length;
  const countBelumBayar = laporanSiswa.filter((l) => l.statusBayar === "belum_bayar").length;

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Laporan</h1>
        <p className="text-muted-foreground mt-1">Analisis data bimbingan belajar</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm"><CardContent className="p-5"><p className="text-xs text-muted-foreground uppercase">Total Siswa</p><p className="text-2xl font-bold mt-1">{siswa.length}</p></CardContent></Card>
        <Card className="border-none shadow-sm"><CardContent className="p-5"><p className="text-xs text-muted-foreground uppercase">Siswa Aktif</p><p className="text-2xl font-bold mt-1 text-success">{siswa.filter(s => s.aktif).length}</p></CardContent></Card>
        <Card className="border-none shadow-sm"><CardContent className="p-5"><p className="text-xs text-muted-foreground uppercase">Total Lunas</p><p className="text-2xl font-bold mt-1 text-primary">{formatRupiah(totalLunas)}</p></CardContent></Card>
        <Card className="border-none shadow-sm"><CardContent className="p-5"><p className="text-xs text-muted-foreground uppercase">Belum Lunas</p><p className="text-2xl font-bold mt-1 text-destructive">{formatRupiah(totalBelumLunas)}</p></CardContent></Card>
      </div>

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList>
          <TabsTrigger value="status">Status Pembayaran</TabsTrigger>
          <TabsTrigger value="grafik">Grafik</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant={filterBayar === "semua" ? "default" : "outline"} size="sm" onClick={() => setFilterBayar("semua")}>
              Semua ({laporanSiswa.length})
            </Button>
            <Button variant={filterBayar === "lunas" ? "default" : "outline"} size="sm" onClick={() => setFilterBayar("lunas")} className={filterBayar !== "lunas" ? "" : ""}>
              <CheckCircle className="w-3 h-3 mr-1" /> Lunas ({countLunas})
            </Button>
            <Button variant={filterBayar === "belum_lunas" ? "default" : "outline"} size="sm" onClick={() => setFilterBayar("belum_lunas")}>
              <Clock className="w-3 h-3 mr-1" /> Belum Lunas ({countBelumLunas})
            </Button>
            <Button variant={filterBayar === "belum_bayar" ? "default" : "outline"} size="sm" onClick={() => setFilterBayar("belum_bayar")}>
              <AlertTriangle className="w-3 h-3 mr-1" /> Belum Bayar ({countBelumBayar})
            </Button>
          </div>

          {filteredLaporan.length === 0 ? (
            <Card className="border-none shadow-sm">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Tidak ada data untuk filter ini</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-none shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Total Bayar</TableHead>
                      <TableHead>Transaksi</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLaporan.map((l) => (
                      <TableRow key={l.siswa.id}>
                        <TableCell className="font-medium">{l.siswa.nama}</TableCell>
                        <TableCell>{l.kelas?.nama || "-"}</TableCell>
                        <TableCell>{formatRupiah(l.totalBayar)}</TableCell>
                        <TableCell>{l.jumlahTransaksi} ({l.lunas} lunas, {l.belumLunas} belum)</TableCell>
                        <TableCell>
                          {l.statusBayar === "lunas" && (
                            <Badge variant="default" className="text-xs"><CheckCircle className="w-3 h-3 mr-1" />Lunas</Badge>
                          )}
                          {l.statusBayar === "belum_lunas" && (
                            <Badge variant="destructive" className="text-xs"><Clock className="w-3 h-3 mr-1" />Belum Lunas</Badge>
                          )}
                          {l.statusBayar === "belum_bayar" && (
                            <Badge variant="secondary" className="text-xs"><AlertTriangle className="w-3 h-3 mr-1" />Belum Bayar</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="grafik" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader><CardTitle className="text-lg">Pemasukan Bulanan</CardTitle></CardHeader>
              <CardContent>
                {pemasukanBulanan.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-8 text-center">Belum ada data pembayaran</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={pemasukanBulanan}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(200,15%,89%)" />
                      <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000)}k`} />
                      <Tooltip formatter={(v: number) => formatRupiah(v)} />
                      <Bar dataKey="jumlah" fill="hsl(168,65%,38%)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader><CardTitle className="text-lg">Distribusi Siswa per Kelas</CardTitle></CardHeader>
              <CardContent>
                {kelasDistribusi.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-8 text-center">Belum ada data siswa</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={kelasDistribusi} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                        {kelasDistribusi.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
