
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth-context";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthForm } from "@/components/auth/AuthForm";

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user && !redirecting) {
      console.log("Auth page: User already authenticated, redirecting to today");
      setRedirecting(true);
      navigate("/today", { replace: true });
    }
  }, [user, loading, navigate, redirecting]);

  // Only render auth form if not already authenticated and not loading
  return (
    <AuthLayout>
      {loading || redirecting ? (
        <div className="flex h-20 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      ) : !user ? (
        <AuthForm />
      ) : null}
    </AuthLayout>
  );
}
