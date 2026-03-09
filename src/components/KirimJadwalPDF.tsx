import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileDown, Send, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Jadwal = { id: string; tutor_id: string; kelas_id: string; ruangan: string; tanggal: string; jam_mulai: string; jam_selesai: string };
type Tutor = { id: string; nama: string; email: string; telepon: string };
type Kelas = { id: string; nama: string };

interface Props {
  jadwalHariIni: Jadwal[];
  tutors: Tutor[];
  kelas: Kelas[];
  tanggal: string;
}

function generatePDF(jadwalList: Jadwal[], tutors: Tutor[], kelas: Kelas[], tanggal: string): jsPDF {
  const doc = new jsPDF();
  const dateFormatted = new Date(tanggal + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  doc.setFontSize(18);
  doc.text("BimbelKu", 14, 20);
  doc.setFontSize(12);
  doc.text(`Jadwal Bimbingan Belajar`, 14, 28);
  doc.setFontSize(11);
  doc.text(dateFormatted, 14, 35);
  doc.setLineWidth(0.5);
  doc.line(14, 38, 196, 38);

  const sorted = [...jadwalList].sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai));
  const rows = sorted.map((j) => {
    const tutor = tutors.find((t) => t.id === j.tutor_id);
    const k = kelas.find((kk) => kk.id === j.kelas_id);
    return [
      `${j.jam_mulai} - ${j.jam_selesai}`,
      k?.nama || "-",
      tutor?.nama || "-",
      j.ruangan,
    ];
  });

  autoTable(doc, {
    startY: 42,
    head: [["Jam", "Kelas", "Tutor", "Ruangan"]],
    body: rows,
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [39, 145, 115], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 250, 248] },
  });

  return doc;
}

export default function KirimJadwalPDF({ jadwalHariIni, tutors, kelas, tanggal }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedTutors, setSelectedTutors] = useState<string[]>([]);

  // Get unique tutor IDs from today's schedule + all tutors for selection
  const allTutorIds = tutors.map((t) => t.id);

  const toggleTutor = (id: string) => {
    setSelectedTutors((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedTutors(allTutorIds);
  const deselectAll = () => setSelectedTutors([]);

  const handleDownload = () => {
    if (jadwalHariIni.length === 0) { toast.error("Tidak ada jadwal hari ini"); return; }
    const doc = generatePDF(jadwalHariIni, tutors, kelas, tanggal);
    doc.save(`Jadwal_BimbelKu_${tanggal}.pdf`);
    toast.success("PDF berhasil diunduh!");
  };

  const handleWhatsApp = () => {
    if (selectedTutors.length === 0) { toast.error("Pilih minimal satu tutor"); return; }
    if (jadwalHariIni.length === 0) { toast.error("Tidak ada jadwal hari ini"); return; }

    // Generate text message with schedule
    const dateFormatted = new Date(tanggal + "T00:00:00").toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const sorted = [...jadwalHariIni].sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai));
    let msg = `📋 *Jadwal BimbelKu*\n📅 ${dateFormatted}\n\n`;
    sorted.forEach((j, i) => {
      const tutor = tutors.find((t) => t.id === j.tutor_id);
      const k = kelas.find((kk) => kk.id === j.kelas_id);
      msg += `${i + 1}. ⏰ ${j.jam_mulai}-${j.jam_selesai}\n   📚 ${k?.nama || "-"}\n   👨‍🏫 ${tutor?.nama || "-"}\n   📍 ${j.ruangan}\n\n`;
    });

    // Open WhatsApp for each selected tutor
    selectedTutors.forEach((id) => {
      const tutor = tutors.find((t) => t.id === id);
      if (tutor?.telepon) {
        let phone = tutor.telepon.replace(/\D/g, "");
        if (phone.startsWith("0")) phone = "62" + phone.slice(1);
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
      }
    });
    toast.success("WhatsApp dibuka untuk tutor terpilih");
  };

  const handleEmail = () => {
    if (selectedTutors.length === 0) { toast.error("Pilih minimal satu tutor"); return; }
    if (jadwalHariIni.length === 0) { toast.error("Tidak ada jadwal hari ini"); return; }

    const dateFormatted = new Date(tanggal + "T00:00:00").toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const sorted = [...jadwalHariIni].sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai));
    let body = `Jadwal BimbelKu - ${dateFormatted}\n\n`;
    sorted.forEach((j, i) => {
      const tutor = tutors.find((t) => t.id === j.tutor_id);
      const k = kelas.find((kk) => kk.id === j.kelas_id);
      body += `${i + 1}. ${j.jam_mulai}-${j.jam_selesai} | ${k?.nama || "-"} | ${tutor?.nama || "-"} | ${j.ruangan}\n`;
    });

    const emails = selectedTutors
      .map((id) => tutors.find((t) => t.id === id)?.email)
      .filter(Boolean)
      .join(",");

    window.open(`mailto:${emails}?subject=Jadwal BimbelKu ${dateFormatted}&body=${encodeURIComponent(body)}`, "_blank");
    toast.success("Email client dibuka");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <FileDown className="w-4 h-4" /> Kirim Jadwal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Kirim Jadwal Hari Ini</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Tutor selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">Pilih Tutor Penerima</Label>
              <div className="flex gap-2">
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={selectAll}>Pilih Semua</Button>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={deselectAll}>Hapus Semua</Button>
              </div>
            </div>
            <div className="max-h-48 overflow-auto space-y-2 border border-border rounded-lg p-3">
              {tutors.map((t) => (
                <label key={t.id} className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-md p-1.5 transition-colors">
                  <Checkbox
                    checked={selectedTutors.includes(t.id)}
                    onCheckedChange={() => toggleTutor(t.id)}
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{t.nama}</span>
                    <span className="text-xs text-muted-foreground ml-2">{t.telepon}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Jadwal yang dikirim adalah <strong>seluruh jadwal hari ini</strong>, bukan hanya jadwal tutor yang dipilih.
          </p>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" className="gap-1.5 text-sm" onClick={handleDownload}>
              <FileDown className="w-4 h-4" /> Download PDF
            </Button>
            <Button variant="outline" className="gap-1.5 text-sm text-success border-success/30 hover:bg-success/10" onClick={handleWhatsApp}>
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </Button>
            <Button variant="outline" className="gap-1.5 text-sm text-info border-info/30 hover:bg-info/10" onClick={handleEmail}>
              <Mail className="w-4 h-4" /> Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
