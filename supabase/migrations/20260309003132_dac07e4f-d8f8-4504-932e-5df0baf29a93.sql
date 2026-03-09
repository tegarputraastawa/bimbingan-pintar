-- Add aktif column to kelas table
ALTER TABLE public.kelas ADD COLUMN aktif BOOLEAN NOT NULL DEFAULT true;

-- Add date range columns to siswa table
ALTER TABLE public.siswa ADD COLUMN tanggal_mulai DATE;
ALTER TABLE public.siswa ADD COLUMN tanggal_akhir DATE;