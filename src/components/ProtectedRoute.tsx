import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { canAccess } from "@/lib/roleAccess";

export default function ProtectedRoute({ children, path }: { children: React.ReactNode; path: string }) {
  const { user, loading, role, approved } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!approved) return <Navigate to="/waiting-approval" replace />;
  if (!canAccess(role, path)) return <Navigate to="/" replace />;

  return <>{children}</>;
}
