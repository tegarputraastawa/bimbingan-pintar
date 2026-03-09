import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Clock, BookOpen, ChevronLeft, ChevronRight, X, MapPin, CalendarDays, Monitor, User } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"today" | "week">("today");
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

  const todayItems = jadwalByDate[today] || [];
  const isHolidayToday = !!liburMap[today];

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
          {/* View mode toggle */}
          <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
            <Button
              variant={viewMode === "today" ? "default" : "ghost"}
              size="sm"
              className="gap-1.5"
              onClick={() => setViewMode("today")}
            >
              <Monitor className="w-4 h-4" />
              Hari Ini
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "ghost"}
              size="sm"
              className="gap-1.5"
              onClick={() => setViewMode("week")}
            >
              <CalendarDays className="w-4 h-4" />
              Mingguan
            </Button>
          </div>
          {viewMode === "week" && (
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={prevWeek}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="default" size="sm" className="font-bold px-4" onClick={() => setWeekRef(new Date())}>Hari Ini</Button>
              <Button variant="outline" size="icon" onClick={nextWeek}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={() => navigate("/jadwal")} title="Kembali"><X className="w-5 h-5" /></Button>
        </div>
      </div>

      {viewMode === "today" ? (
        <TodayView
          items={todayItems}
          tutors={tutors}
          kelas={kelas}
          currentTime={currentTime}
          isHoliday={isHolidayToday}
          holidayNote={liburMap[today]}
          today={today}
        />
      ) : (
        <>
          {/* Week range */}
          <div className="text-center py-2 bg-muted/50 text-sm font-medium text-muted-foreground">
            {formatTanggalShort(weekDates[0])} — {formatTanggalShort(weekDates[6])}
          </div>
          <WeekView
            weekDates={weekDates}
            jadwalByDate={jadwalByDate}
            liburMap={liburMap}
            tutors={tutors}
            kelas={kelas}
            today={today}
            currentTime={currentTime}
          />
        </>
      )}
    </div>
  );
}

/* ─── TODAY VIEW ─── */
function TodayView({
  items, tutors, kelas, currentTime, isHoliday, holidayNote, today,
}: {
  items: Jadwal[]; tutors: Tutor[]; kelas: Kelas[];
  currentTime: string; isHoliday: boolean; holidayNote?: string; today: string;
}) {
  if (isHoliday) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <CalendarDays className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-3xl font-bold text-destructive">Hari Libur</h2>
          <p className="text-xl text-muted-foreground">{holidayNote}</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <CalendarDays className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-muted-foreground">Tidak ada jadwal hari ini</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-7xl mx-auto">
        {items.map((j) => {
          const tutor = tutors.find((t) => t.id === j.tutor_id);
          const k = kelas.find((kk) => kk.id === j.kelas_id);
          const isOngoing = currentTime >= j.jam_mulai && currentTime <= j.jam_selesai;
          const isPast = currentTime > j.jam_selesai;

          return (
            <div
              key={j.id}
              className={`group relative rounded-2xl overflow-hidden transition-all duration-300 ${
                isOngoing
                  ? "ring-2 ring-primary shadow-xl shadow-primary/20 scale-[1.01]"
                  : isPast
                  ? "opacity-60"
                  : "shadow-md hover:shadow-lg"
              }`}
            >
              <div className="flex h-full">
                {/* Tutor photo - left side, integrated into card */}
                <div className={`relative w-28 md:w-36 shrink-0 ${isOngoing ? "bg-primary" : "bg-muted"}`}>
                  {tutor?.foto_url ? (
                    <img
                      src={tutor.foto_url}
                      alt={tutor.nama}
                      className="w-full h-full object-cover min-h-[160px]"
                    />
                  ) : (
                    <div className={`w-full h-full min-h-[160px] flex items-center justify-center ${isOngoing ? "bg-primary" : "bg-muted"}`}>
                      <User className={`w-14 h-14 ${isOngoing ? "text-primary-foreground/40" : "text-muted-foreground/40"}`} />
                    </div>
                  )}
                  {/* Gradient overlay on photo */}
                  {tutor?.foto_url && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                  )}
                  {isOngoing && (
                    <div className="absolute top-2 left-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Content - right side */}
                <div className={`flex-1 p-5 flex flex-col justify-between ${isOngoing ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                  <div className="space-y-3">
                    {/* Class name */}
                    <div>
                      <h3 className="text-lg font-bold leading-tight">{k?.nama || "-"}</h3>
                      {isOngoing && (
                        <Badge className="mt-1.5 bg-primary-foreground/20 text-primary-foreground border-0 text-xs font-semibold tracking-wide">
                          SEDANG BERLANGSUNG
                        </Badge>
                      )}
                    </div>

                    {/* Tutor name */}
                    <p className={`text-sm font-semibold ${isOngoing ? "text-primary-foreground/90" : "text-foreground"}`}>
                      {tutor?.nama || "-"}
                    </p>
                  </div>

                  <div className="space-y-2 mt-4">
                    {/* Time */}
                    <div className={`flex items-center gap-2 text-sm ${isOngoing ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      <Clock className="w-4 h-4" />
                      <span className="font-medium tabular-nums">{j.jam_mulai} — {j.jam_selesai}</span>
                    </div>
                    {/* Room */}
                    <div className={`flex items-center gap-2 text-sm ${isOngoing ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{j.ruangan}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── WEEK VIEW ─── */
function WeekView({
  weekDates, jadwalByDate, liburMap, tutors, kelas, today, currentTime,
}: {
  weekDates: string[]; jadwalByDate: Record<string, Jadwal[]>; liburMap: Record<string, string>;
  tutors: Tutor[]; kelas: Kelas[]; today: string; currentTime: string;
}) {
  return (
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
                    className={`rounded-lg overflow-hidden text-xs transition-all ${
                      isOngoing
                        ? "ring-2 ring-primary shadow-lg scale-[1.02]"
                        : isHoliday
                        ? "bg-destructive/10 border border-destructive/20"
                        : "bg-card border border-border shadow-sm"
                    }`}
                  >
                    {/* Mini tutor photo */}
                    {tutor?.foto_url && (
                      <div className="w-full h-16 overflow-hidden">
                        <img src={tutor.foto_url} alt={tutor.nama} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className={`p-2.5 space-y-1.5 ${isOngoing ? "bg-primary text-primary-foreground" : ""}`}>
                      <p className="font-bold text-sm leading-tight">{k?.nama || "-"}</p>
                      <div className={`flex items-center gap-1 ${isOngoing ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                        <Clock className="w-3 h-3" />
                        <span className="font-medium">{j.jam_mulai} - {j.jam_selesai}</span>
                      </div>
                      <p className={`font-medium ${isOngoing ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                        {tutor?.nama || "-"}
                      </p>
                      <p className={`${isOngoing ? "text-primary-foreground/80" : "text-muted-foreground"}`}>📍 {j.ruangan}</p>
                      {isOngoing && <Badge className="bg-primary-foreground/20 text-primary-foreground text-[10px] border-0">BERLANGSUNG</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
