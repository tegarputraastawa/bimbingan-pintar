type LaporanItem = {
  tanggal: string;
  kehadiran: string;
  nilai: number | null;
  catatan: string;
  kelas_nama: string;
  tutor_nama: string;
};

type SiswaReport = {
  siswa_nama: string;
  kelas_nama: string;
  total_pertemuan: number;
  total_hadir: number;
  rata_nilai: number | null;
  laporan: LaporanItem[];
};

const kehadiranLabel: Record<string, string> = {
  hadir: "Hadir",
  izin: "Izin",
  sakit: "Sakit",
  alpa: "Alpa",
};

const formatTanggal = (tgl: string) =>
  new Date(tgl + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export function buildReportText(report: SiswaReport): string {
  const lines: string[] = [
    `📋 *LAPORAN PERKEMBANGAN SISWA*`,
    ``,
    `👤 Nama: *${report.siswa_nama}*`,
    `📚 Kelas: ${report.kelas_nama}`,
    `📊 Total Pertemuan: ${report.total_pertemuan}`,
    `✅ Total Hadir: ${report.total_hadir}`,
    `📈 Rata-rata Nilai: ${report.rata_nilai ?? "-"}`,
    ``,
    `--- Detail Pertemuan ---`,
  ];

  for (const l of report.laporan) {
    lines.push(``);
    lines.push(`📅 ${formatTanggal(l.tanggal)}`);
    lines.push(`   Kehadiran: ${kehadiranLabel[l.kehadiran] || l.kehadiran}`);
    if (l.nilai !== null) lines.push(`   Nilai: ${l.nilai}`);
    lines.push(`   Kelas: ${l.kelas_nama} | Tutor: ${l.tutor_nama}`);
    if (l.catatan) lines.push(`   Catatan: ${l.catatan}`);
  }

  return lines.join("\n");
}

export function shareWhatsApp(phone: string, text: string) {
  // Clean phone number
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = "62" + cleaned.slice(1);
  if (!cleaned.startsWith("62")) cleaned = "62" + cleaned;

  const url = `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

export function shareWhatsAppNoNumber(text: string) {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

export function generatePDF(report: SiswaReport) {
  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Laporan Perkembangan - ${report.siswa_nama}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a1a; font-size: 13px; }
  .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
  .header h1 { font-size: 20px; color: #2563eb; margin-bottom: 4px; }
  .header p { color: #666; font-size: 12px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 24px; padding: 16px; background: #f8fafc; border-radius: 8px; }
  .info-item { display: flex; gap: 8px; }
  .info-label { font-weight: 600; color: #555; min-width: 120px; }
  .info-value { color: #1a1a1a; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th { background: #2563eb; color: white; padding: 10px 12px; text-align: left; font-size: 12px; }
  td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
  tr:nth-child(even) { background: #f9fafb; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
  .badge-hadir { background: #dcfce7; color: #166534; }
  .badge-izin { background: #e0e7ff; color: #3730a3; }
  .badge-sakit { background: #fef3c7; color: #92400e; }
  .badge-alpa { background: #fee2e2; color: #991b1b; }
  .footer { margin-top: 30px; text-align: center; color: #999; font-size: 11px; border-top: 1px solid #e5e7eb; padding-top: 16px; }
</style>
</head>
<body>
<div class="header">
  <h1>LAPORAN PERKEMBANGAN SISWA</h1>
  <p>Dicetak pada ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
</div>
<div class="info-grid">
  <div class="info-item"><span class="info-label">Nama Siswa</span><span class="info-value">${report.siswa_nama}</span></div>
  <div class="info-item"><span class="info-label">Kelas</span><span class="info-value">${report.kelas_nama}</span></div>
  <div class="info-item"><span class="info-label">Total Pertemuan</span><span class="info-value">${report.total_pertemuan}</span></div>
  <div class="info-item"><span class="info-label">Total Hadir</span><span class="info-value">${report.total_hadir}</span></div>
  <div class="info-item"><span class="info-label">Rata-rata Nilai</span><span class="info-value">${report.rata_nilai ?? "-"}</span></div>
</div>
<table>
  <thead>
    <tr><th>Tanggal</th><th>Kehadiran</th><th>Nilai</th><th>Kelas</th><th>Tutor</th><th>Catatan</th></tr>
  </thead>
  <tbody>
    ${report.laporan
      .map(
        (l) => `<tr>
      <td>${formatTanggal(l.tanggal)}</td>
      <td><span class="badge badge-${l.kehadiran}">${kehadiranLabel[l.kehadiran] || l.kehadiran}</span></td>
      <td>${l.nilai !== null ? l.nilai : "-"}</td>
      <td>${l.kelas_nama}</td>
      <td>${l.tutor_nama}</td>
      <td>${l.catatan || "-"}</td>
    </tr>`
      )
      .join("")}
  </tbody>
</table>
<div class="footer">Dokumen ini digenerate secara otomatis oleh Sistem Manajemen Bimbingan Belajar</div>
</body>
</html>`;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }
}
