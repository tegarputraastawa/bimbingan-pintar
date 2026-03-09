-- Create kelas table
CREATE TABLE public.kelas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  harga INTEGER NOT NULL,
  deskripsi TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create siswa table
CREATE TABLE public.siswa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  telepon TEXT NOT NULL,
  alamat TEXT NOT NULL DEFAULT '',
  kelas_id UUID NOT NULL,
  tanggal_daftar TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  aktif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tutor table
CREATE TABLE public.tutor (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  telepon TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  bidang TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create jadwal table
CREATE TABLE public.jadwal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID NOT NULL,
  kelas_id UUID NOT NULL,
  ruangan TEXT NOT NULL,
  tanggal TEXT NOT NULL,
  jam_mulai TEXT NOT NULL,
  jam_selesai TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create libur table
CREATE TABLE public.libur (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tanggal TEXT NOT NULL UNIQUE,
  keterangan TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pembayaran table
CREATE TABLE public.pembayaran (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  siswa_id UUID NOT NULL,
  jumlah INTEGER NOT NULL,
  tanggal TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metode TEXT NOT NULL,
  status TEXT NOT NULL,
  keterangan TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jadwal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.libur ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pembayaran ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all access for now)
CREATE POLICY "Allow all access to kelas" ON public.kelas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to siswa" ON public.siswa FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to tutor" ON public.tutor FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to jadwal" ON public.jadwal FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to libur" ON public.libur FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to pembayaran" ON public.pembayaran FOR ALL USING (true) WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_kelas_updated_at BEFORE UPDATE ON public.kelas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_siswa_updated_at BEFORE UPDATE ON public.siswa FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tutor_updated_at BEFORE UPDATE ON public.tutor FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jadwal_updated_at BEFORE UPDATE ON public.jadwal FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_libur_updated_at BEFORE UPDATE ON public.libur FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pembayaran_updated_at BEFORE UPDATE ON public.pembayaran FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default kelas data
INSERT INTO public.kelas (nama, harga, deskripsi) VALUES
  ('Matematika SD', 350000, 'Kelas 1-6 SD'),
  ('Matematika SMP', 450000, 'Kelas 7-9 SMP'),
  ('Matematika SMA', 550000, 'Kelas 10-12 SMA'),
  ('Bahasa Inggris', 400000, 'Semua jenjang'),
  ('IPA SMP', 450000, 'Fisika, Kimia, Biologi'),
  ('Persiapan UTBK', 750000, 'Intensif UTBK/SNBT');