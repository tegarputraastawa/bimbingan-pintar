
-- Create ruangan (rooms) table
CREATE TABLE public.ruangan (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  kapasitas INTEGER NOT NULL DEFAULT 20,
  status TEXT NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'non-aktif', 'rusak')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ruangan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to ruangan" ON public.ruangan FOR ALL USING (true) WITH CHECK (true);

-- Create orang_tua (parents) table
CREATE TABLE public.orang_tua (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  siswa_id TEXT NOT NULL,
  nama TEXT NOT NULL,
  telepon TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  hubungan TEXT NOT NULL DEFAULT 'Orang Tua',
  alamat TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orang_tua ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to orang_tua" ON public.orang_tua FOR ALL USING (true) WITH CHECK (true);

-- Create laporan_perkembangan (progress reports) table
CREATE TABLE public.laporan_perkembangan (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  siswa_id TEXT NOT NULL,
  kelas_id TEXT NOT NULL,
  tutor_id TEXT NOT NULL,
  tanggal TEXT NOT NULL,
  kehadiran TEXT NOT NULL DEFAULT 'hadir' CHECK (kehadiran IN ('hadir', 'izin', 'sakit', 'alpa')),
  nilai INTEGER CHECK (nilai >= 0 AND nilai <= 100),
  catatan TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.laporan_perkembangan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to laporan_perkembangan" ON public.laporan_perkembangan FOR ALL USING (true) WITH CHECK (true);

-- Create update trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_ruangan_updated_at BEFORE UPDATE ON public.ruangan FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orang_tua_updated_at BEFORE UPDATE ON public.orang_tua FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_laporan_updated_at BEFORE UPDATE ON public.laporan_perkembangan FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
