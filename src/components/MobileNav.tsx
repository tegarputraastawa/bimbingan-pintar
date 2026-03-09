import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, UserPlus, Users, CreditCard, FileBarChart, GraduationCap, Calendar, DoorOpen, UserCheck, ClipboardList, Library } from "lucide-react";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Home" },
  { to: "/pendaftaran", icon: UserPlus, label: "Daftar" },
  { to: "/siswa", icon: Users, label: "Siswa" },
  { to: "/kelas", icon: Library, label: "Kelas" },
  { to: "/tutor", icon: GraduationCap, label: "Tutor" },
  { to: "/ruangan", icon: DoorOpen, label: "Ruangan" },
  { to: "/jadwal", icon: Calendar, label: "Jadwal" },
  { to: "/pembayaran", icon: CreditCard, label: "Bayar" },
  { to: "/orang-tua", icon: UserCheck, label: "Ortu" },
  { to: "/perkembangan", icon: ClipboardList, label: "Report" },
  { to: "/laporan", icon: FileBarChart, label: "Laporan" },
];

export default function MobileNav() {
  const location = useLocation();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around py-2 overflow-x-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center gap-1 px-2 py-1 text-xs transition-colors ${
                isActive ? "text-primary font-semibold" : "text-muted-foreground"
              }`}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
