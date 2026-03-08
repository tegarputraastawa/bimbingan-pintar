import { supabase } from "@/integrations/supabase/client";
import { getJadwalList, type Jadwal } from "./store";

/**
 * Check if a room has a schedule conflict for a given date and time range.
 * Returns true if there IS a conflict.
 */
export function checkRoomConflict(
  ruanganNama: string,
  tanggal: string,
  jamMulai: string,
  jamSelesai: string,
  excludeJadwalId?: string
): boolean {
  const jadwalList = getJadwalList();
  return jadwalList.some((j) => {
    if (excludeJadwalId && j.id === excludeJadwalId) return false;
    if (j.ruangan !== ruanganNama || j.tanggal !== tanggal) return false;
    // Check time overlap: two intervals overlap if start1 < end2 AND start2 < end1
    return j.jamMulai < jamSelesai && jamMulai < j.jamSelesai;
  });
}

export async function getRuanganAktif() {
  const { data } = await supabase.from("ruangan").select("*").eq("status", "aktif").order("nama");
  return data || [];
}
