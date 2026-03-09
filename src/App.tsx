import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
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
import ManajemenUser from "./pages/ManajemenUser";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WaitingApproval from "./pages/WaitingApproval";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading, approved } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!user ? <Login /> : approved ? <Navigate to="/" /> : <Navigate to="/waiting-approval" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
      <Route path="/waiting-approval" element={user && !approved ? <WaitingApproval /> : <Navigate to="/" />} />
      <Route path="/display" element={<Display />} />

      {/* Protected routes */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<ProtectedRoute path="/"><Dashboard /></ProtectedRoute>} />
        <Route path="/pendaftaran" element={<ProtectedRoute path="/pendaftaran"><Pendaftaran /></ProtectedRoute>} />
        <Route path="/siswa" element={<ProtectedRoute path="/siswa"><DataSiswa /></ProtectedRoute>} />
        <Route path="/kelas" element={<ProtectedRoute path="/kelas"><Kelas /></ProtectedRoute>} />
        <Route path="/pembayaran" element={<ProtectedRoute path="/pembayaran"><Pembayaran /></ProtectedRoute>} />
        <Route path="/tutor" element={<ProtectedRoute path="/tutor"><Tutor /></ProtectedRoute>} />
        <Route path="/ruangan" element={<ProtectedRoute path="/ruangan"><Ruangan /></ProtectedRoute>} />
        <Route path="/jadwal" element={<ProtectedRoute path="/jadwal"><Jadwal /></ProtectedRoute>} />
        <Route path="/orang-tua" element={<ProtectedRoute path="/orang-tua"><OrangTua /></ProtectedRoute>} />
        <Route path="/perkembangan" element={<ProtectedRoute path="/perkembangan"><LaporanPerkembangan /></ProtectedRoute>} />
        <Route path="/laporan" element={<ProtectedRoute path="/laporan"><Laporan /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute path="/users"><ManajemenUser /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
