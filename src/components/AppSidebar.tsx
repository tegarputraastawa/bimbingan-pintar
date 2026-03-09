import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, UserPlus, Users, CreditCard, FileBarChart, GraduationCap, Calendar, BookOpen, DoorOpen, UserCheck, ClipboardList, Library, Shield, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { canAccess, ADMIN_ROLES } from "@/lib/roleAccess";
import { Button } from "@/components/ui/button";

const allLinks = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", adminOnly: false },
  { to: "/pendaftaran", icon: UserPlus, label: "Pendaftaran", adminOnly: true },
  { to: "/siswa", icon: Users, label: "Data Siswa", adminOnly: true },
  { to: "/kelas", icon: Library, label: "Kelas", adminOnly: true },
  { to: "/tutor", icon: GraduationCap, label: "Data Tutor", adminOnly: true },
  { to: "/ruangan", icon: DoorOpen, label: "Ruangan", adminOnly: true },
  { to: "/jadwal", icon: Calendar, label: "Jadwal", adminOnly: false },
  { to: "/pembayaran", icon: CreditCard, label: "Pembayaran", adminOnly: true },
  { to: "/orang-tua", icon: UserCheck, label: "Orang Tua", adminOnly: true },
  { to: "/perkembangan", icon: ClipboardList, label: "Perkembangan", adminOnly: false },
  { to: "/laporan", icon: FileBarChart, label: "Laporan", adminOnly: true },
  { to: "/users", icon: Shield, label: "Manajemen User", adminOnly: true },
];

export default function AppSidebar() {
  const location = useLocation();
  const { role, nama, signOut } = useAuth();

  const links = allLinks.filter((link) => canAccess(role, link.to));

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
      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="px-4 py-2">
          <p className="text-sm font-medium text-sidebar-foreground truncate">{nama || "User"}</p>
          <p className="text-xs text-sidebar-foreground/60 capitalize">{role || ""}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          onClick={signOut}
        >
          <LogOut className="w-4 h-4" /> Keluar
        </Button>
      </div>
    </aside>
  );
}
