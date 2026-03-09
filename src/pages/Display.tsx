import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Clock, GraduationCap, BookOpen, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

type Jadwal = { id: string; tutor_id: string; kelas_id: string; ruangan: string; tanggal: string; jam_mulai: string; jam_selesai: string };
type Tutor = { id: string; nama: string; foto_url: string | null };
type Kelas = { id: string; nama: string };
type Libur = { id: string; tanggal: string; keterangan: string };

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

function formatTanggalShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
}

export default function Display() {
  const [weekRef, setWeekRef] = useState(new Date());
  const [now, setNow] = useState(new Date());
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [liburList, setLiburList] = useState<Libur[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const [jadwalRes, tutorRes, kelasRes, liburRes] = await Promise.all([
        supabase.from("jadwal").select("*"),
        supabase.from("tutor").select("id, nama, foto_url"),
        supabase.from("kelas").select("id, nama"),
        supabase.from("libur").select("*"),
      ]);
      setJadwalList((jadwalRes.data || []) as Jadwal[]);
      setTutors((tutorRes.data || []) as Tutor[]);
      setKelas(kelasRes.data || []);
      setLiburList(liburRes.data || []);
    };
    fetchData();
  }, []);

  const weekDates = useMemo(() => getWeekDates(weekRef), [weekRef]);
  const today = now.toISOString().split("T")[0];
  const currentTime = now.toTimeString().slice(0, 5);

  const liburMap = useMemo(() => {
    const m: Record<string, string> = {};
    liburList.forEach((l) => { m[l.tanggal] = l.keterangan; });
    return m;
  }, [liburList]);

  const jadwalByDate = useMemo(() => {
    const m: Record<string, Jadwal[]> = {};
    jadwalList.forEach((j) => {
      if (!m[j.tanggal]) m[j.tanggal] = [];
      m[j.tanggal].push(j);
    });
    Object.values(m).forEach((arr) => arr.sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai)));
    return m;
  }, [jadwalList]);

  const prevWeek = () => { const d = new Date(weekRef); d.setDate(d.getDate() - 7); setWeekRef(d); };
  const nextWeek = () => { const d = new Date(weekRef); d.setDate(d.getDate() + 7); setWeekRef(d); };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-primary">BimbelKu</h1>
            <p className="text-xs text-muted-foreground">Jadwal Bimbingan Belajar</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums">{now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</p>
            <p className="text-xs text-muted-foreground">{now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={prevWeek}><ChevronLeft className="w-4 h-4" /></Button>
            <Button variant="default" size="sm" className="font-bold px-4" onClick={() => setWeekRef(new Date())}>Hari Ini</Button>
            <Button variant="outline" size="icon" onClick={nextWeek}><ChevronRight className="w-4 h-4" /></Button>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate("/jadwal")} title="Kembali"><X className="w-5 h-5" /></Button>
        </div>
      </div>

      {/* Week range */}
      <div className="text-center py-2 bg-muted/50 text-sm font-medium text-muted-foreground">
        {formatTanggalShort(weekDates[0])} — {formatTanggalShort(weekDates[6])}
      </div>

      {/* Grid */}
      <div className="flex-1 grid grid-cols-7 divide-x divide-border overflow-hidden">
        {weekDates.map((dateStr) => {
          const d = new Date(dateStr + "T00:00:00");
          const dayNum = d.getDay();
          const isToday = dateStr === today;
          const isHoliday = !!liburMap[dateStr];
          const items = jadwalByDate[dateStr] || [];

          return (
            <div
              key={dateStr}
              className={`flex flex-col overflow-auto ${isToday ? "bg-primary/5" : ""} ${isHoliday ? "bg-destructive/5" : ""}`}
            >
              {/* Day header */}
              <div className={`sticky top-0 z-10 px-3 py-3 text-center border-b border-border ${isHoliday ? "bg-destructive/10" : isToday ? "bg-primary/10" : "bg-card"}`}>
                <p className={`text-xs font-bold uppercase tracking-wider ${isHoliday ? "text-destructive" : isToday ? "text-primary" : "text-muted-foreground"}`}>
                  {HARI_LABEL[dayNum]}
                </p>
                <p className={`text-2xl font-bold mt-0.5 ${isToday ? "text-primary" : isHoliday ? "text-destructive" : ""}`}>
                  {d.getDate()}
                </p>
                {isHoliday && (
                  <Badge variant="destructive" className="text-[10px] mt-1">{liburMap[dateStr]}</Badge>
                )}
              </div>

              {/* Items */}
              <div className="flex-1 p-2 space-y-2">
                {items.length === 0 && !isHoliday && (
                  <p className="text-xs text-muted-foreground text-center italic pt-4">—</p>
                )}
                {isHoliday && items.length === 0 && (
                  <p className="text-xs text-destructive text-center italic pt-4">LIBUR</p>
                )}
                {items.map((j) => {
                  const tutor = tutors.find((t) => t.id === j.tutor_id);
                  const k = kelas.find((kk) => kk.id === j.kelas_id);
                  const isOngoing = isToday && currentTime >= j.jam_mulai && currentTime <= j.jam_selesai;

                  return (
                    <div
                      key={j.id}
                      className={`rounded-lg p-3 text-xs space-y-2 transition-all ${
                        isOngoing
                          ? "bg-primary text-primary-foreground ring-2 ring-primary shadow-lg scale-[1.02]"
                          : isHoliday
                          ? "bg-destructive/10 border border-destructive/20"
                          : "bg-card border border-border shadow-sm"
                      }`}
                    >
                      <p className="font-bold text-sm leading-tight">{k?.nama || "-"}</p>
                      <div className={`flex items-center gap-1 ${isOngoing ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                        <Clock className="w-3 h-3" />
                        <span className="font-medium">{j.jam_mulai} - {j.jam_selesai}</span>
                      </div>
                      {/* Tutor with photo */}
                      <div className={`flex items-center gap-2 ${isOngoing ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                        <Avatar className="w-10 h-10 border-2 border-border">
                          <AvatarImage src={tutor?.foto_url || undefined} className="object-cover" />
                          <AvatarFallback className={`text-xs font-bold ${isOngoing ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                            {tutor?.nama?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{tutor?.nama || "-"}</span>
                      </div>
                      <p className={`${isOngoing ? "text-primary-foreground/80" : "text-muted-foreground"}`}>📍 {j.ruangan}</p>
                      {isOngoing && <Badge className="bg-primary-foreground/20 text-primary-foreground text-[10px]">SEDANG BERLANGSUNG</Badge>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
