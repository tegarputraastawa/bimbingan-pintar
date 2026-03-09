import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Clock, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function WaitingApproval() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-warning/20 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-warning" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Menunggu Persetujuan</CardTitle>
            <CardDescription>
              Akun Anda sedang ditinjau oleh admin. Anda akan bisa mengakses sistem setelah disetujui.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="gap-2" onClick={signOut}>
            <LogOut className="w-4 h-4" /> Keluar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
