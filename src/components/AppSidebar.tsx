import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, UserPlus, Users, CreditCard, FileBarChart, GraduationCap, Calendar, BookOpen, DoorOpen, UserCheck, ClipboardList, Library } from "lucide-react";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/pendaftaran", icon: UserPlus, label: "Pendaftaran" },
  { to: "/siswa", icon: Users, label: "Data Siswa" },
  { to: "/kelas", icon: Library, label: "Kelas" },
  { to: "/tutor", icon: GraduationCap, label: "Data Tutor" },
  { to: "/ruangan", icon: DoorOpen, label: "Ruangan" },
  { to: "/jadwal", icon: Calendar, label: "Jadwal" },
  { to: "/pembayaran", icon: CreditCard, label: "Pembayaran" },
  { to: "/orang-tua", icon: UserCheck, label: "Orang Tua" },
  { to: "/perkembangan", icon: ClipboardList, label: "Perkembangan" },
  { to: "/laporan", icon: FileBarChart, label: "Laporan" },
];

export default function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground min-h-screen">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-sidebar-primary">BimbelKu</h1>
          <p className="text-xs text-sidebar-foreground/60">Manajemen Bimbel</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
