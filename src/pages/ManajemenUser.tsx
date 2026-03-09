import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Check, X, Shield, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type Profile = {
  id: string;
  email: string;
  nama: string;
  role: string;
  approved: boolean;
  created_at: string;
};

export default function ManajemenUser() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const { user, role: myRole } = useAuth();

  const fetchProfiles = useCallback(async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setProfiles((data || []) as Profile[]);
  }, []);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const updateApproval = async (id: string, approved: boolean) => {
    const { error } = await supabase.from("profiles").update({ approved }).eq("id", id);
    if (error) { toast.error("Gagal: " + error.message); return; }
    toast.success(approved ? "User disetujui" : "User ditolak");
    fetchProfiles();
  };

  const updateRole = async (id: string, newRole: string) => {
    const { error } = await supabase.from("profiles").update({ role: newRole } as any).eq("id", id);
    if (error) { toast.error("Gagal: " + error.message); return; }
    // Also update user_roles table
    await supabase.from("user_roles").delete().eq("user_id", id);
    await supabase.from("user_roles").insert({ user_id: id, role: newRole } as any);
    toast.success("Role diperbarui");
    fetchProfiles();
  };

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      owner: "bg-primary text-primary-foreground",
      admin: "bg-info text-info-foreground",
      tutor: "bg-secondary text-secondary-foreground",
    };
    return <Badge className={colors[role] || ""}>{role.toUpperCase()}</Badge>;
  };

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Shield className="w-7 h-7 text-primary" /> Manajemen User
        </h1>
        <p className="text-muted-foreground mt-1">Kelola akses dan role pengguna</p>
      </div>

      <div className="grid gap-4">
        {profiles.map((p) => (
          <Card key={p.id} className={`transition-all ${!p.approved ? "border-warning/50 bg-warning/5" : ""}`}>
            <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{p.nama || "Tanpa Nama"}</span>
                  {roleBadge(p.role)}
                  {!p.approved && <Badge variant="outline" className="text-warning border-warning">Pending</Badge>}
                  {p.id === user?.id && <Badge variant="outline" className="text-primary border-primary">Anda</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{p.email}</p>
              </div>
              {p.id !== user?.id && (
                <div className="flex items-center gap-2 flex-wrap">
                  {myRole === "owner" && (
                    <Select value={p.role} onValueChange={(v) => updateRole(p.id, v)}>
                      <SelectTrigger className="w-[120px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="tutor">Tutor</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {!p.approved && (
                    <>
                      <Button size="sm" className="gap-1" onClick={() => updateApproval(p.id, true)}>
                        <Check className="w-3.5 h-3.5" /> Setujui
                      </Button>
                      <Button size="sm" variant="destructive" className="gap-1" onClick={() => updateApproval(p.id, false)}>
                        <X className="w-3.5 h-3.5" /> Tolak
                      </Button>
                    </>
                  )}
                  {p.approved && (
                    <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={() => updateApproval(p.id, false)}>
                      <X className="w-3.5 h-3.5" /> Cabut Akses
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {profiles.length === 0 && (
          <p className="text-muted-foreground text-center py-8">Belum ada user terdaftar</p>
        )}
      </div>
    </div>
  );
}
