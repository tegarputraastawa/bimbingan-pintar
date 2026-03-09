import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Pendaftaran from "./pages/Pendaftaran";
import DataSiswa from "./pages/DataSiswa";
import Pembayaran from "./pages/Pembayaran";
import Laporan from "./pages/Laporan";
import Tutor from "./pages/Tutor";
import Jadwal from "./pages/Jadwal";
import Display from "./pages/Display";
import Ruangan from "./pages/Ruangan";
import OrangTua from "./pages/OrangTua";
import LaporanPerkembangan from "./pages/LaporanPerkembangan";
import Kelas from "./pages/Kelas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pendaftaran" element={<Pendaftaran />} />
            <Route path="/siswa" element={<DataSiswa />} />
            <Route path="/kelas" element={<Kelas />} />
            <Route path="/pembayaran" element={<Pembayaran />} />
            <Route path="/tutor" element={<Tutor />} />
            <Route path="/ruangan" element={<Ruangan />} />
            <Route path="/jadwal" element={<Jadwal />} />
            <Route path="/orang-tua" element={<OrangTua />} />
            <Route path="/perkembangan" element={<LaporanPerkembangan />} />
            <Route path="/laporan" element={<Laporan />} />
          </Route>
          <Route path="/display" element={<Display />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
