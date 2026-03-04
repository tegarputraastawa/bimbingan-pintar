import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSiswaList, getKelasList, getPembayaranList, formatRupiah } from "@/lib/store";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(168,65%,38%)", "hsl(35,90%,55%)", "hsl(210,80%,55%)", "hsl(0,72%,51%)", "hsl(142,71%,45%)", "hsl(280,60%,50%)"];

export default function Laporan() {
  const siswa = getSiswaList();
  const kelas = getKelasList();
  const pembayaran = getPembayaranList();

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

  const metodeDistribusi = useMemo(() => {
    const m: Record<string, number> = {};
    pembayaran.forEach((p) => { m[p.metode] = (m[p.metode] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name: name === "tunai" ? "Tunai" : name === "transfer" ? "Transfer" : "E-Wallet", value }));
  }, [pembayaran]);

  const totalPemasukan = pembayaran.reduce((s, p) => s + p.jumlah, 0);
  const rataRata = pembayaran.length > 0 ? totalPemasukan / pembayaran.length : 0;

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Laporan</h1>
        <p className="text-muted-foreground mt-1">Analisis data bimbingan belajar</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm"><CardContent className="p-5"><p className="text-xs text-muted-foreground uppercase">Total Siswa</p><p className="text-2xl font-bold mt-1">{siswa.length}</p></CardContent></Card>
        <Card className="border-none shadow-sm"><CardContent className="p-5"><p className="text-xs text-muted-foreground uppercase">Siswa Aktif</p><p className="text-2xl font-bold mt-1 text-success">{siswa.filter(s=>s.aktif).length}</p></CardContent></Card>
        <Card className="border-none shadow-sm"><CardContent className="p-5"><p className="text-xs text-muted-foreground uppercase">Total Pemasukan</p><p className="text-2xl font-bold mt-1 text-primary">{formatRupiah(totalPemasukan)}</p></CardContent></Card>
        <Card className="border-none shadow-sm"><CardContent className="p-5"><p className="text-xs text-muted-foreground uppercase">Rata-Rata Bayar</p><p className="text-2xl font-bold mt-1">{formatRupiah(rataRata)}</p></CardContent></Card>
      </div>

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
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v/1000)}k`} />
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

        {metodeDistribusi.length > 0 && (
          <Card className="border-none shadow-sm lg:col-span-2">
            <CardHeader><CardTitle className="text-lg">Metode Pembayaran</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6 justify-center">
                {metodeDistribusi.map((m, i) => (
                  <div key={m.name} className="text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2" style={{ backgroundColor: COLORS[i % COLORS.length] + "22", color: COLORS[i % COLORS.length] }}>
                      {m.value}
                    </div>
                    <p className="text-sm font-medium">{m.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
